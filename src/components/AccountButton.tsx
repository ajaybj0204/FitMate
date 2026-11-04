import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFitMate } from '../context/FitMateContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/** Header control: "Sign in" for guests, account menu (sync status, My Gym, sign out) when signed in. */
export const AccountButton: React.FC = () => {
  const { cloudEnabled, user, account, authLoading, signIn, signOut, authError } = useAuth();
  const { navigateTo, showToast, t } = useFitMate();
  const online = useOnlineStatus();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (authError) showToast(authError, 'warning');
  }, [authError]);

  if (!cloudEnabled || authLoading) return null;

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#152031] hover:bg-[#1f2a3c] border border-[#4edea3]/40 text-[#4edea3] text-xs font-bold transition-colors"
        title="Sign in to save your workouts to your account and use them on any device"
      >
        <span className="material-symbols-outlined text-[18px]">login</span>
        <span className="hidden sm:inline">{t('acc_signIn', "Sign in")}</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-[#152031] transition-colors"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-[#4edea3]/40" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-[#152031] text-[#4edea3] font-bold text-sm flex items-center justify-center border border-[#4edea3]/40">
            {(user.displayName || 'U').charAt(0)}
          </span>
        )}
        <span
          className={`w-2 h-2 rounded-full ${online ? 'bg-[#4edea3]' : 'bg-[#ffb95f]'}`}
          title={online ? 'Synced to your account' : 'Offline: changes will sync when you are back online'}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-64 bg-[#111927] border border-[#1f2a3c] rounded-2xl shadow-2xl p-3 z-50">
          <div className="px-1 pb-2 border-b border-[#1f2a3c]">
            <div className="text-sm font-bold text-[#d8e3fb] truncate">{user.displayName || 'FITORA member'}</div>
            <div className="text-[11px] text-[#86948a] truncate">{user.email}</div>
            <div className={`text-[11px] mt-1 flex items-center gap-1 ${online ? 'text-[#4edea3]' : 'text-[#ffb95f]'}`}>
              <span className="material-symbols-outlined text-[14px]">{online ? 'cloud_done' : 'cloud_off'}</span>
              {online ? 'Saved to your account' : 'Offline: will sync later'}
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); navigateTo('gym'); }}
            className="w-full mt-2 flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-[#d8e3fb] hover:bg-[#1f2a3c]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">storefront</span>
            {account?.ownedGymId ? 'My gym dashboard' : account?.membership ? account.membership.gymName : 'My gym'}
          </button>
          <button
            onClick={() => { setOpen(false); navigateTo('profile'); }}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-[#d8e3fb] hover:bg-[#1f2a3c]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">person</span>
            Profile
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-[#ffb4ab] hover:bg-[#2a1416]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {t('acc_signOut', "Sign out")}
          </button>
          <p className="text-[10px] text-[#86948a] px-2 pt-1">Signing out removes your data from this device. It stays safe in your account.</p>
        </div>
      )}
    </div>
  );
};
