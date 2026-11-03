import React, { useEffect, useMemo, useState } from 'react';
import { ExerciseAnimationType, MuscleHighlightInfo } from '../types';
import { ExerciseDemo } from './ExerciseDemo';
import { exercisePhotos, findExerciseByName, loadExerciseDb, titleCase } from '../data/exerciseDb';

export interface ExerciseAnimationProps {
  /** Kept for older saved plans; no longer drives the demo. */
  type?: ExerciseAnimationType;
  exerciseName: string;
  /** Library exercise id (Free Exercise DB), when known. */
  exerciseDbId?: string;
  /** Start/end photos (full URLs or library-relative paths). */
  images?: string[];
  targetMuscle?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  muscleHighlightInfo?: MuscleHighlightInfo;
  equipment?: string;
  instructions?: string | string[];
  formTips?: string[];
  calorieEstimate?: number;
  photoUrl?: string;
  activeSet?: number;
  totalSets?: number;
  repsTarget?: string;
  mode?: 'workout' | 'library';
  onRepCompleted?: (repCount: number) => void;
}

/**
 * ExerciseAnimation
 * Shows real photos of the exercise (start ↔ end position photo loop),
 * with target muscles and plain-language how-to steps.
 */
export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exerciseName,
  exerciseDbId,
  images,
  targetMuscle,
  primaryMuscles = [],
  secondaryMuscles = [],
  equipment,
  instructions,
  formTips = [],
  calorieEstimate,
  photoUrl,
  activeSet = 1,
  totalSets = 4,
  repsTarget = '10-12',
  mode = 'library',
  onRepCompleted,
}) => {
  const given = useMemo(() => (images && images.length ? exercisePhotos({ images }) : null), [images?.join('|')]);
  const [found, setFound] = useState<string[] | null>(null);
  const [looking, setLooking] = useState(false);

  // Older plans and custom exercises have no photos saved: find them in the library by id or name.
  useEffect(() => {
    if (given) return;
    let alive = true;
    setLooking(true);
    loadExerciseDb()
      .then((db) => {
        const ex = (exerciseDbId && db.find((e) => e.id === exerciseDbId)) || findExerciseByName(db, exerciseName);
        if (alive) setFound(ex ? exercisePhotos(ex) : photoUrl ? [photoUrl] : []);
      })
      .catch(() => alive && setFound(photoUrl ? [photoUrl] : []))
      .finally(() => alive && setLooking(false));
    return () => {
      alive = false;
    };
  }, [given, exerciseDbId, exerciseName, photoUrl]);

  const photos = given || found || [];
  const steps = Array.isArray(instructions) ? instructions : instructions ? instructions.split(/(?<=\.)\s+(?=[A-Z])/).filter(Boolean) : [];
  const primary = primaryMuscles.length ? primaryMuscles : targetMuscle ? [targetMuscle] : [];

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Session strip (workout mode) */}
      {mode === 'workout' && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#1f2a3c] bg-[#111c2d] px-4 py-2.5">
          <span className="text-xs font-bold text-[#d8e3fb]">
            Set <span className="text-[#4edea3]">{activeSet}</span> of {totalSets}
          </span>
          <span className="text-xs font-bold text-[#bbcabf]">
            Target: <span className="text-[#4edea3]">{repsTarget}</span> reps
          </span>
          {calorieEstimate ? <span className="text-xs font-bold text-[#ffb4ab]">~{calorieEstimate} kcal</span> : null}
        </div>
      )}

      {/* Demo */}
      {looking && !photos.length ? (
        <div className="aspect-[3/2] w-full animate-pulse rounded-2xl bg-gradient-to-br from-[#111c2d] via-[#152031] to-[#111c2d]" />
      ) : (
        <ExerciseDemo photos={photos} name={exerciseName} onRep={onRepCompleted} />
      )}

      {/* Muscles & equipment */}
      {(primary.length > 0 || secondaryMuscles.length > 0 || equipment) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {primary.map((m) => (
            <span key={`p-${m}`} className="rounded-full border border-[#4edea3]/40 bg-[#10b981]/20 px-2.5 py-1 text-[11px] font-bold text-[#4edea3]">
              {titleCase(m)}
            </span>
          ))}
          {secondaryMuscles.map((m) => (
            <span key={`s-${m}`} className="rounded-full border border-[#1f2a3c] bg-[#152031] px-2.5 py-1 text-[11px] font-semibold text-[#bbcabf]">
              {titleCase(m)}
            </span>
          ))}
          {equipment && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-[#86948a]">
              <span className="material-symbols-outlined text-[15px]">fitness_center</span>
              {titleCase(equipment)}
            </span>
          )}
        </div>
      )}

      {/* How to do it (library) / one key cue (workout) */}
      {mode === 'library' && steps.length > 0 && (
        <div className="rounded-2xl border border-[#1f2a3c] bg-[#111c2d] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#d8e3fb]">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">format_list_numbered</span>
            How to do it
          </h3>
          <ol className="space-y-2.5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-[#bbcabf]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4edea3]/15 text-xs font-extrabold text-[#4edea3]">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {formTips.length > 0 && (mode === 'library' || formTips[0]) && (
        <div className="rounded-2xl border border-[#1f2a3c] bg-[#111c2d] p-4">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#d8e3fb]">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">verified</span>
            {mode === 'workout' ? 'Form cue' : 'Form tips'}
          </h3>
          <ul className="space-y-1.5">
            {(mode === 'workout' ? formTips.slice(0, 1) : formTips).map((t, i) => (
              <li key={i} className="text-xs leading-relaxed text-[#bbcabf]">
                • {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
