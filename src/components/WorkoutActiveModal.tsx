import React, { useState, useMemo, useEffect } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { ExerciseAnimation } from './ExerciseAnimation';
import { ExerciseSubstitutionModal } from './ExerciseSubstitutionModal';

export const WorkoutActiveModal: React.FC = () => {
  const {
    isWorkoutMode,
    activeWorkoutDay,
    activeExerciseIndex,
    activeSetIndex,
    activeSetsLog,
    updateSetWeight,
    updateSetReps,
    totalWorkoutVolumeKg,
    previousBestForExercise,
    closeWorkoutMode,
    completeSet,
    nextExercise,
    prevExercise,
    toggleRestTimer,
    resetRestTimer,
    restTimerSeconds,
    isTimerRunning,
    finishWorkoutEarly,
    isWorkoutCompleteModalOpen,
    workoutSummary,
    closeCompleteModal,
    userProfile,
    navigateTo,
  } = useFitMate();

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [restInitialSeconds, setRestInitialSeconds] = useState(60);

  // Motivational message pool for varied completion experience
  const motivationalMessage = useMemo(() => {
    if (!workoutSummary) return '';
    const messages = [
      `Congratulations! You burned approximately ${workoutSummary.caloriesBurned} calories today. You're getting closer to your ${userProfile.goal} goal. Keep going!`,
      `Outstanding discipline! With ${workoutSummary.totalVolumeKg.toLocaleString()}kg total volume moved, your progressive overload is building lean tissue. Recovery is your superpower!`,
      `Phenomenal workout! That's another high-intensity session in the books. Your ${userProfile.streakDays}-day consistency streak puts you in the top 5% of athletes!`,
      `Incredible biomechanical execution! You pushed through ${workoutSummary.setsCount} sets with strict form. Hydrate and refuel with your post-workout meal!`,
      `Great job! Approximately ${workoutSummary.caloriesBurned} kcal burned today with high metabolic demand. Consistency is where real transformation happens!`,
    ];
    // Use completed workouts count as seed for deterministic yet varying message
    const index = (userProfile.completedWorkoutsCount || 0) % messages.length;
    return messages[index];
  }, [workoutSummary, userProfile.completedWorkoutsCount, userProfile.goal, userProfile.streakDays]);

  // Calculate Overall Workout Progress (Hooks must be unconditional!)
  const totalWorkoutSets = useMemo(() => {
    if (!activeWorkoutDay) return 1;
    return activeWorkoutDay.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  }, [activeWorkoutDay]);

  const completedSetsCount = useMemo(() => {
    if (!activeWorkoutDay) return 0;
    let count = 0;
    // Count sets in prior exercises
    for (let i = 0; i < activeExerciseIndex; i++) {
      count += activeWorkoutDay.exercises[i].sets;
    }
    // Count completed sets in current exercise
    count += activeSetsLog.filter(s => s.completed).length;
    return count;
  }, [activeWorkoutDay, activeExerciseIndex, activeSetsLog]);

  // Early return ONLY after all hooks are called
  if (!isWorkoutMode && !isWorkoutCompleteModalOpen) return null;

  const currentExercise = activeWorkoutDay?.exercises[activeExerciseIndex];
  const currentSetLog = activeSetsLog.find(s => s.setNumber === activeSetIndex);

  // Format rest timer seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const overallProgressPercent = Math.min(100, Math.round((completedSetsCount / totalWorkoutSets) * 100));
  const remainingSetsInExercise = currentExercise ? Math.max(0, currentExercise.sets - activeSetIndex + 1) : 0;

  // Track initial rest duration for visual ring calculation
  const restProgressPercent = restInitialSeconds > 0
    ? Math.max(0, Math.min(100, Math.round(((restInitialSeconds - restTimerSeconds) / restInitialSeconds) * 100)))
    : 0;

  return (
    <>
      {/* ================================================================ */}
      {/* 1. ACTIVE GUIDED WORKOUT PLAYER MODAL */}
      {/* ================================================================ */}
      {isWorkoutMode && currentExercise && (
        <div className="fixed inset-0 bg-[#060c16]/95 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-[#111927] rounded-3xl w-full max-w-4xl p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col gap-4 relative border border-[#1f2a3c] my-auto">
            
            {/* OVERALL WORKOUT PROGRESS BAR & TOP BAR */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline text-xs font-bold bg-[#4edea3] text-[#003824] px-3 py-1 rounded-full shadow-sm">
                    Exercise {activeExerciseIndex + 1} of {activeWorkoutDay.exercises.length}
                  </span>
                  <span className="text-xs text-[#86948a] font-medium">
                    FITORA • {activeWorkoutDay.splitName} Day • {activeWorkoutDay.focus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSubModalOpen(true)}
                    className="px-2.5 py-1 text-xs text-[#4edea3] hover:text-white bg-[#0a121e] hover:bg-[#1f2a3c] rounded-xl border border-[#1f2a3c] transition-colors flex items-center gap-1.5"
                    title="Substitute Exercise"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    <span className="hidden sm:inline">Swap Exercise</span>
                  </button>
                  <button
                    onClick={closeWorkoutMode}
                    className="p-1.5 text-[#86948a] hover:text-[#ffb4ab] rounded-xl hover:bg-[#1f2a3c] transition-colors"
                    title="Close Workout"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar with Percentage and Metrics */}
              <div className="flex items-center justify-between text-[11px] text-[#86948a] mt-1">
                <span>Overall Workout Progress: <strong className="text-[#4edea3]">{overallProgressPercent}%</strong></span>
                <span>{completedSetsCount} of {totalWorkoutSets} Sets Completed</span>
              </div>
              <div className="w-full h-2 bg-[#09101a] rounded-full overflow-hidden border border-[#1f2a3c]/60">
                <div
                  className="h-full bg-gradient-to-r from-[#4edea3] to-[#9ddf2e] transition-all duration-300 rounded-full"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>

            {/* EXERCISE TITLE & DETAILS */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#4edea3] font-bold">
                    {currentExercise.equipment}
                  </span>
                  <span className="text-[#86948a]">•</span>
                  <span className="text-xs text-[#bbcabf] font-semibold">
                    Target: {currentExercise.targetMuscle}
                  </span>
                </div>
                <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#d8e3fb] mt-0.5">
                  {currentExercise.name}
                </h1>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#152336] text-[#4edea3] border border-[#1f2a3c]">
                  {currentExercise.difficulty}
                </span>
                <span className="text-[10px] text-[#86948a]">
                  ~{currentExercise.calorieEstimate || 40} kcal est.
                </span>
              </div>
            </div>

            {/* REST TIMER COUNTDOWN HERO (SHOWS WHEN TIMER IS RUNNING POST-SET) */}
            {isTimerRunning && (
              <div className="bg-gradient-to-r from-[#10231c] via-[#0e1d2c] to-[#10231c] p-4 sm:p-5 rounded-2xl border-2 border-[#4edea3] shadow-[0_0_25px_rgba(78,222,163,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#003824] border-2 border-[#4edea3] shadow-inner text-[#4edea3]">
                    <span className="material-symbols-outlined text-[28px] animate-pulse">timer</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#4edea3] font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-ping" />
                      REST INTERVAL IN PROGRESS
                    </span>
                    <div className="font-headline text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums mt-0.5">
                      {formatTimer(restTimerSeconds)}
                    </div>
                    <div className="text-xs text-[#bbcabf] mt-0.5">
                      Up Next: <strong className="text-[#4edea3]">Set {activeSetIndex} of {currentExercise.sets}</strong> • {currentExercise.reps} reps
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={toggleRestTimer}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-[#152336] hover:bg-[#1f314a] text-[#d8e3fb] text-xs font-bold border border-[#1f2a3c] transition-colors"
                  >
                    Pause Rest
                  </button>
                  <button
                    onClick={() => {
                      resetRestTimer();
                      toggleRestTimer(); // skip immediately
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-xs font-extrabold transition-all hover:scale-[1.02] shadow-md shadow-[#4edea3]/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Skip Rest &amp; Start Set</span>
                    <span className="material-symbols-outlined text-[16px]">fast_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3D BIOMECHANICAL ANATOMICAL EXERCISE ANIMATION */}
            <ExerciseAnimation
              type={currentExercise.animationType || 'row'}
              exerciseName={currentExercise.name}
              targetMuscle={currentExercise.targetMuscle}
              primaryMuscles={currentExercise.primaryMuscles}
              secondaryMuscles={currentExercise.secondaryMuscles}
              muscleHighlightInfo={currentExercise.muscleHighlightInfo}
              equipment={currentExercise.equipment}
              instructions={currentExercise.instructions}
              formTips={currentExercise.formTips}
              calorieEstimate={currentExercise.calorieEstimate}
              photoUrl={currentExercise.imageUrl}
              activeSet={activeSetIndex}
              totalSets={currentExercise.sets}
              repsTarget={currentExercise.reps}
              mode="workout"
            />

            {/* SET-BY-SET PROGRESSIVE OVERLOAD LOGGER GRID */}
            <div className="bg-[#0c1421] p-4 rounded-2xl border border-[#1f2a3c]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#86948a]">
                    Set Tracker
                  </span>
                  <span className="text-xs text-[#4edea3] font-semibold">
                    • Set {activeSetIndex} of {currentExercise.sets} active ({remainingSetsInExercise} sets remaining)
                  </span>
                </div>
                <div className="text-xs text-[#86948a]">
                  Target: <strong className="text-[#d8e3fb]">{currentExercise.reps} reps</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {activeSetsLog.map(set => {
                  const isCurrent = set.setNumber === activeSetIndex;
                  return (
                    <div
                      key={set.setNumber}
                      className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                        set.completed
                          ? 'bg-[#10b981]/15 border-[#10b981]/50 text-[#4edea3]'
                          : isCurrent
                          ? 'bg-[#152336] border-[#4edea3] shadow-md shadow-[#4edea3]/20 ring-1 ring-[#4edea3]/50'
                          : 'bg-[#152336]/40 border-[#1f2a3c] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <span>Set {set.setNumber}</span>
                          {isCurrent && !set.completed && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-ping" />
                          )}
                        </span>
                        {set.completed ? (
                          <span className="material-symbols-outlined text-[16px] text-[#4edea3]">
                            check_circle
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[10px] text-[#4edea3] uppercase font-bold">Active</span>
                        ) : (
                          <span className="text-[10px] text-[#86948a]">Upcoming</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <label className="text-[10px] text-[#86948a] font-semibold">kg</label>
                        <input
                          type="number"
                          step="0.5"
                          value={set.weightKg}
                          onChange={e => updateSetWeight(set.setNumber, Number(e.target.value))}
                          className="w-16 bg-[#081425] border border-[#3c4a42] rounded-lg px-1.5 py-1 text-xs text-[#d8e3fb] font-bold text-center focus:outline-none focus:border-[#4edea3]"
                        />
                        <label className="text-[10px] text-[#86948a] font-semibold">reps</label>
                        <input
                          type="number"
                          value={set.actualReps}
                          onChange={e => updateSetReps(set.setNumber, Number(e.target.value))}
                          className="w-14 bg-[#081425] border border-[#3c4a42] rounded-lg px-1.5 py-1 text-xs text-[#d8e3fb] font-bold text-center focus:outline-none focus:border-[#4edea3]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REST TIMER STATUS STRIP (ALWAYS VISIBLE) */}
            <div className="bg-[#0c1421] p-3.5 rounded-2xl flex items-center justify-between border border-[#1f2a3c]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isTimerRunning ? 'bg-[#4edea3]/20 text-[#4edea3]' : 'bg-[#152336] text-[#86948a]'
                }`}>
                  <span className="material-symbols-outlined text-[22px]">timer</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#86948a] font-bold uppercase tracking-wider">
                    {isTimerRunning ? 'Rest Countdown Active' : 'Rest Timer'}
                  </div>
                  <div className={`font-headline text-2xl font-extrabold tabular-nums ${
                    isTimerRunning ? 'text-[#4edea3]' : 'text-[#86948a]'
                  }`}>
                    {formatTimer(restTimerSeconds)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetRestTimer}
                  className="px-3 py-1.5 text-xs text-[#86948a] hover:text-[#d8e3fb] rounded-lg hover:bg-[#152336] transition-colors"
                >
                  Reset ({currentExercise.restSeconds}s)
                </button>
                <button
                  onClick={toggleRestTimer}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    isTimerRunning
                      ? 'bg-[#152336] hover:bg-[#1f314a] text-[#ffb4ab]'
                      : 'bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] shadow-sm shadow-[#4edea3]/20'
                  }`}
                >
                  {isTimerRunning ? 'Pause' : 'Start Rest'}
                </button>
              </div>
            </div>

            {/* ACTION CONTROLS: PREVIOUS, COMPLETE SET, SKIP / NEXT */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={prevExercise}
                disabled={activeExerciseIndex === 0}
                className="bg-[#0c1421] text-[#d8e3fb] hover:bg-[#152336] disabled:opacity-30 font-semibold text-xs sm:text-sm px-4 py-3.5 rounded-2xl transition-all flex items-center gap-1.5 border border-[#1f2a3c]"
                title="Previous Exercise"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* PRIMARY CTA: COMPLETE SET */}
              <button
                onClick={completeSet}
                className="flex-1 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-[#4edea3]/25"
              >
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
                <span>
                  Complete Set {activeSetIndex} of {currentExercise.sets} ({currentSetLog?.weightKg || 0}kg × {currentSetLog?.actualReps || 10} reps)
                </span>
              </button>

              <button
                onClick={nextExercise}
                className="bg-[#0c1421] text-[#d8e3fb] hover:bg-[#152336] font-semibold text-xs sm:text-sm px-4 py-3.5 rounded-2xl transition-all flex items-center gap-1.5 border border-[#1f2a3c]"
                title="Skip to next exercise"
              >
                <span className="hidden sm:inline">Skip</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={finishWorkoutEarly}
                className="text-xs text-[#86948a] hover:text-[#ffb4ab] transition-colors underline"
              >
                Finish Workout Early &amp; Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Substitution Modal */}
      {currentExercise && (
        <ExerciseSubstitutionModal
          exercise={currentExercise}
          dayId={activeWorkoutDay.id}
          exerciseIndex={activeExerciseIndex}
          isOpen={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
        />
      )}

      {/* ================================================================ */}
      {/* 2. WORKOUT COMPLETE PROFESSIONAL CELEBRATION EXPERIENCE */}
      {/* ================================================================ */}
      {isWorkoutCompleteModalOpen && workoutSummary && (
        <div className="fixed inset-0 bg-[#060c16]/95 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#111927] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6 border-2 border-[#4edea3]/40 my-auto animate-in fade-in zoom-in-95 relative overflow-hidden">
            {/* Top celebratory accent bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#4edea3] via-[#9ddf2e] to-[#ff3b5c]" />

            {/* Glowing Trophy Badge */}
            <div className="w-20 h-20 bg-[#10b981]/20 text-[#4edea3] rounded-full flex items-center justify-center shadow-lg border-2 border-[#4edea3]/40 relative">
              <span className="material-symbols-outlined text-[46px] animate-bounce">emoji_events</span>
            </div>

            {/* Header Titles */}
            <div>
              <span className="text-xs uppercase tracking-widest text-[#4edea3] font-extrabold">
                FITORA Session Completed
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-[#d8e3fb] mt-1">
                FITORA Workout Complete! 🎉
              </h2>
              <div className="text-sm font-semibold text-[#9ddf2e] mt-1">
                Excellent work, {userProfile.name}!
              </div>
            </div>

            {/* DYNAMIC MOTIVATIONAL MESSAGE VARIATION (REQUIREMENT 6) */}
            <div className="bg-[#0b1420] p-4 rounded-2xl border border-[#4edea3]/30 text-xs sm:text-sm text-[#d8e3fb] leading-relaxed shadow-inner">
              <span className="material-symbols-outlined text-[#4edea3] text-[18px] inline-block align-middle mr-1.5">
                auto_awesome
              </span>
              <span>"{motivationalMessage}"</span>
            </div>

            {/* 4-METRIC STAT BENTO GRID (WITH ESTIMATED CALORIES CLEARLY LABELED) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full bg-[#0c1421] p-4 rounded-2xl border border-[#1f2a3c]">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#86948a] font-bold uppercase">Duration</span>
                <span className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb]">
                  {workoutSummary.duration}
                </span>
                <span className="text-[9px] text-[#86948a]">Active time</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#86948a] font-bold uppercase">Volume</span>
                <span className="font-headline text-lg sm:text-xl font-bold text-[#4edea3] tabular-nums">
                  {workoutSummary.totalVolumeKg.toLocaleString()}kg
                </span>
                <span className="text-[9px] text-[#86948a]">Total weight</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#86948a] font-bold uppercase">Sets</span>
                <span className="font-headline text-lg sm:text-xl font-bold text-[#9ddf2e]">
                  {workoutSummary.setsCount}
                </span>
                <span className="text-[9px] text-[#86948a]">{workoutSummary.exercisesCount} exercises</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#86948a] font-bold uppercase">Burned (est.)</span>
                <span className="font-headline text-lg sm:text-xl font-bold text-[#ff897d] tabular-nums">
                  ~{workoutSummary.caloriesBurned}
                </span>
                <span className="text-[9px] text-[#86948a]">kcal estimate*</span>
              </div>
            </div>

            {/* Streak & Weekly Progress Card */}
            <div className="w-full bg-[#0c1421] px-4 py-3 rounded-2xl flex items-center justify-between border border-[#1f2a3c]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ff897d]/15 text-[#ff897d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#d8e3fb]">Active Workout Streak</div>
                  <div className="text-[11px] text-[#86948a]">Weekly Goal: {userProfile.workoutDaysPerWeek} sessions scheduled</div>
                </div>
              </div>
              <span className="font-headline text-xl font-extrabold text-[#ff897d]">
                {userProfile.streakDays} Days 🔥
              </span>
            </div>

            {/* Calorie Tracking Clarity Label */}
            <div className="text-[10px] text-[#86948a] italic">
              *Calorie values are physiological estimates calibrated to your bodyweight ({userProfile.weightKg}kg) and workout duration.
            </div>

            {/* Navigation CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              <button
                onClick={() => {
                  closeCompleteModal();
                  navigateTo('progress');
                }}
                className="flex-1 bg-[#152336] hover:bg-[#1f314a] text-[#4edea3] font-bold text-xs sm:text-sm py-3 px-4 rounded-xl border border-[#4edea3]/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">monitoring</span>
                <span>View in Progress</span>
              </button>
              <button
                onClick={() => {
                  closeCompleteModal();
                  navigateTo('dashboard');
                }}
                className="flex-1 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-transform shadow-lg shadow-[#4edea3]/20 flex items-center justify-center gap-1.5"
              >
                <span>Return to Dashboard</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
