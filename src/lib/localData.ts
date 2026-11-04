/**
 * Runs before the app reads saved data:
 *  1. One-time cleanup of the sample data older versions of FITORA saved (fake steps,
 *     sleep, water, weight check-ins, grocery list, ticked meals). Because app state syncs
 *     to the account, cleaning here also cleans the cloud copy.
 *  2. Daily reset: water, steps and "eaten"/"done" ticks are per day, so they start at zero
 *     each new day instead of carrying over forever.
 */
import { localDate } from './progression';

const CLEANUP_KEY = 'fitmate_sample_cleanup_v1';
const TODAY_KEY = 'fitmate_today_v1';

const read = <T,>(key: string): T | null => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {}
};

type WithId = { id?: string };
type Tickable = { completed?: boolean; checked?: boolean };

function untick<T extends Tickable>(key: string, field: 'completed' | 'checked') {
  const list = read<T[]>(key);
  if (Array.isArray(list)) write(key, list.map((x) => ({ ...x, [field]: false })));
}

function cleanSampleData() {
  if (localStorage.getItem(CLEANUP_KEY)) return;

  // Sample weight check-ins (ids prog-1…) and auto-entries that copied sample measurements
  const progress = read<WithId[]>('fitmate_progress_v1');
  if (Array.isArray(progress)) {
    write('fitmate_progress_v1', progress.filter((p) => !/^prog-(\d{1,3}|wo-\d+)$/.test(p.id || '')));
  }

  // Sample grocery items (groc-1…)
  const grocery = read<WithId[]>('fitmate_grocery_v1');
  if (Array.isArray(grocery)) write('fitmate_grocery_v1', grocery.filter((g) => !/^groc-\d{1,2}$/.test(g.id || '')));

  // Sample steps / sleep / water values
  const steps = read<{ currentSteps: number }>('fitmate_steps_v1');
  if (steps && steps.currentSteps === 8420) localStorage.removeItem('fitmate_steps_v1');
  const sleep = read<{ sleepHours: number; sleepMinutes: number; recoveryScore: number }>('fitmate_sleep_v1');
  if (sleep && sleep.sleepHours === 7 && sleep.sleepMinutes === 45 && sleep.recoveryScore === 88) localStorage.removeItem('fitmate_sleep_v1');
  if (localStorage.getItem('fitmate_hydration_v1') === '1800') write('fitmate_hydration_v1', '0');

  // Old made-up "personal bests" and sample completed-workout list
  localStorage.removeItem('fitmate_overload_v1');
  const done = read<WithId[]>('fitmate_completed_workouts_v1');
  if (Array.isArray(done)) write('fitmate_completed_workouts_v1', done.filter((w) => /^ws-/.test(w.id || '')));

  untick<Tickable>('fitmate_meals_v1', 'completed');
  untick<Tickable>('fitmate_daily_plan_v1', 'completed');

  write(CLEANUP_KEY, String(Date.now()));
}

function dailyReset() {
  const today = localDate();
  const last = localStorage.getItem(TODAY_KEY);
  if (last === today) return;
  if (last) {
    // A new day: per-day counters start again
    write('fitmate_hydration_v1', '0');
    const steps = read<Record<string, unknown>>('fitmate_steps_v1');
    if (steps) write('fitmate_steps_v1', { ...steps, date: '', currentSteps: 0, distanceKm: 0, caloriesBurned: 0 });
    // Food typed in yesterday ("Log what you ate") belongs to that day: remove it
    const meals = read<WithId[]>('fitmate_meals_v1');
    if (Array.isArray(meals)) write('fitmate_meals_v1', meals.filter((m) => !/^meal-\d{12,}$/.test(m.id || '')));
    untick<Tickable>('fitmate_meals_v1', 'completed');
    untick<Tickable>('fitmate_daily_plan_v1', 'completed');
  }
  write(TODAY_KEY, today);
}

let done = false;
/** Call once, before any saved state is read. Safe to call again (no-op). */
export function prepareLocalData() {
  if (done) return;
  done = true;
  try {
    cleanSampleData();
    dailyReset();
  } catch {}
}
