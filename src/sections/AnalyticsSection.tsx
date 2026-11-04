import React, { useMemo } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { exerciseKey, localDate } from '../lib/progression';

/**
 * Analytics from real data only: logged workouts, meals ticked as eaten today, and the
 * sleep / steps the user logged. Anything not logged yet shows an empty state, never sample numbers.
 */

const mondayOf = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localDate(d);
};
const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const Panel: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-[#152031] rounded-2xl border border-[#1f2a3c] p-5 ${className}`}>
    <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">{title}</h3>
    {subtitle && <p className="text-xs text-[#86948a] mt-0.5 mb-3">{subtitle}</p>}
    {children}
  </div>
);

const Bar: React.FC<{ label: string; value: number; max: number; text: string; tone?: string }> = ({ label, value, max, text, tone = '#4edea3' }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-[#bbcabf]">{label}</span>
      <span className="text-[#d8e3fb] font-semibold tabular-nums">{text}</span>
    </div>
    <div className="h-2 rounded-full bg-[#0b1420] overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, max ? (value / max) * 100 : 0)}%`, background: tone }} />
    </div>
  </div>
);

export const AnalyticsSection: React.FC = () => {
  const { sessions, sessionsLoaded, workoutSchedule, healthMetrics, consumedCalories, consumedProtein, consumedCarbs, consumedFats, meals, stepsLog, sleepLog, navigateTo, t } = useFitMate();

  // Kg lifted per week, last 8 weeks
  const weeks = useMemo(() => {
    const thisMonday = mondayOf(localDate());
    const out = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(thisMonday + 'T00:00:00');
      d.setDate(d.getDate() - (7 - i) * 7);
      return { start: localDate(d), volume: 0, count: 0 };
    });
    for (const s of sessions) {
      const w = out.find((x) => x.start === mondayOf(s.date));
      if (w) {
        w.volume += s.totalVolumeKg;
        w.count++;
      }
    }
    return out;
  }, [sessions]);

  // Sets per muscle group (last 30 days), using the muscle listed on the plan's exercises
  const muscleSplit = useMemo(() => {
    const muscleOf = new Map<string, string>();
    for (const day of workoutSchedule) for (const ex of day.exercises) muscleOf.set(exerciseKey(ex), (ex.targetMuscle || 'Other').split(',')[0].trim());
    const since = localDate(new Date(Date.now() - 30 * 864e5));
    const counts = new Map<string, number>();
    for (const s of sessions) {
      if (s.date < since) continue;
      for (const e of s.exercises) {
        const m = muscleOf.get(e.key) || 'Other';
        counts.set(m, (counts.get(m) || 0) + e.sets.length);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [sessions, workoutSchedule]);

  const maxVolume = Math.max(1, ...weeks.map((w) => w.volume));
  const maxSets = Math.max(1, ...muscleSplit.map(([, n]) => n));
  const eatenCount = meals.filter((m) => m.completed).length;
  const sleepLoggedToday = sleepLog.date === localDate();

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      <div>
        <div className="flex items-center gap-2 text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-1">
          <span className="material-symbols-outlined text-[16px]">insights</span>
          {t('analytics', 'Analytics')}
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb]">{t('a_title', "Your numbers")}</h1>
        <p className="text-xs sm:text-sm text-[#bbcabf] mt-1">{t('a_sub', "Built only from what you log: workouts, meals you tick as eaten, sleep and steps.")}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title={t('a_volume', "Training volume")} subtitle="Kg lifted per week (sets × reps × weight), last 8 weeks">
          {!sessionsLoaded ? (
            <div className="h-36 animate-pulse rounded-xl bg-[#111c2d]" />
          ) : sessions.length === 0 ? (
            <EmptyHint text="No workouts logged yet." action="Go to my plan" onClick={() => navigateTo('workout')} />
          ) : (
            <div className="flex items-end gap-2 h-40" role="img" aria-label={`Kg lifted per week: ${weeks.map((w) => Math.round(w.volume)).join(', ')}`}>
              {weeks.map((w, i) => (
                <div key={w.start} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`Week of ${fmt(w.start)}: ${Math.round(w.volume).toLocaleString('en-IN')} kg in ${w.count} workouts`}>
                  <span className="text-[9px] text-[#bbcabf] tabular-nums">{w.volume ? `${(w.volume / 1000).toFixed(1)}t` : ''}</span>
                  <div className={`w-full rounded-t-md ${i === weeks.length - 1 ? 'bg-[#4edea3]' : 'bg-[#4edea3]/45'}`} style={{ height: w.volume ? `${Math.max(6, (w.volume / maxVolume) * 100)}%` : '2px' }} />
                  <span className="text-[9px] text-[#86948a]">{fmt(w.start).split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={t('a_muscles', "Muscles trained")} subtitle="Working sets per muscle group, last 30 days">
          {muscleSplit.length === 0 ? (
            <EmptyHint text="This fills in after your first logged workout." />
          ) : (
            <div className="flex flex-col gap-3">
              {muscleSplit.map(([m, n]) => <Bar key={m} label={m} value={n} max={maxSets} text={`${n} sets`} />)}
            </div>
          )}
        </Panel>

        <Panel title={t('a_food', "Today's food")} subtitle={eatenCount ? `From ${eatenCount} meal${eatenCount > 1 ? 's' : ''} you ticked as eaten` : 'Tick meals as eaten on the Nutrition page to see this'}>
          <div className="flex flex-col gap-3">
            <Bar label="Calories" value={consumedCalories} max={healthMetrics.dailyCalorieTarget} text={`${consumedCalories} / ${healthMetrics.dailyCalorieTarget} kcal`} />
            <Bar label="Protein" value={consumedProtein} max={healthMetrics.proteinTarget} text={`${consumedProtein} / ${healthMetrics.proteinTarget} g`} tone="#9ddf2e" />
            <Bar label="Carbs" value={consumedCarbs} max={healthMetrics.carbsTarget} text={`${consumedCarbs} / ${healthMetrics.carbsTarget} g`} tone="#9ecaff" />
            <Bar label="Fats" value={consumedFats} max={healthMetrics.fatsTarget} text={`${consumedFats} / ${healthMetrics.fatsTarget} g`} tone="#ffb95f" />
          </div>
          <p className="text-[11px] text-[#86948a] mt-3">Targets come from your profile (Mifflin-St Jeor formula and your goal).</p>
        </Panel>

        <Panel title={t('a_recovery', "Recovery & activity")} subtitle="What you logged today">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111c2d] rounded-xl p-3 border border-[#1f2a3c]">
              <div className="text-[11px] text-[#86948a] font-semibold">Sleep</div>
              {sleepLoggedToday ? (
                <>
                  <div className="font-headline text-xl font-bold text-[#d8e3fb]">{sleepLog.sleepHours}h {sleepLog.sleepMinutes}m</div>
                  <div className="text-[11px] text-[#bbcabf]">{sleepLog.sleepQuality} · recovery {sleepLog.recoveryScore}%</div>
                </>
              ) : (
                <div className="text-sm text-[#86948a] mt-1">Not logged today</div>
              )}
            </div>
            <div className="bg-[#111c2d] rounded-xl p-3 border border-[#1f2a3c]">
              <div className="text-[11px] text-[#86948a] font-semibold">Steps</div>
              {stepsLog.currentSteps > 0 ? (
                <>
                  <div className="font-headline text-xl font-bold text-[#d8e3fb]">{stepsLog.currentSteps.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-[#bbcabf]">of {stepsLog.targetSteps.toLocaleString('en-IN')} · {stepsLog.distanceKm} km</div>
                </>
              ) : (
                <div className="text-sm text-[#86948a] mt-1">Not logged today</div>
              )}
            </div>
          </div>
          <button onClick={() => navigateTo('progress')} className="text-xs text-[#4edea3] hover:underline mt-3">Log sleep or steps on the Progress page →</button>
        </Panel>
      </div>
    </div>
  );
};

const EmptyHint: React.FC<{ text: string; action?: string; onClick?: () => void }> = ({ text, action, onClick }) => (
  <div className="h-36 flex flex-col items-center justify-center text-center gap-2">
    <p className="text-sm text-[#86948a]">{text}</p>
    {action && <button onClick={onClick} className="px-3 py-1.5 rounded-lg bg-[#4edea3] text-[#003824] text-xs font-bold">{action}</button>}
  </div>
);
