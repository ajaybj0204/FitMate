import React, { useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { ActivityLevel, DietPreference, FitnessExperience, FitnessGoal, UserProfile } from '../types';

export const OnboardingSection: React.FC = () => {
  const { userProfile, updateProfile, navigateTo, showToast } = useFitMate();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Local draft state initialized with existing profile
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      // Complete Onboarding!
      updateProfile(formData);
      showToast('Blueprint generated successfully! Welcome to FITORA 🎉', 'success');
      navigateTo('dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const toggleAllergy = (allergy: string) => {
    setFormData(prev => {
      const exists = prev.allergies.includes(allergy);
      const updated = exists
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy];
      return { ...prev, allergies: updated };
    });
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-4 sm:py-6">
      {/* Top Header & Step Indicator */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[11px] font-bold uppercase tracking-wider">
              FITORA Onboarding
            </span>
            <span className="text-xs text-[#86948a]">
              Step <span className="text-[#d8e3fb] font-semibold">{step}</span> of {totalSteps}
            </span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb]">
            Build Your FITORA Blueprint
          </h1>
          <p className="text-xs text-[#86948a] mt-1">
            Welcome to FITORA — Your personalized fitness journey starts here.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 bg-[#1f2a3c] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#4edea3] h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#111c2d] rounded-2xl p-6 sm:p-10 shadow-2xl relative border border-[#1f2a3c] overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#d8e3fb]">Basic Information</h2>
              <p className="text-sm text-[#bbcabf] mt-1">
                We use this data to calculate your baseline metabolic rate (Mifflin-St Jeor) and tailor your structural loading metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#d8e3fb]">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="bg-[#152031] border border-[#3c4a42] rounded-xl px-4 py-3 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#d8e3fb]">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) || 28 })}
                    placeholder="28"
                    className="bg-[#152031] border border-[#3c4a42] rounded-xl px-4 py-3 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#d8e3fb]">Sex</label>
                  <select
                    value={formData.sex}
                    onChange={e => setFormData({ ...formData, sex: e.target.value as any })}
                    className="bg-[#152031] border border-[#3c4a42] rounded-xl px-4 py-3 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3] transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#d8e3fb]">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) || 178 })}
                  placeholder="182"
                  className="bg-[#152031] border border-[#3c4a42] rounded-xl px-4 py-3 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#d8e3fb]">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) || 75 })}
                  placeholder="76.5"
                  className="bg-[#152031] border border-[#3c4a42] rounded-xl px-4 py-3 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3] transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Fitness Goal */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#d8e3fb]">Primary Fitness Goal</h2>
              <p className="text-sm text-[#bbcabf] mt-1">
                Select your primary objective. This dictates your progressive overload curves and macronutrient splits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'Build Muscle' as FitnessGoal,
                  title: 'Build Muscle',
                  desc: 'Hypertrophy-focused volume training to maximize muscle mass gains.',
                  icon: 'fitness_center',
                },
                {
                  id: 'Lose Fat' as FitnessGoal,
                  title: 'Lose Fat',
                  desc: 'Caloric deficit optimization combined with high-intensity conditioning.',
                  icon: 'local_fire_department',
                },
                {
                  id: 'Build Strength' as FitnessGoal,
                  title: 'Build Strength',
                  desc: 'Heavy compound barbell and dumbbell lifts for absolute mechanical force.',
                  icon: 'bolt',
                },
                {
                  id: 'Maintain Weight' as FitnessGoal,
                  title: 'Maintain Weight',
                  desc: 'Metabolic equilibrium, tone definition, and functional longevity.',
                  icon: 'scale',
                },
                {
                  id: 'General Fitness' as FitnessGoal,
                  title: 'General Fitness',
                  desc: 'Balanced aerobic capacity, mobility, flexibility, and daily stamina.',
                  icon: 'directions_run',
                },
              ].map(g => {
                const isSelected = formData.goal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setFormData({ ...formData, goal: g.id })}
                    className={`cursor-pointer rounded-xl p-5 flex flex-col justify-between transition-all border-2 ${
                      isSelected
                        ? 'border-[#4edea3] bg-[#152031] shadow-lg shadow-[#4edea3]/10'
                        : 'border-transparent bg-[#152031]/80 hover:bg-[#1f2a3c]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[26px]">{g.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-base font-bold text-[#d8e3fb] mb-1">
                        {g.title}
                      </h3>
                      <p className="text-xs text-[#bbcabf] leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Training Experience */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#d8e3fb]">Training Experience</h2>
              <p className="text-sm text-[#bbcabf] mt-1">
                How long have you consistently engaged in structured resistance or cardio training?
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              {[
                {
                  id: 'Beginner' as FitnessExperience,
                  title: 'Beginner (0 - 1 years)',
                  desc: 'New to proper lifting form, gym equipment, or returning after a long hiatus.',
                  icon: 'fitbit_check_small',
                },
                {
                  id: 'Intermediate' as FitnessExperience,
                  title: 'Intermediate (1 - 3 years)',
                  desc: 'Comfortable with compound lifts, exercise technique, and macronutrient tracking.',
                  icon: 'trending_up',
                },
                {
                  id: 'Advanced' as FitnessExperience,
                  title: 'Advanced (3+ years)',
                  desc: 'Deep understanding of RPE, periodization, recovery management, and plateaus.',
                  icon: 'military_tech',
                },
              ].map(exp => {
                const isSelected = formData.experience === exp.id;
                return (
                  <div
                    key={exp.id}
                    onClick={() => setFormData({ ...formData, experience: exp.id })}
                    className={`cursor-pointer rounded-xl p-5 flex items-center justify-between transition-all border-2 ${
                      isSelected
                        ? 'border-[#4edea3] bg-[#152031] shadow-lg shadow-[#4edea3]/10'
                        : 'border-transparent bg-[#152031]/80 hover:bg-[#1f2a3c]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">{exp.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-headline text-sm font-bold text-[#d8e3fb]">
                          {exp.title}
                        </h4>
                        <p className="text-xs text-[#bbcabf] mt-0.5">{exp.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#4edea3] bg-[#4edea3]' : 'border-[#86948a]'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#003824]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Daily Activity Level */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#d8e3fb]">Daily Activity Level</h2>
              <p className="text-sm text-[#bbcabf] mt-1">
                Estimate your baseline movement outside of planned workouts (NEAT).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'Sedentary' as ActivityLevel,
                  title: 'Sedentary',
                  desc: 'Desk job, little to no intentional daily walking or movement (< 5k steps).',
                  icon: 'chair',
                },
                {
                  id: 'Lightly Active' as ActivityLevel,
                  title: 'Lightly Active',
                  desc: 'Some daily walking or light household chores (5k - 8k steps).',
                  icon: 'directions_walk',
                },
                {
                  id: 'Moderately Active' as ActivityLevel,
                  title: 'Moderately Active',
                  desc: 'Active lifestyle with regular daily movement (8k - 12k steps).',
                  icon: 'directions_run',
                },
                {
                  id: 'Very Active' as ActivityLevel,
                  title: 'Very Active',
                  desc: 'Physical job or heavy daily exertion (> 12k steps daily).',
                  icon: 'bolt',
                },
              ].map(act => {
                const isSelected = formData.activityLevel === act.id;
                return (
                  <div
                    key={act.id}
                    onClick={() => setFormData({ ...formData, activityLevel: act.id })}
                    className={`cursor-pointer rounded-xl p-5 flex items-start gap-4 transition-all border-2 ${
                      isSelected
                        ? 'border-[#4edea3] bg-[#152031] shadow-lg shadow-[#4edea3]/10'
                        : 'border-transparent bg-[#152031]/80 hover:bg-[#1f2a3c]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">{act.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-sm font-bold text-[#d8e3fb] mb-1">
                        {act.title}
                      </h3>
                      <p className="text-xs text-[#bbcabf] leading-relaxed">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Workout Preferences */}
        {step === 5 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#d8e3fb]">Workout Preferences</h2>
              <p className="text-sm text-[#bbcabf] mt-1">
                Tell us where you train and how often to design your ideal split.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Training Location */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-[#d8e3fb]">Primary Training Location</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Full Gym' as const, label: 'Full Gym', icon: 'apartment' },
                    { id: 'Home Workout' as const, label: 'Home Workout', icon: 'home' },
                  ].map(loc => {
                    const isSelected = formData.workoutLocation === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setFormData({ ...formData, workoutLocation: loc.id })}
                        className={`cursor-pointer rounded-xl p-4 text-center transition-all border-2 ${
                          isSelected
                            ? 'border-[#4edea3] bg-[#152031]'
                            : 'border-transparent bg-[#152031]/80 hover:bg-[#1f2a3c]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[#4edea3] text-3xl mb-1">
                          {loc.icon}
                        </span>
                        <div className="text-xs font-semibold text-[#d8e3fb]">{loc.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Days Per Week */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-[#d8e3fb]">Days Per Week</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map(d => {
                    const isSelected = formData.workoutDaysPerWeek === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData({ ...formData, workoutDaysPerWeek: d })}
                        className={`py-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                          isSelected
                            ? 'border-[#4edea3] bg-[#4edea3] text-[#003824]'
                            : 'border-transparent bg-[#152031] text-[#d8e3fb] hover:bg-[#1f2a3c]'
                        }`}
                      >
                        {d} Days
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Nutrition Preferences & Dietary Parameters */}
        {step === 6 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#d8e3fb]">
                Nutrition &amp; Dietary Parameters
              </h2>
              <p className="text-sm text-[#bbcabf] mt-1">
                Configure your meal planner parameters to match your dietary ethics, allergies, and lifestyle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#d8e3fb]">Dietary Preference</label>
                <select
                  value={formData.dietPreference}
                  onChange={e => setFormData({ ...formData, dietPreference: e.target.value as DietPreference })}
                  className="bg-[#152031] border border-[#3c4a42] rounded-xl px-4 py-3 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3] transition-colors"
                >
                  <option value="Non-Vegetarian">Non-Vegetarian (Chicken, Fish, Eggs, Veg)</option>
                  <option value="Eggetarian">Eggetarian (Eggs &amp; Vegetarian)</option>
                  <option value="Vegetarian">Vegetarian (Pure Vegetarian / Paneer / Dal)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#d8e3fb]">Weekly Meal Budget</label>
                <select
                  value={formData.weeklyBudget}
                  onChange={e => setFormData({ ...formData, weeklyBudget: e.target.value })}
                  className="bg-[#152031] border border-[#3c4a42] rounded-xl px-4 py-3 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3] transition-colors"
                >
                  <option value="Budget Friendly ($)">Budget Friendly ($ - Lentils, Soya, Eggs, Rice)</option>
                  <option value="Moderate ($$)">Moderate ($$ - Paneer, Chicken Breast, Whey, Curd)</option>
                  <option value="Premium / Organic ($$$)">Premium ($$$ - Salmon, Avocado, Imported Nuts)</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#d8e3fb]">
                  Food Allergies &amp; Intolerances
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Gluten-Free', 'Dairy-Free', 'Peanuts', 'Shellfish', 'Soy', 'Eggs'].map(allergy => {
                    const isSelected = formData.allergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'border-[#4edea3] bg-[#10b981]/20 text-[#4edea3]'
                            : 'border-[#3c4a42] bg-[#152031] text-[#bbcabf] hover:border-[#4edea3]'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1f2a3c]">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`px-5 py-3 rounded-xl bg-[#152031] hover:bg-[#1f2a3c] text-[#d8e3fb] font-semibold text-sm transition-all flex items-center gap-2 border border-[#1f2a3c] ${
              step === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className={`px-7 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${
              step === totalSteps
                ? 'bg-[#9ddf2e] text-[#213600] hover:scale-[1.02] shadow-[#9ddf2e]/20'
                : 'bg-[#4edea3] text-[#003824] hover:bg-[#6ffbbe] hover:scale-[1.02] shadow-[#4edea3]/20'
            }`}
          >
            {step === totalSteps ? (
              <>
                Create My Fitness Plan
                <span className="material-symbols-outlined text-[20px]">check</span>
              </>
            ) : (
              <>
                Next
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
