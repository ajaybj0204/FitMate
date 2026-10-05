import React, { useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { Exercise } from '../types';

export const WorkoutSection: React.FC = () => {
  const {
    workoutSchedule,
    selectedScheduleDayId,
    setSelectedScheduleDayId,
    startWorkout,
    userProfile,
  } = useFitMate();

  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null);

  const activeDay =
    workoutSchedule.find(d => d.id === selectedScheduleDayId) || workoutSchedule[0];

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Plan Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#152031] rounded-2xl p-6 sm:p-8 shadow-xl gap-6 border border-[#1f2a3c]">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wider text-[#4edea3] font-bold">
            Active Training Program
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb]">
            Hypertrophy &amp; Strength Builder
          </h1>
          <p className="text-xs sm:text-sm text-[#bbcabf] max-w-xl leading-relaxed">
            Designed to maximize muscle mass and functional power through systematic progressive overload and calibrated supersets.
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
        </div>
      </div>

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
                <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'opacity-90' : 'text-[#86948a]'}`}>
                  {day.dayName}
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

          {!activeDay.isRest && activeDay.exercises.length > 0 && (
            <button
              onClick={() => startWorkout(activeDay.id)}
              className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md shadow-[#4edea3]/20 shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              Start Full Workout
            </button>
          )}
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
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
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

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectingExercise(exercise)}
                      className="flex-1 bg-[#111c2d] hover:bg-[#1f2a3c] text-[#d8e3fb] text-xs font-semibold py-2.5 rounded-xl transition-all border border-[#1f2a3c]"
                    >
                      Instructions &amp; Tips
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

      {/* Exercise Detail Modal */}
      {inspectingExercise && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#152031] rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative border border-[#1f2a3c] my-auto">
            <button
              onClick={() => setInspectingExercise(null)}
              className="absolute top-5 right-5 p-1.5 text-[#86948a] hover:text-[#d8e3fb] rounded-lg hover:bg-[#1f2a3c]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-[#4edea3]">
                {inspectingExercise.targetMuscle}
              </span>
              <span className="text-xs text-[#86948a]">• {inspectingExercise.difficulty}</span>
            </div>

            <h3 className="font-headline text-2xl font-bold text-[#d8e3fb] mb-3">
              {inspectingExercise.name}
            </h3>

            {/* Photo */}
            <div className="h-44 w-full rounded-xl overflow-hidden mb-4 bg-[#111c2d] border border-[#1f2a3c]">
              <img
                src={inspectingExercise.imageUrl}
                alt={inspectingExercise.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#4edea3] uppercase tracking-wider mb-1">
                  Required Equipment
                </h4>
                <p className="text-sm text-[#d8e3fb]">{inspectingExercise.equipment}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#4edea3] uppercase tracking-wider mb-1">
                  Execution Instructions
                </h4>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  {inspectingExercise.instructions}
                </p>
              </div>

              {inspectingExercise.formTips && inspectingExercise.formTips.length > 0 && (
                <div className="bg-[#111c2d] p-4 rounded-xl border border-[#1f2a3c]">
                  <h4 className="text-xs font-bold text-[#98da27] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
                    Key Form Tips
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#bbcabf]">
                    {inspectingExercise.formTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#4edea3] mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#1f2a3c]">
              <button
                onClick={() => setInspectingExercise(null)}
                className="px-4 py-2.5 rounded-xl bg-[#111c2d] hover:bg-[#1f2a3c] text-[#d8e3fb] text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setInspectingExercise(null);
                  startWorkout(activeDay.id);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] hover:bg-[#6ffbbe] text-xs font-bold flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Start Workout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
