/**
 * Smart logger brain: "what should I lift next time?"
 *
 * Uses double progression, the method most coaches use for beginners and intermediates:
 *  - hit the TOP of the rep range on every set  → add a small amount of weight next time
 *  - hit at least the BOTTOM of the range        → same weight, try for one more rep
 *  - missed the bottom on most sets, twice running → drop the weight ~10% and build back up
 * Bodyweight exercises (0 kg) progress by reps instead.
 */
import type { Exercise, WorkoutDay } from '../types';
import type { ExerciseLog, LoggedSet, WorkoutSession } from '../types/cloud';

export interface RepRange {
  min: number;
  max: number;
}

export function parseRepRange(reps: string | undefined): RepRange | null {
  if (!reps) return null;
  const nums = (reps.match(/\d+/g) || []).map(Number).filter((n) => n > 0);
  if (!nums.length || /s\b|sec|min|max/i.test(reps)) return null; // timed holds / "Max"
  return { min: Math.min(...nums.slice(0, 2)), max: Math.max(...nums.slice(0, 2)) };
}

/** Key that identifies the same exercise across plans and swaps. */
export const exerciseKey = (ex: Pick<Exercise, 'id' | 'exerciseDbId' | 'name'>) =>
  ex.exerciseDbId || ex.id || ex.name.toLowerCase();

const LOWER_BODY_COMPOUND = /squat|deadlift|leg press|hip thrust|rdl|romanian/i;

/** Smallest sensible jump in weight for this exercise. */
export function weightStep(ex: Pick<Exercise, 'name' | 'equipment'>): number {
  const eq = (ex.equipment || '').toLowerCase();
  if (LOWER_BODY_COMPOUND.test(ex.name)) return 5;
  if (eq.includes('kettlebell')) return 4;
  if (eq.includes('dumbbell')) return 2;
  return 2.5;
}

const roundTo = (value: number, step: number) => Math.max(0, Math.round(value / step) * step);

/** Estimated one-rep max (Epley formula). Used for strength charts. */
export const estimate1RM = (weightKg: number, reps: number) =>
  weightKg <= 0 || reps <= 0 ? 0 : Math.round(weightKg * (1 + Math.min(reps, 12) / 30) * 10) / 10;

export const bestSet = (sets: LoggedSet[]): LoggedSet | null =>
  sets.reduce<LoggedSet | null>((best, s) => (!best || estimate1RM(s.weightKg, s.reps) > estimate1RM(best.weightKg, best.reps) ? s : best), null);

export const setVolume = (sets: LoggedSet[]) => sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);

/** Most recent logs for one exercise, newest first. */
export function historyFor(sessions: WorkoutSession[], key: string): { date: string; log: ExerciseLog }[] {
  const out: { date: string; log: ExerciseLog }[] = [];
  for (const s of sessions) {
    const log = s.exercises.find((e) => e.key === key && e.sets.length > 0);
    if (log) out.push({ date: s.date, log });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export type SuggestionKind = 'first' | 'increase' | 'repeat' | 'reps' | 'deload';

export interface Suggestion {
  kind: SuggestionKind;
  weightKg: number;
  reps: number;
  /** Short, plain-language reason shown to the user. */
  note: string;
  last?: ExerciseLog;
  lastDate?: string;
}

const fmtSets = (sets: LoggedSet[]) => {
  const w = sets.map((s) => s.weightKg);
  const same = w.every((x) => x === w[0]);
  return same ? `${w[0]} kg × ${sets.map((s) => s.reps).join(', ')}` : sets.map((s) => `${s.weightKg}×${s.reps}`).join(', ');
};

export const describeSets = fmtSets;

export function suggestNext(ex: Exercise, sessions: WorkoutSession[]): Suggestion {
  const range = parseRepRange(ex.reps) || { min: 10, max: 10 };
  const history = historyFor(sessions, exerciseKey(ex));
  const startWeight = ex.defaultWeightKg ?? 0;

  if (!history.length) {
    return {
      kind: 'first',
      weightKg: startWeight,
      reps: range.max,
      note: startWeight > 0
        ? `First time: start light (${startWeight} kg is a guide) and focus on form. Your numbers will be remembered.`
        : 'First time: log what you can do with good form. Your numbers will be remembered.',
    };
  }

  const { log, date } = history[0];
  const sets = log.sets;
  const workWeight = Math.max(...sets.map((s) => s.weightKg));
  const workSets = sets.filter((s) => s.weightKg === workWeight);
  const hitTop = workSets.length >= Math.min(ex.sets, workSets.length) && workSets.every((s) => s.reps >= range.max);
  const missed = workSets.filter((s) => s.reps < range.min).length;
  const last = { last: log, lastDate: date };

  // Bodyweight: progress with reps
  if (workWeight === 0) {
    const bestReps = Math.max(...sets.map((s) => s.reps));
    return { kind: 'reps', weightKg: 0, reps: bestReps + 1, note: `Last time your best set was ${bestReps} reps. Aim for ${bestReps + 1} today.`, ...last };
  }

  if (hitTop && workSets.length >= ex.sets) {
    const next = roundTo(workWeight + weightStep(ex), weightStep(ex) === 5 ? 2.5 : weightStep(ex) === 2 ? 1 : 1.25);
    return {
      kind: 'increase',
      weightKg: next,
      reps: range.min,
      note: `You hit ${range.max} reps on every set last time. Go up to ${next} kg and aim for ${range.min}+ reps.`,
      ...last,
    };
  }

  if (missed >= Math.ceil(workSets.length / 2)) {
    // Struggled twice in a row at this weight → step back and rebuild
    const prev = history[1]?.log;
    const prevWeight = prev ? Math.max(...prev.sets.map((s) => s.weightKg)) : null;
    const prevMissed = prev ? prev.sets.filter((s) => s.weightKg === prevWeight && s.reps < range.min).length : 0;
    if (prev && prevWeight === workWeight && prevMissed >= Math.ceil(prev.sets.length / 2)) {
      const lighter = roundTo(workWeight * 0.9, 2.5);
      return {
        kind: 'deload',
        weightKg: lighter,
        reps: range.max,
        note: `${workWeight} kg was tough two sessions in a row. Drop to ${lighter} kg, get clean reps and build back up.`,
        ...last,
      };
    }
    return { kind: 'repeat', weightKg: workWeight, reps: range.min, note: `Stay at ${workWeight} kg and try to reach ${range.min} reps on every set.`, ...last };
  }

  const lowest = Math.min(...workSets.map((s) => s.reps));
  const target = Math.min(range.max, lowest + 1);
  return { kind: 'repeat', weightKg: workWeight, reps: target, note: `Same weight (${workWeight} kg). Try for ${target} reps on every set before adding weight.`, ...last };
}

// ── Week planning helpers ────────────────────────────────────────────────────

const DAY_IDS: WorkoutDay['id'][] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const localDate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const todayDayId = (d = new Date()) => DAY_IDS[d.getDay()];

/** Monday-based dates of the current week up to (not including) today. */
function earlierThisWeek(now = new Date()): { dayId: WorkoutDay['id']; date: string }[] {
  const out: { dayId: WorkoutDay['id']; date: string }[] = [];
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  for (let i = dow; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({ dayId: DAY_IDS[d.getDay()], date: localDate(d) });
  }
  return out;
}

/** Training days earlier this week with no workout logged (and not skipped). */
export function missedDaysThisWeek(schedule: WorkoutDay[], sessions: WorkoutSession[], skipped: string[], now = new Date()) {
  const weekStart = earlierThisWeek(now)[0]?.date ?? localDate(now);
  const doneThisWeek = new Set(sessions.filter((s) => s.date >= weekStart).map((s) => s.dayId));
  return earlierThisWeek(now)
    .map(({ dayId, date }) => ({ day: schedule.find((d) => d.id === dayId), date }))
    .filter((x): x is { day: WorkoutDay; date: string } => Boolean(x.day && !x.day.isRest && x.day.exercises.length))
    .filter(({ day, date }) => !doneThisWeek.has(day.id) && !skipped.includes(`${date}:${day.id}`));
}

/**
 * Streak in days: counts back from today. A day keeps the streak if you trained,
 * or if it was a planned rest day. Today doesn't break it until it's over.
 */
export function computeStreak(schedule: WorkoutDay[], sessions: WorkoutSession[], now = new Date()): number {
  if (!sessions.length) return 0;
  const trained = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const d = new Date(now);
  for (let i = 0; i < 400; i++) {
    const date = localDate(d);
    const day = schedule.find((x) => x.id === DAY_IDS[d.getDay()]);
    const isRest = !day || day.isRest || !day.exercises.length;
    if (trained.has(date)) streak++;
    else if (isRest) streak += streak > 0 || i === 0 ? 1 : 0;
    else if (i !== 0) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** 30-minute version of a workout: the first 3 exercises (main lifts), one set fewer each. */
export function quickVersion(day: WorkoutDay): WorkoutDay {
  return {
    ...day,
    splitName: `${day.splitName} (Quick)`,
    durationMinutes: Math.min(day.durationMinutes, 30),
    exercises: day.exercises.slice(0, 3).map((e) => ({ ...e, sets: Math.max(2, e.sets - 1), restSeconds: Math.min(e.restSeconds, 75) })),
  };
}

// ── In-gym helpers ───────────────────────────────────────────────────────────

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

/** Plates to load on EACH side of the bar for a total weight. Null if it can't be made exactly. */
export function platesPerSide(totalKg: number, barKg = 20): number[] | null {
  let side = Math.round(((totalKg - barKg) / 2) * 100) / 100;
  if (side < 0) return null;
  const out: number[] = [];
  for (const p of PLATES) {
    while (side >= p - 1e-9) {
      out.push(p);
      side = Math.round((side - p) * 100) / 100;
    }
  }
  return side === 0 ? out : null;
}

export const usesBarbell = (ex: Pick<Exercise, 'equipment' | 'name'>) => /barbell/i.test(ex.equipment) || /barbell/i.test(ex.name);

/**
 * Warm-up sets before a heavy working weight (a common ramp: bar, ~50%, ~70%, ~85%).
 * Only for weights where warming up matters (40 kg+ barbell, 20 kg+ otherwise).
 */
export function warmupSets(ex: Pick<Exercise, 'equipment' | 'name'>, workKg: number): { weightKg: number; reps: number }[] {
  const barbell = usesBarbell(ex);
  if (workKg < (barbell ? 40 : 20)) return [];
  const step = barbell ? 2.5 : weightStep(ex as Exercise);
  const r = (pct: number) => Math.max(barbell ? 20 : step, roundTo(workKg * pct, step));
  const sets = [
    ...(barbell ? [{ weightKg: 20, reps: 10 }] : []),
    { weightKg: r(0.5), reps: 5 },
    { weightKg: r(0.7), reps: 3 },
    ...(workKg >= 60 ? [{ weightKg: r(0.85), reps: 1 }] : []),
  ];
  // Drop duplicates (light weights can round to the same number)
  return sets.filter((s, i) => s.weightKg < workKg && sets.findIndex((x) => x.weightKg === s.weightKg) === i);
}
