import React, { useEffect, useMemo, useState } from 'react';
import { Exercise } from '../types';
import { useFitMate } from '../context/FitMateContext';
import {
  type DbExercise,
  type SwapEquipment,
  exerciseImageUrl,
  findAlternatives,
  findExerciseByName,
  loadExerciseDb,
  equipmentLabel,
  LEVEL_LABEL,
  toPlanExercise,
} from '../data/exerciseDb';

interface ExerciseSubstitutionModalProps {
  exercise: Exercise;
  dayId: string;
  exerciseIndex: number;
  isOpen: boolean;
  onClose: () => void;
  /** 'workout' = during a session (default: swap just for today). 'plan' = edit the weekly plan. */
  mode?: 'workout' | 'plan';
}

const EQUIPMENT_CHIPS: { id: SwapEquipment; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'dumbbell', label: 'Dumbbells' },
  { id: 'body only', label: 'Bodyweight' },
  { id: 'cable', label: 'Cable' },
  { id: 'machine', label: 'Machine' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'kettlebells', label: 'Kettlebell' },
  { id: 'bands', label: 'Band' },
];

export const ExerciseSubstitutionModal: React.FC<ExerciseSubstitutionModalProps> = ({
  exercise,
  dayId,
  exerciseIndex,
  isOpen,
  onClose,
  mode = 'workout',
}) => {
  const { substituteExercise, swapExerciseForToday, userProfile, t } = useFitMate();
  const [db, setDb] = useState<DbExercise[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [equipment, setEquipment] = useState<SwapEquipment>(userProfile.workoutLocation === 'Home Workout' ? 'body only' : 'any');
  const [permanent, setPermanent] = useState(mode === 'plan');

  useEffect(() => {
    if (!isOpen || db) return;
    loadExerciseDb().then(setDb).catch(() => setFailed(true));
  }, [isOpen, db]);

  useEffect(() => setPermanent(mode === 'plan'), [mode, isOpen]);

  const current = useMemo(() => {
    if (!db) return null;
    return db.find((e) => e.id === exercise.exerciseDbId) || findExerciseByName(db, exercise.name);
  }, [db, exercise]);

  const alternatives = useMemo(() => {
    if (!db) return [];
    const fallbackMuscle = (exercise.primaryMuscles?.[0] || exercise.targetMuscle || '').toLowerCase().split(',')[0].trim();
    return findAlternatives(db, current, fallbackMuscle, { equipment, limit: 6 });
  }, [db, current, exercise, equipment]);

  if (!isOpen) return null;

  const choose = (alt: DbExercise) => {
    const next = toPlanExercise(alt, { sets: exercise.sets, reps: exercise.reps, restSeconds: exercise.restSeconds, calorieEstimate: exercise.calorieEstimate });
    if (permanent) substituteExercise(dayId, exerciseIndex, next);
    if (mode === 'workout') swapExerciseForToday(exerciseIndex, next);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-[#152031] rounded-2xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl border border-[#1f2a3c] my-auto">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#1f2a3c]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb]">
                {mode === 'workout' ? t('s_title', 'Equipment busy? Swap it') : 'Swap exercise'}
              </h3>
              <p className="text-xs text-[#86948a]">
                Alternatives for <strong className="text-[#bbcabf]">{exercise.name}</strong> that train the same muscle
                {current ? ` (${current.primaryMuscles[0]})` : ''}.
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[#86948a] hover:text-[#d8e3fb] p-1.5 rounded-lg hover:bg-[#1f2a3c]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Equipment filter */}
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#86948a] mb-2">{t('s_free', "What's free right now?")}</div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {EQUIPMENT_CHIPS.map((c) => (
              <button
                key={c.id}
                onClick={() => setEquipment(c.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  equipment === c.id ? 'bg-[#4edea3] text-[#003824] border-[#4edea3]' : 'bg-[#111c2d] text-[#bbcabf] border-[#1f2a3c] hover:border-[#4edea3]/50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto pr-1">
          {!db && !failed && Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-[#111c2d] animate-pulse" />)}
          {failed && <p className="text-sm text-[#ffb4ab] col-span-full">Couldn't load the exercise library. Check your connection and try again.</p>}
          {db && !alternatives.length && (
            <p className="text-sm text-[#86948a] col-span-full">No match with that equipment. Try "Any".</p>
          )}
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              onClick={() => choose(alt)}
              className="text-left bg-[#111c2d] hover:bg-[#1f2a3c] p-2.5 rounded-xl border border-[#1f2a3c] hover:border-[#4edea3]/60 flex gap-3 items-center transition-colors"
            >
              <img
                src={exerciseImageUrl(alt.images[0])}
                alt=""
                loading="lazy"
                className="w-20 h-16 rounded-lg object-cover bg-[#0b1420] shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#d8e3fb] leading-snug line-clamp-2">{alt.name}</div>
                <div className="text-[11px] text-[#86948a] mt-0.5">
                  {equipmentLabel(alt.equipment)} · {LEVEL_LABEL[alt.level]}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1f2a3c]">
          {mode === 'workout' ? (
            <label className="flex items-center gap-2 text-xs text-[#bbcabf] cursor-pointer select-none">
              <input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} className="accent-[#4edea3] w-4 h-4" />
              {t('s_alsoPlan', "Also change my weekly plan (otherwise just today)")}
            </label>
          ) : (
            <span className="text-xs text-[#86948a]">This changes your weekly plan.</span>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold hover:bg-[#1f2a3c]">
            Keep {exercise.name.length > 24 ? 'original' : exercise.name}
          </button>
        </div>
      </div>
    </div>
  );
};
