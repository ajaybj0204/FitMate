import React from 'react';
import { Exercise, ExerciseSubstitution } from '../types';
import { useFitMate } from '../context/FitMateContext';

interface ExerciseSubstitutionModalProps {
  exercise: Exercise;
  dayId: string;
  exerciseIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseSubstitutionModal: React.FC<ExerciseSubstitutionModalProps> = ({
  exercise,
  dayId,
  exerciseIndex,
  isOpen,
  onClose,
}) => {
  const { substituteExercise } = useFitMate();

  if (!isOpen) return null;

  const defaultSubs: ExerciseSubstitution[] = exercise.substitutions || [
    {
      name: `${exercise.name} (Dumbbell Variation)`,
      equipment: 'Dumbbells',
      reason: 'Provides independent stabilizer activation and shoulder safety.',
      difficulty: 'Intermediate',
    },
    {
      name: `${exercise.name} (Bodyweight Progression)`,
      equipment: 'Bodyweight',
      reason: 'No gym equipment required; optimal for home workouts.',
      difficulty: 'Beginner',
    },
  ];

  const handleSelectSub = (sub: ExerciseSubstitution) => {
    const substituted: Exercise = {
      ...exercise,
      id: `ex-sub-${Date.now()}`,
      name: sub.name,
      equipment: sub.equipment,
      difficulty: sub.difficulty,
      instructions: `Alternative variation of ${exercise.name} tailored for ${sub.equipment}. Focus on controlled eccentric cadence.`,
    };
    substituteExercise(dayId, exerciseIndex, substituted);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#152031] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-[#1f2a3c] my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2a3c]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb]">
                Exercise Substitution
              </h3>
              <p className="text-xs text-[#86948a]">
                Swap "{exercise.name}" with a calibrated alternative
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#86948a] hover:text-[#d8e3fb] p-1.5 rounded-lg hover:bg-[#1f2a3c]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="my-5 flex flex-col gap-3">
          {defaultSubs.map((sub, idx) => (
            <div
              key={idx}
              className="bg-[#111c2d] hover:bg-[#1f2a3c] p-4 rounded-xl border border-[#1f2a3c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#d8e3fb]">{sub.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#152031] text-[#4edea3] border border-[#1f2a3c]">
                    {sub.difficulty}
                  </span>
                </div>
                <div className="text-xs text-[#86948a] mt-0.5">Equipment: {sub.equipment}</div>
                <p className="text-xs text-[#bbcabf] mt-1.5 leading-relaxed">{sub.reason}</p>
              </div>

              <button
                onClick={() => handleSelectSub(sub)}
                className="px-4 py-2 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-xs font-bold transition-all shrink-0"
              >
                Use Alternative
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold hover:bg-[#1f2a3c]"
          >
            Keep Original
          </button>
        </div>
      </div>
    </div>
  );
};
