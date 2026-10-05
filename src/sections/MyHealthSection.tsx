import React, { useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { calculateBMI } from '../utils/healthCalculations';

export const MyHealthSection: React.FC<{ onOpenLearnModal?: (topicId: string) => void }> = ({
  onOpenLearnModal,
}) => {
  const { userProfile, updateProfile, healthMetrics, navigateTo } = useFitMate();

  // Interactive live calculator inputs
  const [calcHeight, setCalcHeight] = useState<number>(userProfile.heightCm);
  const [calcWeight, setCalcWeight] = useState<number>(userProfile.weightKg);

  const liveBmiResult = calculateBMI(calcWeight, calcHeight);

  // Sync to profile button
  const handleSaveToProfile = () => {
    updateProfile({ heightCm: calcHeight, weightKg: calcWeight });
  };

  const handleLearnClick = (topicId: string) => {
    if (onOpenLearnModal) {
      onOpenLearnModal(topicId);
    } else {
      navigateTo('learn');
    }
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-[#4edea3] font-bold">
            Health Analytics
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb]">
            Understand Your Body
          </h1>
          <p className="text-sm sm:text-base text-[#bbcabf] max-w-2xl leading-relaxed">
            Analyze your core vitals, metabolic rate, and daily nutritional requirements with high-precision formulas based on clinical research.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111c2d] px-4 py-2 rounded-xl border border-[#1f2a3c] shadow-sm">
          <span className="material-symbols-outlined text-[#4edea3] text-[20px]">verified</span>
          <span className="text-xs font-semibold text-[#d8e3fb]">
            Mifflin-St Jeor Engine Active
          </span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* BMI Calculator Card (Span 7) */}
        <div className="md:col-span-7 bg-[#152031] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden border border-[#1f2a3c]">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#4edea3]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[24px]">accessibility_new</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">
                    Body Mass Index (BMI)
                  </h3>
                  <p className="text-xs text-[#86948a]">
                    General weight-to-height proportion screening
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleLearnClick('bmi')}
                className="text-[#4edea3] text-xs font-semibold hover:underline flex items-center gap-1"
              >
                Learn more
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Inputs and Live Output Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#bbcabf]">Height (cm)</label>
                <input
                  type="number"
                  value={calcHeight}
                  onChange={e => setCalcHeight(Number(e.target.value) || 178)}
                  className="bg-[#1f2a3c] border border-[#3c4a42] px-3.5 py-2.5 rounded-xl text-[#d8e3fb] text-sm focus:outline-none focus:border-[#4edea3] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#bbcabf]">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcWeight}
                  onChange={e => setCalcWeight(Number(e.target.value) || 72)}
                  className="bg-[#1f2a3c] border border-[#3c4a42] px-3.5 py-2.5 rounded-xl text-[#d8e3fb] text-sm focus:outline-none focus:border-[#4edea3] transition-colors"
                />
              </div>

              <div className="bg-[#111c2d] rounded-xl p-3 flex flex-col justify-center items-center border border-[#1f2a3c]">
                <span className="text-[10px] uppercase font-semibold text-[#86948a]">Live Calculated BMI</span>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="font-headline text-2xl font-bold text-[#4edea3] tabular-nums">
                    {liveBmiResult.bmi}
                  </span>
                  <span className="text-[11px] text-[#86948a]">kg/m²</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    liveBmiResult.category === 'Normal weight'
                      ? 'bg-[#10b981]/20 text-[#4edea3]'
                      : liveBmiResult.category === 'Overweight'
                      ? 'bg-[#83c300]/20 text-[#98da27]'
                      : 'bg-[#93000a]/20 text-[#ffb4ab]'
                  }`}
                >
                  {liveBmiResult.category}
                </span>
              </div>
            </div>

            {/* Visual Indicator Gauge */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-[#86948a] mb-1 font-medium">
                <span>Underweight (&lt;18.5)</span>
                <span>Normal (18.5 - 24.9)</span>
                <span>Overweight (25 - 29.9)</span>
                <span>Obese (&ge;30)</span>
              </div>
              <div className="h-2 w-full bg-[#111c2d] rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400 w-[18.5%]" />
                <div className="h-full bg-[#4edea3] w-[26.5%]" />
                <div className="h-full bg-[#9ddf2e] w-[20%]" />
                <div className="h-full bg-[#ffb3af] w-[35%]" />
              </div>
            </div>

            {/* Save to profile if modified */}
            {(calcHeight !== userProfile.heightCm || calcWeight !== userProfile.weightKg) && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#98da27]">Modified values ready to save:</span>
                <button
                  onClick={handleSaveToProfile}
                  className="bg-[#4edea3] text-[#003824] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#6ffbbe] transition-colors"
                >
                  Update My Profile
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f2a3c]">
            <p className="text-xs text-[#86948a] flex items-start gap-1.5 leading-relaxed">
              <span className="material-symbols-outlined text-[16px] text-[#4edea3] shrink-0 mt-0.5">info</span>
              <span>
                <strong>Important note:</strong> BMI is a general population screening measurement. It does not directly assess visceral body fat, bone density, or muscular development.
              </span>
            </p>
          </div>
        </div>

        {/* BMR Card (Span 5) */}
        <div className="md:col-span-5 bg-[#152031] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden border border-[#1f2a3c]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">BMR</h3>
                  <p className="text-xs text-[#86948a]">Basal Metabolic Rate</p>
                </div>
              </div>
              <button
                onClick={() => handleLearnClick('bmr')}
                className="text-[#4edea3] text-xs font-semibold hover:underline flex items-center gap-1"
              >
                Learn more
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="my-2 flex items-baseline gap-2">
              <span className="font-headline text-4xl sm:text-5xl font-bold text-[#d8e3fb] tabular-nums">
                {healthMetrics.bmr}
              </span>
              <span className="text-sm font-semibold text-[#4edea3]">kcal / day</span>
            </div>

            <p className="text-xs sm:text-sm text-[#bbcabf] leading-relaxed">
              The exact baseline energy your body burns strictly to keep your brain, heart, lungs, and cellular organs functioning at complete bed rest.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1f2a3c] flex items-center justify-between text-xs text-[#86948a]">
            <span>Formula: Mifflin-St Jeor</span>
            <span className="text-[#4edea3] font-semibold">Accounts for ~65% of TDEE</span>
          </div>
        </div>

        {/* TDEE Card (Span 4) */}
        <div className="md:col-span-4 bg-[#152031] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-[#1f2a3c]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[24px]">bolt</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">TDEE</h3>
                  <p className="text-xs text-[#86948a]">Total Daily Energy</p>
                </div>
              </div>
              <button
                onClick={() => handleLearnClick('tdee')}
                className="text-[#4edea3] text-xs font-semibold hover:underline"
              >
                Formula
              </button>
            </div>

            <div className="my-2 flex items-baseline gap-2">
              <span className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb] tabular-nums">
                {healthMetrics.tdee}
              </span>
              <span className="text-sm font-semibold text-[#4edea3]">kcal / day</span>
            </div>

            <p className="text-xs text-[#bbcabf] leading-relaxed">
              Total expenditure including workouts, daily footsteps (NEAT), and the thermic effect of digesting food.
            </p>
          </div>

          <div className="mt-6 pt-3 flex items-center justify-between border-t border-[#1f2a3c] text-xs">
            <span className="text-[#86948a]">Activity Multiplier</span>
            <span className="font-semibold text-[#4edea3]">{userProfile.activityLevel}</span>
          </div>
        </div>

        {/* Daily Calorie Targets Breakdown Card (Span 8) */}
        <div className="md:col-span-8 bg-[#152031] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-[#1f2a3c]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[24px]">restaurant</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">
                    Calorie Targets by Objective
                  </h3>
                  <p className="text-xs text-[#86948a]">
                    Science-backed caloric ranges tailored to your target physique
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleLearnClick('calorie-deficit')}
                className="text-[#4edea3] text-xs font-semibold hover:underline flex items-center gap-1"
              >
                Learn more
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Target Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-2">
              {/* Maintenance */}
              <div
                className={`rounded-xl p-4 flex flex-col gap-1 border transition-all ${
                  userProfile.goal === 'Maintain Weight'
                    ? 'border-[#4edea3] bg-[#111c2d] ring-2 ring-[#4edea3]/30'
                    : 'border-[#1f2a3c] bg-[#111c2d]/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#86948a] uppercase font-bold tracking-wider">
                    Maintenance
                  </span>
                  {userProfile.goal === 'Maintain Weight' && (
                    <span className="text-[9px] bg-[#4edea3] text-[#003824] px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-headline text-2xl font-bold text-[#d8e3fb] tabular-nums">
                    {healthMetrics.maintenanceCalories}
                  </span>
                  <span className="text-xs text-[#86948a]">kcal</span>
                </div>
                <p className="text-[11px] text-[#bbcabf]">
                  Preserves current bodyweight and composition.
                </p>
              </div>

              {/* Fat Loss */}
              <div
                className={`rounded-xl p-4 flex flex-col gap-1 border transition-all ${
                  userProfile.goal === 'Lose Fat'
                    ? 'border-[#4edea3] bg-[#111c2d] ring-2 ring-[#4edea3]/30'
                    : 'border-[#1f2a3c] bg-[#111c2d]/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#4edea3] uppercase font-bold tracking-wider">
                    Fat Loss (-20%)
                  </span>
                  {userProfile.goal === 'Lose Fat' && (
                    <span className="text-[9px] bg-[#4edea3] text-[#003824] px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-headline text-2xl font-bold text-[#4edea3] tabular-nums">
                    {healthMetrics.fatLossCalories}
                  </span>
                  <span className="text-xs text-[#86948a]">kcal</span>
                </div>
                <p className="text-[11px] text-[#bbcabf]">
                  Optimal ~500 kcal deficit for safe 0.5kg/week fat loss.
                </p>
              </div>

              {/* Muscle Gain */}
              <div
                className={`rounded-xl p-4 flex flex-col gap-1 border transition-all ${
                  userProfile.goal === 'Build Muscle' || userProfile.goal === 'Build Strength'
                    ? 'border-[#4edea3] bg-[#111c2d] ring-2 ring-[#4edea3]/30'
                    : 'border-[#1f2a3c] bg-[#111c2d]/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#98da27] uppercase font-bold tracking-wider">
                    Muscle Gain (+10%)
                  </span>
                  {(userProfile.goal === 'Build Muscle' || userProfile.goal === 'Build Strength') && (
                    <span className="text-[9px] bg-[#4edea3] text-[#003824] px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-headline text-2xl font-bold text-[#98da27] tabular-nums">
                    {healthMetrics.muscleGainCalories}
                  </span>
                  <span className="text-xs text-[#86948a]">kcal</span>
                </div>
                <p className="text-[11px] text-[#bbcabf]">
                  Controlled surplus prioritizing lean tissue hypertrophy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Protein Guidance Card (Span 6) */}
        <div className="md:col-span-6 bg-[#152031] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-[#1f2a3c]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[24px]">fitness_center</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">Protein Target</h3>
                  <p className="text-xs text-[#86948a]">Macronutrient optimization for recovery</p>
                </div>
              </div>
              <button
                onClick={() => handleLearnClick('protein')}
                className="text-[#4edea3] text-xs font-semibold hover:underline flex items-center gap-1"
              >
                Learn more
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="font-headline text-4xl sm:text-5xl font-bold text-[#d8e3fb] tabular-nums">
                {healthMetrics.proteinTarget}
              </span>
              <span className="text-sm font-semibold text-[#4edea3]">g / day</span>
            </div>

            <p className="text-xs sm:text-sm text-[#bbcabf] leading-relaxed">
              Calculated based on your bodyweight of {userProfile.weightKg} kg to maximize muscle protein synthesis (MPS) and mitigate muscle catabolism.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1f2a3c] mt-4 text-xs">
            <span className="text-[#86948a]">Per meal distribution (4 meals)</span>
            <span className="font-bold text-[#4edea3]">
              ~{Math.round(healthMetrics.proteinTarget / 4)}g protein / meal
            </span>
          </div>
        </div>

        {/* Water Guidance Card (Span 6) */}
        <div className="md:col-span-6 bg-[#152031] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-[#1f2a3c]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[24px]">water_drop</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">Hydration Guidance</h3>
                  <p className="text-xs text-[#86948a]">Daily fluid volume recommendation</p>
                </div>
              </div>
              <button
                onClick={() => handleLearnClick('hydration')}
                className="text-[#4edea3] text-xs font-semibold hover:underline flex items-center gap-1"
              >
                Learn more
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="font-headline text-4xl sm:text-5xl font-bold text-[#d8e3fb] tabular-nums">
                {healthMetrics.waterTargetLiters}
              </span>
              <span className="text-sm font-semibold text-[#4edea3]">Liters / day</span>
            </div>

            <p className="text-xs sm:text-sm text-[#bbcabf] leading-relaxed">
              Based on your body mass, daily step count, and perspiration volume. Proper hydration maintains cellular muscle glycogen and joint lubricating synovial fluid.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1f2a3c] mt-4 text-xs">
            <span className="text-[#86948a]">Standard 250ml glasses equivalent</span>
            <span className="font-bold text-[#4edea3]">
              {healthMetrics.waterGlasses} glasses daily 💧
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
