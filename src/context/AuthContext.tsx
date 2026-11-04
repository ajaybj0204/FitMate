import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getRedirectResult, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, firebaseEnabled, signInWithGoogle, signOut as fbSignOut } from '../lib/firebase';
import {
  clearDeviceData,
  loadOrCreateAccount,
  pullStateOnSignIn,
  pushStateIfChanged,
  subscribeAccount,
  updateAccount,
} from '../lib/cloudStore';
import type { AccountDoc } from '../types/cloud';

interface AuthContextType {
  /** False when Firebase isn't configured: the app runs in guest mode only. */
  cloudEnabled: boolean;
  user: User | null;
  uid: string | null;
  account: AccountDoc | null;
  /** True until we know whether someone is signed in */
  authLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateMyAccount: (patch: Partial<AccountDoc>) => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SYNC_EVERY_MS = 15_000;

const friendlyError = (err: unknown) => {
  const code = (err as { code?: string })?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  if (code === 'auth/unauthorized-domain') return 'This website address is not yet allowed in Firebase (Authentication → Settings → Authorized domains).';
  if (code === 'auth/network-request-failed') return 'No internet connection. Try again when you are online.';
  return 'Sign-in did not work. Please try again.';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountDoc | null>(null);
  const [authLoading, setAuthLoading] = useState(firebaseEnabled);
  const [authError, setAuthError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const signingOut = useRef(false);

  // Watch sign-in state
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth).catch((e) => setAuthError(friendlyError(e)));
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setAccount(null);
        setSynced(false);
        setAuthLoading(false);
        return;
      }
      try {
        const acc = await loadOrCreateAccount(u);
        setAccount(acc);
        const { reload } = await pullStateOnSignIn(u.uid);
        if (reload) {
          window.location.reload();
          return;
        }
        setSynced(true);
      } catch (e) {
        console.error('FITORA sync failed', e);
        setSynced(true); // keep working on local data; sync retries below
      } finally {
        setAuthLoading(false);
      }
    });
  }, []);

  // Live account doc (role, gym link)
  useEffect(() => {
    if (!user) return;
    return subscribeAccount(user.uid, (a) => a && setAccount(a));
  }, [user]);

  // Push local changes to the cloud regularly and when the tab is hidden
  useEffect(() => {
    if (!user || !synced) return;
    const push = () => {
      if (!signingOut.current) pushStateIfChanged(user.uid).catch(() => {});
    };
    const id = window.setInterval(push, SYNC_EVERY_MS);
    const onHide = () => document.visibilityState === 'hidden' && push();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', push);
    push();
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', push);
    };
  }, [user, synced]);

  const signIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setAuthError(friendlyError(e));
    }
  };

  const signOut = async () => {
    if (user) {
      try {
        await pushStateIfChanged(user.uid);
      } catch {}
    }
    signingOut.current = true;
    await fbSignOut();
    clearDeviceData();
    window.location.hash = '';
    window.location.reload();
  };

  const updateMyAccount = async (patch: Partial<AccountDoc>) => {
    if (!user) return;
    await updateAccount(user.uid, patch);
  };

  return (
    <AuthContext.Provider
      value={{
        cloudEnabled: firebaseEnabled,
        user,
        uid: user?.uid ?? null,
        account,
        authLoading,
        signIn,
        signOut,
        updateMyAccount,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
