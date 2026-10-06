import React, { useState } from 'react';
import { useFitMate } from '../context/FitMateContext';

export const AnalyticsSection: React.FC = () => {
  const { userProfile, healthMetrics, totalWorkoutVolumeKg, stepsLog, sleepLog, progressEntries, t } =
    useFitMate();

  const [activeMetricTab, setActiveMetricTab] = useState<'volume' | 'calories' | 'recovery'>('volume');

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">insights</span>
            {t('analytics', 'Advanced Analytics')}
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb]">
            Performance &amp; Biometrics
          </h1>
          <p className="text-xs sm:text-sm text-[#bbcabf] mt-1">
            Algorithmic insights tracking progressive overload, energy balance, and recovery readiness.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-[#111c2d] p-1 rounded-xl border border-[#1f2a3c]">
          <button
            onClick={() => setActiveMetricTab('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMetricTab === 'volume'
                ? 'bg-[#4edea3] text-[#003824] shadow-sm'
                : 'text-[#bbcabf] hover:text-[#d8e3fb]'
            }`}
          >
            Volume &amp; Strength
          </button>
          <button
            onClick={() => setActiveMetricTab('calories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMetricTab === 'calories'
                ? 'bg-[#4edea3] text-[#003824] shadow-sm'
                : 'text-[#bbcabf] hover:text-[#d8e3fb]'
            }`}
          >
            Energy Balance
          </button>
          <button
            onClick={() => setActiveMetricTab('recovery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMetricTab === 'recovery'
                ? 'bg-[#4edea3] text-[#003824] shadow-sm'
                : 'text-[#bbcabf] hover:text-[#d8e3fb]'
            }`}
          >
            Recovery &amp; Sleep
          </button>
        </div>
      </div>

      {/* Primary Chart Widget */}
      <div className="bg-[#152031] p-6 sm:p-8 rounded-2xl border border-[#1f2a3c] shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">
              {activeMetricTab === 'volume' && 'Weekly Tonnage Progression'}
              {activeMetricTab === 'calories' && 'Caloric Balance vs Expenditure'}
              {activeMetricTab === 'recovery' && 'Sleep Quality & Nervous System Readiness'}
            </span>
            <h2 className="font-headline text-2xl font-bold text-[#d8e3fb] mt-0.5">
              {activeMetricTab === 'volume' && 'Total Working Volume: 14,850 kg'}
              {activeMetricTab === 'calories' && `TDEE: ${healthMetrics.tdee} kcal / Day`}
              {activeMetricTab === 'recovery' && `Recovery Score: ${sleepLog.recoveryScore}% (Optimal)`}
            </h2>
          </div>
          <span className="text-xs font-bold text-[#4edea3] bg-[#10b981]/20 px-3 py-1 rounded-full">
            +8.4% vs Last Cycle
          </span>
        </div>

        {/* SVG Chart Visualization */}
        <div className="h-56 sm:h-64 w-full bg-[#111c2d] rounded-xl p-4 border border-[#1f2a3c] flex flex-col justify-between relative overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-20">
            <div className="border-b border-[#bbcabf]" />
            <div className="border-b border-[#bbcabf]" />
            <div className="border-b border-[#bbcabf]" />
            <div className="border-b border-[#bbcabf]" />
          </div>

          {activeMetricTab === 'volume' && (
            <div className="flex items-end justify-between gap-3 h-full pt-8 px-2 z-10">
              {[
                { label: 'Week 1', height: '55%', val: '11,200 kg' },
                { label: 'Week 2', height: '68%', val: '12,450 kg' },
                { label: 'Week 3', height: '82%', val: '13,900 kg' },
                { label: 'Week 4 (Current)', height: '95%', val: '14,850 kg', active: true },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[11px] font-bold text-[#4edea3] opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.val}
                  </span>
                  <div
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 ${
                      bar.active
                        ? 'bg-gradient-to-t from-[#10b981] to-[#4edea3] shadow-lg shadow-[#4edea3]/30'
                        : 'bg-[#4edea3]/30 hover:bg-[#4edea3]/60'
                    }`}
                    style={{ height: bar.height }}
                  />
                  <span className="text-xs text-[#86948a] font-medium">{bar.label}</span>
                </div>
              ))}
            </div>
          )}

          {activeMetricTab === 'calories' && (
            <div className="flex items-end justify-between gap-3 h-full pt-8 px-2 z-10">
              {[
                { label: 'Mon', intake: '2,200', target: '2,250', height: '78%' },
                { label: 'Tue', intake: '2,310', target: '2,250', height: '82%' },
                { label: 'Wed', intake: '2,150', target: '2,250', height: '75%' },
                { label: 'Thu', intake: '2,280', target: '2,250', height: '80%' },
                { label: 'Fri', intake: '2,240', target: '2,250', height: '79%' },
                { label: 'Sat', intake: '2,400', target: '2,250', height: '86%' },
                { label: 'Sun', intake: '2,180', target: '2,250', height: '77%' },
              ].map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] text-[#ffb3af] opacity-0 group-hover:opacity-100">
                    {day.intake} kcal
                  </span>
                  <div
                    className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-[#ffb3af]/40 to-[#ffb3af] transition-all"
                    style={{ height: day.height }}
                  />
                  <span className="text-xs text-[#86948a]">{day.label}</span>
                </div>
              ))}
            </div>
          )}

          {activeMetricTab === 'recovery' && (
            <div className="flex items-end justify-between gap-4 h-full pt-8 px-2 z-10">
              {[
                { label: 'Mon', sleep: '7.8h', score: 88, height: '88%' },
                { label: 'Tue', sleep: '8.1h', score: 92, height: '92%' },
                { label: 'Wed', sleep: '7.2h', score: 80, height: '80%' },
                { label: 'Thu', sleep: '8.0h', score: 90, height: '90%' },
                { label: 'Fri', sleep: '7.5h', score: 85, height: '85%' },
                { label: 'Sat', sleep: '8.4h', score: 95, height: '95%' },
                { label: 'Sun', sleep: '7.6h', score: 88, height: '88%' },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] text-[#9ddf2e] opacity-0 group-hover:opacity-100">
                    {item.score}%
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-[#9ddf2e]/40 to-[#9ddf2e] transition-all"
                    style={{ height: item.height }}
                  />
                  <span className="text-xs text-[#86948a]">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Muscle Group Split Distribution */}
        <div className="bg-[#111c2d] p-6 rounded-2xl border border-[#1f2a3c] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] mb-1">
              Muscle Group Frequency
            </h3>
            <p className="text-xs text-[#86948a] mb-4">Weekly direct training volume breakdown</p>

            <div className="space-y-3">
              {[
                { muscle: 'Chest & Pecs', sets: '12 sets', percent: 85, color: '#4edea3' },
                { muscle: 'Back & Lats', sets: '14 sets', percent: 92, color: '#98da27' },
                { muscle: 'Quads & Glutes', sets: '10 sets', percent: 75, color: '#ffb3af' },
                { muscle: 'Delts & Shoulders', sets: '10 sets', percent: 75, color: '#4edea3' },
                { muscle: 'Arms (Bi/Tri)', sets: '8 sets', percent: 65, color: '#d8e3fb' },
              ].map((m, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#d8e3fb]">{m.muscle}</span>
                    <span className="text-[#86948a]">{m.sets}</span>
                  </div>
                  <div className="w-full bg-[#152031] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${m.percent}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Macronutrient Distribution Donut / Proportions */}
        <div className="bg-[#111c2d] p-6 rounded-2xl border border-[#1f2a3c] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] mb-1">
              Macro Distribution
            </h3>
            <p className="text-xs text-[#86948a] mb-4">Caloric contribution split</p>

            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36 rounded-full flex items-center justify-center bg-[#152031] border border-[#1f2a3c]">
                <div className="flex flex-col items-center">
                  <span className="font-headline text-xl font-bold text-[#d8e3fb]">
                    {healthMetrics.dailyCalorieTarget}
                  </span>
                  <span className="text-[10px] text-[#86948a]">Target kcal</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
              <div className="bg-[#152031] p-2.5 rounded-xl border border-[#1f2a3c]">
                <span className="block text-[10px] text-[#98da27] font-bold">PROTEIN</span>
                <span className="font-bold text-[#d8e3fb]">{healthMetrics.proteinTarget}g</span>
                <span className="block text-[10px] text-[#86948a]">30%</span>
              </div>
              <div className="bg-[#152031] p-2.5 rounded-xl border border-[#1f2a3c]">
                <span className="block text-[10px] text-[#ffb3af] font-bold">CARBS</span>
                <span className="font-bold text-[#d8e3fb]">{healthMetrics.carbsTarget}g</span>
                <span className="block text-[10px] text-[#86948a]">45%</span>
              </div>
              <div className="bg-[#152031] p-2.5 rounded-xl border border-[#1f2a3c]">
                <span className="block text-[10px] text-[#4edea3] font-bold">FATS</span>
                <span className="font-bold text-[#d8e3fb]">{healthMetrics.fatsTarget}g</span>
                <span className="block text-[10px] text-[#86948a]">25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consistency & Habit Adherence */}
        <div className="bg-[#111c2d] p-6 rounded-2xl border border-[#1f2a3c] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] mb-1">
              Monthly Adherence
            </h3>
            <p className="text-xs text-[#86948a] mb-4">Habit consistency tracking</p>

            <div className="space-y-4">
              <div className="bg-[#152031] p-3 rounded-xl border border-[#1f2a3c] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#4edea3]">fitness_center</span>
                  <div>
                    <div className="text-xs font-bold text-[#d8e3fb]">Workout Sessions</div>
                    <div className="text-[11px] text-[#86948a]">18 of 20 completed</div>
                  </div>
                </div>
                <span className="font-headline text-sm font-bold text-[#4edea3]">90%</span>
              </div>

              <div className="bg-[#152031] p-3 rounded-xl border border-[#1f2a3c] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#4edea3]">water_drop</span>
                  <div>
                    <div className="text-xs font-bold text-[#d8e3fb]">Hydration Target</div>
                    <div className="text-[11px] text-[#86948a]">26 of 28 days reached</div>
                  </div>
                </div>
                <span className="font-headline text-sm font-bold text-[#4edea3]">93%</span>
              </div>

              <div className="bg-[#152031] p-3 rounded-xl border border-[#1f2a3c] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#ffb3af]">bedtime</span>
                  <div>
                    <div className="text-xs font-bold text-[#d8e3fb]">Sleep Consistency</div>
                    <div className="text-[11px] text-[#86948a]">Avg 7h 48m / night</div>
                  </div>
                </div>
                <span className="font-headline text-sm font-bold text-[#ffb3af]">87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
