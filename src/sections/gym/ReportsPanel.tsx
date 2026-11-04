import React, { useMemo, useState } from 'react';
import type { Gym, GymCheckin, GymMember, GymPayment } from '../../types/cloud';
import { Btn, Card, inr, labelCls } from './ui';

/**
 * Monthly report for the owner: joins, renewals, money collected, members who left,
 * visits and the busiest hours. Built from the gym's own records only.
 */

const monthLabel = (key: string) => new Date(key + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ReportsPanel: React.FC<{
  gym: Gym;
  members: GymMember[];
  payments: GymPayment[];
  checkins: GymCheckin[];
  checkinsSince: string;
}> = ({ gym, members, payments, checkins, checkinsSince }) => {
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
  }, []);
  const [month, setMonth] = useState(months[0]);

  const r = useMemo(() => {
    const inMonth = (d?: string | null) => Boolean(d && d.startsWith(month));
    const pays = payments.filter((p) => inMonth(p.paidOn));
    const joined = members.filter((m) => inMonth(m.joinedOn));
    const left = members.filter((m) => inMonth(m.leftOn));
    const renewals = pays.filter((p) => p.note !== 'Joining fee');
    const visits = checkins.filter((c) => inMonth(c.date));
    const byHour = Array(24).fill(0) as number[];
    const byDay = Array(7).fill(0) as number[];
    for (const c of visits) {
      const d = new Date(c.at);
      byHour[d.getHours()]++;
      byDay[(d.getDay() + 6) % 7]++;
    }
    const byMethod = new Map<string, number>();
    for (const p of pays) byMethod.set(p.method, (byMethod.get(p.method) || 0) + p.amountInr);
    const activeNow = members.filter((m) => m.status === 'active').length;
    return {
      pays,
      joined,
      left,
      renewals,
      visits,
      uniqueVisitors: new Set(visits.map((v) => v.memberId)).size,
      total: pays.reduce((s, p) => s + p.amountInr, 0),
      byMethod: [...byMethod.entries()].sort((a, b) => b[1] - a[1]),
      byHour,
      byDay,
      activeNow,
    };
  }, [month, members, payments, checkins]);

  const visitsComplete = `${month}-01` >= checkinsSince;
  const peakHour = Math.max(...r.byHour);
  const hours = r.byHour.map((n, h) => ({ h, n })).filter((x) => x.h >= 5 && x.h <= 23);
  const fmtHour = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? 'am' : 'pm'}`;

  const downloadCsv = () => {
    const rows = [['Date', 'Member', 'Amount (INR)', 'Method', 'Months', 'Paid till', 'Note']];
    for (const p of [...r.pays].sort((a, b) => a.paidOn.localeCompare(b.paidOn))) {
      rows.push([p.paidOn, p.memberName, String(p.amountInr), p.method.toUpperCase(), String(p.months), p.newDueDate, p.note || '']);
    }
    const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gym.name.replace(/[^a-z0-9]+/gi, '-')}-payments-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Num: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
    <div className="bg-[#111c2d] rounded-xl border border-[#1f2a3c] p-3.5">
      <div className="font-headline text-2xl font-extrabold text-[#d8e3fb] tabular-nums">{value}</div>
      <div className="text-[11px] text-[#86948a] font-semibold">{label}</div>
      {hint && <div className="text-[10px] text-[#5d6b80] mt-0.5">{hint}</div>}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-headline font-bold text-[#d8e3fb]">Monthly report</h3>
          <p className="text-xs text-[#86948a]">{monthLabel(month)} · {gym.name}</p>
        </div>
        <div className="flex gap-2 items-center">
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-[#0b1420] border border-[#2a3a52] rounded-xl px-3 py-2 text-sm text-[#d8e3fb]" aria-label="Month">
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <Btn small icon="download" onClick={downloadCsv} disabled={!r.pays.length}>Payments CSV</Btn>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Num label="Collected" value={inr(r.total)} hint={`${r.pays.length} payments`} />
        <Num label="New members" value={r.joined.length} />
        <Num label="Renewals" value={r.renewals.length} />
        <Num label="Left the gym" value={r.left.length} hint={`${r.activeNow} active members now`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-headline font-bold text-[#d8e3fb] mb-1">Money by payment method</h3>
          {r.byMethod.length === 0 ? (
            <p className="text-sm text-[#86948a] py-3">No payments recorded this month.</p>
          ) : (
            r.byMethod.map(([method, amt]) => (
              <div key={method} className="py-1.5">
                <div className="flex justify-between text-sm"><span className="text-[#bbcabf] uppercase text-xs font-bold">{method}</span><span className="text-[#d8e3fb] font-semibold tabular-nums">{inr(amt)}</span></div>
                <div className="h-1.5 bg-[#0b1420] rounded-full mt-1"><div className="h-full bg-[#4edea3] rounded-full" style={{ width: `${(amt / Math.max(1, r.total)) * 100}%` }} /></div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <h3 className="font-headline font-bold text-[#d8e3fb]">Visits</h3>
          {!visitsComplete && <p className="text-[11px] text-[#ffb95f] mt-0.5">Visit history is kept for the last 100 days, so this month may be incomplete.</p>}
          <div className="grid grid-cols-3 gap-2 my-3">
            <Num label="Check-ins" value={r.visits.length} />
            <Num label="Members who came" value={r.uniqueVisitors} />
            <Num label="Visits per member" value={r.uniqueVisitors ? (r.visits.length / r.uniqueVisitors).toFixed(1) : '—'} />
          </div>
          <div className={`${labelCls} mb-1.5`}>Busiest days</div>
          <div className="flex items-end gap-1.5 h-16">
            {r.byDay.map((n, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5" title={`${DAYS[i]}: ${n} check-ins`}>
                <div className="w-full bg-[#9ecaff]/60 rounded-t" style={{ height: n ? `${(n / Math.max(1, ...r.byDay)) * 100}%` : '2px' }} />
                <span className="text-[9px] text-[#86948a]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-headline font-bold text-[#d8e3fb]">Busiest hours</h3>
        <p className="text-xs text-[#86948a] mb-3">Check-ins by hour of arrival. Useful for trainer shifts and offers in quiet hours.</p>
        {r.visits.length === 0 ? (
          <p className="text-sm text-[#86948a]">No check-ins this month yet. They come from QR scans and "Present" taps.</p>
        ) : (
          <div className="flex items-end gap-1 h-28" role="img" aria-label="Check-ins by hour">
            {hours.map(({ h, n }) => (
              <div key={h} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5" title={`${fmtHour(h)}: ${n} check-ins`}>
                <div className={`w-full rounded-t ${n === peakHour && n > 0 ? 'bg-[#4edea3]' : 'bg-[#4edea3]/40'}`} style={{ height: n ? `${(n / Math.max(1, peakHour)) * 100}%` : '2px' }} />
                <span className="text-[8px] text-[#86948a]">{h % 3 === 0 ? fmtHour(h) : ''}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {(r.joined.length > 0 || r.left.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-headline font-bold text-[#d8e3fb] mb-2">Joined in {monthLabel(month).split(' ')[0]}</h3>
            {r.joined.length ? r.joined.map((m) => <div key={m.id} className="text-sm text-[#bbcabf] py-1">{m.name}</div>) : <p className="text-sm text-[#86948a]">None</p>}
          </Card>
          <Card>
            <h3 className="font-headline font-bold text-[#d8e3fb] mb-2">Left in {monthLabel(month).split(' ')[0]}</h3>
            {r.left.length ? r.left.map((m) => <div key={m.id} className="text-sm text-[#bbcabf] py-1">{m.name}</div>) : <p className="text-sm text-[#86948a]">None</p>}
          </Card>
        </div>
      )}
    </div>
  );
};
