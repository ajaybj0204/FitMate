/**
 * Builds a weekly workout plan from the user's profile: training days per week, gym or home,
 * goal and experience. Uses well-known exercises from the 873-exercise library, a standard
 * split for the number of days, and sets/reps that match the goal.
 */
import type { UserProfile, WorkoutDay } from '../types';
import { type DbExercise, toPlanExercise } from '../data/exerciseDb';

type Slot =
  | 'squat' | 'hinge' | 'hpush' | 'vpush' | 'hpull' | 'vpull' | 'incline' | 'lunge'
  | 'glute' | 'quadIso' | 'hamIso' | 'calf' | 'lateral' | 'rearDelt' | 'biceps' | 'triceps' | 'core' | 'core2' | 'chestIso';

// First existing id wins. Gym list, then home list (bodyweight / dumbbells).
const GYM: Record<Slot, string[]> = {
  squat: ['Barbell_Squat', 'Leg_Press'],
  hinge: ['Romanian_Deadlift', 'Barbell_Deadlift'],
  hpush: ['Barbell_Bench_Press_-_Medium_Grip', 'Dumbbell_Bench_Press'],
  vpush: ['Standing_Military_Press', 'Seated_Dumbbell_Press'],
  hpull: ['Bent_Over_Barbell_Row', 'Seated_Cable_Rows', 'One-Arm_Dumbbell_Row'],
  vpull: ['Wide-Grip_Lat_Pulldown', 'Pullups'],
  incline: ['Incline_Dumbbell_Press'],
  lunge: ['Dumbbell_Lunges'],
  glute: ['Barbell_Hip_Thrust', 'Barbell_Glute_Bridge'],
  quadIso: ['Leg_Extensions'],
  hamIso: ['Lying_Leg_Curls'],
  calf: ['Standing_Calf_Raises'],
  lateral: ['Side_Lateral_Raise'],
  rearDelt: ['Face_Pull', 'Reverse_Flyes'],
  biceps: ['Dumbbell_Bicep_Curl', 'Barbell_Curl'],
  triceps: ['Triceps_Pushdown', 'Lying_Triceps_Press'],
  core: ['Hanging_Leg_Raise', 'Plank'],
  core2: ['Plank', 'Crunches'],
  chestIso: ['Cable_Crossover', 'Dumbbell_Flyes'],
};
const HOME: Record<Slot, string[]> = {
  squat: ['Goblet_Squat', 'Bodyweight_Squat'],
  hinge: ['Stiff-Legged_Dumbbell_Deadlift', 'Single_Leg_Glute_Bridge'],
  hpush: ['Pushups', 'Dumbbell_Floor_Press'],
  vpush: ['Dumbbell_Shoulder_Press', 'Seated_Dumbbell_Press'],
  hpull: ['One-Arm_Dumbbell_Row', 'Inverted_Row'],
  vpull: ['Bent_Over_Two-Dumbbell_Row', 'Pullups'],
  incline: ['Incline_Push-Up', 'Pushups'],
  lunge: ['Bodyweight_Walking_Lunge', 'Dumbbell_Lunges'],
  glute: ['Single_Leg_Glute_Bridge', 'Butt_Lift_Bridge'],
  quadIso: ['Dumbbell_Step_Ups', 'Split_Squat_with_Dumbbells'],
  hamIso: ['Stiff-Legged_Dumbbell_Deadlift'],
  calf: ['Standing_Dumbbell_Calf_Raise', 'Calf_Raise_On_A_Dumbbell'],
  lateral: ['Side_Lateral_Raise'],
  rearDelt: ['Reverse_Flyes', 'Superman'],
  biceps: ['Hammer_Curls', 'Dumbbell_Bicep_Curl'],
  triceps: ['Bench_Dips', 'Push-Ups_-_Close_Triceps_Position'],
  core: ['Plank', 'Russian_Twist'],
  core2: ['Mountain_Climbers', 'Crunches'],
  chestIso: ['Dumbbell_Flyes', 'Incline_Push-Up'],
};

const COMPOUND: Slot[] = ['squat', 'hinge', 'hpush', 'vpush', 'hpull', 'vpull', 'incline', 'lunge', 'glute'];

interface Session { name: string; focus: string; slots: Slot[] }

const FULL_A: Session = { name: 'Full Body A', focus: 'Squat, push, pull', slots: ['squat', 'hpush', 'hpull', 'vpush', 'hamIso', 'core'] };
const FULL_B: Session = { name: 'Full Body B', focus: 'Hinge, press, pull', slots: ['hinge', 'incline', 'vpull', 'lunge', 'lateral', 'core2'] };
const FULL_C: Session = { name: 'Full Body C', focus: 'Legs, chest, back', slots: ['squat', 'hpush', 'hpull', 'glute', 'biceps', 'triceps'] };
const UPPER: Session = { name: 'Upper', focus: 'Chest, back, shoulders, arms', slots: ['hpush', 'hpull', 'vpush', 'vpull', 'biceps', 'triceps'] };
const LOWER: Session = { name: 'Lower', focus: 'Quads, hamstrings, glutes, core', slots: ['squat', 'hinge', 'lunge', 'hamIso', 'calf', 'core'] };
const UPPER2: Session = { name: 'Upper 2', focus: 'Shoulders, back, chest', slots: ['incline', 'vpull', 'hpull', 'lateral', 'rearDelt', 'triceps'] };
const LOWER2: Session = { name: 'Lower 2', focus: 'Glutes, hamstrings, quads', slots: ['hinge', 'glute', 'quadIso', 'hamIso', 'calf', 'core2'] };
const PUSH: Session = { name: 'Push', focus: 'Chest, shoulders, triceps', slots: ['hpush', 'vpush', 'incline', 'lateral', 'chestIso', 'triceps'] };
const PULL: Session = { name: 'Pull', focus: 'Back, rear delts, biceps', slots: ['vpull', 'hpull', 'hinge', 'rearDelt', 'biceps', 'core'] };
const LEGS: Session = { name: 'Legs', focus: 'Quads, hamstrings, glutes, calves', slots: ['squat', 'glute', 'lunge', 'hamIso', 'calf', 'core2'] };

/** Which sessions on which weekdays (index 0 = Monday). */
const SPLITS: Record<number, { session: Session; day: number }[]> = {
  2: [{ session: FULL_A, day: 0 }, { session: FULL_B, day: 3 }],
  3: [{ session: FULL_A, day: 0 }, { session: FULL_B, day: 2 }, { session: FULL_C, day: 4 }],
  4: [{ session: UPPER, day: 0 }, { session: LOWER, day: 1 }, { session: UPPER2, day: 3 }, { session: LOWER2, day: 4 }],
  5: [{ session: PUSH, day: 0 }, { session: PULL, day: 1 }, { session: LEGS, day: 2 }, { session: UPPER, day: 4 }, { session: LOWER, day: 5 }],
  6: [
    { session: PUSH, day: 0 }, { session: PULL, day: 1 }, { session: LEGS, day: 2 },
    { session: { ...PUSH, name: 'Push 2' }, day: 3 }, { session: { ...PULL, name: 'Pull 2' }, day: 4 }, { session: { ...LEGS, name: 'Legs 2' }, day: 5 },
  ],
};

const WEEK: { id: WorkoutDay['id']; dayName: string }[] = [
  { id: 'monday', dayName: 'Monday' }, { id: 'tuesday', dayName: 'Tuesday' }, { id: 'wednesday', dayName: 'Wednesday' },
  { id: 'thursday', dayName: 'Thursday' }, { id: 'friday', dayName: 'Friday' }, { id: 'saturday', dayName: 'Saturday' },
  { id: 'sunday', dayName: 'Sunday' },
];

type Role = 'main' | 'compound' | 'accessory';

/** Sets/reps by goal. The day's first two lifts are the main (heaviest) work. */
function dose(goal: UserProfile['goal'], experience: UserProfile['experience'], role: Role) {
  const extra = experience === 'Advanced' ? 1 : 0;
  const table: Record<UserProfile['goal'], Record<Role, { sets: number; reps: string; restSeconds: number }>> = {
    'Build Strength': { main: { sets: 4 + extra, reps: '5-6', restSeconds: 150 }, compound: { sets: 3, reps: '6-8', restSeconds: 105 }, accessory: { sets: 3, reps: '8-10', restSeconds: 60 } },
    'Build Muscle': { main: { sets: 3 + extra, reps: '8-10', restSeconds: 105 }, compound: { sets: 3, reps: '8-12', restSeconds: 90 }, accessory: { sets: 3, reps: '10-12', restSeconds: 60 } },
    'Lose Fat': { main: { sets: 3, reps: '10-12', restSeconds: 75 }, compound: { sets: 3, reps: '10-12', restSeconds: 60 }, accessory: { sets: 2 + extra, reps: '12-15', restSeconds: 45 } },
    'Maintain Weight': { main: { sets: 3, reps: '8-12', restSeconds: 90 }, compound: { sets: 3, reps: '8-12', restSeconds: 75 }, accessory: { sets: 2 + extra, reps: '12-15', restSeconds: 60 } },
    'General Fitness': { main: { sets: 3, reps: '8-12', restSeconds: 90 }, compound: { sets: 3, reps: '8-12', restSeconds: 75 }, accessory: { sets: 2 + extra, reps: '12-15', restSeconds: 60 } },
  };
  return table[goal] || table['General Fitness'];
}

/** Holds and conditioning moves are timed, not counted in reps. */
const TIMED: Record<string, string> = { Plank: '30-45s hold', Mountain_Climbers: '30s', Russian_Twist: '20 reps' };

export interface GeneratedPlan {
  days: WorkoutDay[];
  summary: string;
}

export function generatePlan(db: DbExercise[], profile: Pick<UserProfile, 'workoutDaysPerWeek' | 'workoutLocation' | 'goal' | 'experience'>): GeneratedPlan {
  const byId = new Map(db.map((e) => [e.id, e]));
  const lists = profile.workoutLocation === 'Home Workout' ? HOME : GYM;
  const daysPerWeek = Math.min(6, Math.max(2, Math.round(profile.workoutDaysPerWeek || 3)));
  const split = SPLITS[daysPerWeek];
  // Beginners: 5 exercises per session (drop the last accessory); others: 6
  const perSession = profile.experience === 'Beginner' ? 5 : 6;

  const days: WorkoutDay[] = WEEK.map((w, i) => {
    const s = split.find((x) => x.day === i);
    if (!s) {
      return { id: w.id, dayName: w.dayName, splitName: 'Rest', focus: 'Recovery & walking', isRest: true, durationMinutes: 0, exercises: [] };
    }
    const used = new Set<string>();
    const exercises = s.session.slots.slice(0, perSession).flatMap((slot, idx) => {
      const id = lists[slot].find((x) => byId.has(x) && !used.has(x));
      if (!id) return [];
      used.add(id);
      const role: Role = idx < 2 && COMPOUND.includes(slot) ? 'main' : COMPOUND.includes(slot) ? 'compound' : 'accessory';
      const d = dose(profile.goal, profile.experience, role)[role];
      return [toPlanExercise(byId.get(id)!, { ...d, reps: TIMED[id] || d.reps })];
    });
    const minutes = exercises.reduce((n, e) => n + e.sets * (1 + e.restSeconds / 60), 0) + 10;
    return {
      id: w.id,
      dayName: w.dayName,
      splitName: s.session.name,
      focus: s.session.focus,
      isRest: false,
      durationMinutes: Math.round(minutes / 5) * 5,
      exercises,
    };
  });

  const style = { 2: 'full body twice a week', 3: 'full body three times a week', 4: 'upper / lower split', 5: 'push / pull / legs + upper / lower', 6: 'push / pull / legs twice' }[daysPerWeek];
  return {
    days,
    summary: `${daysPerWeek} days a week, ${style}, ${profile.workoutLocation === 'Home Workout' ? 'home (bodyweight & dumbbells)' : 'full gym'}, set up for ${profile.goal.toLowerCase()}.`,
  };
}
