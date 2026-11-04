/**
 * FITORA AI coach + food logging (Vercel serverless function).
 *
 * POST /api/coach   Authorization: Bearer <Firebase ID token>
 *   { mode: 'chat', message, history?, context }  → { reply }
 *   { mode: 'food', text }                          → { items, totals, note }
 *
 * The Gemini key (GEMINI_API_KEY) lives only on the server. Only signed-in FITORA users can
 * call this, with a per-user limit, so the free Gemini quota can't be drained by others.
 */

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => void;
}

// Fast models first (flash-lite answers in ~1-2 s with minimal thinking; bigger flash models
// can take minutes on the free tier). On 404 (retired), 429/5xx (busy) or a timeout, the next is tried.
const MODELS = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-flash-latest'];
const PER_MODEL_TIMEOUT_MS = 20_000;
const PER_USER_PER_HOUR = 40;
const hits = new Map<string, number[]>(); // best effort (per warm instance)

const COACH_RULES = `You are FITORA's fitness coach for Indian users. Be warm, specific and brief (under 170 words unless asked for a plan).
Use the user's real data in CONTEXT (profile, targets, recent logged workouts, today's food). Quote their actual numbers when relevant.
Rules:
- Never invent data that is not in CONTEXT. If something isn't logged, say so and suggest logging it.
- Give practical, safe advice. For pain, injury, dizziness, chest pain, or medical conditions, advise seeing a doctor or physiotherapist; never diagnose.
- Progressive overload: add weight only after hitting the top of the rep range on all sets; otherwise add reps.
- Prefer Indian foods and budget options (dal, paneer, curd, eggs, soya, chana, chicken, fish).
- No supplements beyond basics (whey, creatine) and never medication or steroids.
- Use short bullet points when listing steps. Plain text, light markdown only (**bold**, bullets).`;

const FOOD_RULES = `You estimate nutrition for meals described in free text, focused on Indian home food and Indian portion sizes
(1 roti/chapati ≈ 30-35 g flour ≈ 100-120 kcal; 1 katori dal ≈ 150 g; 1 cup cooked rice ≈ 150 g; idli ≈ 40 g; dosa plain ≈ 100 g).
Return ONLY JSON: {"items":[{"name":string,"quantity":string,"calories":number,"protein":number,"carbs":number,"fats":number}],
"note":string}. Numbers are grams (kcal for calories), rounded to whole numbers. If the text is not food, return {"items":[],"note":"..."}.
Keep note to one short sentence about the biggest uncertainty (e.g. oil/ghee amount).`;

async function verifyUser(idToken: string): Promise<string | null> {
  const key = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (!key || !idToken) return null;
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { users?: { localId: string }[] };
  return j.users?.[0]?.localId || null;
}

function allowed(uid: string) {
  const now = Date.now();
  const list = (hits.get(uid) || []).filter((t) => now - t < 3600_000);
  if (list.length >= PER_USER_PER_HOUR) return false;
  list.push(now);
  hits.set(uid, list);
  return true;
}

async function gemini(body: Record<string, unknown>): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('AI is not set up yet.');
  let lastErr = '';
  for (const model of MODELS) {
    // Keep "thinking" minimal: these are short, practical answers and speed matters
    const gc = (body.generationConfig || {}) as Record<string, unknown>;
    const payload = { ...body, generationConfig: { ...gc, thinkingConfig: { thinkingLevel: 'minimal' } } };
    let r: Response;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(PER_MODEL_TIMEOUT_MS),
      });
    } catch {
      lastErr = `${model}: timeout`;
      continue;
    }
    if (r.ok) {
      const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
      if (text) return text;
      lastErr = 'empty response';
      continue;
    }
    lastErr = `${model}: ${r.status}`;
    // Model retired or overloaded → try the next one
    if (![400, 404, 429, 500, 503].includes(r.status)) break;
  }
  throw new Error(`AI unavailable (${lastErr})`);
}

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '');

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const auth = String(req.headers.authorization || '');
  const uid = await verifyUser(auth.replace(/^Bearer\s+/i, '')).catch(() => null);
  if (!uid) return res.status(401).json({ error: 'Please sign in to use the AI coach.' });
  if (!allowed(uid)) return res.status(429).json({ error: 'You have reached the hourly AI limit. Try again a bit later.' });

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;

  try {
    if (body.mode === 'food') {
      const text = clip(body.text, 500).trim();
      if (!text) return res.status(400).json({ error: 'Describe what you ate.' });
      const out = await gemini({
        systemInstruction: { parts: [{ text: FOOD_RULES }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json', maxOutputTokens: 1200 },
      });
      const parsed = JSON.parse(out.replace(/^```json\s*|```$/g, '')) as { items?: Record<string, unknown>[]; note?: string };
      const num = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));
      const items = (parsed.items || []).slice(0, 20).map((i) => ({
        name: clip(i.name, 80),
        quantity: clip(i.quantity, 40),
        calories: num(i.calories),
        protein: num(i.protein),
        carbs: num(i.carbs),
        fats: num(i.fats),
      }));
      const totals = items.reduce((t, i) => ({ calories: t.calories + i.calories, protein: t.protein + i.protein, carbs: t.carbs + i.carbs, fats: t.fats + i.fats }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
      return res.status(200).json({ items, totals, note: clip(parsed.note, 200) });
    }

    // Chat
    const message = clip(body.message, 800).trim();
    if (!message) return res.status(400).json({ error: 'Type a question.' });
    const context = clip(JSON.stringify(body.context || {}), 6000);
    const history = Array.isArray(body.history) ? (body.history as { role?: string; text?: string }[]).slice(-8) : [];
    const contents = [
      ...history.map((h) => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: clip(h.text, 800) }] })),
      { role: 'user', parts: [{ text: `CONTEXT (the user's real FITORA data):\n${context}\n\nQUESTION: ${message}` }] },
    ];
    const reply = await gemini({
      systemInstruction: { parts: [{ text: COACH_RULES }] },
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 700 },
    });
    return res.status(200).json({ reply: reply.trim() });
  } catch (e) {
    console.error('coach error', (e as Error).message);
    return res.status(502).json({ error: (e as Error).message.includes('not set up') ? 'The AI coach is not switched on yet.' : 'The AI coach is busy right now. Please try again in a minute.' });
  }
}
