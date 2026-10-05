export type NavigationSection =
  | 'landing'
  | 'onboarding'
  | 'dashboard'
  | 'my-health'
  | 'workout'
  | 'nutrition'
  | 'progress'
  | 'learn'
  | 'profile';

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

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  formTips: string[];
  imageUrl: string;
  equipment: string;
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
