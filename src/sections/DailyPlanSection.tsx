import React, { useMemo } from 'react';
import { useFitMate } from '../context/FitMateContext';

export const DailyPlanSection: React.FC = () => {
  const {
    userProfile,
    healthMetrics,
    dailyPlanItems,
    toggleDailyPlanItem,
    hydrationMl,
    waterGoalMl,
    addWaterMl,
    stepsLog,
    logSteps,
    sleepLog,
    startWorkout,
    activeWorkoutDay,
    navigateTo,
    setIsRemindersModalOpen,
    t,
  } = useFitMate();

  const completedCount = dailyPlanItems.filter(i => i.completed).length;
  const progressPercent = Math.round((completedCount / Math.max(1, dailyPlanItems.length)) * 100);

  const hydrationPercent = Math.min(100, Math.round((hydrationMl / waterGoalMl) * 100));
  const stepsPercent = Math.min(100, Math.round((stepsLog.currentSteps / stepsLog.targetSteps) * 100));

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {t('dailyPlan', 'Personalized Daily Plan')}
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb]">
            Today's Performance Blueprint
          </h1>
          <p className="text-xs sm:text-sm text-[#bbcabf] mt-1">
            Orchestrated daily timing for meals, workouts, hydration, steps, and hormonal recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRemindersModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111c2d] hover:bg-[#1f2a3c] text-[#4edea3] border border-[#1f2a3c] text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">alarm</span>
            <span>{t('smartReminders', 'Smart Reminders')}</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Score Banner */}
      <div className="bg-[#152031] rounded-2xl p-6 sm:p-8 border border-[#1f2a3c] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-[#111c2d] border border-[#1f2a3c] shrink-0">
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#1f2a3c"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#4edea3"
                strokeWidth="6"
                fill="none"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute font-headline text-xl font-bold text-[#d8e3fb] tabular-nums">
              {progressPercent}%
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">
              Daily Adherence Index
            </span>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-[#d8e3fb] mt-0.5">
              {completedCount} of {dailyPlanItems.length} Milestones Checked
            </h3>
            <p className="text-xs text-[#bbcabf] mt-1 max-w-md">
              Following a synchronized routine improves metabolic flexibility and hormonal rhythm for {userProfile.goal.toLowerCase()}.
            </p>
          </div>
        </div>

        {/* Quick Vitals Snapshot */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
          <div className="bg-[#111c2d] p-3.5 rounded-xl border border-[#1f2a3c] flex flex-col">
            <span className="text-[10px] text-[#86948a] font-bold uppercase">Hydration</span>
            <span className="font-headline text-base font-bold text-[#4edea3] mt-0.5 tabular-nums">
              {(hydrationMl / 1000).toFixed(1)}L / {healthMetrics.waterTargetLiters}L
            </span>
            <div className="w-24 bg-[#1f2a3c] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#4edea3] h-full" style={{ width: `${hydrationPercent}%` }} />
            </div>
          </div>

          <div className="bg-[#111c2d] p-3.5 rounded-xl border border-[#1f2a3c] flex flex-col">
            <span className="text-[10px] text-[#86948a] font-bold uppercase">Steps Today</span>
            <span className="font-headline text-base font-bold text-[#98da27] mt-0.5 tabular-nums">
              {stepsLog.currentSteps.toLocaleString()} / 10k
            </span>
            <div className="w-24 bg-[#1f2a3c] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#98da27] h-full" style={{ width: `${stepsPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline Checklist */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold text-[#d8e3fb]">
            Chronological Daily Schedule
          </h2>
          <span className="text-xs text-[#86948a]">Tap circle to toggle item completion</span>
        </div>

        <div className="space-y-3">
          {dailyPlanItems.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-4 ${
                item.completed
                  ? 'bg-[#111c2d]/70 border-[#4edea3]/40'
                  : 'bg-[#152031] border-[#1f2a3c] hover:border-[#3c4a42]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <button
                  onClick={() => toggleDailyPlanItem(item.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 sm:mt-0 transition-colors shrink-0 ${
                    item.completed
                      ? 'bg-[#4edea3] text-[#003824]'
                      : 'bg-[#111c2d] border border-[#3c4a42] text-transparent hover:border-[#4edea3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-headline font-bold text-[#4edea3] tabular-nums">
                      {item.time}
                    </span>
                    <span className="text-xs text-[#86948a]">•</span>
                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        item.completed ? 'line-through text-[#86948a]' : 'text-[#d8e3fb]'
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#bbcabf] mt-1 leading-relaxed">{item.detail}</p>
                </div>
              </div>

              {/* Contextual Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                {item.category === 'workout' && (
                  <button
                    onClick={() => startWorkout()}
                    className="px-3 py-1.5 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-[#4edea3]/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Start Session</span>
                  </button>
                )}

                {item.category === 'hydration' && (
                  <button
                    onClick={() => addWaterMl(250)}
                    className="px-3 py-1.5 rounded-xl bg-[#111c2d] hover:bg-[#1f2a3c] text-[#4edea3] border border-[#1f2a3c] text-xs font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>+250ml</span>
                  </button>
                )}

                {item.category === 'meal' && (
                  <button
                    onClick={() => navigateTo('nutrition')}
                    className="px-3 py-1.5 rounded-xl bg-[#111c2d] hover:bg-[#1f2a3c] text-[#d8e3fb] border border-[#1f2a3c] text-xs font-semibold"
                  >
                    View Recipes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery & Sleep Science Note */}
      <div className="bg-[#111c2d] rounded-2xl p-6 border border-[#1f2a3c] flex items-start gap-4">
        <span className="material-symbols-outlined text-[#4edea3] text-[28px] mt-0.5">
          bedtime
        </span>
        <div>
          <h4 className="font-headline text-base font-bold text-[#d8e3fb] mb-1">
            Why Daily Plan Synchronicity Matters
          </h4>
          <p className="text-xs text-[#bbcabf] leading-relaxed">
            Consuming pre-workout nutrition 60–90 minutes before lifting maximizes glycogen readiness and pump delivery. Consistent sleep timing anchors your circadian rhythm, allowing natural pulses of testosterone and growth hormone during slow-wave restorative sleep.
          </p>
        </div>
      </div>
    </div>
  );
};
