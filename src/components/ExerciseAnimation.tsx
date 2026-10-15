import React, { useState, useEffect, useMemo } from 'react';
import { ExerciseAnimationType, MuscleHighlightInfo } from '../types';
import { CameraViewAngle } from '../types/exerciseAnimation';
import { EXERCISE_ANIMATION_MODELS } from '../data/exerciseAnimationModelData';
import { HumanExerciseRenderer } from './HumanExerciseRenderer';
import { ExerciseAnimationModel } from './ExerciseAnimationModel';
import { FitoraCharacterAnimation } from './FitoraCharacterAnimation';

export { ExerciseAnimationModel, FitoraCharacterAnimation };

export interface ExerciseAnimationProps {
  type: ExerciseAnimationType;
  exerciseName: string;
  targetMuscle?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  muscleHighlightInfo?: MuscleHighlightInfo;
  equipment?: string;
  instructions?: string;
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
 * A high-clarity human exercise demonstration engine for FITORA.
 * Shows a realistic human athlete performing the complete biomechanical movement
 * with directional motion cues, real-time rep synchronization, and user-friendly instructions.
 */
export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  type,
  exerciseName,
  targetMuscle = 'General Muscle Group',
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
  // Retrieve structured exercise model data
  const modelData = useMemo(() => {
    return (
      EXERCISE_ANIMATION_MODELS[type] ||
      EXERCISE_ANIMATION_MODELS.squat
    );
  }, [type]);

  // View & Playback State
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.5x, 1.0x, 1.5x
  const [cameraAngle, setCameraAngle] = useState<CameraViewAngle>(modelData.defaultCamera || 'side');
  const [motionProgress, setMotionProgress] = useState(0); // 0.0 to 1.0
  const [currentRepNumber, setCurrentRepNumber] = useState(1);
  const [renderEngine, setRenderEngine] = useState<'character' | '3d-webgl'>('character');
  const [viewMode, setViewMode] = useState<'3d-model' | 'photo'>('3d-model');

  // Accordion State
  const [isScienceExpanded, setIsScienceExpanded] = useState(false); // Collapsed by default

  // Reset camera when exercise type changes
  useEffect(() => {
    setCameraAngle(modelData.defaultCamera || 'side');
    setMotionProgress(0);
    setCurrentRepNumber(1);
  }, [type, modelData.defaultCamera]);

  // Smooth 60fps kinetic cycle loop with authentic resistance training cadence:
  // 3.2 seconds base cycle modulated by playbackSpeed
  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;
    let startTime: number | null = null;
    let lastRepCount = 1;
    const baseCycleMs = 3200 / playbackSpeed;

    const updateFrame = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const cycleProgress = (elapsed % baseCycleMs) / baseCycleMs;
      const completedCycles = Math.floor(elapsed / baseCycleMs) + 1;

      setMotionProgress(cycleProgress);

      if (completedCycles !== lastRepCount) {
        lastRepCount = completedCycles;
        setCurrentRepNumber(completedCycles);
        if (onRepCompleted) {
          onRepCompleted(completedCycles);
        }
      }

      animFrame = requestAnimationFrame(updateFrame);
    };

    animFrame = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, playbackSpeed, onRepCompleted]);

  // Active Phase calculation
  const isPeak = motionProgress >= 0.45 && motionProgress <= 0.58;
  const activePhaseIndex = useMemo(() => {
    if (motionProgress < 0.25) return 0; // Setup
    if (motionProgress < 0.5) return 1; // Movement / Lowering
    if (motionProgress < 0.65) return 2; // Peak Contraction
    return 3; // Return / Push
  }, [motionProgress]);

  const currentPhase = modelData.phases[activePhaseIndex] || modelData.phases[0];

  // Primary & Secondary muscle lists (preferring simple user-friendly labels)
  const displayPrimaryMuscles = useMemo(() => {
    if (modelData.simplePrimaryMuscles && modelData.simplePrimaryMuscles.length > 0) {
      return modelData.simplePrimaryMuscles;
    }
    if (primaryMuscles.length > 0) return primaryMuscles;
    return [targetMuscle.split('&')[0].trim()];
  }, [modelData, primaryMuscles, targetMuscle]);

  const displaySecondaryMuscles = useMemo(() => {
    if (modelData.simpleSecondaryMuscles && modelData.simpleSecondaryMuscles.length > 0) {
      return modelData.simpleSecondaryMuscles;
    }
    if (secondaryMuscles.length > 0) return secondaryMuscles;
    return targetMuscle.includes('&')
      ? [targetMuscle.split('&')[1].trim()]
      : ['Core Stabilizers'];
  }, [modelData, secondaryMuscles, targetMuscle]);

  // Restart function
  const handleRestart = () => {
    setMotionProgress(0);
    setCurrentRepNumber(1);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col w-full rounded-3xl bg-[#0c1421] border border-[#1f2a3c] overflow-hidden shadow-2xl relative select-none">
      {/* ---------------- 1. TOP HEADER & TELEMETRY BAR ---------------- */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#08101a] border-b border-[#1a2536] flex-wrap gap-2 text-xs">
        {/* Left: Exercise Name & Rep / Set Telemetry */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#152336] border border-[#1f2a3c]">
            <span className="text-[10px] text-[#86948a] font-bold uppercase tracking-wider">
              {mode === 'workout' ? `Set ${activeSet}/${totalSets}` : 'DEMO'}
            </span>
            <span className="text-[#86948a]">•</span>
            <span className="text-xs font-extrabold text-[#4edea3] font-headline tabular-nums">
              REP {currentRepNumber}
            </span>
            {repsTarget && (
              <span className="text-[10px] text-[#86948a]">
                ({repsTarget} target)
              </span>
            )}
          </div>

          {/* Current Phase Indicator Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#10b981]/15 text-[#4edea3] border border-[#4edea3]/25 font-semibold text-xs">
            <span className={`w-2 h-2 rounded-full ${isPeak ? 'bg-[#ff3b5c] animate-ping' : 'bg-[#4edea3]'}`} />
            <span>{currentPhase.name}</span>
          </div>
        </div>

        {/* Right: Mode Selector, Speed & Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Animated Character (Default) vs Optional 3D View */}
          <div className="flex items-center bg-[#070f1a] rounded-xl p-0.5 border border-[#1f2a3c]">
            <button
              type="button"
              onClick={() => setRenderEngine('character')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                renderEngine === 'character'
                  ? 'bg-[#152336] text-[#4edea3] border border-[#4edea3]/40 shadow-sm'
                  : 'text-[#86948a] hover:text-[#d8e3fb]'
              }`}
              title="Clean Animated Exercise Character (Default)"
            >
              <span className="material-symbols-outlined text-[13px]">accessibility_new</span>
              <span>Animation</span>
            </button>
            <button
              type="button"
              onClick={() => setRenderEngine('3d-webgl')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                renderEngine === '3d-webgl'
                  ? 'bg-[#152336] text-[#4edea3] border border-[#4edea3]/40 shadow-sm'
                  : 'text-[#86948a] hover:text-[#d8e3fb]'
              }`}
              title="Optional 3D Model View"
            >
              <span className="material-symbols-outlined text-[13px]">view_in_ar</span>
              <span>3D</span>
            </button>
          </div>

          {/* Camera View Selector (Available in 3D Mode) */}
          {renderEngine === '3d-webgl' && (
            <div className="flex items-center bg-[#070f1a] rounded-xl p-0.5 border border-[#1f2a3c]">
              {modelData.supportedCameras.map(angle => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setCameraAngle(angle)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    cameraAngle === angle
                      ? 'bg-[#152336] text-[#4edea3] border border-[#4edea3]/30 shadow-sm'
                      : 'text-[#86948a] hover:text-[#d8e3fb]'
                  }`}
                  title={`Switch to ${angle} view`}
                >
                  {angle === '3d' ? '3/4' : angle}
                </button>
              ))}
            </div>
          )}

          {/* Playback Speed (0.5x, 1x, 1.5x) */}
          <div className="flex items-center bg-[#070f1a] rounded-xl p-0.5 border border-[#1f2a3c]">
            {[0.5, 1.0, 1.5].map(spd => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  playbackSpeed === spd
                    ? 'bg-[#4edea3] text-[#003824] shadow-sm'
                    : 'text-[#86948a] hover:text-[#d8e3fb]'
                }`}
                title={`Playback speed ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Restart Button */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-[#152336] hover:bg-[#1f314a] text-[#86948a] hover:text-[#d8e3fb] border border-[#1f2a3c] transition-colors"
            title="Restart Exercise Animation"
          >
            <span className="material-symbols-outlined text-[17px]">replay</span>
          </button>

          {/* Play / Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(p => !p)}
            className="p-1.5 rounded-xl bg-[#152336] hover:bg-[#1f314a] text-[#4edea3] border border-[#1f2a3c] transition-colors"
            title={isPlaying ? 'Pause Demonstration' : 'Play Demonstration'}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
      </div>

      {/* ---------------- 2. MAIN REALISTIC HUMAN ATHLETE STAGE ---------------- */}
      <div className="relative w-full h-72 sm:h-84 md:h-92 bg-gradient-to-b from-[#08101a] via-[#0c1624] to-[#111e30] flex items-center justify-center overflow-hidden">
        {/* Soft Ambient Overhead Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(78,222,163,0.14),transparent_70%)] pointer-events-none" />

        {/* Phase Directional Guidance Bar (Top-Left) */}
        <div className="absolute top-3 left-3 bg-[#08121f]/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#1f2a3c] flex items-center gap-2 pointer-events-none z-10 shadow-lg">
          <span className="material-symbols-outlined text-[#4edea3] text-[18px]">
            {isPeak ? 'local_fire_department' : isPlaying ? 'directions_run' : 'pause_circle'}
          </span>
          <div>
            <div className="text-[10px] text-[#86948a] font-bold uppercase tracking-wider">
              Current Motion
            </div>
            <div className="text-xs font-extrabold text-[#d8e3fb]">
              {currentPhase.instruction}
            </div>
          </div>
        </div>

        {/* Calorie Burn Rate Badge (Top-Right) */}
        <div className="absolute top-3 right-3 bg-[#08121f]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#1f2a3c] flex items-center gap-1.5 pointer-events-none z-10 shadow-lg">
          <span className="material-symbols-outlined text-[#ff897d] text-[16px]">local_fire_department</span>
          <span className="text-xs font-bold text-[#d8e3fb] tabular-nums">
            ~{calorieEstimate || 45} kcal
          </span>
          <span className="text-[10px] text-[#86948a]">est.</span>
        </div>

        {/* MAIN CLEAR ANIMATED FITNESS CHARACTER (DEFAULT) */}
        {renderEngine === 'character' ? (
          <FitoraCharacterAnimation
            type={type}
            motionProgress={motionProgress}
            isPeak={isPeak}
          />
        ) : (
          <ExerciseAnimationModel
            type={type}
            motionProgress={motionProgress}
            cameraAngle={cameraAngle}
            isPeak={isPeak}
            onCameraChange={setCameraAngle}
          />
        )}

        {/* Cycle Progress Tracker at bottom of canvas */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#08101a]">
          <div
            className="h-full bg-gradient-to-r from-[#4edea3] via-[#9ddf2e] to-[#ff3b5c] transition-all duration-75"
            style={{ width: `${Math.round(motionProgress * 100)}%` }}
          />
        </div>
      </div>

      {/* ---------------- 3. SECONDARY MUSCLE HIGHLIGHT STRIP (CLEAN & SUBTLE) ---------------- */}
      <div className="px-4 py-3 bg-[#0a121c] border-t border-[#1a2536] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86948a]">
            Primary Muscles:
          </span>
          {displayPrimaryMuscles.map((muscle, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-[#ff4757]/15 text-[#ff6b81] font-bold text-xs border border-[#ff4757]/30 flex items-center gap-1.5 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4757] animate-pulse" />
              <span>{muscle}</span>
            </span>
          ))}

          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86948a] ml-2">
            Assisting:
          </span>
          {displaySecondaryMuscles.slice(0, 2).map((muscle, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-lg bg-[#152336] text-[#bbcabf] font-medium text-xs border border-[#1f2a3c]"
            >
              {muscle}
            </span>
          ))}
        </div>

        {/* Motion Path Cue */}
        <div className="text-[11px] text-[#4edea3] font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">info</span>
          <span>{modelData.motionArrowLabel}</span>
        </div>
      </div>

      {/* ---------------- 4. DETAILED USER-FRIENDLY INFORMATION (LIBRARY & FULL MODE) ---------------- */}
      {mode === 'library' && (
        <div className="p-5 bg-[#08101a] border-t border-[#1a2536] flex flex-col gap-5">
          {/* A. HOW TO DO IT (1, 2, 3, 4 Step-by-Step in plain English) */}
          <div className="bg-[#0e1724] p-4 sm:p-5 rounded-2xl border border-[#1f2a3c]">
            <h4 className="font-headline text-sm font-bold text-[#d8e3fb] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3] text-[20px]">
                format_list_numbered
              </span>
              HOW TO PERFORM THIS EXERCISE
            </h4>
            <ol className="flex flex-col gap-2.5">
              {(modelData.howToDoSteps || []).map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-[#d8e3fb] leading-relaxed">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#152336] text-[#4edea3] font-bold text-[11px] shrink-0 mt-0.5 border border-[#4edea3]/30">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* B. COMMON MISTAKES & FORM & SAFETY (Two Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Mistakes with ❌ */}
            <div className="bg-[#0e1724] p-4 rounded-2xl border border-[#ffb4ab]/25">
              <h5 className="font-headline text-xs font-bold text-[#ffb4ab] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">cancel</span>
                COMMON MISTAKES TO AVOID
              </h5>
              <ul className="flex flex-col gap-2 text-xs text-[#bbcabf]">
                {(modelData.commonMistakes || []).map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#ff6b81] font-bold shrink-0">✕</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form & Safety with 🛡️ */}
            <div className="bg-[#0e1724] p-4 rounded-2xl border border-[#4edea3]/25">
              <h5 className="font-headline text-xs font-bold text-[#4edea3] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">verified_user</span>
                FORM &amp; INJURY PREVENTION
              </h5>
              <ul className="flex flex-col gap-2 text-xs text-[#bbcabf]">
                {(modelData.formAndSafety || []).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#4edea3] font-bold shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* C. OPTIONAL COLLAPSIBLE: "🔬 UNDERSTAND THE SCIENCE" (Collapsed by default!) */}
          <div className="rounded-2xl border border-[#1f2a3c] bg-[#0c1421] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsScienceExpanded(prev => !prev)}
              className="w-full flex items-center justify-between p-4 bg-[#111c2d] hover:bg-[#152336] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🔬</span>
                <div>
                  <div className="font-headline text-xs sm:text-sm font-bold text-[#d8e3fb]">
                    Understand the Science
                  </div>
                  <div className="text-[11px] text-[#86948a]">
                    Optional biomechanics, joint actions, and anatomical breakdown
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#4edea3] font-bold">
                <span>{isScienceExpanded ? 'Collapse' : 'Explore'}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {isScienceExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </div>
            </button>

            {isScienceExpanded && (
              <div className="p-4 sm:p-5 border-t border-[#1f2a3c] space-y-4 animate-in fade-in duration-200 text-xs">
                {/* Movement Pattern & Joint Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#08101a] p-3 rounded-xl border border-[#1f2a3c]">
                    <span className="text-[10px] text-[#86948a] font-bold uppercase block mb-1">
                      Biomechanical Pattern
                    </span>
                    <span className="text-xs font-bold text-[#4edea3]">
                      {modelData.science.movementPattern}
                    </span>
                  </div>
                  <div className="bg-[#08101a] p-3 rounded-xl border border-[#1f2a3c]">
                    <span className="text-[10px] text-[#86948a] font-bold uppercase block mb-1">
                      Joint Articulations
                    </span>
                    <span className="text-xs font-bold text-[#d8e3fb]">
                      {modelData.science.jointActions.join(' • ')}
                    </span>
                  </div>
                </div>

                {/* Anatomical Muscles List */}
                <div className="bg-[#08101a] p-3 rounded-xl border border-[#1f2a3c]">
                  <span className="text-[10px] text-[#86948a] font-bold uppercase block mb-1.5">
                    Anatomical Muscular Classification
                  </span>
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <div>
                      <strong className="text-[#ff6b81]">Agonists (Primary): </strong>
                      <span className="text-[#d8e3fb]">
                        {modelData.science.primaryMusclesAnatomical.join(', ')}
                      </span>
                    </div>
                    <div>
                      <strong className="text-[#9ddf2e]">Synergists &amp; Fixators: </strong>
                      <span className="text-[#bbcabf]">
                        {modelData.science.secondaryMusclesAnatomical.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Why It Works & Scientific Explanation */}
                <div className="bg-[#08101a] p-3.5 rounded-xl border border-[#9ddf2e]/25">
                  <span className="text-[10px] text-[#9ddf2e] font-bold uppercase block mb-1">
                    Physiological Mechanism
                  </span>
                  <p className="text-xs text-[#d8e3fb] leading-relaxed">
                    {modelData.science.scientificExplanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 5. SIMPLE FORM CUE IN WORKOUT MODE ---------------- */}
      {mode === 'workout' && (
        <div className="px-4 py-3 bg-[#08101a] border-t border-[#1a2536] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[18px]">tips_and_updates</span>
            <span className="text-xs text-[#d8e3fb]">
              <strong>Form Cue: </strong>
              {modelData.formAndSafety[0] || 'Maintain controlled tempo and strict form throughout the set.'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsScienceExpanded(p => !p)}
            className="text-[11px] text-[#86948a] hover:text-[#4edea3] font-semibold transition-colors shrink-0"
          >
            {isScienceExpanded ? 'Hide Science' : '🔬 Science'}
          </button>
        </div>
      )}
    </div>
  );
};
