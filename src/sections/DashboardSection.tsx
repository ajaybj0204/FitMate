import React, { useMemo } from 'react';
import { useFitMate } from '../context/FitMateContext';

export const DashboardSection: React.FC = () => {
  const {
    userProfile,
    healthMetrics,
    meals,
    consumedCalories,
    consumedProtein,
    startWorkout,
    navigateTo,
    activeWorkoutDay,
    toggleMealCompletion,
    setIsRemindersModalOpen,
    hydrationMl,
    addWaterMl,
    waterGoalMl,
    t,
  } = useFitMate();

  // Dynamic greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Compute percentage progress for today's summary
  const caloriesPercent = Math.min(
    100,
    Math.round((consumedCalories / healthMetrics.dailyCalorieTarget) * 100)
  );
  const proteinPercent = Math.min(
    100,
    Math.round((consumedProtein / healthMetrics.proteinTarget) * 100)
  );
  const completedMealsCount = meals.filter(m => m.completed).length;

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Top Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#4edea3] font-extrabold">
              FITORA Daily Pulse
            </span>
            <span className="text-[10px] bg-[#4edea3]/15 text-[#4edea3] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-[#4edea3]/30">
              Intelligent Companion
            </span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb] mt-1">
            {greeting}, {userProfile.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm sm:text-base text-[#bbcabf] mt-1">
            Your intelligent personal fitness companion • Real-time performance &amp; wellness roadmap.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#111c2d] px-4 py-2.5 rounded-xl flex items-center gap-2.5 border border-[#1f2a3c]">
            <span className="material-symbols-outlined text-[#ffb3af]">local_fire_department</span>
            <div>
              <div className="text-[10px] text-[#86948a] uppercase font-semibold">Streak</div>
              <div className="text-xs font-bold text-[#d8e3fb]">{userProfile.streakDays} Days 🔥</div>
            </div>
          </div>

          <div className="bg-[#111c2d] px-4 py-2.5 rounded-xl flex items-center gap-2.5 border border-[#1f2a3c]">
            <span className="material-symbols-outlined text-[#98da27]">bolt</span>
            <div>
              <div className="text-[10px] text-[#86948a] uppercase font-semibold">Energy</div>
              <div className="text-xs font-bold text-[#d8e3fb]">Peak State ⚡</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Weight Card */}
        <div
          onClick={() => navigateTo('progress')}
          className="bg-[#111c2d] p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg border border-[#1f2a3c] cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#bbcabf] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Weight</span>
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">scale</span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-[#d8e3fb] tabular-nums">
              {userProfile.weightKg}{' '}
              <span className="text-sm font-normal text-[#86948a]">kg</span>
            </div>
            <div className="text-xs text-[#4edea3] flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[15px]">trending_down</span>
              -0.4kg this week
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div
          onClick={() => navigateTo('my-health')}
          className="bg-[#111c2d] p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg border border-[#1f2a3c] cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#bbcabf] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">BMI</span>
            <span className="material-symbols-outlined text-[#98da27] text-[20px]">activity_zone</span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-[#d8e3fb] tabular-nums">
              {healthMetrics.bmi}
            </div>
            <div className="text-xs text-[#98da27] font-medium mt-1">
              {healthMetrics.bmiCategory}
            </div>
          </div>
        </div>

        {/* Daily Calories Card */}
        <div
          onClick={() => navigateTo('nutrition')}
          className="bg-[#111c2d] p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg border border-[#1f2a3c] cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#bbcabf] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Calories</span>
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">local_dining</span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-[#d8e3fb] tabular-nums">
              {healthMetrics.dailyCalorieTarget}{' '}
              <span className="text-sm font-normal text-[#86948a]">kcal</span>
            </div>
            <div className="text-xs text-[#bbcabf] mt-1 font-medium">
              Goal: {userProfile.goal}
            </div>
          </div>
        </div>

        {/* Protein Target Card */}
        <div
          onClick={() => navigateTo('nutrition')}
          className="bg-[#111c2d] p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg border border-[#1f2a3c] cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#bbcabf] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Protein</span>
            <span className="material-symbols-outlined text-[#ffb3af] text-[20px]">fitness_center</span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-[#d8e3fb] tabular-nums">
              {healthMetrics.proteinTarget}{' '}
              <span className="text-sm font-normal text-[#86948a]">g</span>
            </div>
            <div className="text-xs text-[#4edea3] mt-1 font-medium">
              {proteinPercent}% achieved today
            </div>
          </div>
        </div>

        {/* Water Goal Card */}
        <div
          onClick={() => navigateTo('my-health')}
          className="bg-[#111c2d] p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg border border-[#1f2a3c] sm:col-span-2 lg:col-span-1 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#bbcabf] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Hydration</span>
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">water_drop</span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-[#d8e3fb] tabular-nums">
              {healthMetrics.waterTargetLiters}{' '}
              <span className="text-sm font-normal text-[#86948a]">L</span>
            </div>
            <div className="text-xs text-[#4edea3] mt-1 font-medium">
              {healthMetrics.waterGlasses} glasses target 💧
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Progress & Workout) / Right 1 Col (Weekly & Today's Nutrition) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Today's Progress Card */}
          <div className="bg-[#111c2d] p-6 rounded-2xl border border-[#1f2a3c] shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-headline text-xl font-bold text-[#d8e3fb]">Today's Progress</h2>
                <span className="text-xs text-[#86948a]">Real-time tracking from logged meals &amp; workouts</span>
              </div>
              <button
                onClick={() => navigateTo('nutrition')}
                className="text-xs text-[#4edea3] hover:underline font-semibold"
              >
                View Log
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Calories Progress */}
              <div className="bg-[#152031] p-4 rounded-xl flex flex-col gap-2 border border-[#1f2a3c]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#d8e3fb] font-semibold">Calories Consumed</span>
                  <span className="text-[#4edea3] font-bold tabular-nums">
                    {consumedCalories} / {healthMetrics.dailyCalorieTarget} kcal
                  </span>
                </div>
                <div className="w-full bg-[#1f2a3c] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4edea3] h-full rounded-full transition-all duration-500"
                    style={{ width: `${caloriesPercent}%` }}
                  />
                </div>
              </div>

              {/* Protein Progress */}
              <div className="bg-[#152031] p-4 rounded-xl flex flex-col gap-2 border border-[#1f2a3c]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#d8e3fb] font-semibold">Protein Intake</span>
                  <span className="text-[#98da27] font-bold tabular-nums">
                    {consumedProtein} / {healthMetrics.proteinTarget} g
                  </span>
                </div>
                <div className="w-full bg-[#1f2a3c] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#98da27] h-full rounded-full transition-all duration-500"
                    style={{ width: `${proteinPercent}%` }}
                  />
                </div>
              </div>

              {/* Water Progress */}
              <div className="bg-[#152031] p-4 rounded-xl flex flex-col gap-2 border border-[#1f2a3c]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#d8e3fb] font-semibold">Water Intake</span>
                  <span className="text-[#4edea3] font-bold tabular-nums">
                    {healthMetrics.waterTargetLiters} / {healthMetrics.waterTargetLiters} L
                  </span>
                </div>
                <div className="w-full bg-[#1f2a3c] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#4edea3] h-full rounded-full w-full" />
                </div>
              </div>

              {/* Meals Tracked */}
              <div className="bg-[#152031] p-4 rounded-xl flex flex-col gap-2 border border-[#1f2a3c]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#d8e3fb] font-semibold">Meals Tracked</span>
                  <span className="text-[#ffb3af] font-bold tabular-nums">
                    {completedMealsCount} / {meals.length} Meals
                  </span>
                </div>
                <div className="w-full bg-[#1f2a3c] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ffb3af] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(completedMealsCount / Math.max(1, meals.length)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Workout & Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Today's Workout Card */}
            <div className="bg-[#111c2d] p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-[#1f2a3c] shadow-xl">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#4edea3]/10 rounded-full blur-2xl group-hover:bg-[#4edea3]/20 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#4edea3]/20 text-[#4edea3] px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                    Scheduled Today
                  </span>
                  <span className="text-xs text-[#86948a] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {activeWorkoutDay.durationMinutes}m
                  </span>
                </div>

                <h3 className="font-headline text-2xl font-bold text-[#d8e3fb] mb-1">
                  {activeWorkoutDay.splitName} Workout
                </h3>
                <p className="text-xs text-[#bbcabf] mb-6 leading-relaxed">
                  {activeWorkoutDay.focus} • {activeWorkoutDay.exercises.length} exercises programmed for progressive overload.
                </p>
              </div>

              <button
                onClick={() => startWorkout(activeWorkoutDay.id)}
                className="w-full bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-[#4edea3]/20"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                Start Workout
              </button>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#111c2d] p-6 rounded-2xl flex flex-col justify-between border border-[#1f2a3c] shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">
                    Quick Actions
                  </h3>
                  <button
                    onClick={() => setIsRemindersModalOpen(true)}
                    className="text-xs text-[#4edea3] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[15px]">alarm</span>
                    Reminders
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => navigateTo('daily-plan')}
                    className="bg-[#152031] p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 hover:bg-[#1f2a3c] transition-colors border border-[#1f2a3c]"
                  >
                    <span className="material-symbols-outlined text-[#4edea3] text-[24px]">calendar_today</span>
                    <span className="text-xs font-semibold text-[#d8e3fb]">Daily Plan</span>
                  </button>

                  <button
                    onClick={() => navigateTo('exercise-library')}
                    className="bg-[#152031] p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 hover:bg-[#1f2a3c] transition-colors border border-[#1f2a3c] group"
                    title="Explore Exercise Library"
                  >
                    <span className="material-symbols-outlined text-[#4edea3] text-[24px] group-hover:scale-110 transition-transform">menu_book</span>
                    <span className="text-xs font-semibold text-[#d8e3fb]">Exercise Library</span>
                  </button>

                  <button
                    onClick={() => startWorkout()}
                    className="bg-[#152031] p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 hover:bg-[#1f2a3c] transition-colors border border-[#1f2a3c]"
                  >
                    <span className="material-symbols-outlined text-[#98da27] text-[24px]">fitness_center</span>
                    <span className="text-xs font-semibold text-[#d8e3fb]">Start Workout</span>
                  </button>

                  <button
                    onClick={() => navigateTo('analytics')}
                    className="bg-[#152031] p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 hover:bg-[#1f2a3c] transition-colors border border-[#1f2a3c]"
                  >
                    <span className="material-symbols-outlined text-[#ffb3af] text-[24px]">insights</span>
                    <span className="text-xs font-semibold text-[#d8e3fb]">Analytics</span>
                  </button>

                  <button
                    onClick={() => navigateTo('nutrition')}
                    className="bg-[#152031] p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 hover:bg-[#1f2a3c] transition-colors border border-[#1f2a3c]"
                  >
                    <span className="material-symbols-outlined text-[#4edea3] text-[24px]">restaurant</span>
                    <span className="text-xs font-semibold text-[#d8e3fb]">Meals &amp; Diet</span>
                  </button>

                  <button
                    onClick={() => addWaterMl(250)}
                    className="bg-[#152031] p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 hover:bg-[#1f2a3c] transition-colors border border-[#1f2a3c]"
                    title="Quick log +250ml water"
                  >
                    <span className="material-symbols-outlined text-[#4edea3] text-[24px]">water_drop</span>
                    <span className="text-xs font-semibold text-[#d8e3fb]">+250ml Water</span>
                  </button>

                  <button
                    onClick={() => navigateTo('progress')}
                    className="bg-[#152031] p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 hover:bg-[#1f2a3c] transition-colors border border-[#1f2a3c]"
                  >
                    <span className="material-symbols-outlined text-[#bbcabf] text-[24px]">scale</span>
                    <span className="text-xs font-semibold text-[#d8e3fb]">Log Weight</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Activity & Today's Nutrition */}
        <div className="flex flex-col gap-6">
          {/* Weekly Activity Bar Chart Widget */}
          <div className="bg-[#111c2d] p-6 rounded-2xl flex flex-col justify-between border border-[#1f2a3c] shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">Weekly Activity</h3>
              <span className="text-xs text-[#4edea3] font-bold">Active Week</span>
            </div>
            <p className="text-xs text-[#86948a] mb-5">
              Daily effort and calories burned trend across the last 7 days.
            </p>

            {/* Inline Bar Chart Visualization */}
            <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2 bg-[#152031] rounded-xl border border-[#1f2a3c]">
              {[
                { day: 'M', height: '65%', active: false, val: '420 kcal' },
                { day: 'T', height: '85%', active: false, val: '510 kcal' },
                { day: 'W', height: '40%', active: false, val: 'Rest/Mobility' },
                { day: 'T', height: '90%', active: false, val: '540 kcal' },
                { day: 'F', height: '75%', active: false, val: '460 kcal' },
                { day: 'S', height: '100%', active: true, val: 'Peak Session' },
                { day: 'S', height: '50%', active: false, val: 'Walk 8k' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group relative">
                  <div
                    className={`w-full rounded-t transition-all ${
                      item.active
                        ? 'bg-[#4edea3] shadow-md shadow-[#4edea3]/30'
                        : 'bg-[#4edea3]/30 hover:bg-[#4edea3]'
                    }`}
                    style={{ height: item.height }}
                  />
                  <span
                    className={`text-xs ${
                      item.active ? 'text-[#4edea3] font-bold' : 'text-[#86948a]'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Nutrition Breakdown Card */}
          <div className="bg-[#111c2d] p-6 rounded-2xl flex flex-col gap-4 border border-[#1f2a3c] shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">Today's Meals</h3>
                <span className="text-xs text-[#86948a]">Tap checkmark to toggle eaten</span>
              </div>
              <span className="text-xs text-[#4edea3] font-bold tabular-nums">
                {consumedCalories} kcal
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {meals.slice(0, 4).map(meal => (
                <div
                  key={meal.id}
                  className={`bg-[#152031] p-3.5 rounded-xl flex items-center justify-between border transition-all ${
                    meal.completed ? 'border-[#4edea3]/40 bg-[#152031]/90' : 'border-[#1f2a3c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMealCompletion(meal.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        meal.completed
                          ? 'bg-[#4edea3] text-[#003824]'
                          : 'bg-[#1f2a3c] text-[#86948a] hover:text-[#d8e3fb]'
                      }`}
                      title={meal.completed ? 'Completed' : 'Mark as Eaten'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {meal.completed ? 'check' : 'add'}
                      </span>
                    </button>
                    <div>
                      <div className="text-xs font-bold text-[#d8e3fb] line-clamp-1">{meal.name}</div>
                      <div className="text-[11px] text-[#86948a]">{meal.mealType} • {meal.portion}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-[#d8e3fb] tabular-nums">
                      {meal.calories} kcal
                    </div>
                    <div className="text-[11px] text-[#4edea3] tabular-nums">
                      {meal.protein}g protein
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigateTo('nutrition')}
              className="text-xs text-center text-[#4edea3] hover:underline font-semibold pt-1"
            >
              Open Full Nutrition Planner &amp; Recipes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
