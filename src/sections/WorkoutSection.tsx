import React, { useMemo, useState } from 'react';
import { describeSets, localDate, todayDayId } from '../lib/progression';
import { useFitMate } from '../context/FitMateContext';
import { Exercise } from '../types';
import { ExerciseSubstitutionModal } from '../components/ExerciseSubstitutionModal';
import { ExerciseAnimation } from '../components/ExerciseAnimation';
import { PlanBuilderModal } from '../components/PlanBuilderModal';
import { exerciseImageUrl } from '../data/exerciseDb';

export const WorkoutSection: React.FC = () => {
  const {
    workoutSchedule,
    selectedScheduleDayId,
    setSelectedScheduleDayId,
    startWorkout,
    userProfile,
    navigateTo,
    missedDays,
    skipMissedDay,
    suggestionFor,
    sessions,
    t,
  } = useFitMate();

  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null);
  const [substitutingExercise, setSubstitutingExercise] = useState<{ exercise: Exercise; index: number } | null>(null);
  const [isPlanBuilderOpen, setIsPlanBuilderOpen] = useState(false);

  const activeDay =
    workoutSchedule.find(d => d.id === selectedScheduleDayId) || workoutSchedule[0];

  const todayId = todayDayId();
  // Days of the current week (Mon–Sun) that already have a logged workout
  const doneThisWeek = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const start = localDate(monday);
    return new Set(sessions.filter(s => s.date >= start).map(s => s.dayId));
  }, [sessions]);

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Plan Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#152031] rounded-2xl p-6 sm:p-8 shadow-xl gap-6 border border-[#1f2a3c]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#4edea3] font-bold">
              FITORA Training System
            </span>
            <span className="text-[10px] bg-[#4edea3]/15 text-[#4edea3] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#4edea3]/30">
              Personalized
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb]">
            {t('w_weeklyPlan', "Your Weekly Plan")}
          </h1>
          <p className="text-xs sm:text-sm text-[#bbcabf] max-w-xl leading-relaxed">
            {t('w_planDesc', "Your weekly plan. Log every set and FITORA remembers your numbers and tells you what to lift next time.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col bg-[#111c2d] px-4 py-2 rounded-xl border border-[#1f2a3c]">
            <span className="text-[10px] text-[#86948a] uppercase font-semibold">Goal</span>
            <span className="text-xs font-bold text-[#4edea3]">{userProfile.goal}</span>
          </div>

          <div className="flex flex-col bg-[#111c2d] px-4 py-2 rounded-xl border border-[#1f2a3c]">
            <span className="text-[10px] text-[#86948a] uppercase font-semibold">Experience</span>
            <span className="text-xs font-bold text-[#d8e3fb]">{userProfile.experience}</span>
          </div>

          <div className="flex flex-col bg-[#111c2d] px-4 py-2 rounded-xl border border-[#1f2a3c]">
            <span className="text-[10px] text-[#86948a] uppercase font-semibold">Frequency</span>
            <span className="text-xs font-bold text-[#98da27]">{userProfile.workoutDaysPerWeek} Days / Wk</span>
          </div>

          <button
            onClick={() => setIsPlanBuilderOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
            {t('w_buildPlan', "Build my plan")}
          </button>
        </div>
      </div>
      {isPlanBuilderOpen && <PlanBuilderModal onClose={() => setIsPlanBuilderOpen(false)} />}

      {/* Missed a training day? Do it today or skip it */}
      {missedDays.length > 0 && (
        <div className="bg-[#2a1f12] border border-[#ffb95f]/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#ffb95f] text-[24px] shrink-0">event_busy</span>
            <div>
              <h3 className="font-headline text-base font-bold text-[#ffddb8]">
                {missedDays.length === 1 ? t('w_missedTitle', 'You missed a workout this week') : t('w_missedMany', 'You missed {n} workouts this week').replace('{n}', String(missedDays.length))}
              </h3>
              <p className="text-xs text-[#d8c3ad] mt-0.5">
                {t('w_missedDesc', "Life happens. Do it today instead, or skip it so your week moves on. No guilt either way.")}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {missedDays.slice(0, 3).map(({ day, date }) => (
              <div key={`${date}-${day.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1b150d] rounded-xl px-3.5 py-2.5 border border-[#ffb95f]/20">
                <div className="text-sm text-[#ffddb8]">
                  <strong>{day.dayName}:</strong> {day.splitName} <span className="text-[#d8c3ad] text-xs">({day.focus})</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startWorkout(day.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#ffb95f] text-[#2a1700] text-xs font-bold hover:brightness-110"
                  >
                    {t('w_doToday', "Do it today")}
                  </button>
                  <button
                    onClick={() => startWorkout(day.id, { quick: true })}
                    className="px-3 py-1.5 rounded-lg bg-[#1f2a3c] text-[#ffddb8] text-xs font-semibold hover:bg-[#2b3a52]"
                  >
                    {t('w_quick30', "Quick 30 min")}
                  </button>
                  <button
                    onClick={() => skipMissedDay(date, day.id)}
                    className="px-3 py-1.5 rounded-lg text-[#d8c3ad] text-xs font-semibold hover:text-white"
                  >
                    {t('w_skip', "Skip")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Schedule Day Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold text-[#d8e3fb]">Weekly Schedule</h2>
          <span className="text-xs text-[#86948a]">Select a day to view programmed exercises</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {workoutSchedule.map(day => {
            const isSelected = day.id === activeDay.id;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedScheduleDayId(day.id)}
                className={`flex flex-col p-4 rounded-xl transition-all text-left shadow-sm cursor-pointer hover:scale-[1.02] border ${
                  isSelected
                    ? 'bg-[#4edea3] text-[#003824] border-[#4edea3] shadow-md shadow-[#4edea3]/20 font-semibold'
                    : 'bg-[#152031] text-[#d8e3fb] hover:bg-[#1f2a3c] border-[#1f2a3c]'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-wider flex items-center justify-between gap-1 ${isSelected ? 'opacity-90' : 'text-[#86948a]'}`}>
                  <span>
                    {day.dayName}
                    {day.id === todayId && <span className={`ml-1 font-extrabold ${isSelected ? '' : 'text-[#4edea3]'}`}>· {t('w_today', "Today")}</span>}
                  </span>
                  {doneThisWeek.has(day.id) && (
                    <span className="material-symbols-outlined text-[16px]" title="Done this week">check_circle</span>
                  )}
                </span>
                <span className="font-headline text-base font-bold mt-1">
                  {day.splitName}
                </span>
                <span className={`text-[11px] mt-2 line-clamp-1 ${isSelected ? 'text-[#00422b]' : 'text-[#bbcabf]'}`}>
                  {day.focus}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise List Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#d8e3fb]">
              {activeDay.dayName}: {activeDay.splitName} Workout Plan
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] px-2.5 py-0.5 rounded-full text-xs font-bold">
              {activeDay.exercises.length} Exercises
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateTo('exercise-library')}
              className="bg-[#111c2d] hover:bg-[#1f2a3c] text-[#4edea3] hover:text-white border border-[#4edea3]/30 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
              title="Browse FITORA Exercise Library"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Browse Library</span>
            </button>

            {!activeDay.isRest && activeDay.exercises.length > 3 && (
              <button
                onClick={() => startWorkout(activeDay.id, { quick: true })}
                className="bg-[#111c2d] hover:bg-[#1f2a3c] text-[#9ddf2e] border border-[#9ddf2e]/30 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0"
                title="Short on time: the 3 main exercises, one set fewer each"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>{t('w_quick30', "Quick 30 min")}</span>
              </button>
            )}
            {!activeDay.isRest && activeDay.exercises.length > 0 && (
              <button
                onClick={() => startWorkout(activeDay.id)}
                className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md shadow-[#4edea3]/20 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>Start Full Workout</span>
              </button>
            )}
          </div>
        </div>

        {activeDay.isRest || activeDay.exercises.length === 0 ? (
          <div className="bg-[#152031] rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 border border-[#1f2a3c]">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">bedtime</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">Scheduled Rest &amp; Mobility</h3>
            <p className="text-xs sm:text-sm text-[#bbcabf] max-w-md">
              Rest days allow muscle glycogen stores to recharge and micro-trauma in tendons to adapt. Sleep 8+ hours, drink water, and keep light activity like walking.
            </p>
            <button
              onClick={() => navigateTo('exercise-library')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#4edea3]/20"
            >
              <span className="material-symbols-outlined text-[18px]">self_improvement</span>
              <span>Find Mobility &amp; Recovery Exercises</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDay.exercises.map((exercise, idx) => (
              <div
                key={exercise.id}
                className="flex flex-col bg-[#152031] rounded-2xl overflow-hidden shadow-xl border border-[#1f2a3c] group hover:bg-[#1f2a3c] transition-colors"
              >
                {/* Exercise Visual Photo */}
                <div className="h-48 w-full relative overflow-hidden bg-[#111c2d]">
                  <img
                    src={exercise.images?.[0] ? exerciseImageUrl(exercise.images[0]) : exercise.imageUrl}
                    alt={`${exercise.name}: start position`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {exercise.images?.[1] && (
                    // Hovering shows the end position, so the card previews the movement
                    <img
                      src={exerciseImageUrl(exercise.images[1])}
                      alt={`${exercise.name}: end position`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#152031] via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-[#081425]/85 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#4edea3] border border-[#3c4a42]/50">
                    {exercise.difficulty}
                  </div>
                  <div className="absolute bottom-2 left-4 text-[11px] font-semibold text-[#86948a] uppercase tracking-wider">
                    {exercise.targetMuscle}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline text-lg font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors">
                      {exercise.name}
                    </h3>
                    <p className="text-xs text-[#bbcabf] line-clamp-2 leading-relaxed">
                      {exercise.instructions}
                    </p>
                  </div>

                  {/* Sets / Reps / Rest box */}
                  <div className="grid grid-cols-3 gap-2 bg-[#111c2d] p-3 rounded-xl text-center border border-[#1f2a3c]">
                    <div>
                      <span className="block text-[10px] font-semibold text-[#86948a] uppercase">SETS</span>
                      <span className="font-headline text-base font-bold text-[#d8e3fb] tabular-nums">
                        {exercise.sets}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-[#86948a] uppercase">REPS</span>
                      <span className="font-headline text-base font-bold text-[#d8e3fb] tabular-nums">
                        {exercise.reps}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-[#86948a] uppercase">REST</span>
                      <span className="font-headline text-base font-bold text-[#d8e3fb] tabular-nums">
                        {exercise.restSeconds}s
                      </span>
                    </div>
                  </div>

                  {/* Smart logger: last time → next target */}
                  {(() => {
                    const s = suggestionFor(exercise);
                    if (!s.last) {
                      return <div className="text-[11px] text-[#86948a] -mt-1">{t('w_notLogged', "Not logged yet. Your first session sets the baseline.")}</div>;
                    }
                    return (
                      <div className="-mt-1 text-[11px] leading-relaxed">
                        <span className="text-[#86948a]">{t('w_last', "Last")}: </span>
                        <span className="text-[#bbcabf] font-semibold">{describeSets(s.last.sets)}</span>
                        <span className="text-[#86948a]"> → {t('w_next', "Next")}: </span>
                        <span className={`font-bold ${s.kind === 'increase' ? 'text-[#4edea3]' : s.kind === 'deload' ? 'text-[#ffb4ab]' : 'text-[#d8e3fb]'}`}>
                          {s.weightKg > 0 ? `${s.weightKg} kg × ${s.reps}` : `${s.reps} reps`}
                          {s.kind === 'increase' ? ' ↑' : ''}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectingExercise(exercise)}
                      className="flex-1 bg-[#111c2d] hover:bg-[#1f2a3c] text-[#d8e3fb] text-xs font-semibold py-2.5 rounded-xl transition-all border border-[#1f2a3c]"
                    >
                      Instructions &amp; Tips
                    </button>
                    <button
                      onClick={() => setSubstitutingExercise({ exercise, index: idx })}
                      className="bg-[#111c2d] hover:bg-[#1f2a3c] text-[#bbcabf] hover:text-[#4edea3] p-2.5 rounded-xl text-xs transition-all border border-[#1f2a3c]"
                      title="Swap this exercise in your plan"
                    >
                      <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    </button>
                    <button
                      onClick={() => startWorkout(activeDay.id)}
                      className="bg-[#10b981]/20 hover:bg-[#4edea3] hover:text-[#003824] text-[#4edea3] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                      title="Start Workout"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercise detail modal with photo demo */}
      {inspectingExercise && (
        <div className="fixed inset-0 bg-[#081425]/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#111927] rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl relative border border-[#1f2a3c] my-auto flex flex-col gap-4">
            <button
              onClick={() => setInspectingExercise(null)}
              className="absolute top-5 right-5 p-1.5 text-[#86948a] hover:text-[#d8e3fb] rounded-xl hover:bg-[#1f2a3c] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs uppercase font-bold text-[#4edea3]">
                {inspectingExercise.targetMuscle}
              </span>
              <span className="text-xs text-[#86948a]">• {inspectingExercise.difficulty}</span>
              <span className="text-xs text-[#86948a]">• {inspectingExercise.sets} Sets × {inspectingExercise.reps}</span>
            </div>

            <h3 className="font-headline text-2xl font-bold text-[#d8e3fb]">
              {inspectingExercise.name}
            </h3>

            {/* Exercise demonstration */}
            <ExerciseAnimation
              exerciseName={inspectingExercise.name}
              exerciseDbId={inspectingExercise.exerciseDbId}
              images={inspectingExercise.images}
              targetMuscle={inspectingExercise.targetMuscle}
              primaryMuscles={inspectingExercise.primaryMuscles}
              secondaryMuscles={inspectingExercise.secondaryMuscles}
              muscleHighlightInfo={inspectingExercise.muscleHighlightInfo}
              equipment={inspectingExercise.equipment}
              instructions={inspectingExercise.instructions}
              formTips={inspectingExercise.formTips}
              calorieEstimate={inspectingExercise.calorieEstimate}
              photoUrl={inspectingExercise.imageUrl}
              activeSet={1}
              totalSets={inspectingExercise.sets}
              repsTarget={inspectingExercise.reps}
            />

            <div className="mt-2 flex justify-end gap-3 pt-3 border-t border-[#1f2a3c]">
              <button
                onClick={() => setInspectingExercise(null)}
                className="px-4 py-2.5 rounded-xl bg-[#0c1421] hover:bg-[#152336] text-[#d8e3fb] text-xs font-semibold transition-colors border border-[#1f2a3c]"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setInspectingExercise(null);
                  startWorkout(activeDay.id);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] hover:bg-[#6ffbbe] text-xs font-extrabold flex items-center gap-1.5 transition-transform hover:scale-[1.02] shadow-md shadow-[#4edea3]/20"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Start Workout ({activeDay.splitName})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Substitution Modal */}
      {substitutingExercise && (
        <ExerciseSubstitutionModal
          exercise={substitutingExercise.exercise}
          dayId={activeDay.id}
          exerciseIndex={substitutingExercise.index}
          mode="plan"
          isOpen={true}
          onClose={() => setSubstitutingExercise(null)}
        />
      )}
    </div>
  );
};
