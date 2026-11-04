/**
 * Phone / browser reminders via Firebase Cloud Messaging.
 * The device token + reminder choices are saved in pushSubscriptions/{uid}; FITORA's server
 * (api/reminders, run every hour) decides what is due and sends it.
 */
import { getMessaging, getToken, deleteToken, isSupported } from 'firebase/messaging';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore';
import { app, db } from './firebase';

export interface ReminderPrefs {
  workout: { on: boolean; hour: number };
  water: { on: boolean };
  fees: { on: boolean };
}

export const DEFAULT_PREFS: ReminderPrefs = {
  workout: { on: true, hour: 18 },
  water: { on: true },
  fees: { on: true },
};

const VAPID = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

export const pushConfigured = () => Boolean(app && db && VAPID);

export async function pushSupported(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return false;
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

/** iPhones only allow web notifications once FITORA is added to the Home Screen. */
export const needsIosInstall = () =>
  /iPhone|iPad|iPod/i.test(navigator.userAgent) && !(window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone);

async function registration() {
  return navigator.serviceWorker.register('/fitora-sw.js', { scope: '/' });
}

export async function loadPushState(uid: string): Promise<{ enabled: boolean; prefs: ReminderPrefs }> {
  if (!db) return { enabled: false, prefs: DEFAULT_PREFS };
  const s = await getDoc(doc(db, 'pushSubscriptions', uid));
  const data = s.data() as { tokens?: string[]; prefs?: ReminderPrefs } | undefined;
  const enabled = Notification.permission === 'granted' && Boolean(data?.tokens?.length);
  return { enabled, prefs: { ...DEFAULT_PREFS, ...(data?.prefs || {}) } };
}

export async function enablePush(uid: string, prefs: ReminderPrefs): Promise<void> {
  if (!app || !db || !VAPID) throw new Error('Reminders are not set up yet.');
  if (!(await pushSupported())) throw new Error('This browser cannot show notifications.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications are blocked. Allow them in your browser or phone settings, then try again.');
  const reg = await registration();
  const token = await getToken(getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: reg });
  if (!token) throw new Error('Could not turn on notifications on this device.');
  localStorage.setItem('fitora_push_token', token);
  await setDoc(
    doc(db, 'pushSubscriptions', uid),
    {
      uid,
      tokens: arrayUnion(token),
      prefs,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      updatedAt: Date.now(),
    },
    { merge: true },
  );
}

export async function savePrefs(uid: string, prefs: ReminderPrefs) {
  if (!db) return;
  await setDoc(doc(db, 'pushSubscriptions', uid), { prefs, tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata', updatedAt: Date.now() }, { merge: true });
}

/** Turns reminders off on THIS device. */
export async function disablePush(uid: string) {
  if (!app || !db) return;
  const token = localStorage.getItem('fitora_push_token');
  try {
    await deleteToken(getMessaging(app));
  } catch {}
  if (token) await setDoc(doc(db, 'pushSubscriptions', uid), { tokens: arrayRemove(token), updatedAt: Date.now() }, { merge: true });
  localStorage.removeItem('fitora_push_token');
}
