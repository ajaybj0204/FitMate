import { ExerciseAnimationType, SupportedLanguage } from './index';

export type BodyPartFilter =
  | 'All'
  | 'Full Body'
  | 'Upper Body'
  | 'Lower Body'
  | 'Core'
  | 'Arms'
  | 'Legs'
  | 'Back'
  | 'Chest'
  | 'Shoulders'
  | 'Glutes'
  | 'Hips';

export type GoalFilter =
  | 'All'
  | 'Strength'
  | 'Muscle Growth'
  | 'Fat Loss'
  | 'Endurance'
  | 'Mobility'
  | 'Flexibility'
  | 'Balance'
  | 'General Fitness'
  | 'Recovery'
  | 'Functional'
  | 'Prehab'
  | 'Posture'
  | 'Warm-up'
  | 'Cool-down'
  | 'Power'
  | 'HIIT'
  | 'Cardio';

export type DifficultyFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

export type EquipmentFilter =
  | 'All'
  | 'No Equipment'
  | 'Dumbbell'
  | 'Barbell'
  | 'Kettlebell'
  | 'Resistance Band'
  | 'Cable'
  | 'Machine'
  | 'Bench'
  | 'Other';

export type MovementTypeFilter =
  | 'All'
  | 'Strength'
  | 'Cardio'
  | 'Mobility'
  | 'Stretch'
  | 'Warm-up'
  | 'Cool-down'
  | 'Balance'
  | 'Functional'
  | 'Prehab'
  | 'HIIT';

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  bodyPart: BodyPartFilter;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: EquipmentFilter;
  equipmentAlternatives: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyReason: string;
  exerciseType: MovementTypeFilter;
  movementPattern: string; // e.g. "Knee Dominant", "Hip Hinge", "Horizontal Push", "Vertical Pull"
  goals: GoalFilter[];
  shortDescription: string;
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  safetyNotes: string;
  simpleExplanation: string;
  scientificExplanation: string;
  benefits: string[];
  references: string[];
  animationType?: ExerciseAnimationType;
  imageUrl: string;
  relatedExerciseIds: string[];
  calorieBurnPerMin?: number; // Physiological estimate
}

export interface LocalizedExerciseContent {
  name: string;
  shortDescription: string;
  simpleExplanation: string;
  scientificExplanation: string;
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  safetyNotes: string;
  benefits: string[];
}
