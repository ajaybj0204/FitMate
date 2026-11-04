import React, { useMemo, useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { useAuth } from '../context/AuthContext';
import { bestSet, describeSets, estimate1RM, localDate } from '../lib/progression';
import type { WorkoutSession } from '../types/cloud';

/**
 * Progress from real logged workouts only: strength per exercise (estimated 1-rep max),
 * workouts and volume per week, personal records and recent sessions.
 * Shows an empty state until the first workout is logged; never sample data.
 */

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const mondayOf = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localDate(d);
};

export const StrengthProgress: React.FC = () => {
  const { sessions, sessionsLoaded, navigateTo, startWorkout, selectedScheduleDayId, t } = useFitMate();
  const { cloudEnabled, user, signIn } = useAuth();

  // Exercises with history, most-logged first
  const exercises = useMemo(() => {
    const map = new Map<string, { key: string; name: string; count: number }>();
    for (const s of sessions) for (const e of s.exercises) {
      if (!e.sets.some((x) => x.weightKg > 0)) continue;
      const cur = map.get(e.key) || { key: e.key, name: e.name, count: 0 };
      cur.count++;
      map.set(e.key, cur);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [sessions]);

  const [picked, setPicked] = useState<string | null>(null);
  const key = picked && exercises.some((e) => e.key === picked) ? picked : exercises[0]?.key;

  // One point per session: best estimated 1RM that day
  const points = useMemo(() => {
    if (!key) return [];
    const byDate = new Map<string, { date: string; e1rm: number; label: string }>();
    for (const s of [...sessions].sort((a, b) => a.startedAt - b.startedAt)) {
      const log = s.exercises.find((e) => e.key === key);
      const b = log && bestSet(log.sets);
      if (!b || b.weightKg <= 0) continue;
      const e1rm = estimate1RM(b.weightKg, b.reps);
      const prev = byDate.get(s.date);
      if (!prev || e1rm > prev.e1rm) byDate.set(s.date, { date: s.date, e1rm, label: `${b.weightKg} kg × ${b.reps}` });
    }
    return [...byDate.values()].slice(-20);
  }, [sessions, key]);

  // Last 8 weeks
  const weeks = useMemo(() => {
    const out: { start: string; count: number; volume: number }[] = [];
    const thisMonday = mondayOf(localDate());
    for (let i = 7; i >= 0; i--) {
      const d = new Date(thisMonday + 'T00:00:00');
      d.setDate(d.getDate() - i * 7);
      out.push({ start: localDate(d), count: 0, volume: 0 });
    }
    for (const s of sessions) {
      const w = out.find((x) => x.start === mondayOf(s.date));
      if (w) {
        w.count++;
        w.volume += s.totalVolumeKg;
      }
    }
    return out;
  }, [sessions]);

  const records = useMemo(() => {
    const best = new Map<string, { name: string; e1rm: number; label: string; date: string }>();
    for (const s of sessions) for (const e of s.exercises) {
      const b = bestSet(e.sets);
      if (!b || b.weightKg <= 0) continue;
      const v = estimate1RM(b.weightKg, b.reps);
      const cur = best.get(e.key);
      if (!cur || v > cur.e1rm) best.set(e.key, { name: e.name, e1rm: v, label: `${b.weightKg} kg × ${b.reps}`, date: s.date });
    }
    return [...best.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [sessions]);

  if (!sessionsLoaded) return <div className="h-40 rounded-2xl bg-[#152031] animate-pulse" />;

  if (!sessions.length) {
    return (
      <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-6 sm:p-8 text-center">
        <span className="material-symbols-outlined text-[44px] text-[#4edea3]">show_chart</span>
        <h2 className="font-headline text-xl font-bold text-[#d8e3fb] mt-2">{t('sp_empty', "Your strength chart starts with your first workout")}</h2>
        <p className="text-sm text-[#bbcabf] mt-1 max-w-lg mx-auto">
          Log your sets during a workout. FITORA charts how your strength grows for each exercise, counts your workouts per week and keeps your personal records.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <button onClick={() => startWorkout(selectedScheduleDayId)} className="px-4 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] text-sm font-bold hover:bg-[#6ffbbe]">{t('sp_start', "Start a workout")}</button>
          <button onClick={() => navigateTo('workout')} className="px-4 py-2.5 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-sm font-semibold border border-[#1f2a3c]">See my plan</button>
        </div>
        {cloudEnabled && !user && (
          <p className="text-xs text-[#86948a] mt-4">
            Tip: <button onClick={signIn} className="text-[#4edea3] hover:underline">sign in</button> so your history is saved to your account, not just this browser.
          </p>
        )}
      </div>
    );
  }

  const thisWeek = weeks[weeks.length - 1];
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));
  const first = points[0]?.e1rm || 0;
  const last = points[points.length - 1]?.e1rm || 0;
  const change = first ? Math.round(((last - first) / first) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Workouts logged', value: sessions.length, icon: 'fitness_center' },
          { label: 'This week', value: thisWeek.count, icon: 'event_available' },
          { label: 'Kg lifted this week', value: Math.round(thisWeek.volume).toLocaleString('en-IN'), icon: 'scale' },
          { label: 'Exercises tracked', value: exercises.length, icon: 'list_alt' },
        ].map((s) => (
          <div key={s.label} className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-[#4edea3] bg-[#4edea3]/10 rounded-xl w-10 h-10 flex items-center justify-center">{s.icon}</span>
            <div>
              <div className="font-headline text-xl font-extrabold text-[#d8e3fb] tabular-nums">{s.value}</div>
              <div className="text-[11px] text-[#86948a] font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* Strength line chart */}
        <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-headline font-bold text-[#d8e3fb]">{t('sp_strength', "Strength over time")}</h3>
              <p className="text-[11px] text-[#86948a]">Estimated 1-rep max from your best set each session</p>
            </div>
            {exercises.length > 0 && (
              <select
                value={key}
                onChange={(e) => setPicked(e.target.value)}
                className="bg-[#0b1420] border border-[#2a3a52] rounded-xl px-3 py-2 text-xs text-[#d8e3fb] max-w-[220px]"
                aria-label="Exercise"
              >
                {exercises.map((e) => <option key={e.key} value={e.key}>{e.name}</option>)}
              </select>
            )}
          </div>
          {points.length < 2 ? (
            <p className="text-sm text-[#86948a] py-10 text-center">
              {exercises.length ? 'Log this exercise one more time to see a trend line.' : 'Log a weighted exercise to start your strength chart.'}
            </p>
          ) : (
            <>
              <LineChart points={points} />
              <p className="text-xs text-[#bbcabf] mt-2">
                {change > 0 ? <>Up <strong className="text-[#4edea3]">{change}%</strong> since {fmt(points[0].date)}. 💪</> : change < 0 ? <>Down {Math.abs(change)}% since {fmt(points[0].date)}. A lighter phase is normal; keep showing up.</> : <>Holding steady since {fmt(points[0].date)}.</>}
              </p>
            </>
          )}
        </div>

        {/* Weekly consistency */}
        <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-4 sm:p-5">
          <h3 className="font-headline font-bold text-[#d8e3fb]">{t('sp_perWeek', "Workouts per week")}</h3>
          <p className="text-[11px] text-[#86948a] mb-3">Last 8 weeks</p>
          <div className="flex items-end gap-2 h-36" role="img" aria-label={`Workouts per week: ${weeks.map((w) => w.count).join(', ')}`}>
            {weeks.map((w, i) => (
              <div key={w.start} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] text-[#bbcabf] tabular-nums">{w.count || ''}</span>
                <div
                  className={`w-full rounded-t-md ${i === weeks.length - 1 ? 'bg-[#4edea3]' : 'bg-[#4edea3]/45'}`}
                  style={{ height: `${Math.max(w.count ? 8 : 2, (w.count / maxCount) * 100)}%` }}
                  title={`Week of ${fmt(w.start)}: ${w.count} workouts, ${Math.round(w.volume).toLocaleString('en-IN')} kg`}
                />
                <span className="text-[9px] text-[#86948a]">{fmt(w.start).split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-4 sm:p-5">
          <h3 className="font-headline font-bold text-[#d8e3fb] mb-2">{t('sp_records', "Personal records")}</h3>
          {records.map((r) => (
            <div key={r.name} className="flex justify-between gap-3 py-2 border-b border-[#1f2a3c] last:border-0 text-sm">
              <span className="text-[#d8e3fb] truncate">{r.name}</span>
              <span className="text-[#4edea3] font-bold whitespace-nowrap">{r.label} <span className="text-[#86948a] font-normal text-xs">· {fmt(r.date)}</span></span>
            </div>
          ))}
          {!records.length && <p className="text-sm text-[#86948a]">Records appear once you log weighted sets.</p>}
        </div>
        <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-4 sm:p-5">
          <h3 className="font-headline font-bold text-[#d8e3fb] mb-2">{t('sp_recent', "Recent workouts")}</h3>
          {sessions.slice(0, 6).map((s: WorkoutSession) => (
            <details key={s.id} className="py-2 border-b border-[#1f2a3c] last:border-0 group">
              <summary className="flex justify-between gap-3 text-sm cursor-pointer list-none">
                <span className="text-[#d8e3fb]">{fmt(s.date)} · {s.splitName}</span>
                <span className="text-[#86948a] text-xs whitespace-nowrap">{s.setsCount} sets · {s.durationMin} min · {s.totalVolumeKg.toLocaleString('en-IN')} kg</span>
              </summary>
              <ul className="mt-2 text-xs text-[#bbcabf] flex flex-col gap-1">
                {s.exercises.map((e) => <li key={e.key}><strong className="text-[#d8e3fb]">{e.name}:</strong> {describeSets(e.sets)}</li>)}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

const LineChart: React.FC<{ points: { date: string; e1rm: number; label: string }[] }> = ({ points }) => {
  const W = 600, H = 200, P = { l: 40, r: 12, t: 12, b: 26 };
  const vals = points.map((p) => p.e1rm);
  const min = Math.floor(Math.min(...vals) * 0.95);
  const max = Math.ceil(Math.max(...vals) * 1.05);
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / Math.max(1, points.length - 1);
  const y = (v: number) => P.t + (1 - (v - min) / Math.max(1, max - min)) * (H - P.t - P.b);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.e1rm).toFixed(1)}`).join(' ');
  const ticks = [min, Math.round((min + max) / 2), max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Estimated max from ${vals[0]} kg to ${vals[vals.length - 1]} kg`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#1f2a3c" />
          <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#86948a">{t}</text>
        </g>
      ))}
      <path d={`${path} L${x(points.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`} fill="#4edea3" opacity="0.08" />
      <path d={path} fill="none" stroke="#4edea3" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.date}>
          <circle cx={x(i)} cy={y(p.e1rm)} r="4" fill="#081425" stroke="#4edea3" strokeWidth="2">
            <title>{`${fmt(p.date)}: ${p.label} (≈${p.e1rm} kg max)`}</title>
          </circle>
          {(i === 0 || i === points.length - 1 || points.length <= 6) && (
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#86948a">{fmt(p.date)}</text>
          )}
        </g>
      ))}
    </svg>
  );
};
