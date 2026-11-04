import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useFitMate } from '../../context/FitMateContext';
import type { Gym, GymCheckin, GymMember, GymPayment, GymPlan, MemberStatus, PaymentMethod } from '../../types/cloud';
import {
  addMember,
  checkinUrl,
  daysUntilDue,
  deleteMember,
  deletePayment,
  feeReminderText,
  getOrCreateQrToken,
  inviteText,
  inviteUrl,
  manualCheckin,
  missYouText,
  normalisePhone,
  recordPayment,
  rotateQrToken,
  subscribeCheckinsSince,
  subscribeGym,
  subscribeMembers,
  subscribePayments,
  updateGym,
  updateMember,
  whatsappLink,
} from '../../lib/gym';
import { localDate } from '../../lib/progression';
import { Btn, Card, FeeBadge, Modal, Stat, daysSinceVisit, fmtDate, inputCls, inr, labelCls, visitText } from './ui';

type Tab = 'overview' | 'members' | 'payments' | 'qr' | 'settings';

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'upi', label: 'UPI' },
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank transfer' },
];

export const OwnerDashboard: React.FC<{ gymId: string }> = ({ gymId }) => {
  const { showToast } = useFitMate();
  const [gym, setGym] = useState<Gym | null>(null);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [payments, setPayments] = useState<GymPayment[]>([]);
  const [checkins, setCheckins] = useState<GymCheckin[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [adding, setAdding] = useState(false);
  const [paying, setPaying] = useState<GymMember | null>(null);
  const [editing, setEditing] = useState<GymMember | null>(null);
  const [inviting, setInviting] = useState<GymMember | null>(null);
  const [memberFilter, setMemberFilter] = useState<'all' | 'due' | 'overdue' | 'inactive' | 'unlinked'>('all');

  const since = useMemo(() => localDate(new Date(Date.now() - 60 * 864e5)), []);
  useEffect(() => subscribeGym(gymId, setGym), [gymId]);
  useEffect(() => subscribeMembers(gymId, setMembers), [gymId]);
  useEffect(() => subscribePayments(gymId, setPayments), [gymId]);
  useEffect(() => subscribeCheckinsSince(gymId, since, setCheckins), [gymId, since]);

  // Last visit = newest of manual record and QR check-ins
  const lastVisitById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) if (m.lastVisit) map[m.id] = m.lastVisit;
    for (const c of checkins) if (!map[c.memberId] || c.date > map[c.memberId]) map[c.memberId] = c.date;
    return map;
  }, [members, checkins]);

  // Save newer QR visits onto the member record so they survive beyond the 60-day window
  const backfilled = useRef(new Set<string>());
  useEffect(() => {
    for (const m of members) {
      const lv = lastVisitById[m.id];
      const key = `${m.id}:${lv}`;
      if (lv && lv !== m.lastVisit && !backfilled.current.has(key)) {
        backfilled.current.add(key);
        updateMember(gymId, m.id, { lastVisit: lv }).catch(() => {});
      }
    }
  }, [members, lastVisitById, gymId]);

  const today = localDate();
  const active = members.filter((m) => m.status === 'active');
  const overdue = active.filter((m) => daysUntilDue(m) < 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const dueSoon = active.filter((m) => { const d = daysUntilDue(m); return d >= 0 && d <= 7; }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const inactiveDays = gym?.inactiveAfterDays ?? 7;
  const atRisk = active
    .filter((m) => {
      const d = daysSinceVisit(lastVisitById[m.id]);
      // Brand-new members get a grace period equal to the inactivity window
      return d === null ? m.joinedOn <= localDate(new Date(Date.now() - inactiveDays * 864e5)) : d >= inactiveDays;
    })
    .sort((a, b) => (lastVisitById[a.id] || '').localeCompare(lastVisitById[b.id] || ''));
  const todayCheckins = checkins.filter((c) => c.date === today);
  const monthKey = today.slice(0, 7);
  const monthPayments = payments.filter((p) => p.paidOn.startsWith(monthKey));
  const monthTotal = monthPayments.reduce((s, p) => s + p.amountInr, 0);

  if (!gym) {
    return <Card><div className="h-24 animate-pulse" /></Card>;
  }

  const planOf = (m: GymMember) => gym.plans.find((p) => p.id === m.planId);
  const memberById = (id: string) => members.find((m) => m.id === id);

  const markPresent = async (m: GymMember) => {
    try {
      await manualCheckin(gymId, m);
      showToast(`${m.name} marked present today ✅`);
    } catch {
      showToast('Could not save. Check your connection.', 'warning');
    }
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Today', icon: 'space_dashboard' },
    { id: 'members', label: `Members (${active.length})`, icon: 'group' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'qr', label: 'Check-in QR', icon: 'qr_code_2' },
    { id: 'settings', label: 'Settings', icon: 'tune' },
  ];

  const MemberRow: React.FC<{ m: GymMember; mode?: 'fee' | 'risk' | 'full' }> = ({ m, mode = 'full' }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 border-b border-[#1f2a3c] last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-[#d8e3fb]">{m.name}</span>
          <FeeBadge member={m} />
          {m.uid ? (
            <span className="text-[10px] text-[#4edea3] flex items-center gap-0.5" title="Uses the FITORA app"><span className="material-symbols-outlined text-[13px]">smartphone</span>App</span>
          ) : null}
        </div>
        <div className="text-[11px] text-[#86948a] mt-0.5">
          {planOf(m)?.name || 'Plan'} · +{m.phone.slice(-10)} · {visitText(lastVisitById[m.id])}
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {(mode === 'fee' || mode === 'full') && (
          <>
            <Btn small variant="primary" icon="currency_rupee" onClick={() => setPaying(m)}>Paid</Btn>
            {mode === 'fee' && (
              <a href={whatsappLink(m.phone, feeReminderText(gym, m))} target="_blank" rel="noreferrer">
                <Btn small variant="whatsapp" icon="chat">Remind</Btn>
              </a>
            )}
          </>
        )}
        {mode === 'risk' && (
          <a href={whatsappLink(m.phone, missYouText(gym, m, daysSinceVisit(lastVisitById[m.id])))} target="_blank" rel="noreferrer">
            <Btn small variant="whatsapp" icon="chat">Check in on them</Btn>
          </a>
        )}
        {mode === 'full' && (
          <>
            <Btn small icon="how_to_reg" onClick={() => markPresent(m)} disabled={lastVisitById[m.id] === today}>{lastVisitById[m.id] === today ? 'Here today' : 'Present'}</Btn>
            {!m.uid && <Btn small icon="link" onClick={() => setInviting(m)}>Invite</Btn>}
            <Btn small icon="edit" onClick={() => setEditing(m)} aria-label={`Edit ${m.name}`} />
          </>
        )}
      </div>
    </div>
  );

  const filteredMembers = members
    .filter((m) => {
      if (memberFilter === 'due') return m.status === 'active' && daysUntilDue(m) >= 0 && daysUntilDue(m) <= 7;
      if (memberFilter === 'overdue') return m.status === 'active' && daysUntilDue(m) < 0;
      if (memberFilter === 'inactive') return atRisk.includes(m);
      if (memberFilter === 'unlinked') return !m.uid;
      return true;
    })
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === 'active' ? -1 : 1));

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#152031] to-[#10251d] rounded-2xl border border-[#1f2a3c] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#4edea3]">Gym owner dashboard</div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#d8e3fb]">{gym.name}</h1>
          <p className="text-xs text-[#86948a] mt-0.5">{gym.city} · {members.length} members on record</p>
        </div>
        <Btn variant="primary" icon="person_add" onClick={() => setAdding(true)}>Add member</Btn>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              tab === t.id ? 'bg-[#4edea3] text-[#003824] border-[#4edea3]' : 'bg-[#152031] text-[#bbcabf] border-[#1f2a3c] hover:border-[#4edea3]/40'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat icon="how_to_reg" tone="green" label="Checked in today" value={todayCheckins.length} onClick={() => setTab('qr')} />
            <Stat icon="schedule" tone="amber" label="Fees due in 7 days" value={dueSoon.length} onClick={() => { setMemberFilter('due'); setTab('members'); }} />
            <Stat icon="error" tone="red" label="Fees overdue" value={overdue.length} onClick={() => { setMemberFilter('overdue'); setTab('members'); }} />
            <Stat icon="payments" tone="blue" label={`Collected in ${new Date().toLocaleDateString('en-IN', { month: 'long' })}`} value={inr(monthTotal)} onClick={() => setTab('payments')} />
          </div>

          {members.length === 0 ? (
            <Card className="text-center py-10">
              <span className="material-symbols-outlined text-[44px] text-[#4edea3]">group_add</span>
              <h3 className="font-headline text-lg font-bold text-[#d8e3fb] mt-2">Add your first member</h3>
              <p className="text-sm text-[#86948a] max-w-md mx-auto mt-1">
                Enter their name, phone and plan. FITORA then tracks their fee due date and visits, and tells you who to follow up with.
              </p>
              <Btn variant="primary" icon="person_add" className="mt-4" onClick={() => setAdding(true)}>Add member</Btn>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              <Card>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline font-bold text-[#d8e3fb] flex items-center gap-2"><span className="material-symbols-outlined text-[#ffb95f]">notifications_active</span>Collect fees</h3>
                  <span className="text-[11px] text-[#86948a]">{overdue.length + dueSoon.length} to follow up</span>
                </div>
                <p className="text-[11px] text-[#86948a] mb-2">"Remind" opens WhatsApp with the message ready. You tap Send.</p>
                {[...overdue, ...dueSoon].length === 0 ? (
                  <p className="text-sm text-[#4edea3] py-4">Everyone is paid up for the next 7 days. 🎉</p>
                ) : (
                  [...overdue, ...dueSoon].slice(0, 12).map((m) => <MemberRow key={m.id} m={m} mode="fee" />)
                )}
              </Card>
              <Card>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline font-bold text-[#d8e3fb] flex items-center gap-2"><span className="material-symbols-outlined text-[#ffb4ab]">person_alert</span>At risk of quitting</h3>
                  <span className="text-[11px] text-[#86948a]">No visit in {inactiveDays}+ days</span>
                </div>
                <p className="text-[11px] text-[#86948a] mb-2">Members who stop coming usually don't renew. A friendly message early often brings them back.</p>
                {atRisk.length === 0 ? (
                  <p className="text-sm text-[#4edea3] py-4">Everyone has visited recently. 💪</p>
                ) : (
                  atRisk.slice(0, 12).map((m) => <MemberRow key={m.id} m={m} mode="risk" />)
                )}
              </Card>
            </div>
          )}

          {todayCheckins.length > 0 && (
            <Card>
              <h3 className="font-headline font-bold text-[#d8e3fb] mb-2">Here today</h3>
              <div className="flex flex-wrap gap-2">
                {todayCheckins.map((c) => (
                  <span key={c.id} className="text-xs bg-[#111c2d] border border-[#1f2a3c] rounded-full px-3 py-1 text-[#d8e3fb]">
                    {memberById(c.memberId)?.name || 'Member'}
                    <span className="text-[#86948a]"> · {new Date(c.at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} · {c.source === 'qr' ? 'QR' : 'desk'}</span>
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'members' && (
        <Card>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-1 [scrollbar-width:none]">
            {([
              ['all', `All (${members.length})`],
              ['due', `Due soon (${dueSoon.length})`],
              ['overdue', `Overdue (${overdue.length})`],
              ['inactive', `Not visiting (${atRisk.length})`],
              ['unlinked', `Not on app (${members.filter((m) => !m.uid).length})`],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMemberFilter(id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border ${memberFilter === id ? 'bg-[#4edea3] text-[#003824] border-[#4edea3]' : 'bg-[#111c2d] text-[#bbcabf] border-[#1f2a3c]'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {filteredMembers.length === 0 ? (
            <p className="text-sm text-[#86948a] py-6 text-center">No members here.</p>
          ) : (
            filteredMembers.map((m) => <MemberRow key={m.id} m={m} />)
          )}
        </Card>
      )}

      {tab === 'payments' && (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h3 className="font-headline font-bold text-[#d8e3fb]">Payments</h3>
            <div className="text-xs text-[#86948a]">
              This month: <strong className="text-[#4edea3]">{inr(monthTotal)}</strong> from {monthPayments.length} payments
              {METHODS.map((mt) => {
                const t = monthPayments.filter((p) => p.method === mt.id).reduce((s, p) => s + p.amountInr, 0);
                return t ? <span key={mt.id}> · {mt.label} {inr(t)}</span> : null;
              })}
            </div>
          </div>
          <p className="text-[11px] text-[#86948a] mb-2">FITORA records payments you've received; it doesn't collect money itself.</p>
          {payments.length === 0 ? (
            <p className="text-sm text-[#86948a] py-6 text-center">No payments recorded yet. Use "Paid" next to a member.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-[#86948a] border-b border-[#1f2a3c]">
                    <th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Member</th><th className="py-2 pr-3 text-right">Amount</th><th className="py-2 pr-3">Method</th><th className="py-2 pr-3">Paid till</th><th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 200).map((p) => (
                    <tr key={p.id} className="border-b border-[#1f2a3c] last:border-0 text-[#d8e3fb]">
                      <td className="py-2.5 pr-3 whitespace-nowrap">{fmtDate(p.paidOn)}</td>
                      <td className="py-2.5 pr-3">{p.memberName}</td>
                      <td className="py-2.5 pr-3 text-right font-bold tabular-nums">{inr(p.amountInr)}</td>
                      <td className="py-2.5 pr-3 uppercase text-[11px] text-[#bbcabf]">{p.method}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-[#bbcabf]">{fmtDate(p.newDueDate)}</td>
                      <td className="py-2.5 text-right">
                        <button
                          className="text-[#86948a] hover:text-[#ffb4ab]"
                          title="Delete this payment record"
                          onClick={async () => {
                            if (window.confirm(`Delete the ${inr(p.amountInr)} payment from ${p.memberName}? The member's due date will NOT change automatically.`)) {
                              await deletePayment(gymId, p.id);
                              showToast('Payment record deleted.', 'info');
                            }
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'qr' && <QrPanel gym={gym} todayCheckins={todayCheckins} memberById={memberById} />}

      {tab === 'settings' && <SettingsPanel gym={gym} onSaved={() => showToast('Gym settings saved.')} />}

      {adding && <AddMemberModal gym={gym} onClose={() => setAdding(false)} onAdded={(m) => { setAdding(false); setInviting(m); }} />}
      {paying && <PaymentModal gym={gym} member={paying} onClose={() => setPaying(null)} />}
      {editing && <EditMemberModal gym={gym} member={editing} onClose={() => setEditing(null)} />}
      {inviting && <InviteModal gym={gym} member={inviting} onClose={() => setInviting(null)} />}
    </div>
  );
};

// ── Add member ───────────────────────────────────────────────────────────────

const AddMemberModal: React.FC<{ gym: Gym; onClose: () => void; onAdded: (m: GymMember) => void }> = ({ gym, onClose, onAdded }) => {
  const { showToast } = useFitMate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState(gym.plans[0]?.id || '');
  const [joinedOn, setJoinedOn] = useState(localDate());
  const [paidNow, setPaidNow] = useState(true);
  const [amount, setAmount] = useState<number>(gym.plans[0]?.priceInr || 0);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [saving, setSaving] = useState(false);
  const phoneOk = phone.replace(/\D/g, '').length >= 10;

  useEffect(() => {
    const p = gym.plans.find((x) => x.id === planId);
    if (p) setAmount(p.priceInr);
  }, [planId, gym.plans]);

  const save = async () => {
    if (!name.trim() || !phoneOk) return;
    setSaving(true);
    try {
      const m = await addMember(gym, { name, phone, planId, joinedOn, paidNow, amountInr: amount, method });
      showToast(`${m.name} added ✅`);
      onAdded(m);
    } catch {
      showToast('Could not add member. Check your connection.', 'warning');
      setSaving(false);
    }
  };

  return (
    <Modal title="Add member" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1"><span className={labelCls}>Name</span><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Ravi Kumar" /></label>
        <label className="flex flex-col gap-1"><span className={labelCls}>WhatsApp number</span><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="10-digit mobile number" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1"><span className={labelCls}>Plan</span>
            <select className={inputCls} value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {gym.plans.map((p) => <option key={p.id} value={p.id}>{p.name} · {inr(p.priceInr)}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className={labelCls}>Start date</span><input type="date" className={inputCls} value={joinedOn} onChange={(e) => setJoinedOn(e.target.value)} /></label>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#d8e3fb] cursor-pointer mt-1">
          <input type="checkbox" checked={paidNow} onChange={(e) => setPaidNow(e.target.checked)} className="accent-[#4edea3] w-4 h-4" /> Fee paid now
        </label>
        {paidNow && (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1"><span className={labelCls}>Amount (₹)</span><input type="number" min={0} className={inputCls} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></label>
            <label className="flex flex-col gap-1"><span className={labelCls}>Paid by</span>
              <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </label>
          </div>
        )}
        {!paidNow && <p className="text-[11px] text-[#ffb95f]">They'll show as "due" from the start date until you record a payment.</p>}
        <div className="flex justify-end gap-2 mt-2">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="check" disabled={!name.trim() || !phoneOk || saving} onClick={save}>{saving ? 'Saving…' : 'Add member'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ── Record payment ───────────────────────────────────────────────────────────

const PaymentModal: React.FC<{ gym: Gym; member: GymMember; onClose: () => void }> = ({ gym, member, onClose }) => {
  const { showToast } = useFitMate();
  const [planId, setPlanId] = useState(member.planId);
  const plan = gym.plans.find((p) => p.id === planId) || gym.plans[0];
  const [amount, setAmount] = useState<number>(plan?.priceInr || 0);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [paidOn, setPaidOn] = useState(localDate());
  const [saving, setSaving] = useState(false);

  useEffect(() => setAmount(gym.plans.find((p) => p.id === planId)?.priceInr || 0), [planId, gym.plans]);

  const save = async () => {
    setSaving(true);
    try {
      const p = await recordPayment(gym, member, { planId, amountInr: amount, method, paidOn });
      showToast(`${inr(p.amountInr)} recorded. ${member.name} is paid till ${fmtDate(p.newDueDate)}.`);
      onClose();
    } catch {
      showToast('Could not save. Check your connection.', 'warning');
      setSaving(false);
    }
  };

  return (
    <Modal title={`Fee received: ${member.name}`} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[#86948a]">Currently paid till <strong className="text-[#d8e3fb]">{fmtDate(member.dueDate)}</strong>. Paying early extends from that date; paying late starts from the payment date.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1"><span className={labelCls}>Plan</span>
            <select className={inputCls} value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {gym.plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.months} mo)</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className={labelCls}>Amount (₹)</span><input type="number" min={0} className={inputCls} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></label>
          <label className="flex flex-col gap-1"><span className={labelCls}>Paid by</span>
            <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className={labelCls}>Date</span><input type="date" className={inputCls} value={paidOn} onChange={(e) => setPaidOn(e.target.value)} /></label>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="check" disabled={saving || amount < 0} onClick={save}>{saving ? 'Saving…' : 'Save payment'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ── Edit member ──────────────────────────────────────────────────────────────

const EditMemberModal: React.FC<{ gym: Gym; member: GymMember; onClose: () => void }> = ({ gym, member, onClose }) => {
  const { showToast } = useFitMate();
  const [name, setName] = useState(member.name);
  const [phone, setPhone] = useState(member.phone);
  const [status, setStatus] = useState<MemberStatus>(member.status);
  const [dueDate, setDueDate] = useState(member.dueDate);
  const [notes, setNotes] = useState(member.notes || '');

  const save = async () => {
    await updateMember(gym.id, member.id, { name: name.trim(), phone: normalisePhone(phone), status, dueDate, notes });
    showToast('Member updated.');
    onClose();
  };

  return (
    <Modal title="Edit member" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1"><span className={labelCls}>Name</span><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="flex flex-col gap-1"><span className={labelCls}>WhatsApp number</span><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1"><span className={labelCls}>Status</span>
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as MemberStatus)}>
              <option value="active">Active</option><option value="paused">Paused (travel, injury…)</option><option value="left">Left the gym</option>
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className={labelCls}>Paid till</span><input type="date" className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
        </div>
        <label className="flex flex-col gap-1"><span className={labelCls}>Notes</span><textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. knee injury, prefers evening slot" /></label>
        <div className="flex justify-between gap-2 mt-2">
          <Btn
            variant="danger"
            icon="delete"
            onClick={async () => {
              if (window.confirm(`Remove ${member.name} completely? Their payment records stay. To keep their history, set status to "Left" instead.`)) {
                await deleteMember(gym.id, member);
                showToast(`${member.name} removed.`, 'info');
                onClose();
              }
            }}
          >
            Remove
          </Btn>
          <div className="flex gap-2">
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" icon="check" disabled={!name.trim()} onClick={save}>Save</Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── Invite to the app ────────────────────────────────────────────────────────

const InviteModal: React.FC<{ gym: Gym; member: GymMember; onClose: () => void }> = ({ gym, member, onClose }) => {
  const { showToast } = useFitMate();
  const link = inviteUrl(gym.id, member.inviteCode);
  return (
    <Modal title={`Invite ${member.name.split(' ')[0]} to the app`} onClose={onClose}>
      <p className="text-sm text-[#bbcabf]">
        With the app they can see their fee due date, check in by scanning your QR at reception, and track workouts. Send them this personal link:
      </p>
      <div className="mt-3 bg-[#0b1420] border border-[#2a3a52] rounded-xl px-3 py-2.5 text-xs text-[#9ecaff] break-all">{link}</div>
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <a className="flex-1" href={whatsappLink(member.phone, inviteText(gym, member))} target="_blank" rel="noreferrer">
          <Btn variant="whatsapp" icon="chat" className="w-full">Send on WhatsApp</Btn>
        </a>
        <Btn
          icon="content_copy"
          className="flex-1"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              showToast('Link copied.');
            } catch {
              showToast('Copy failed. Select the link and copy it.', 'warning');
            }
          }}
        >
          Copy link
        </Btn>
      </div>
      <p className="text-[11px] text-[#86948a] mt-3">The link only works for this member. They sign in with Google once.</p>
    </Modal>
  );
};

// ── Reception QR ─────────────────────────────────────────────────────────────

const QrPanel: React.FC<{ gym: Gym; todayCheckins: GymCheckin[]; memberById: (id: string) => GymMember | undefined }> = ({ gym, todayCheckins, memberById }) => {
  const { showToast } = useFitMate();
  const [token, setToken] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    getOrCreateQrToken(gym.id).then(setToken).catch(() => showToast('Could not load the QR code.', 'warning'));
  }, [gym.id]);

  useEffect(() => {
    if (!token) return;
    QRCode.toDataURL(checkinUrl(gym.id, token), { width: 640, margin: 2, color: { dark: '#081425', light: '#ffffff' } }).then(setDataUrl);
  }, [token, gym.id]);

  const print = () => {
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) return;
    w.document.write(`<!doctype html><title>${gym.name} check-in</title><body style="font-family:system-ui;text-align:center;padding:40px">
      <h1 style="margin:0">${gym.name}</h1><p style="font-size:20px">Scan to check in with FITORA</p>
      <img src="${dataUrl}" style="width:420px;max-width:100%"/><p style="color:#555">Open your phone camera and point it at this code.</p>
      <script>onload=()=>print()</script></body>`);
    w.document.close();
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-5">
      <Card className="flex flex-col items-center text-center">
        <h3 className="font-headline font-bold text-[#d8e3fb]">Reception check-in QR</h3>
        <p className="text-xs text-[#86948a] mt-1 mb-3">Print it and stick it at the front desk. Members scan it with their phone camera when they arrive.</p>
        {dataUrl ? <img src={dataUrl} alt="Check-in QR code" className="w-64 h-64 rounded-xl bg-white p-2" /> : <div className="w-64 h-64 rounded-xl bg-[#111c2d] animate-pulse" />}
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          <Btn variant="primary" icon="print" onClick={print} disabled={!dataUrl}>Print</Btn>
          <Btn
            icon="autorenew"
            onClick={async () => {
              if (!window.confirm('Make a new QR code? The old printed one will stop working.')) return;
              setToken(await rotateQrToken(gym.id));
              showToast('New QR code ready. Print it again.');
            }}
          >
            New code
          </Btn>
        </div>
        <p className="text-[11px] text-[#86948a] mt-3">Only members you've invited (linked to the app) can check in, once per day.</p>
      </Card>
      <Card>
        <h3 className="font-headline font-bold text-[#d8e3fb] mb-2">Today's check-ins ({todayCheckins.length})</h3>
        {todayCheckins.length === 0 ? (
          <p className="text-sm text-[#86948a]">No one yet today. Members without the app can be marked present from the Members tab.</p>
        ) : (
          todayCheckins.sort((a, b) => b.at - a.at).map((c) => (
            <div key={c.id} className="flex justify-between py-2 border-b border-[#1f2a3c] last:border-0 text-sm">
              <span className="text-[#d8e3fb]">{memberById(c.memberId)?.name || 'Member'}</span>
              <span className="text-[#86948a] text-xs">{new Date(c.at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} · {c.source === 'qr' ? 'QR scan' : 'Desk'}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

// ── Settings ─────────────────────────────────────────────────────────────────

const SettingsPanel: React.FC<{ gym: Gym; onSaved: () => void }> = ({ gym, onSaved }) => {
  const [name, setName] = useState(gym.name);
  const [city, setCity] = useState(gym.city);
  const [phone, setPhone] = useState(gym.phone);
  const [days, setDays] = useState(gym.inactiveAfterDays);
  const [plans, setPlans] = useState<GymPlan[]>(gym.plans);
  const setPlan = (i: number, patch: Partial<GymPlan>) => setPlans((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <Card className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1"><span className={labelCls}>Gym name</span><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="flex flex-col gap-1"><span className={labelCls}>City / area</span><input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} /></label>
        <label className="flex flex-col gap-1"><span className={labelCls}>Gym phone</span><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      </div>
      <label className="flex flex-col gap-1 max-w-xs">
        <span className={labelCls}>"At risk" after no visit for</span>
        <select className={inputCls} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {[5, 7, 10, 14, 21].map((d) => <option key={d} value={d}>{d} days</option>)}
        </select>
      </label>
      <div>
        <div className={`${labelCls} mb-2`}>Membership plans</div>
        <div className="flex flex-col gap-2">
          {plans.map((p, i) => (
            <div key={p.id} className="grid grid-cols-[1fr_90px_110px_36px] gap-2 items-center">
              <input className={inputCls} value={p.name} onChange={(e) => setPlan(i, { name: e.target.value })} aria-label="Plan name" />
              <select className={inputCls} value={p.months} onChange={(e) => setPlan(i, { months: Number(e.target.value) })} aria-label="Months">
                {[1, 2, 3, 6, 12].map((m) => <option key={m} value={m}>{m} mo</option>)}
              </select>
              <input type="number" min={0} className={inputCls} value={p.priceInr} onChange={(e) => setPlan(i, { priceInr: Number(e.target.value) })} aria-label="Price in rupees" />
              <button className="text-[#86948a] hover:text-[#ffb4ab] disabled:opacity-30" disabled={plans.length <= 1} onClick={() => setPlans((x) => x.filter((_, j) => j !== i))} aria-label="Remove plan">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>
        <Btn small icon="add" className="mt-2" onClick={() => setPlans((x) => [...x, { id: `p${Date.now().toString(36)}`, name: 'New plan', months: 1, priceInr: 1000 }])}>Add plan</Btn>
      </div>
      <div className="flex justify-end">
        <Btn
          variant="primary"
          icon="save"
          disabled={!name.trim()}
          onClick={async () => {
            await updateGym(gym.id, { name: name.trim(), city: city.trim(), phone: phone.trim(), inactiveAfterDays: days, plans: plans.filter((p) => p.name.trim()) });
            onSaved();
          }}
        >
          Save settings
        </Btn>
      </div>
    </Card>
  );
};
