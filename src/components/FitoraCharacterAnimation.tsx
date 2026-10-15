import React, { useMemo } from 'react';
import { ExerciseAnimationType } from '../types';

export interface FitoraCharacterAnimationProps {
  type: ExerciseAnimationType;
  exerciseName?: string;
  motionProgress: number;
  isPeak: boolean;
  className?: string;
}

// Real character cut-outs extracted from the reference sheet supplied for FITORA.
// Each exercise uses the closest matching reference poses instead of the old drawn SVG person.
const POSES: Record<string, number[]> = {
  pushup: [10, 9, 10, 8],
  push: [10, 9, 10, 8],
  bench: [10, 9, 10, 8],
  chest: [10, 9, 10, 8],
  plank: [10, 9, 10, 8],
  squat: [1, 2, 1, 2],
  lunge: [2, 1, 2, 1],
  curl: [1, 2, 1, 2],
  deadlift: [3, 4, 3, 4],
  row: [3, 6, 3, 6],
  burpee: [5, 2, 7, 2],
  mountain: [5, 6, 5, 6],
  crunch: [15, 16, 15, 16],
  situp: [15, 18, 23, 15],
  'sit-up': [15, 18, 23, 15],
  bicycle: [15, 16, 22, 15],
  leg: [20, 27, 20, 27],
  bridge: [20, 16, 20, 16],
  dip: [26, 26, 26, 26],
  pull: [24, 24, 24, 24],
  hang: [24, 24, 24, 24],
  extension: [21, 20, 21, 20],
};

function choosePoses(exerciseName: string, type: string): number[] {
  const key = `${exerciseName} ${type}`.toLowerCase().replace(/[^a-z0-9 -]/g, ' ');
  for (const [needle, frames] of Object.entries(POSES)) {
    if (key.includes(needle)) return frames;
  }
  return [1, 2, 1, 2];
}

export const FitoraCharacterAnimation: React.FC<FitoraCharacterAnimationProps> = ({
  type,
  exerciseName = '',
  motionProgress,
  isPeak,
  className = '',
}) => {
  const frames = useMemo(() => choosePoses(exerciseName, String(type)), [exerciseName, type]);
  const normalized = Math.max(0, Math.min(0.999, motionProgress));
  const frameIndex = Math.min(frames.length - 1, Math.floor(normalized * frames.length));
  const nextFrame = (frameIndex + 1) % frames.length;
  const blend = (normalized * frames.length) % 1;
  const currentPose = frames[frameIndex];
  const nextPose = frames[nextFrame];

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`} aria-label={`${exerciseName || 'Exercise'} demonstration using the FITORA reference character`}>
      <div className="pointer-events-none absolute bottom-[12%] h-5 w-[64%] rounded-[50%] bg-slate-300/35 blur-xl" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <img
          src={`/pose-${String(currentPose).padStart(2, '0')}.png`}
          alt={`${exerciseName || 'Exercise'} movement pose`}
          draggable={false}
          className="absolute h-[92%] w-[92%] select-none object-contain transition-opacity duration-150"
          style={{ opacity: 1 - blend * 0.7, transform: `translateY(${isPeak ? '-2px' : '0px'}) scale(${isPeak ? 1.015 : 1})` }}
        />
        <img
          src={`/pose-${String(nextPose).padStart(2, '0')}.png`}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute h-[92%] w-[92%] select-none object-contain transition-opacity duration-150"
          style={{ opacity: blend * 0.7, transform: `translateY(${isPeak ? '-2px' : '0px'}) scale(${isPeak ? 1.015 : 1})` }}
        />
      </div>
      <div className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur">
        FITORA · 3D-style reference
      </div>
    </div>
  );
};
