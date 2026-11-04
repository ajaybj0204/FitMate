import React, { useEffect, useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { useAuth } from '../context/AuthContext';
import {
  DEFAULT_PREFS,
  disablePush,
  enablePush,
  loadPushState,
  needsIosInstall,
  pushConfigured,
  pushSupported,
  savePrefs,
  type ReminderPrefs,
} from '../lib/push';

const hourLabel = (h: number) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'am' : 'pm'}`;

/** Reminder settings: real phone notifications sent by FITORA's server. */
export const SmartRemindersModal: React.FC = () => {
  const { isRemindersModalOpen, setIsRemindersModalOpen, showToast } = useFitMate();
  const { user, signIn, account } = useAuth();
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_PREFS);
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isRemindersModalOpen) return;
    setError('');
    pushSupported().then(setSupported);
    if (user) loadPushState(user.uid).then((s) => { setPrefs(s.prefs); setEnabled(s.enabled); }).catch(() => {});
  }, [isRemindersModalOpen, user]);

  if (!isRemindersModalOpen) return null;
  const close = () => setIsRemindersModalOpen(false);

  const update = (next: ReminderPrefs) => {
    setPrefs(next);
    if (user && enabled) savePrefs(user.uid, next).catch(() => {});
  };

  const turnOn = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      await enablePush(user.uid, prefs);
      setEnabled(true);
      showToast('Reminders are on for this device 🔔');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ test: true }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Could not send a test.');
      showToast(j.sent ? 'Test sent. Check your notifications 🔔' : 'No device received it. Try turning reminders off and on.', j.sent ? 'success' : 'warning');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    if (!user) return;
    setBusy(true);
    await disablePush(user.uid).catch(() => {});
    setEnabled(false);
    setBusy(false);
    showToast('Reminders turned off on this device.', 'info');
  };

  const Row: React.FC<{ icon: string; title: string; desc: string; on: boolean; onToggle: () => void; children?: React.ReactNode }> = ({ icon, title, desc, on, onToggle, children }) => (
    <div className="py-3.5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${on ? 'bg-[#4edea3]/20 text-[#4edea3]' : 'bg-[#1f2a3c] text-[#86948a]'}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#d8e3fb]">{title}</h4>
          <p className="text-xs text-[#bbcabf] mt-0.5 leading-relaxed">{desc}</p>
          {children}
        </div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={title}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${on ? 'bg-[#4edea3]' : 'bg-[#1f2a3c]'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-[#081425] shadow transition ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Reminders">
      <div className="bg-[#152031] rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-[#1f2a3c] my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2a3c]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">alarm</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">Reminders</h3>
              <p className="text-xs text-[#86948a]">Notifications on this phone or computer, even when FITORA is closed</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="text-[#86948a] hover:text-[#d8e3fb] p-1.5 rounded-lg hover:bg-[#1f2a3c]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {!user ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#bbcabf]">Reminders are linked to your account, so they know your plan and what you've logged.</p>
            <button onClick={signIn} className="mt-4 px-4 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] text-sm font-bold">Sign in with Google</button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#1f2a3c]/70 my-2">
              <Row
                icon="fitness_center"
                title="Workout reminder"
                desc="On training days, if you haven't logged today's workout yet."
                on={prefs.workout.on}
                onToggle={() => update({ ...prefs, workout: { ...prefs.workout, on: !prefs.workout.on } })}
              >
                <label className="mt-2 flex items-center gap-2 text-xs text-[#86948a]">
                  At
                  <select
                    value={prefs.workout.hour}
                    onChange={(e) => update({ ...prefs, workout: { ...prefs.workout, hour: Number(e.target.value) } })}
                    className="bg-[#0b1420] border border-[#2a3a52] rounded-lg px-2 py-1 text-[#d8e3fb]"
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 5).map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
                  </select>
                </label>
              </Row>
              <Row
                icon="water_drop"
                title="Water reminders"
                desc="At 11 am, 3 pm and 7 pm, only if you're behind on today's water."
                on={prefs.water.on}
                onToggle={() => update({ ...prefs, water: { on: !prefs.water.on } })}
              />
              {account?.membership && (
                <Row
                  icon="receipt_long"
                  title="Gym fee due"
                  desc={`3 days before your ${account.membership.gymName} fee is due, and on the day.`}
                  on={prefs.fees.on}
                  onToggle={() => update({ ...prefs, fees: { on: !prefs.fees.on } })}
                />
              )}
            </div>

            {!pushConfigured() ? (
              <p className="text-xs text-[#ffb95f] bg-[#2a1f12] rounded-xl p-3">Reminders are being set up and will be available soon.</p>
            ) : !supported ? (
              <p className="text-xs text-[#ffb95f] bg-[#2a1f12] rounded-xl p-3">
                {needsIosInstall()
                  ? 'On iPhone, first add FITORA to your Home Screen (Share → Add to Home Screen), then open it from there and turn reminders on.'
                  : "This browser can't show notifications. Try Chrome on Android or a computer."}
              </p>
            ) : enabled ? (
              <div className="flex items-center justify-between gap-3 bg-[#10251d] border border-[#4edea3]/30 rounded-xl p-3">
                <span className="text-xs text-[#4edea3] flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">notifications_active</span>Reminders are on for this device</span>
                <span className="flex gap-3">
                  <button onClick={sendTest} disabled={busy} className="text-xs text-[#4edea3] hover:text-white underline">Send a test</button>
                  <button onClick={turnOff} disabled={busy} className="text-xs text-[#bbcabf] hover:text-white underline">Turn off</button>
                </span>
              </div>
            ) : (
              <button onClick={turnOn} disabled={busy} className="w-full py-3 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {busy ? 'Turning on…' : 'Turn on reminders on this device'}
              </button>
            )}
            {error && <p className="text-xs text-[#ffb4ab] mt-2">{error}</p>}
          </>
        )}

        <div className="flex justify-end pt-4">
          <button onClick={close} className="px-5 py-2.5 rounded-xl bg-[#111c2d] text-[#d8e3fb] font-semibold text-xs border border-[#1f2a3c]">Done</button>
        </div>
      </div>
    </div>
  );
};
