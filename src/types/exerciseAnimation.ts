import { ExerciseAnimationType } from './index';

export type CameraViewAngle = 'front' | 'side' | '3d';

export interface ExerciseMovementPhase {
  name: string; // e.g. "1. Start Position", "2. Lowering Phase", "3. Bottom Pause", "4. Drive & Lockout"
  instruction: string; // e.g. "Brace core and lower hips backwards with controlled tempo"
  arrowDirection?: 'up' | 'down' | 'pull' | 'push' | 'hold';
  cue: string; // e.g. "Inhale & keep knees in line with toes"
}

export interface ExerciseBiomechanicalModel {
  type: ExerciseAnimationType;
  title: string;
  defaultCamera: CameraViewAngle;
  supportedCameras: CameraViewAngle[];
  
  // Simple User-Friendly Information
  howToDoSteps: string[];
  simplePrimaryMuscles: string[]; // e.g. ["Front Thighs (Quadriceps)", "Glutes (Buttocks)"]
  simpleSecondaryMuscles: string[]; // e.g. ["Hamstrings", "Deep Core"]
  commonMistakes: string[]; // Plain english with clear error cues
  formAndSafety: string[]; // Plain english safety rules

  // Movement & Direction Guidance
  startingPositionDescription: string;
  phases: ExerciseMovementPhase[];
  motionArrowLabel: string; // e.g. "Drive through heels" or "Elbows tuck 45°"
  
  // Optional "🔬 Understand the Science" (Biomechanical Details)
  science: {
    primaryMusclesAnatomical: string[];
    secondaryMusclesAnatomical: string[];
    jointActions: string[];
    movementPattern: string;
    whyItWorks: string;
    scientificExplanation: string;
  };
}
