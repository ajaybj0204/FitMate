import React, { useMemo, useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { StrengthProgress } from '../components/StrengthProgress';
import { localDate } from '../lib/progression';
import type { ProgressEntry, SleepLog } from '../types';

/**
 * Progress from real data only: logged workouts (strength), body check-ins the user enters,
 * badges earned from logged activity, and today's steps / sleep. No sample values.
 */

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
const inputCls = 'w-full bg-[#0b1420] border border-[#2a3a52] focus:border-[#4edea3] rounded-xl px-3 py-2.5 text-sm text-[#d8e3fb] focus:outline-none';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-[#86948a]';

const MEASURES: { key: keyof Pick<ProgressEntry, 'waistInches' | 'chestInches' | 'armsInches' | 'thighsInches'>; label: string; goodWhenDown: boolean }[] = [
  { key: 'waistInches', label: 'Waist', goodWhenDown: true },
  { key: 'chestInches', label: 'Chest', goodWhenDown: false },
  { key: 'armsInches', label: 'Arms', goodWhenDown: false },
  { key: 'thighsInches', label: 'Thighs', goodWhenDown: false },
];

export const ProgressSection: React.FC = () => {
  const { progressEntries, addProgressEntry, userProfile, achievements, logSteps, logSleep, stepsLog, sleepLog, t } = useFitMate();
  const [modal, setModal] = useState<'checkin' | 'steps' | 'sleep' | null>(null);

  // Real check-ins only (weight > 0), oldest first
  const entries = useMemo(
    () => [...progressEntries].filter((e) => e.weightKg > 0).sort((a, b) => a.date.localeCompare(b.date)),
    [progressEntries],
  );
  const first = entries[0];
  const last = entries[entries.length - 1];
  const change = first && last && entries.length > 1 ? Math.round((last.weightKg - first.weightKg) * 10) / 10 : null;
  const today = localDate();

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-1">Progress</div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb]">{t('p_title', "Your progress")}</h1>
          <p className="text-xs sm:text-sm text-[#bbcabf] mt-1">{t('p_sub', "Everything here comes from what you log.")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal('steps')} className="px-3.5 py-2.5 rounded-xl bg-[#111c2d] border border-[#1f2a3c] text-[#d8e3fb] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1f2a3c]">
            <span className="material-symbols-outlined text-[18px] text-[#9ecaff]">directions_walk</span>
            {stepsLog.currentSteps > 0 ? `${stepsLog.currentSteps.toLocaleString('en-IN')} steps` : t('p_logSteps', "Log steps")}
          </button>
          <button onClick={() => setModal('sleep')} className="px-3.5 py-2.5 rounded-xl bg-[#111c2d] border border-[#1f2a3c] text-[#d8e3fb] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1f2a3c]">
            <span className="material-symbols-outlined text-[18px] text-[#c3b5ff]">bedtime</span>
            {sleepLog.date === today ? `Slept ${sleepLog.sleepHours}h ${sleepLog.sleepMinutes}m` : t('p_logSleep', "Log sleep")}
          </button>
          <button onClick={() => setModal('checkin')} className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add_chart</span>
            {t('p_checkin', "Log body check-in")}
          </button>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-headline text-xl font-bold text-[#d8e3fb]">{t('p_workoutProgress', "Workout progress")}</h2>
        <StrengthProgress />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-headline text-xl font-bold text-[#d8e3fb]">{t('p_body', "Body check-ins")}</h2>
        {entries.length === 0 ? (
          <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-6 sm:p-8 text-center">
            <span className="material-symbols-outlined text-[44px] text-[#4edea3]">monitor_weight</span>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] mt-2">{t('p_noCheckins', "No check-ins yet")}</h3>
            <p className="text-sm text-[#bbcabf] mt-1 max-w-md mx-auto">
              Log your weight (and measurements if you like) once a week, same time of day. FITORA charts the trend so you can see real change.
            </p>
            <button onClick={() => setModal('checkin')} className="mt-4 px-4 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] text-sm font-bold">Log my first check-in</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-4">
            <div className="flex flex-col gap-3">
              <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-5">
                <div className={labelCls}>{t('p_latestWeight', "Latest weight")}</div>
                <div className="font-headline text-4xl font-bold text-[#d8e3fb] tabular-nums mt-1">{last.weightKg}<span className="text-base text-[#86948a] font-medium"> kg</span></div>
                <div className="text-xs text-[#86948a] mt-1">{fmt(last.date)}</div>
                {change !== null && (
                  <div className={`text-sm font-semibold mt-2 ${change === 0 ? 'text-[#bbcabf]' : 'text-[#4edea3]'}`}>
                    {change > 0 ? '+' : ''}{change} kg since {fmt(first.date)}
                  </div>
                )}
              </div>
              <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-5">
                <div className={`${labelCls} mb-2`}>Measurements (first → latest)</div>
                {MEASURES.map((m) => {
                  const withVal = entries.filter((e) => (e[m.key] || 0) > 0);
                  if (!withVal.length) return null;
                  const a = withVal[0][m.key];
                  const b = withVal[withVal.length - 1][m.key];
                  const d = Math.round((b - a) * 10) / 10;
                  return (
                    <div key={m.key} className="flex justify-between text-sm py-1.5 border-b border-[#1f2a3c] last:border-0">
                      <span className="text-[#bbcabf]">{m.label}</span>
                      <span className="text-[#d8e3fb] tabular-nums">
                        {a}" → {b}"{' '}
                        {withVal.length > 1 && d !== 0 && <span className={(d < 0) === m.goodWhenDown ? 'text-[#4edea3]' : 'text-[#ffb95f]'}>({d > 0 ? '+' : ''}{d})</span>}
                      </span>
                    </div>
                  );
                })}
                {!MEASURES.some((m) => entries.some((e) => (e[m.key] || 0) > 0)) && <p className="text-xs text-[#86948a]">No measurements logged. They're optional.</p>}
              </div>
            </div>
            <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-5">
              <h3 className="font-headline font-bold text-[#d8e3fb]">{t('p_weightTrend', "Weight trend")}</h3>
              {entries.length < 2 ? (
                <p className="text-sm text-[#86948a] py-10 text-center">Log one more check-in to see your trend line.</p>
              ) : (
                <WeightChart entries={entries.slice(-24)} />
              )}
              <div className="mt-3 max-h-48 overflow-y-auto">
                {[...entries].reverse().map((e) => (
                  <div key={e.id} className="flex justify-between gap-3 text-xs py-1.5 border-b border-[#1f2a3c] last:border-0">
                    <span className="text-[#bbcabf] whitespace-nowrap">{fmt(e.date)}</span>
                    <span className="text-[#d8e3fb] font-semibold">{e.weightKg} kg</span>
                    <span className="text-[#86948a] truncate flex-1 text-right">{e.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-headline text-xl font-bold text-[#d8e3fb]">{t('p_badges', "Badges")}</h2>
          <span className="text-xs text-[#86948a]">{achievements.filter((a) => a.unlocked).length} / {achievements.length} earned</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((a) => (
            <div key={a.id} className={`rounded-2xl border p-4 flex gap-3 ${a.unlocked ? 'bg-[#10251d] border-[#4edea3]/40' : 'bg-[#152031] border-[#1f2a3c]'}`}>
              <span className={`material-symbols-outlined text-[28px] ${a.unlocked ? 'text-[#4edea3]' : 'text-[#5d6b80]'}`}>{a.unlocked ? 'workspace_premium' : 'lock'}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#d8e3fb]">{a.title}</div>
                <div className="text-[11px] text-[#86948a] leading-snug">{a.description}</div>
                <div className="h-1.5 bg-[#0b1420] rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#4edea3] rounded-full" style={{ width: `${Math.min(100, (a.progress / a.maxProgress) * 100)}%` }} />
                </div>
                <div className="text-[10px] text-[#86948a] mt-1 tabular-nums">{a.progress} / {a.maxProgress}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {modal === 'checkin' && (
        <CheckinModal
          defaultWeight={last?.weightKg || userProfile.weightKg}
          onClose={() => setModal(null)}
          onSave={(e) => {
            addProgressEntry(e);
            setModal(null);
          }}
        />
      )}
      {modal === 'steps' && <StepsModal current={stepsLog.currentSteps} onClose={() => setModal(null)} onSave={(n) => { logSteps(n); setModal(null); }} />}
      {modal === 'sleep' && (
        <SleepModal onClose={() => setModal(null)} onSave={(h, m, q) => { logSleep(h, m, q); setModal(null); }} />
      )}
    </div>
  );
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[70] bg-[#060c16]/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
    <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] w-full max-w-md p-5 sm:p-6 my-auto shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">{title}</h3>
        <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-[#86948a] hover:text-white hover:bg-[#1f2a3c]">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const num = (v: string) => (v.trim() === '' ? 0 : Number(v));

const CheckinModal: React.FC<{ defaultWeight: number; onClose: () => void; onSave: (e: Omit<ProgressEntry, 'id'>) => void }> = ({ defaultWeight, onClose, onSave }) => {
  const [date, setDate] = useState(localDate());
  const [weight, setWeight] = useState(String(defaultWeight || ''));
  const [m, setM] = useState({ waistInches: '', chestInches: '', armsInches: '', thighsInches: '' });
  const [notes, setNotes] = useState('');
  const valid = num(weight) >= 25 && num(weight) <= 300;
  return (
    <Modal title="Body check-in" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1"><span className={labelCls}>Weight (kg)</span><input className={inputCls} inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} autoFocus /></label>
          <label className="flex flex-col gap-1"><span className={labelCls}>Date</span><input type="date" className={inputCls} value={date} max={localDate()} onChange={(e) => setDate(e.target.value)} /></label>
        </div>
        <div className={labelCls}>Measurements in inches (optional)</div>
        <div className="grid grid-cols-2 gap-3">
          {MEASURES.map((x) => (
            <label key={x.key} className="flex flex-col gap-1">
              <span className="text-[11px] text-[#bbcabf]">{x.label}</span>
              <input className={inputCls} inputMode="decimal" placeholder="—" value={m[x.key]} onChange={(e) => setM({ ...m, [x.key]: e.target.value })} />
            </label>
          ))}
        </div>
        <label className="flex flex-col gap-1"><span className={labelCls}>Note (optional)</span><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. after a week of better sleep" /></label>
        <div className="flex justify-end gap-2 mt-1">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-sm font-semibold border border-[#1f2a3c]">Cancel</button>
          <button
            disabled={!valid}
            onClick={() =>
              onSave({
                date,
                weightKg: num(weight),
                waistInches: num(m.waistInches),
                chestInches: num(m.chestInches),
                armsInches: num(m.armsInches),
                thighsInches: num(m.thighsInches),
                notes: notes.trim(),
              })
            }
            className="px-4 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] text-sm font-bold disabled:opacity-40"
          >
            Save check-in
          </button>
        </div>
      </div>
    </Modal>
  );
};

const StepsModal: React.FC<{ current: number; onClose: () => void; onSave: (n: number) => void }> = ({ current, onClose, onSave }) => {
  const [steps, setSteps] = useState(current ? String(current) : '');
  return (
    <Modal title="Today's steps" onClose={onClose}>
      <p className="text-xs text-[#86948a] mb-3">Copy the number from your phone's health app or watch.</p>
      <input className={inputCls} inputMode="numeric" value={steps} onChange={(e) => setSteps(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 6500" autoFocus />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-sm font-semibold border border-[#1f2a3c]">Cancel</button>
        <button disabled={!steps} onClick={() => onSave(Number(steps))} className="px-4 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] text-sm font-bold disabled:opacity-40">Save</button>
      </div>
    </Modal>
  );
};

const SleepModal: React.FC<{ onClose: () => void; onSave: (h: number, m: number, q: SleepLog['sleepQuality']) => void }> = ({ onClose, onSave }) => {
  const [h, setH] = useState('7');
  const [m, setMins] = useState('0');
  const [q, setQ] = useState<SleepLog['sleepQuality']>('Restful');
  return (
    <Modal title="Last night's sleep" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1"><span className={labelCls}>Hours</span><input className={inputCls} inputMode="numeric" value={h} onChange={(e) => setH(e.target.value.replace(/\D/g, ''))} /></label>
        <label className="flex flex-col gap-1"><span className={labelCls}>Minutes</span><input className={inputCls} inputMode="numeric" value={m} onChange={(e) => setMins(e.target.value.replace(/\D/g, ''))} /></label>
      </div>
      <div className={`${labelCls} mt-3 mb-1.5`}>How did you sleep?</div>
      <div className="grid grid-cols-4 gap-2">
        {(['Poor', 'Fair', 'Restful', 'Deep'] as const).map((x) => (
          <button key={x} onClick={() => setQ(x)} className={`py-2 rounded-xl text-xs font-bold border ${q === x ? 'bg-[#4edea3] text-[#003824] border-[#4edea3]' : 'bg-[#111c2d] text-[#bbcabf] border-[#1f2a3c]'}`}>{x}</button>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-sm font-semibold border border-[#1f2a3c]">Cancel</button>
        <button
          disabled={!h || Number(h) > 16 || Number(m) > 59}
          onClick={() => onSave(Number(h), Number(m || 0), q)}
          className="px-4 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] text-sm font-bold disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

const WeightChart: React.FC<{ entries: ProgressEntry[] }> = ({ entries }) => {
  const W = 600, H = 190, P = { l: 40, r: 12, t: 12, b: 24 };
  const vals = entries.map((e) => e.weightKg);
  const min = Math.floor(Math.min(...vals) - 1);
  const max = Math.ceil(Math.max(...vals) + 1);
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / Math.max(1, entries.length - 1);
  const y = (v: number) => P.t + (1 - (v - min) / Math.max(1, max - min)) * (H - P.t - P.b);
  const path = entries.map((e, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(e.weightKg).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-2" role="img" aria-label={`Weight from ${vals[0]} kg to ${vals[vals.length - 1]} kg`}>
      {[min, Math.round((min + max) / 2), max].map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#1f2a3c" />
          <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#86948a">{t}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#4edea3" strokeWidth="2.5" strokeLinejoin="round" />
      {entries.map((e, i) => (
        <g key={e.id}>
          <circle cx={x(i)} cy={y(e.weightKg)} r="4" fill="#081425" stroke="#4edea3" strokeWidth="2"><title>{`${fmt(e.date)}: ${e.weightKg} kg`}</title></circle>
          {(i === 0 || i === entries.length - 1) && <text x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : 'end'} fontSize="10" fill="#86948a">{fmt(e.date)}</text>}
        </g>
      ))}
    </svg>
  );
};
