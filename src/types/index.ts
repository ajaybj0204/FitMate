export type NavigationSection =
  | 'landing'
  | 'onboarding'
  | 'dashboard'
  | 'my-health'
  | 'workout'
  | 'exercise-library'
  | 'daily-plan'
  | 'nutrition'
  | 'analytics'
  | 'progress'
  | 'learn'
  | 'profile';

export type SupportedLanguage = 'en' | 'kn' | 'te' | 'ta' | 'ml';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export type FitnessGoal =
  | 'Build Muscle'
  | 'Lose Fat'
  | 'Build Strength'
  | 'Maintain Weight'
  | 'General Fitness';

export type FitnessExperience = 'Beginner' | 'Intermediate' | 'Advanced';

export type ActivityLevel =
  | 'Sedentary'
  | 'Lightly Active'
  | 'Moderately Active'
  | 'Very Active';

export type DietPreference = 'Vegetarian' | 'Eggetarian' | 'Non-Vegetarian';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  heightCm: number;
  weightKg: number;
  goal: FitnessGoal;
  experience: FitnessExperience;
  activityLevel: ActivityLevel;
  workoutDaysPerWeek: number;
  workoutLocation: 'Full Gym' | 'Home Workout';
  dietPreference: DietPreference;
  allergies: string[];
  weeklyBudget: string;
  memberSince: string;
  streakDays: number;
  completedWorkoutsCount: number;
}

export interface HealthMetrics {
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  bmiExplanation: string;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  waterTargetLiters: number;
  waterGlasses: number;
  maintenanceCalories: number;
  fatLossCalories: number;
  muscleGainCalories: number;
}

export type ExerciseAnimationType =
  | 'squat'
  | 'bench_press'
  | 'pushup'
  | 'lat_pulldown'
  | 'shoulder_press'
  | 'bicep_curl'
  | 'plank'
  | 'lunge'
  | 'row'
  | 'tricep'
  | 'deadlift'
  | 'pullup'
  | 'dips'
  | 'lateral_raise'
  | 'leg_press'
  | 'chest_fly'
  | 'military_press'
  | 'calf_raise'
  | 'leg_raise'
  | 'cardio'
  | 'recovery';

export type MuscleGroup =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'lats'
  | 'upper_back'
  | 'lower_back'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'core';

export interface MuscleHighlightInfo {
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
  primaryLabels: string[];
  secondaryLabels: string[];
  activationScore?: number; // e.g. 95%
}

export interface ExerciseSubstitution {
  name: string;
  equipment: string;
  reason: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  targetMuscles?: string[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  muscleHighlightInfo?: MuscleHighlightInfo;
  calorieEstimate?: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  formTips: string[];
  imageUrl: string;
  equipment: string;
  animationType?: ExerciseAnimationType;
  substitutions?: ExerciseSubstitution[];
  defaultWeightKg?: number;
}

export interface WorkoutDay {
  id: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  dayName: string;
  splitName: string;
  focus: string;
  isRest: boolean;
  durationMinutes: number;
  exercises: Exercise[];
}

export interface SetLog {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  completed: boolean;
}

export interface Meal {
  id: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner' | 'Pre-workout' | 'Post-workout';
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietaryType: 'veg' | 'non-veg' | 'egg';
  portion: string;
  description: string;
  recipe: string;
  imageUrl: string;
  completed: boolean;
  costInr?: number;
  costPerGramProtein?: number;
  isBudgetFriendly?: boolean;
  prepTimeMinutes?: number;
  ingredients?: string[];
}

export interface ProgressEntry {
  id: string;
  date: string;
  weightKg: number;
  waistInches: number;
  chestInches: number;
  armsInches: number;
  thighsInches: number;
  bodyFatPercent?: number;
  notes: string;
}

export interface EducationalTopic {
  id: string;
  title: string;
  category: 'nutrition' | 'metabolism' | 'body' | 'training';
  categoryLabel: string;
  shortDesc: string;
  whatIsIt: string;
  whyItMatters: string;
  simpleExample: string;
  commonMisconception: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

export interface SmartReminder {
  id: string;
  title: string;
  desc: string;
  time: string;
  enabled: boolean;
  type: 'water' | 'workout' | 'meal' | 'sleep';
  icon: string;
}

export interface DailyPlanItem {
  id: string;
  time: string;
  title: string;
  category: 'hydration' | 'meal' | 'workout' | 'recovery' | 'steps';
  detail: string;
  completed: boolean;
}

export interface HydrationLog {
  currentMl: number;
  targetMl: number;
  history: { id: string; time: string; amountMl: number }[];
}

export interface SleepLog {
  date: string;
  sleepHours: number;
  sleepMinutes: number;
  sleepQuality: 'Deep' | 'Restful' | 'Fair' | 'Poor';
  recoveryScore: number;
  restingHeartRate: number;
}

export interface StepsLog {
  date: string;
  currentSteps: number;
  targetSteps: number;
  distanceKm: number;
  caloriesBurned: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: 'Produce' | 'Protein & Dairy' | 'Grains & Pulses' | 'Pantry & Spices';
  estimatedCostInr: number;
  checked: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: string;
}

