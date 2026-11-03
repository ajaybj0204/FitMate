import React, { useEffect, useRef, useState } from 'react';
import { PHOTO_CREDIT } from '../data/exerciseDb';

interface ExerciseDemoProps {
  /** Start and end position photos (full URLs). */
  photos: string[];
  name: string;
  /** Compact: no controls, used in cards. */
  compact?: boolean;
  /** Start playing immediately (cards play only on hover). */
  autoPlay?: boolean;
  /** Called after every full start → end → start cycle (one rep). */
  onRep?: (rep: number) => void;
  className?: string;
}

const SPEEDS = [0.5, 1, 1.5] as const;
// One rep = hold start, move, hold end, move back. Milliseconds at 1x speed.
const HOLD_MS = 650;
const MOVE_MS = 750;

/**
 * Real-photo exercise demo: crossfades between the start and end position photos
 * in a smooth loop, like a short demo clip of a real trainer.
 */
export const ExerciseDemo: React.FC<ExerciseDemoProps> = ({ photos, name, compact = false, autoPlay = true, onRep, className = '' }) => {
  const [frame, setFrame] = useState(0); // 0 = start position, 1 = end position
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [loaded, setLoaded] = useState<boolean[]>([]);
  const [failed, setFailed] = useState(false);
  const [rep, setRep] = useState(0);
  const onRepRef = useRef(onRep);
  onRepRef.current = onRep;

  const twoFrames = photos.length >= 2;
  const moveMs = MOVE_MS / speed;

  // Reset when the exercise changes
  useEffect(() => {
    setFrame(0);
    setRep(0);
    setLoaded([]);
    setFailed(false);
  }, [photos.join('|')]);

  useEffect(() => setPlaying(autoPlay), [autoPlay]);

  // Loop: hold → crossfade → hold → crossfade back (counts one rep)
  useEffect(() => {
    if (!playing || !twoFrames) return;
    const t = setTimeout(() => {
      setFrame((f) => {
        const next = f === 0 ? 1 : 0;
        if (next === 0) {
          setRep((r) => {
            const n = r + 1;
            onRepRef.current?.(n);
            return n;
          });
        }
        return next;
      });
    }, (HOLD_MS + MOVE_MS) / speed);
    return () => clearTimeout(t);
  }, [playing, frame, speed, twoFrames]);

  const ready = loaded.filter(Boolean).length >= Math.min(photos.length, 2);

  if (!photos.length || failed) {
    return (
      <div className={`relative flex aspect-[3/2] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#0b1422] text-[#86948a] ${className}`}>
        <span className="material-symbols-outlined text-[36px]">fitness_center</span>
        <span className="text-xs font-semibold">Demo photos unavailable for this exercise</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="group relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-[#0b1422]"
        onClick={() => !compact && twoFrames && setFrame((f) => (f === 0 ? 1 : 0))}
        role={compact ? undefined : 'button'}
        aria-label={compact ? `${name} demo` : `${name} demo. Click to switch position.`}
      >
        {photos.slice(0, 2).map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${name}: ${i === 0 ? 'start' : 'end'} position`}
            loading={compact ? 'lazy' : 'eager'}
            decoding="async"
            draggable={false}
            onLoad={() => setLoaded((l) => Object.assign([...l], { [i]: true }))}
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full select-none object-cover"
            style={{
              opacity: frame === i ? 1 : 0,
              transform: frame === i ? 'scale(1.035)' : 'scale(1)',
              transition: `opacity ${moveMs}ms ease-in-out, transform ${(HOLD_MS + MOVE_MS) / speed}ms ease-out`,
            }}
          />
        ))}

        {!ready && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#111c2d] via-[#152031] to-[#111c2d]" />}

        {/* Soft bottom gradient for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {twoFrames && (
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
            <span className={`h-1.5 w-1.5 rounded-full ${playing ? 'animate-pulse bg-[#4edea3]' : 'bg-[#86948a]'}`} />
            {frame === 0 ? 'Start position' : 'End position'}
          </div>
        )}

        {!compact && twoFrames && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur">
            Rep {rep + 1}
          </div>
        )}

        {/* Two-step progress bar */}
        {twoFrames && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex gap-1.5">
            {[0, 1].map((i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-[#4edea3]" style={{ width: frame === i ? '100%' : '0%', transition: `width ${moveMs}ms ease-in-out` }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex items-center gap-1 rounded-xl bg-[#4edea3] px-3 py-2 text-xs font-extrabold text-[#003824] transition-all hover:bg-[#6ffbbe]"
              aria-label={playing ? 'Pause demo' : 'Play demo'}
            >
              <span className="material-symbols-outlined text-[18px]">{playing ? 'pause' : 'play_arrow'}</span>
              {playing ? 'Pause' : 'Play'}
            </button>
            {twoFrames && (
              <button
                onClick={() => {
                  setPlaying(false);
                  setFrame((f) => (f === 0 ? 1 : 0));
                }}
                className="flex items-center gap-1 rounded-xl border border-[#1f2a3c] bg-[#152031] px-3 py-2 text-xs font-bold text-[#bbcabf] transition-all hover:text-white"
                aria-label="Show the other position"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                Step
              </button>
            )}
          </div>
          {twoFrames && (
            <div className="flex items-center gap-1 rounded-xl border border-[#1f2a3c] bg-[#111c2d] p-1" role="group" aria-label="Demo speed">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition-all ${speed === s ? 'bg-[#4edea3] text-[#003824]' : 'text-[#86948a] hover:text-white'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!compact && (
        <a href={PHOTO_CREDIT.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-[10px] text-[#5d6b7e] hover:text-[#86948a]">
          {PHOTO_CREDIT.label}
        </a>
      )}
    </div>
  );
};
