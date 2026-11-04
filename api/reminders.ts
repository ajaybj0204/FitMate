/**
 * FITORA reminders (Vercel serverless function).
 *
 *  - Hourly run:  POST /api/reminders   header x-cron-secret: <CRON_SECRET>   (GitHub Actions)
 *      For every device that turned reminders on, sends what is due in that person's time zone:
 *        • workout: at their chosen hour, on a training day, if today's workout isn't logged yet
 *        • water:   11 am / 3 pm / 7 pm, only if they're behind on today's water
 *        • fees:    10 am, 3 days before and on the day a linked gym membership is due
 *  - Test:        POST /api/reminders   Authorization: Bearer <Firebase ID token>   { test: true }
 *
 * Needs FIREBASE_SERVICE_ACCOUNT (service account JSON, server only) and CRON_SECRET.
 */
import { createSign } from 'node:crypto';

interface Req { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown }
interface Res { status: (c: number) => Res; json: (b: unknown) => void; setHeader: (k: string, v: string) => void }

interface ServiceAccount { client_email: string; private_key: string; project_id: string }

const sa = (): ServiceAccount | null => {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
    const j = JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
    return j.client_email && j.private_key ? j : null;
  } catch {
    return null;
  }
};

const b64url = (v: string | Buffer) => Buffer.from(v).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

async function accessToken(acc: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: acc.client_email,
      scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${head}.${claims}`);
  const jwt = `${head}.${claims}.${b64url(signer.sign(acc.private_key))}`;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`,
  });
  const j = (await r.json()) as { access_token?: string; error?: string };
  if (!j.access_token) throw new Error(`token: ${j.error}`);
  return j.access_token;
}

// ── Firestore REST helpers ───────────────────────────────────────────────────

type FsValue = Record<string, unknown>;
const decode = (v: FsValue | undefined): unknown => {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (((v.arrayValue as { values?: FsValue[] }).values) || []).map(decode);
  if ('mapValue' in v) return decodeFields(((v.mapValue as { fields?: Record<string, FsValue> }).fields) || {});
  return undefined;
};
const decodeFields = (f: Record<string, FsValue>) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decode(v)]));
const encode = (v: unknown): FsValue => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, encode(x)])) } };
};

function fs(project: string, token: string) {
  const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  return {
    async get(path: string): Promise<Record<string, unknown> | null> {
      const r = await fetch(`${base}/${path}`, { headers: h });
      if (!r.ok) return null;
      const j = (await r.json()) as { fields?: Record<string, FsValue> };
      return decodeFields(j.fields || {});
    },
    async list(collection: string): Promise<{ id: string; data: Record<string, unknown> }[]> {
      const out: { id: string; data: Record<string, unknown> }[] = [];
      let pageToken = '';
      do {
        const r = await fetch(`${base}/${collection}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`, { headers: h });
        const j = (await r.json()) as { documents?: { name: string; fields?: Record<string, FsValue> }[]; nextPageToken?: string };
        for (const d of j.documents || []) out.push({ id: d.name.split('/').pop()!, data: decodeFields(d.fields || {}) });
        pageToken = j.nextPageToken || '';
      } while (pageToken);
      return out;
    },
    async hasSessionOn(uid: string, date: string): Promise<boolean> {
      const r = await fetch(`${base}/users/${uid}:runQuery`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'sessions' }],
            where: { fieldFilter: { field: { fieldPath: 'date' }, op: 'EQUAL', value: { stringValue: date } } },
            limit: 1,
          },
        }),
      });
      const j = (await r.json()) as { document?: unknown }[];
      return Array.isArray(j) && j.some((x) => x.document);
    },
    async patch(path: string, data: Record<string, unknown>) {
      const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
      await fetch(`${base}/${path}?${mask}`, {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)])) }),
      });
    },
  };
}

// ── Sending ──────────────────────────────────────────────────────────────────

async function send(project: string, token: string, deviceToken: string, msg: { title: string; body: string; link: string; tag: string }) {
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${project}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token: deviceToken,
        data: msg,
        webpush: { headers: { Urgency: 'high', TTL: '3600' }, fcm_options: { link: msg.link } },
      },
    }),
  });
  if (r.ok) return 'sent';
  const j = (await r.json().catch(() => ({}))) as { error?: { status?: string; details?: { errorCode?: string }[] } };
  const code = j.error?.details?.find((d) => d.errorCode)?.errorCode || j.error?.status;
  return code === 'UNREGISTERED' || code === 'NOT_FOUND' || code === 'INVALID_ARGUMENT' ? 'invalid' : 'failed';
}

// ── Time helpers (per user time zone) ───────────────────────────────────────

function localNow(tz: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', weekday: 'long', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), weekday: String(parts.weekday).toLowerCase() };
}
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);

const SITE = 'https://fit-mate-coral.vercel.app';

interface Prefs { workout?: { on?: boolean; hour?: number }; water?: { on?: boolean }; fees?: { on?: boolean } }
interface Msg { key: string; title: string; body: string; link: string }

async function dueMessages(db: ReturnType<typeof fs>, uid: string, prefs: Prefs, tz: string, lastSent: Record<string, string>): Promise<Msg[]> {
  const now = localNow(tz);
  const out: Msg[] = [];
  const fresh = (key: string) => lastSent[key] !== now.date;
  const state = (await db.get(`users/${uid}/private/appState`))?.data as Record<string, string> | undefined;
  const parse = <T,>(k: string): T | null => {
    try {
      return state?.[k] ? (JSON.parse(state[k]) as T) : null;
    } catch {
      return null;
    }
  };

  // Workout
  if (prefs.workout?.on !== false && now.hour === (prefs.workout?.hour ?? 18) && fresh('workout')) {
    const schedule = parse<{ id: string; isRest: boolean; splitName: string; exercises: unknown[] }[]>('fitmate_schedule_v1');
    const today = schedule?.find((d) => d.id === now.weekday);
    if (today && !today.isRest && today.exercises.length && !(await db.hasSessionOn(uid, now.date))) {
      out.push({ key: 'workout', title: `${today.splitName} day today 💪`, body: `${today.exercises.length} exercises are ready. Tap to start; FITORA has your targets.`, link: `${SITE}/#workout` });
    }
  }

  // Water
  const waterSlots: Record<number, number> = { 11: 0.3, 15: 0.55, 19: 0.8 };
  if (prefs.water?.on !== false && waterSlots[now.hour] && fresh(`water-${now.hour}`)) {
    const profile = parse<{ weightKg?: number }>('fitmate_profile_v1');
    const goalMl = Math.round(((profile?.weightKg || 70) * 35) / 250) * 250;
    const sameDay = state?.fitmate_today_v1 === now.date;
    const had = sameDay ? Number(state?.fitmate_hydration_v1 || 0) : 0;
    if (had < goalMl * waterSlots[now.hour]) {
      out.push({ key: `water-${now.hour}`, title: 'Time for some water 💧', body: `${(had / 1000).toFixed(1)} L of about ${(goalMl / 1000).toFixed(1)} L so far today.`, link: `${SITE}/#dashboard` });
    }
  }

  // Gym fee
  if (prefs.fees?.on !== false && now.hour === 10 && fresh('fees')) {
    const account = await db.get(`users/${uid}`);
    const m = account?.membership as { gymId?: string; memberId?: string; gymName?: string } | null;
    if (m?.gymId && m.memberId) {
      const member = await db.get(`gyms/${m.gymId}/members/${m.memberId}`);
      const due = member?.dueDate as string | undefined;
      if (due && member?.status === 'active') {
        const d = daysBetween(now.date, due);
        if (d === 3 || d === 0 || (d < 0 && d >= -15 && d % 3 === 0)) {
          out.push({
            key: 'fees',
            title: d === 0 ? `${m.gymName} fee due today` : d > 0 ? `${m.gymName} fee due in ${d} days` : `${m.gymName} fee is overdue`,
            body: d < 0 ? `It was due ${-d} days ago. Pay at the desk or by UPI.` : 'Pay at the desk or by UPI to keep training without a break.',
            link: `${SITE}/#gym`,
          });
        }
      }
    }
  }
  return out;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const acc = sa();
  if (!acc) return res.status(503).json({ error: 'Reminders are not set up (service account missing).' });

  const token = await accessToken(acc);
  const db = fs(acc.project_id, token);
  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;

  // Test notification for the signed-in user
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (body.test && bearer) {
    const key = process.env.VITE_FIREBASE_API_KEY;
    const look = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: bearer }),
    });
    const uid = ((await look.json()) as { users?: { localId: string }[] }).users?.[0]?.localId;
    if (!uid) return res.status(401).json({ error: 'Please sign in again.' });
    const sub = await db.get(`pushSubscriptions/${uid}`);
    const tokens = (sub?.tokens as string[]) || [];
    const results = await Promise.all(tokens.map((t) => send(acc.project_id, token, t, { title: 'FITORA reminders are on ✅', body: 'This is a test. You will get workout, water and fee reminders here.', link: SITE, tag: 'test' })));
    return res.status(200).json({ devices: tokens.length, sent: results.filter((r) => r === 'sent').length });
  }

  // Hourly run
  if (!process.env.CRON_SECRET || req.headers['x-cron-secret'] !== process.env.CRON_SECRET) return res.status(401).json({ error: 'unauthorized' });

  const subs = await db.list('pushSubscriptions');
  let sent = 0;
  for (const s of subs) {
    const tokens = ((s.data.tokens as string[]) || []).filter(Boolean);
    if (!tokens.length) continue;
    const tz = (s.data.tz as string) || 'Asia/Kolkata';
    const lastSent = ((s.data.lastSent as Record<string, string>) || {});
    let msgs: Msg[] = [];
    try {
      msgs = await dueMessages(db, s.id, (s.data.prefs as Prefs) || {}, tz, lastSent);
    } catch (e) {
      console.error('reminder check failed', s.id, (e as Error).message);
      continue;
    }
    if (!msgs.length) continue;
    const invalid = new Set<string>();
    for (const m of msgs) {
      for (const t of tokens) {
        const r = await send(acc.project_id, token, t, { title: m.title, body: m.body, link: m.link, tag: m.key });
        if (r === 'sent') sent++;
        if (r === 'invalid') invalid.add(t);
      }
      lastSent[m.key] = localNow(tz).date;
    }
    await db.patch(`pushSubscriptions/${s.id}`, { lastSent, tokens: tokens.filter((t) => !invalid.has(t)) });
  }
  return res.status(200).json({ devices: subs.length, sent });
}
