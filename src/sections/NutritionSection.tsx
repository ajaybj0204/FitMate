import React, { useMemo, useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { Meal } from '../types';

export const NutritionSection: React.FC = () => {
  const {
    meals,
    toggleMealCompletion,
    addCustomMeal,
    healthMetrics,
    consumedCalories,
    consumedProtein,
    consumedCarbs,
    consumedFats,
    addMealToGrocery,
    setIsGroceryModalOpen,
    t,
  } = useFitMate();

  const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg' | 'egg' | 'budget' | 'high-protein'>('all');
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);

  // New Meal Form state
  const [newMeal, setNewMeal] = useState<{
    name: string;
    mealType: Meal['mealType'];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    dietaryType: Meal['dietaryType'];
    portion: string;
    description: string;
    recipe: string;
    costInr: number;
  }>({
    name: '',
    mealType: 'Snack',
    calories: 300,
    protein: 20,
    carbs: 35,
    fats: 8,
    dietaryType: 'veg',
    portion: '1 bowl',
    description: '',
    recipe: '',
    costInr: 45,
  });

  const filteredMeals = useMemo(() => {
    if (filter === 'all') return meals;
    if (filter === 'budget') return meals.filter(m => (m.costInr || 50) <= 60);
    if (filter === 'high-protein') return meals.filter(m => m.protein >= 30);
    return meals.filter(m => m.dietaryType === filter);
  }, [meals, filter]);

  const handleCreateMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.name.trim()) return;

    addCustomMeal({
      ...newMeal,
      time: '12:00 PM',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVo0u9zQwxgpS_bnk34xaR_D6qyKyt8SWxTAmoGwOGAyjBWiLLzfb4sQnABYMUJFZjCNINLHqEmwqaoLS4KjmJYEubImk-ViGMNs-NRWFdHye32fSv05WLdKBiZltCqhJiywzfKczMskwvreBmON8i9dHu7D6KDpZO2QGGJT7CG1g21cRSrmd_61nD1Xu-Utly7jt6aQjEVQ2Q9Khga1CRqotnve1K1Lvlw0bpxgyJU6bCv03gsHmgiw',
      completed: false,
    });
    setIsAddMealModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header & Daily Target */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">nutrition</span>
            Fuel Your Performance
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb]">
            My Nutrition Plan
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-[#111c2d] px-4 py-2.5 rounded-xl border border-[#1f2a3c] shadow-sm">
          <span className="material-symbols-outlined text-[#ffb3af] text-[20px]">local_fire_department</span>
          <span className="text-xs text-[#bbcabf]">
            Daily Goal:{' '}
            <strong className="text-[#d8e3fb] font-headline text-sm font-bold">
              {healthMetrics.dailyCalorieTarget} kcal
            </strong>
          </span>
        </div>
      </div>

      {/* Daily Targets Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="bg-[#111c2d] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-[#1f2a3c] shadow-xl group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#4edea3]/5 rounded-full blur-xl group-hover:bg-[#4edea3]/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Calories</span>
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">bolt</span>
          </div>
          <div>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] mb-2 tabular-nums">
              {consumedCalories}{' '}
              <span className="text-xs font-normal text-[#86948a]">/ {healthMetrics.dailyCalorieTarget} kcal</span>
            </div>
            <div className="w-full bg-[#152031] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#4edea3] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((consumedCalories / healthMetrics.dailyCalorieTarget) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Protein */}
        <div className="bg-[#111c2d] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-[#1f2a3c] shadow-xl group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#98da27]/5 rounded-full blur-xl group-hover:bg-[#98da27]/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Protein</span>
            <span className="material-symbols-outlined text-[#98da27] text-[20px]">fitness_center</span>
          </div>
          <div>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] mb-2 tabular-nums">
              {consumedProtein}{' '}
              <span className="text-xs font-normal text-[#86948a]">/ {healthMetrics.proteinTarget} g</span>
            </div>
            <div className="w-full bg-[#152031] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#98da27] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((consumedProtein / healthMetrics.proteinTarget) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="bg-[#111c2d] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-[#1f2a3c] shadow-xl group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ffb3af]/5 rounded-full blur-xl group-hover:bg-[#ffb3af]/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Carbohydrates</span>
            <span className="material-symbols-outlined text-[#ffb3af] text-[20px]">bakery_dining</span>
          </div>
          <div>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] mb-2 tabular-nums">
              {consumedCarbs}{' '}
              <span className="text-xs font-normal text-[#86948a]">/ {healthMetrics.carbsTarget} g</span>
            </div>
            <div className="w-full bg-[#152031] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#ffb3af] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((consumedCarbs / healthMetrics.carbsTarget) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Fats */}
        <div className="bg-[#111c2d] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-[#1f2a3c] shadow-xl group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#4edea3]/5 rounded-full blur-xl group-hover:bg-[#4edea3]/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">Fats</span>
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">question_mark</span>
          </div>
          <div>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] mb-2 tabular-nums">
              {consumedFats}{' '}
              <span className="text-xs font-normal text-[#86948a]">/ {healthMetrics.fatsTarget} g</span>
            </div>
            <div className="w-full bg-[#152031] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#4edea3] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((consumedFats / healthMetrics.fatsTarget) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Custom Meal Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Diet Category Segmented Controls */}
        <div className="flex items-center gap-1.5 bg-[#111c2d] p-1.5 rounded-xl border border-[#1f2a3c] overflow-x-auto max-w-full">
          {[
            { id: 'all' as const, label: 'All' },
            { id: 'veg' as const, label: 'Vegetarian' },
            { id: 'non-veg' as const, label: 'Non-Veg' },
            { id: 'egg' as const, label: 'Eggetarian' },
            { id: 'budget' as const, label: 'Budget (≤₹60)' },
            { id: 'high-protein' as const, label: 'High Protein (≥30g)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#4edea3] text-[#003824] shadow-md shadow-[#4edea3]/20'
                  : 'text-[#bbcabf] hover:text-[#d8e3fb]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGroceryModalOpen(true)}
            className="bg-[#111c2d] hover:bg-[#1f2a3c] text-[#4edea3] border border-[#4edea3]/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Open Smart Grocery List"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            <span>Grocery List</span>
          </button>

          <button
            onClick={() => setIsAddMealModalOpen(true)}
            className="bg-[#152031] hover:bg-[#1f2a3c] text-[#d8e3fb] border border-[#1f2a3c] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:border-[#4edea3]/40"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">add_circle</span>
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Indian Budget Optimization Callout */}
      <div className="bg-[#111c2d] border border-[#1f2a3c] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#98da27]/10 text-[#98da27] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">savings</span>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#d8e3fb]">
              Indian High-Protein Budget Engine
            </h4>
            <p className="text-xs text-[#86948a] mt-0.5">
              Soya Chunks provide 52g protein per 100g at ₹12/serving. Pair with Dal &amp; Rice for full BCAAs under ₹40!
            </p>
          </div>
        </div>
        <button
          onClick={() => setFilter('budget')}
          className="text-xs font-bold text-[#4edea3] hover:underline whitespace-nowrap"
        >
          View Budget Meals →
        </button>
      </div>

      {/* Meal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMeals.map(meal => (
          <div
            key={meal.id}
            className={`bg-[#111c2d] rounded-2xl overflow-hidden flex flex-col justify-between border shadow-xl transition-all ${
              meal.completed ? 'border-[#4edea3]/50 ring-1 ring-[#4edea3]/30' : 'border-[#1f2a3c]'
            }`}
          >
            {/* Meal Cover Image */}
            <div className="relative h-48 w-full bg-[#152031] overflow-hidden">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 bg-[#081425]/85 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-[#d8e3fb] border border-[#3c4a42]/50 flex items-center gap-1.5">
                <span>{meal.mealType} • {meal.time}</span>
                {meal.costInr && (
                  <span className="bg-[#4edea3]/20 text-[#4edea3] font-bold px-1.5 py-0.2 rounded text-[11px]">
                    ₹{meal.costInr}
                  </span>
                )}
              </div>

              {/* Completed badge or toggle button */}
              <button
                onClick={() => toggleMealCompletion(meal.id)}
                className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${
                  meal.completed
                    ? 'bg-[#4edea3] text-[#003824]'
                    : 'bg-[#152031]/90 hover:bg-[#4edea3] hover:text-[#003824] text-[#d8e3fb] border border-[#3c4a42]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {meal.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>{meal.completed ? 'Eaten' : 'Mark Eaten'}</span>
              </button>
            </div>

            {/* Meal Content */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">{meal.name}</h3>
                  <div className="text-right">
                    <span className="text-[#4edea3] font-headline text-base font-bold tabular-nums block">
                      {meal.calories} kcal
                    </span>
                    {meal.costPerGramProtein && (
                      <span className="text-[10px] text-[#86948a] font-semibold">
                        ₹{meal.costPerGramProtein}/g protein
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#bbcabf] mb-4 leading-relaxed">
                  {meal.description}
                </p>

                {/* Macro Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-[#152031] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#98da27] border border-[#1f2a3c]">
                    Protein: {meal.protein}g
                  </span>
                  <span className="bg-[#152031] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#ffb3af] border border-[#1f2a3c]">
                    Carbs: {meal.carbs}g
                  </span>
                  <span className="bg-[#152031] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#4edea3] border border-[#1f2a3c]">
                    Fats: {meal.fats}g
                  </span>
                  <span className="bg-[#152031] px-2.5 py-1 rounded-lg text-xs font-medium text-[#86948a] border border-[#1f2a3c]">
                    Portion: {meal.portion}
                  </span>
                </div>
              </div>

              {/* Preparation & Ingredients Action */}
              <div className="border-t border-[#1f2a3c] pt-4 mt-2 flex flex-col gap-3">
                {meal.recipe && (
                  <div>
                    <span className="text-[11px] font-bold text-[#4edea3] uppercase tracking-wider block mb-1">
                      Preparation Method
                    </span>
                    <p className="text-xs text-[#86948a] leading-relaxed italic">
                      {meal.recipe}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#86948a]">
                    Prep: {meal.prepTimeMinutes || 15} mins
                  </span>
                  <button
                    onClick={() => addMealToGrocery(meal)}
                    className="text-xs font-semibold text-[#4edea3] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                    Add to Grocery List
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Health & Nutritional Disclaimer */}
      <div className="bg-[#111c2d]/70 border border-[#1f2a3c] rounded-2xl p-6 flex items-start gap-4">
        <span className="material-symbols-outlined text-[#4edea3] text-[24px] mt-0.5 shrink-0">
          info
        </span>
        <div>
          <h4 className="font-headline text-sm font-bold text-[#d8e3fb] mb-1">
            Health &amp; Nutritional Disclaimer
          </h4>
          <p className="text-xs text-[#86948a] leading-relaxed">
            The nutritional information and meal plans provided on FITORA are calculated based on algorithmic estimates for body composition and training targets. Individual caloric requirements and macro tolerances vary depending on age, metabolic rate, endocrine health, and workout intensity. Consult a certified nutritionist or physician before starting any extreme deficit or transformation program.
          </p>
        </div>
      </div>

      {/* Add Custom Meal Modal */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#152031] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-[#1f2a3c] my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">Add Custom Meal</h3>
              <button
                onClick={() => setIsAddMealModalOpen(false)}
                className="text-[#86948a] hover:text-[#d8e3fb]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateMeal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Meal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Soya Chunks &amp; Brown Rice"
                  value={newMeal.name}
                  onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Meal Type</label>
                  <select
                    value={newMeal.mealType}
                    onChange={e => setNewMeal({ ...newMeal, mealType: e.target.value as any })}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snack">Snack</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Pre-workout">Pre-workout</option>
                    <option value="Post-workout">Post-workout</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Diet Type</label>
                  <select
                    value={newMeal.dietaryType}
                    onChange={e => setNewMeal({ ...newMeal, dietaryType: e.target.value as any })}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="egg">Eggetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#d8e3fb] block mb-1">Calories</label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={e => setNewMeal({ ...newMeal, calories: Number(e.target.value) || 0 })}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#d8e3fb] block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newMeal.protein}
                    onChange={e => setNewMeal({ ...newMeal, protein: Number(e.target.value) || 0 })}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#d8e3fb] block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={newMeal.carbs}
                    onChange={e => setNewMeal({ ...newMeal, carbs: Number(e.target.value) || 0 })}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#d8e3fb] block mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={newMeal.fats}
                    onChange={e => setNewMeal({ ...newMeal, fats: Number(e.target.value) || 0 })}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Portion size</label>
                <input
                  type="text"
                  placeholder="e.g. 1 plate (200g)"
                  value={newMeal.portion}
                  onChange={e => setNewMeal({ ...newMeal, portion: e.target.value })}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMealModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold hover:bg-[#6ffbbe]"
                >
                  Save Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
