/**
 * Firebase setup for FITORA: Google sign-in + Firestore (with offline cache, so logging
 * works in basement gyms with no signal and syncs when the phone is back online).
 *
 * Config comes from VITE_FIREBASE_* env vars. If they are missing, the app still runs in
 * "guest mode" (everything saved in this browser only).
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

const env = import.meta.env;

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (firebaseEnabled) {
  app = initializeApp(config as Required<typeof config>);
  auth = getAuth(app);
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    // Private windows / old browsers without IndexedDB: fall back to memory cache
    db = initializeFirestore(app, {});
  }
}

export { app, auth, db };

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export async function signInWithGoogle(): Promise<void> {
  if (!auth) throw new Error('Sign-in is not set up yet.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    // Popups are often blocked on phones / in-app browsers: use a full-page redirect instead
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment' || isMobile()) {
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
        return;
      }
    }
    throw err;
  }
}

export async function signOut(): Promise<void> {
  if (auth) await fbSignOut(auth);
}
