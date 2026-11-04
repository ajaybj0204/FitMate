import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFitMate } from '../../context/FitMateContext';
import type { Gym, GymCheckin, GymMember } from '../../types/cloud';
import { claimInvite, createGym, getGym, myRecentCheckins, selfCheckin, subscribeMyMembership } from '../../lib/gym';
import { localDate } from '../../lib/progression';
import { OwnerDashboard } from './OwnerDashboard';
import { Btn, Card, FeeBadge, fmtDate, inputCls, inr, labelCls } from './ui';
import { daysUntilDue } from '../../lib/gym';

/** Links opened from WhatsApp invites and the reception QR. */
type PendingAction = { kind: 'join' | 'checkin'; gymId: string; code: string } | null;

const readPendingAction = (): PendingAction => {
  const m = window.location.hash.match(/^#(join|checkin)\/([^/]+)\/([^/?#]+)/);
  return m ? { kind: m[1] as 'join' | 'checkin', gymId: m[2], code: m[3] } : null;
};

export const GymSection: React.FC = () => {
  const { cloudEnabled, user, account, authLoading, signIn, authError } = useAuth();
  const [pending, setPending] = useState<PendingAction>(readPendingAction);
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => {
    const onHash = () => {
      const p = readPendingAction();
      if (p) setPending(p);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const clearPending = () => {
    setPending(null);
    try {
      window.history.replaceState({ section: 'gym' }, '', '#gym');
    } catch {}
  };

  if (!cloudEnabled) {
    return (
      <Card className="text-center py-12">
        <span className="material-symbols-outlined text-[44px] text-[#86948a]">cloud_off</span>
        <h2 className="font-headline text-xl font-bold text-[#d8e3fb] mt-2">Gym features need an account</h2>
        <p className="text-sm text-[#86948a] mt-1">Sign-in isn't set up on this copy of FITORA yet.</p>
      </Card>
    );
  }

  if (authLoading) return <Card><div className="h-32 animate-pulse" /></Card>;

  if (!user) {
    return (
      <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
        <Card className="text-center py-10 px-6">
          <span className="material-symbols-outlined text-[48px] text-[#4edea3]">{pending?.kind === 'checkin' ? 'qr_code_scanner' : pending?.kind === 'join' ? 'mail' : 'storefront'}</span>
          <h1 className="font-headline text-2xl font-extrabold text-[#d8e3fb] mt-2">
            {pending?.kind === 'checkin' ? 'Sign in to check in' : pending?.kind === 'join' ? "You've been invited to your gym on FITORA" : 'FITORA for gyms'}
          </h1>
          <p className="text-sm text-[#bbcabf] mt-2 max-w-lg mx-auto">
            {pending
              ? 'Sign in with Google once. After that, your gym membership, fee due date and visits show up here.'
              : 'Members: see your fee due date and check in with a QR scan. Gym owners: track members, fees and who has stopped coming, and send WhatsApp reminders in one tap.'}
          </p>
          <Btn variant="primary" icon="login" className="mt-5" onClick={signIn}>Continue with Google</Btn>
          {authError && <p className="text-xs text-[#ffb4ab] mt-3">{authError}</p>}
        </Card>
      </div>
    );
  }

  if (pending) {
    return <PendingActionCard action={pending} uid={user.uid} membership={account?.membership || null} onDone={clearPending} />;
  }

  if (account?.ownedGymId) return <OwnerDashboard gymId={account.ownedGymId} />;

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      {account?.membership ? (
        <MemberGym gymId={account.membership.gymId} memberId={account.membership.memberId} uid={user.uid} />
      ) : (
        <Card className="py-8 px-6 text-center">
          <span className="material-symbols-outlined text-[44px] text-[#4edea3]">fitness_center</span>
          <h2 className="font-headline text-xl font-bold text-[#d8e3fb] mt-2">Connect your gym</h2>
          <p className="text-sm text-[#bbcabf] mt-1 max-w-lg mx-auto">
            Ask your gym to add you in FITORA. They'll send you a personal link on WhatsApp. Open it on this phone and your membership appears here.
          </p>
        </Card>
      )}

      {!setupOpen ? (
        <div className="text-center">
          <button onClick={() => setSetupOpen(true)} className="text-sm text-[#4edea3] hover:underline">
            Do you run a gym? Set it up on FITORA (free) →
          </button>
        </div>
      ) : (
        <SetupGym uid={user.uid} onCancel={() => setSetupOpen(false)} />
      )}
    </div>
  );
};

// ── Owner setup ──────────────────────────────────────────────────────────────

const SetupGym: React.FC<{ uid: string; onCancel: () => void }> = ({ uid, onCancel }) => {
  const { showToast } = useFitMate();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-headline text-xl font-bold text-[#d8e3fb]">Set up your gym</h2>
      <p className="text-sm text-[#bbcabf]">
        You'll get a dashboard for members, fees and visits, a check-in QR for reception, and WhatsApp reminder buttons. You can edit plans and prices later.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1"><span className={labelCls}>Gym name</span><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Iron Temple Fitness" /></label>
        <label className="flex flex-col gap-1"><span className={labelCls}>City / area</span><input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jayanagar, Bengaluru" /></label>
        <label className="flex flex-col gap-1"><span className={labelCls}>Gym phone</span><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" /></label>
      </div>
      <div className="flex justify-end gap-2">
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn
          variant="primary"
          icon="storefront"
          disabled={!name.trim() || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await createGym(uid, { name, city, phone });
              showToast(`${name} is set up! Add your first member. 🎉`);
            } catch (e) {
              console.error(e);
              showToast('Could not create the gym. Check your connection.', 'warning');
              setSaving(false);
            }
          }}
        >
          {saving ? 'Creating…' : 'Create my gym'}
        </Btn>
      </div>
    </Card>
  );
};

// ── Invite link / QR scan ────────────────────────────────────────────────────

const PendingActionCard: React.FC<{
  action: NonNullable<PendingAction>;
  uid: string;
  membership: { gymId: string; memberId: string; gymName: string } | null;
  onDone: () => void;
}> = ({ action, uid, membership, onDone }) => {
  const [state, setState] = useState<'working' | 'done' | 'error'>('working');
  const [message, setMessage] = useState('');
  const [gymName, setGymName] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (action.kind === 'join') {
          const { gym } = await claimInvite(uid, action.gymId, action.code);
          if (cancelled) return;
          setGymName(gym.name);
          setMessage(`You're connected to ${gym.name}. Your fee due date and visits now show on the Gym page.`);
          setState('done');
        } else {
          if (!membership || membership.gymId !== action.gymId) {
            const gym = await getGym(action.gymId).catch(() => null);
            throw new Error(
              gym
                ? `You're not linked to ${gym.name} yet. Ask the front desk to add you, then open the invite link they send you.`
                : 'This QR code is not valid.',
            );
          }
          await selfCheckin(uid, action.gymId, membership.memberId, action.code);
          if (cancelled) return;
          setGymName(membership.gymName);
          setMessage(`Checked in at ${membership.gymName} · ${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}. Have a great workout!`);
          setState('done');
        }
      } catch (e) {
        if (cancelled) return;
        const code = (e as { code?: string })?.code;
        setMessage(
          code === 'permission-denied'
            ? action.kind === 'checkin'
              ? 'This QR code is old or not valid. Ask the front desk for the current one.'
              : 'This invite link has already been used by another account, or is not valid.'
            : (e as Error)?.message || 'Something went wrong. Please try again.',
        );
        setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [action, uid, membership]);

  return (
    <Card className="max-w-lg mx-auto w-full text-center py-10 px-6">
      {state === 'working' && (
        <>
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-[#4edea3]/30 border-t-[#4edea3] animate-spin" />
          <p className="text-sm text-[#bbcabf] mt-4">{action.kind === 'join' ? 'Connecting you to your gym…' : 'Checking you in…'}</p>
        </>
      )}
      {state !== 'working' && (
        <>
          <span className={`material-symbols-outlined text-[56px] ${state === 'done' ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}`}>{state === 'done' ? 'check_circle' : 'error'}</span>
          <h2 className="font-headline text-2xl font-extrabold text-[#d8e3fb] mt-2">
            {state === 'done' ? (action.kind === 'checkin' ? "You're checked in!" : `Welcome to ${gymName}!`) : 'That didn’t work'}
          </h2>
          <p className="text-sm text-[#bbcabf] mt-2">{message}</p>
          <Btn variant="primary" className="mt-5" onClick={onDone}>Continue</Btn>
        </>
      )}
    </Card>
  );
};

// ── Member's view of their gym ───────────────────────────────────────────────

const MemberGym: React.FC<{ gymId: string; memberId: string; uid: string }> = ({ gymId, memberId, uid }) => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [member, setMember] = useState<GymMember | null>(null);
  const [visits, setVisits] = useState<GymCheckin[]>([]);

  useEffect(() => {
    getGym(gymId).then(setGym).catch(() => {});
    myRecentCheckins(gymId, uid).then(setVisits).catch(() => {});
    return subscribeMyMembership(gymId, memberId, setMember);
  }, [gymId, memberId, uid]);

  if (!gym || !member) return <Card><div className="h-32 animate-pulse" /></Card>;

  const plan = gym.plans.find((p) => p.id === member.planId);
  const d = daysUntilDue(member);
  const monthKey = localDate().slice(0, 7);
  const thisMonth = visits.filter((v) => v.date.startsWith(monthKey)).length;
  const today = visits.some((v) => v.date === localDate());

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-br from-[#152031] to-[#10251d] rounded-2xl border border-[#1f2a3c] p-5 sm:p-6">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#4edea3]">My gym</div>
        <h1 className="font-headline text-2xl font-extrabold text-[#d8e3fb]">{gym.name}</h1>
        <p className="text-xs text-[#86948a]">{gym.city}{gym.phone ? ` · ${gym.phone}` : ''}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Card>
          <div className={labelCls}>Membership</div>
          <div className="font-headline text-lg font-bold text-[#d8e3fb] mt-1">{plan?.name || 'Plan'}{plan ? ` · ${inr(plan.priceInr)}` : ''}</div>
          <div className="mt-1.5"><FeeBadge member={member} /></div>
        </Card>
        <Card>
          <div className={labelCls}>Paid till</div>
          <div className={`font-headline text-lg font-bold mt-1 ${d < 0 ? 'text-[#ffb4ab]' : d <= 7 ? 'text-[#ffb95f]' : 'text-[#d8e3fb]'}`}>{fmtDate(member.dueDate)}</div>
          <div className="text-[11px] text-[#86948a] mt-1">{d < 0 ? `${-d} days overdue. Please pay at the desk.` : d === 0 ? 'Due today' : `${d} days left`}</div>
        </Card>
        <Card>
          <div className={labelCls}>Visits this month</div>
          <div className="font-headline text-lg font-bold text-[#4edea3] mt-1">{thisMonth}</div>
          <div className="text-[11px] text-[#86948a] mt-1">{today ? 'Checked in today ✅' : 'Not checked in today'}</div>
        </Card>
      </div>
      <Card className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[28px] text-[#4edea3]">qr_code_scanner</span>
        <div>
          <h3 className="font-bold text-[#d8e3fb]">How to check in</h3>
          <p className="text-sm text-[#bbcabf]">When you arrive, open your phone camera and scan the FITORA QR code at reception. That's it.</p>
        </div>
      </Card>
      {visits.length > 0 && (
        <Card>
          <h3 className="font-bold text-[#d8e3fb] mb-2">Recent visits</h3>
          <div className="flex flex-wrap gap-2">
            {visits.slice(0, 20).map((v) => (
              <span key={v.id} className="text-xs bg-[#111c2d] border border-[#1f2a3c] rounded-full px-3 py-1 text-[#bbcabf]">{fmtDate(v.date)}</span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
