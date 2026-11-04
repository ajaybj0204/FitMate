/**
 * Where FITORA data lives:
 *  - Signed in  → Firestore (users/{uid}/...), cached offline on the device
 *  - Guest      → this browser's localStorage only
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AccountDoc, WorkoutSession } from '../types/cloud';

const LOCAL_SESSIONS = 'fitora_sessions_v1';
const SYNC_META = 'fitora_sync_meta_v1';
const SESSIONS_EVENT = 'fitora-local-sessions';

/** Keys of the existing app state that should follow the user across devices. */
const isSyncedKey = (k: string) => k.startsWith('fitmate_') && k !== 'fitmate_lang_v1';

// ── Workout sessions ─────────────────────────────────────────────────────────

const readLocalSessions = (): WorkoutSession[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSIONS) || '[]');
  } catch {
    return [];
  }
};

const writeLocalSessions = (list: WorkoutSession[]) => {
  try {
    localStorage.setItem(LOCAL_SESSIONS, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event(SESSIONS_EVENT));
};

/** Removes undefined fields (Firestore rejects them). */
const clean = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export async function saveSession(uid: string | null, session: WorkoutSession): Promise<void> {
  if (uid && db) {
    // With the offline cache this resolves once written locally; it syncs when back online.
    await setDoc(doc(db, 'users', uid, 'sessions', session.id), clean(session));
    return;
  }
  writeLocalSessions([session, ...readLocalSessions().filter((s) => s.id !== session.id)]);
}

export function subscribeSessions(uid: string | null, cb: (list: WorkoutSession[]) => void): () => void {
  if (uid && db) {
    const q = query(collection(db, 'users', uid, 'sessions'), orderBy('startedAt', 'desc'), limit(500));
    return onSnapshot(
      q,
      (snap) => cb(snap.docs.map((d) => d.data() as WorkoutSession)),
      () => cb([]),
    );
  }
  const emit = () => cb(readLocalSessions().sort((a, b) => b.startedAt - a.startedAt));
  emit();
  window.addEventListener(SESSIONS_EVENT, emit);
  window.addEventListener('storage', emit);
  return () => {
    window.removeEventListener(SESSIONS_EVENT, emit);
    window.removeEventListener('storage', emit);
  };
}

/** After signing in: move workouts logged as a guest into the account. */
async function migrateLocalSessions(uid: string) {
  const local = readLocalSessions();
  if (!local.length || !db) return 0;
  for (let i = 0; i < local.length; i += 400) {
    const batch = writeBatch(db);
    local.slice(i, i + 400).forEach((s) => batch.set(doc(db!, 'users', uid, 'sessions', s.id), clean(s)));
    await batch.commit();
  }
  writeLocalSessions([]);
  return local.length;
}

// ── Account document ─────────────────────────────────────────────────────────

export async function loadOrCreateAccount(user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null }): Promise<AccountDoc> {
  if (!db) throw new Error('Cloud not configured');
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as AccountDoc;
  const account: AccountDoc = {
    uid: user.uid,
    name: user.displayName || 'FITORA Member',
    email: user.email || '',
    photoURL: user.photoURL,
    role: 'member',
    ownedGymId: null,
    membership: null,
    createdAt: Date.now(),
  };
  await setDoc(ref, account);
  return account;
}

export function subscribeAccount(uid: string, cb: (a: AccountDoc | null) => void): () => void {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'users', uid), (s) => cb(s.exists() ? (s.data() as AccountDoc) : null), () => cb(null));
}

export async function updateAccount(uid: string, patch: Partial<AccountDoc>) {
  if (!db) return;
  await setDoc(doc(db, 'users', uid), clean(patch), { merge: true });
}

// ── App state sync (profile, plan, meals, progress, …) ───────────────────────

interface SyncMeta {
  uid: string;
  updatedAt: number;
  hash: string;
}

const readMeta = (): SyncMeta | null => {
  try {
    return JSON.parse(localStorage.getItem(SYNC_META) || 'null');
  } catch {
    return null;
  }
};
const writeMeta = (m: SyncMeta | null) => {
  try {
    if (m) localStorage.setItem(SYNC_META, JSON.stringify(m));
    else localStorage.removeItem(SYNC_META);
  } catch {}
};

const snapshotLocal = (): Record<string, string> => {
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (isSyncedKey(k)) out[k] = localStorage.getItem(k) || '';
    }
  } catch {}
  return out;
};

const hashOf = (data: Record<string, string>) => {
  const s = JSON.stringify(Object.keys(data).sort().map((k) => [k, data[k]]));
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `${s.length}:${h}`;
};

/**
 * Called right after sign-in. Returns true when cloud data was copied onto this device
 * (the caller reloads so every screen picks it up).
 */
export async function pullStateOnSignIn(uid: string): Promise<{ reload: boolean; migrated: number }> {
  if (!db) return { reload: false, migrated: 0 };
  const migrated = await migrateLocalSessions(uid);
  const ref = doc(db, 'users', uid, 'private', 'appState');
  const snap = await getDoc(ref);
  const meta = readMeta();
  const local = snapshotLocal();

  if (snap.exists()) {
    const cloud = snap.data() as { data: Record<string, string>; updatedAt: number };
    const sameUser = meta?.uid === uid;
    if (!sameUser || cloud.updatedAt > (meta?.updatedAt || 0)) {
      // Cloud wins: replace this device's copy with the account's data
      Object.keys(local).forEach((k) => localStorage.removeItem(k));
      Object.entries(cloud.data || {}).forEach(([k, v]) => localStorage.setItem(k, v));
      writeMeta({ uid, updatedAt: cloud.updatedAt, hash: hashOf(cloud.data || {}) });
      return { reload: hashOf(cloud.data || {}) !== hashOf(local), migrated };
    }
    return { reload: false, migrated };
  }

  // First sign-in on any device: keep what this browser has and upload it
  const now = Date.now();
  await setDoc(ref, { data: local, updatedAt: now });
  writeMeta({ uid, updatedAt: now, hash: hashOf(local) });
  return { reload: false, migrated };
}

/** Uploads local changes if anything changed since the last upload. */
export async function pushStateIfChanged(uid: string): Promise<void> {
  if (!db) return;
  const local = snapshotLocal();
  const h = hashOf(local);
  const meta = readMeta();
  if (meta?.uid === uid && meta.hash === h) return;
  const now = Date.now();
  writeMeta({ uid, updatedAt: now, hash: h });
  await setDoc(doc(db, 'users', uid, 'private', 'appState'), { data: local, updatedAt: now });
}

/** On sign-out, remove this account's data from the device (it stays safe in the cloud). */
export function clearDeviceData() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (isSyncedKey(k) || k === LOCAL_SESSIONS || k === SYNC_META) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export async function countCloudSessions(uid: string) {
  if (!db) return 0;
  return (await getDocs(query(collection(db, 'users', uid, 'sessions'), limit(1)))).size;
}
