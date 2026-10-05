import React from 'react';
import { useFitMate } from '../context/FitMateContext';

export const WorkoutActiveModal: React.FC = () => {
  const {
    isWorkoutMode,
    activeWorkoutDay,
    activeExerciseIndex,
    activeSetIndex,
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
  } = useFitMate();

  if (!isWorkoutMode && !isWorkoutCompleteModalOpen) return null;

  // Format rest timer seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = activeWorkoutDay?.exercises[activeExerciseIndex];

  return (
    <>
      {/* 1. Active Workout Player Modal */}
      {isWorkoutMode && currentExercise && (
        <div className="fixed inset-0 bg-[#081425]/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#152031] rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative border border-[#1f2a3c] my-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-headline text-xs font-semibold bg-[#10b981] text-[#00422b] px-3 py-1 rounded-full">
                  Exercise {activeExerciseIndex + 1} of {activeWorkoutDay.exercises.length}
                </span>
                <span className="text-xs text-[#86948a] font-medium">
                  {activeWorkoutDay.splitName} Day • {currentExercise.targetMuscle}
                </span>
              </div>
              <button
                onClick={closeWorkoutMode}
                className="p-1.5 text-[#86948a] hover:text-[#d8e3fb] rounded-lg hover:bg-[#1f2a3c] transition-colors"
                title="Cancel Workout"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Exercise Overview */}
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#4edea3] font-semibold">
                    {currentExercise.equipment}
                  </span>
                  <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] mt-0.5">
                    {currentExercise.name}
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#1f2a3c] text-[#4edea3]">
                  {currentExercise.difficulty}
                </span>
              </div>
              <p className="text-sm text-[#bbcabf] leading-relaxed">
                {currentExercise.instructions}
              </p>
            </div>

            {/* Visual Photo preview with scrim fallback */}
            <div className="h-44 sm:h-52 w-full rounded-xl overflow-hidden relative border border-[#1f2a3c] bg-[#111c2d]">
              <img
                src={currentExercise.imageUrl}
                alt={currentExercise.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#152031] via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#d8e3fb]/90 font-medium">
                <span>Target: {currentExercise.reps} Reps</span>
                <span>Rest: {currentExercise.restSeconds}s</span>
              </div>
            </div>

            {/* Set Counter & Rest Timer Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Set Counter */}
              <div className="bg-[#111c2d] p-4 rounded-xl flex flex-col items-center justify-center gap-1 border border-[#1f2a3c]">
                <span className="text-[11px] font-semibold text-[#86948a] uppercase tracking-wider">
                  Current Set
                </span>
                <span className="font-headline text-3xl sm:text-4xl font-bold text-[#4edea3] tabular-nums">
                  {activeSetIndex} <span className="text-xl text-[#86948a]">/ {currentExercise.sets}</span>
                </span>
                <span className="text-xs text-[#bbcabf]">
                  Target: {currentExercise.reps} reps
                </span>
              </div>

              {/* Rest Timer */}
              <div className="bg-[#111c2d] p-4 rounded-xl flex flex-col items-center justify-center gap-1 border border-[#1f2a3c]">
                <div className="flex items-center justify-between w-full px-2">
                  <span className="text-[11px] font-semibold text-[#86948a] uppercase tracking-wider">
                    Rest Timer
                  </span>
                  <button
                    onClick={resetRestTimer}
                    className="text-[10px] text-[#86948a] hover:text-[#4edea3] underline"
                  >
                    Reset
                  </button>
                </div>
                <span className={`font-headline text-3xl sm:text-4xl font-bold tabular-nums ${isTimerRunning ? 'text-[#9ddf2e]' : 'text-[#86948a]'}`}>
                  {formatTimer(restTimerSeconds)}
                </span>
                <button
                  onClick={toggleRestTimer}
                  className="mt-1 text-xs font-semibold px-3 py-1 rounded bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] transition-colors"
                >
                  {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                </button>
              </div>
            </div>

            {/* Form tips accordion snippet */}
            {currentExercise.formTips && currentExercise.formTips.length > 0 && (
              <div className="bg-[#111c2d]/70 p-3.5 rounded-xl border border-[#1f2a3c]/60 text-xs">
                <span className="font-semibold text-[#4edea3] flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
                  Pro Form Tip
                </span>
                <p className="text-[#bbcabf] italic">
                  "{currentExercise.formTips[0]}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={prevExercise}
                disabled={activeExerciseIndex === 0}
                className="bg-[#111c2d] text-[#d8e3fb] hover:bg-[#1f2a3c] disabled:opacity-40 disabled:hover:bg-[#111c2d] font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all flex items-center gap-1.5 border border-[#1f2a3c]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="hidden sm:inline">Prev Exercise</span>
              </button>

              <button
                onClick={completeSet}
                className="flex-1 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-sm py-3 px-4 rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4edea3]/20"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Complete Set {activeSetIndex} &amp; Rest
              </button>

              <button
                onClick={nextExercise}
                className="bg-[#111c2d] text-[#d8e3fb] hover:bg-[#1f2a3c] font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all flex items-center gap-1.5 border border-[#1f2a3c]"
                title="Skip to next exercise"
              >
                <span className="hidden sm:inline">Skip</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={finishWorkoutEarly}
                className="text-xs text-[#86948a] hover:text-[#ffb4ab] transition-colors"
              >
                Finish Workout Early &amp; Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Workout Complete Celebration Modal */}
      {isWorkoutCompleteModalOpen && workoutSummary && (
        <div className="fixed inset-0 bg-[#081425]/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#152031] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6 border border-[#4edea3]/40 my-auto animate-in fade-in zoom-in-95">
            {/* Trophy Icon */}
            <div className="w-20 h-20 bg-[#10b981]/20 text-[#4edea3] rounded-full flex items-center justify-center shadow-lg border border-[#4edea3]/30">
              <span className="material-symbols-outlined text-[44px]">emoji_events</span>
            </div>

            {/* Title & encouragement */}
            <div>
              <span className="text-xs uppercase tracking-widest text-[#4edea3] font-bold">
                Session Finished
              </span>
              <h2 className="font-headline text-3xl font-bold text-[#d8e3fb] mt-1">
                Workout Complete! 🎉
              </h2>
              <p className="text-sm text-[#bbcabf] mt-2 max-w-sm">
                Outstanding effort! You've successfully finished your {activeWorkoutDay?.splitName || 'training'} session and preserved your consistency streak.
              </p>
            </div>

            {/* Metrics stats row */}
            <div className="grid grid-cols-3 gap-3 w-full bg-[#111c2d] p-4 rounded-xl border border-[#1f2a3c]">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#86948a] font-semibold uppercase">Duration</span>
                <span className="font-headline text-xl sm:text-2xl font-bold text-[#d8e3fb]">
                  {workoutSummary.duration}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#86948a] font-semibold uppercase">Exercises</span>
                <span className="font-headline text-xl sm:text-2xl font-bold text-[#4edea3]">
                  {workoutSummary.exercisesCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#86948a] font-semibold uppercase">Total Sets</span>
                <span className="font-headline text-xl sm:text-2xl font-bold text-[#9ddf2e]">
                  {workoutSummary.setsCount}
                </span>
              </div>
            </div>

            {/* Streak card */}
            <div className="w-full bg-[#111c2d]/70 px-4 py-3 rounded-xl flex items-center justify-between border border-[#1f2a3c]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ffb3af] text-[24px]">local_fire_department</span>
                <div className="text-left">
                  <div className="text-xs font-semibold text-[#d8e3fb]">Workout Streak</div>
                  <div className="text-[11px] text-[#86948a]">Updated and saved to profile</div>
                </div>
              </div>
              <span className="font-headline text-lg font-bold text-[#ffb3af]">
                {userProfile.streakDays} Days 🔥
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={closeCompleteModal}
              className="w-full bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-sm py-3.5 px-6 rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-transform shadow-lg shadow-[#4edea3]/20"
            >
              Finish &amp; Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};
