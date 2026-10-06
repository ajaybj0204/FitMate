import React, { useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { DietPreference, FitnessExperience, FitnessGoal } from '../types';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n/translations';

export const ProfileSection: React.FC = () => {
  const { userProfile, updateProfile, resetAllData, currentLanguage, setLanguage, t } = useFitMate();

  // Modals
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUpdateMeasurementsModalOpen, setIsUpdateMeasurementsModalOpen] = useState(false);
  const [isUpdateGoalModalOpen, setIsUpdateGoalModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editAge, setEditAge] = useState(userProfile.age);
  const [editExperience, setEditExperience] = useState<FitnessExperience>(userProfile.experience);

  // Measurements Form State
  const [editHeight, setEditHeight] = useState(userProfile.heightCm);
  const [editWeight, setEditWeight] = useState(userProfile.weightKg);

  // Goal Form State
  const [editGoal, setEditGoal] = useState<FitnessGoal>(userProfile.goal);
  const [editDiet, setEditDiet] = useState<DietPreference>(userProfile.dietPreference);

  // Convert height cm to feet/inches string for display
  const totalInches = Math.round(userProfile.heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      email: editEmail,
      age: editAge,
      experience: editExperience,
    });
    setIsEditProfileModalOpen(false);
  };

  const handleSaveMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      heightCm: editHeight,
      weightKg: editWeight,
    });
    setIsUpdateMeasurementsModalOpen(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      goal: editGoal,
      dietPreference: editDiet,
    });
    setIsUpdateGoalModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header and Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#4edea3] font-bold">
            {t('accountSettings', 'Account Settings')}
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb] mt-0.5">
            {t('profile', 'My Profile')}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setEditName(userProfile.name);
              setEditEmail(userProfile.email);
              setEditAge(userProfile.age);
              setEditExperience(userProfile.experience);
              setIsEditProfileModalOpen(true);
            }}
            className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md shadow-[#4edea3]/20"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            {t('editProfile', 'Edit Profile')}
          </button>

          <button
            onClick={() => {
              setEditHeight(userProfile.heightCm);
              setEditWeight(userProfile.weightKg);
              setIsUpdateMeasurementsModalOpen(true);
            }}
            className="bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center gap-2 border border-[#3c4a42] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">straighten</span>
            {t('updateMeasurements', 'Update Measurements')}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column 4 cols / Right Column 8 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Account Actions & Language Settings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-[#111c2d] rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xl relative overflow-hidden border border-[#1f2a3c]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4edea3]/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative mb-5">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#4edea3]/30 shadow-2xl bg-[#152031]">
                <img
                  className="w-full h-full object-cover"
                  alt={userProfile.name}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcoQbNT5W3T6QG7ZBQOA2FE7_zwK7MNUOcYJb2mT_4KbUp1bzpcqalyKcpKzobaym_xYhW_GKmUD3m01w91D4Dx57_8yqow0Ncn9XHu9vjWLyU-sMcmemXlizh43Hfg1ZfJaCGifXc4NI2KOdDBKzbGXjZ4IUsDe8--Qgt_pTp7VHzW7vKJB6gz_DoEKGmleBaw_OGY6vGOYhqIN5AkvMxucWI_E7c9nUcp7ubGZq9rpZCi27mz6JrLQ"
                />
              </div>
              <span className="absolute bottom-1 right-1 bg-[#4edea3] text-[#003824] p-1.5 rounded-full shadow-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </span>
            </div>

            <h2 className="font-headline text-2xl font-bold text-[#d8e3fb] mb-1">
              {userProfile.name}
            </h2>
            <p className="text-xs text-[#86948a] mb-6">{userProfile.email}</p>

            <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-[#1f2a3c]">
              <div className="bg-[#152031] p-3 rounded-xl text-center border border-[#1f2a3c]">
                <span className="text-[10px] text-[#86948a] block uppercase font-semibold mb-1">
                  {t('memberSince', 'Member Since')}
                </span>
                <span className="font-headline text-sm font-bold text-[#d8e3fb]">
                  {userProfile.memberSince}
                </span>
              </div>

              <div className="bg-[#152031] p-3 rounded-xl text-center border border-[#1f2a3c]">
                <span className="text-[10px] text-[#86948a] block uppercase font-semibold mb-1">
                  {t('activeStreak', 'Active Streak')}
                </span>
                <span className="font-headline text-sm font-bold text-[#4edea3] flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[#ffb3af] text-[18px]">
                    local_fire_department
                  </span>
                  {userProfile.streakDays} Days
                </span>
              </div>
            </div>
          </div>

          {/* Language Preference Settings Card */}
          <div className="bg-[#111c2d] rounded-2xl p-6 flex flex-col shadow-xl border border-[#1f2a3c] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-[22px]">translate</span>
                <h3 className="font-headline text-base font-bold text-[#d8e3fb]">
                  {t('languagePreference', 'Language Preference')}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#10b981]/20 text-[#4edea3] rounded-full border border-[#4edea3]/30">
                {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.nativeName}
              </span>
            </div>

            <p className="text-xs text-[#86948a] mb-4 leading-relaxed">
              {t(
                'languageSubtitle',
                'Select your preferred language. All metrics, workouts, recipes, and academy guides will instantly adapt and persist across sessions.'
              )}
            </p>

            {/* Native Styled Dropdown */}
            <div className="relative mb-3">
              <label htmlFor="profile-language-dropdown" className="text-[11px] font-semibold text-[#bbcabf] block mb-1">
                {t('languageActive', 'Active Language')}
              </label>
              <div className="relative">
                <select
                  id="profile-language-dropdown"
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full bg-[#152031] hover:bg-[#1f2a3c] border border-[#3c4a42] text-[#d8e3fb] font-semibold text-xs sm:text-sm rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-[#4edea3] transition-all cursor-pointer pr-10"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-[#111c2d] text-[#d8e3fb] py-1.5">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#4edea3]">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Quick 1-tap language switch buttons */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1f2a3c]/60">
              {SUPPORTED_LANGUAGES.map(lang => {
                const isActive = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-[#10b981]/20 border border-[#4edea3] text-[#4edea3] font-bold shadow-sm'
                        : 'bg-[#152031] hover:bg-[#1f2a3c] text-[#bbcabf] hover:text-[#d8e3fb] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{lang.nativeName}</span>
                      <span className="text-[10px] text-[#86948a]">({lang.name})</span>
                    </span>
                    {isActive && (
                      <span className="material-symbols-outlined text-[16px] text-[#4edea3]">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 pt-3 mt-1 border-t border-[#1f2a3c]/60 text-[10px] text-[#86948a]">
              <span className="material-symbols-outlined text-[#4edea3] text-[14px]">save</span>
              <span>Saved in FITORA Context (localStorage: fitmate_lang_v1)</span>
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="bg-[#111c2d] rounded-2xl p-6 flex flex-col shadow-xl border border-[#1f2a3c]">
            <h3 className="font-headline text-base font-bold text-[#d8e3fb] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3] text-[20px]">security</span>
              {t('accountSettings', 'Account Actions')}
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setEditGoal(userProfile.goal);
                  setEditDiet(userProfile.dietPreference);
                  setIsUpdateGoalModalOpen(true);
                }}
                className="w-full bg-[#152031] hover:bg-[#1f2a3c] text-[#d8e3fb] py-3 px-4 rounded-xl flex items-center justify-between transition-all border border-[#1f2a3c] text-xs font-semibold group"
              >
                <span className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#98da27] text-[18px]">flag</span>
                  Update Fitness Goal
                </span>
                <span className="material-symbols-outlined text-[#86948a] group-hover:text-[#4edea3] transition-colors text-[18px]">
                  chevron_right
                </span>
              </button>

              <button
                onClick={() => setIsResetConfirmModalOpen(true)}
                className="w-full bg-[#93000a]/15 hover:bg-[#93000a]/25 text-[#ffb4ab] py-3 px-4 rounded-xl flex items-center justify-between transition-all border border-[#93000a]/30 text-xs font-semibold"
              >
                <span className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">restart_alt</span>
                  {t('resetData', 'Reset All Local Data')}
                </span>
                <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Biometrics & Training Parameters */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Core Biometrics Card */}
          <div className="bg-[#111c2d] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#1f2a3c]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4edea3]/5 via-transparent to-transparent pointer-events-none" />

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl font-bold text-[#d8e3fb] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#4edea3] text-[24px]">badge</span>
                {t('coreBiometrics', 'Core Biometrics')}
              </h3>
              <span className="text-[11px] font-bold px-3 py-1 bg-[#10b981]/20 text-[#4edea3] rounded-full">
                Active Metrics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#152031] p-5 rounded-xl flex flex-col justify-between border border-[#1f2a3c]">
                <span className="text-[#86948a] text-[11px] font-bold uppercase tracking-wider mb-2">
                  Age
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline text-3xl font-bold text-[#d8e3fb] tabular-nums">
                    {userProfile.age}
                  </span>
                  <span className="text-xs text-[#86948a]">Years old</span>
                </div>
              </div>

              <div className="bg-[#152031] p-5 rounded-xl flex flex-col justify-between border border-[#1f2a3c]">
                <span className="text-[#86948a] text-[11px] font-bold uppercase tracking-wider mb-2">
                  Height
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline text-3xl font-bold text-[#d8e3fb] tabular-nums">
                    {userProfile.heightCm}
                  </span>
                  <span className="text-xs text-[#86948a]">cm ({feet}'{inches}")</span>
                </div>
              </div>

              <div className="bg-[#152031] p-5 rounded-xl flex flex-col justify-between border border-[#1f2a3c]">
                <span className="text-[#86948a] text-[11px] font-bold uppercase tracking-wider mb-2">
                  {t('weight', 'Weight')}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline text-3xl font-bold text-[#d8e3fb] tabular-nums">
                    {userProfile.weightKg}
                  </span>
                  <span className="text-xs text-[#86948a]">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Training & Lifestyle Parameters Card */}
          <div className="bg-[#111c2d] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#1f2a3c]">
            <h3 className="font-headline text-xl font-bold text-[#d8e3fb] mb-6 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#4edea3] text-[24px]">tune</span>
              {t('trainingParameters', 'Training & Lifestyle Parameters')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Goal */}
              <div className="bg-[#152031] p-5 rounded-xl flex items-start gap-4 border border-[#1f2a3c]">
                <div className="p-3 bg-[#10b981]/15 rounded-xl text-[#4edea3] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">track_changes</span>
                </div>
                <div>
                  <span className="text-[#86948a] text-[10px] font-bold uppercase tracking-wider block mb-1">
                    {t('primaryGoal', 'Primary Goal')}
                  </span>
                  <span className="font-headline text-base font-bold text-[#d8e3fb] block mb-1">
                    {userProfile.goal}
                  </span>
                  <span className="text-xs text-[#bbcabf] leading-relaxed">
                    Targeting lean muscle accretion and structural strength over progressive cycles.
                  </span>
                </div>
              </div>

              {/* Fitness Level */}
              <div className="bg-[#152031] p-5 rounded-xl flex items-start gap-4 border border-[#1f2a3c]">
                <div className="p-3 bg-[#10b981]/15 rounded-xl text-[#4edea3] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">bolt</span>
                </div>
                <div>
                  <span className="text-[#86948a] text-[10px] font-bold uppercase tracking-wider block mb-1">
                    {t('fitnessLevel', 'Fitness Level')}
                  </span>
                  <span className="font-headline text-base font-bold text-[#d8e3fb] block mb-1">
                    {userProfile.experience}
                  </span>
                  <span className="text-xs text-[#bbcabf] leading-relaxed">
                    Consistent training history with solid technique foundation in compound lifts.
                  </span>
                </div>
              </div>

              {/* Activity Level */}
              <div className="bg-[#152031] p-5 rounded-xl flex items-start gap-4 border border-[#1f2a3c]">
                <div className="p-3 bg-[#10b981]/15 rounded-xl text-[#4edea3] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">directions_run</span>
                </div>
                <div>
                  <span className="text-[#86948a] text-[10px] font-bold uppercase tracking-wider block mb-1">
                    {t('activityLevel', 'Activity Level')}
                  </span>
                  <span className="font-headline text-base font-bold text-[#d8e3fb] block mb-1">
                    {userProfile.activityLevel}
                  </span>
                  <span className="text-xs text-[#bbcabf] leading-relaxed">
                    Trains {userProfile.workoutDaysPerWeek} times per week with high non-exercise step counts.
                  </span>
                </div>
              </div>

              {/* Nutrition Preference */}
              <div className="bg-[#152031] p-5 rounded-xl flex items-start gap-4 border border-[#1f2a3c]">
                <div className="p-3 bg-[#10b981]/15 rounded-xl text-[#4edea3] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">nutrition</span>
                </div>
                <div>
                  <span className="text-[#86948a] text-[10px] font-bold uppercase tracking-wider block mb-1">
                    {t('dietPreference', 'Nutrition Preference')}
                  </span>
                  <span className="font-headline text-base font-bold text-[#d8e3fb] block mb-1">
                    {userProfile.dietPreference}
                  </span>
                  <span className="text-xs text-[#bbcabf] leading-relaxed">
                    Targeting clean protein density with balanced complex carbohydrates and micronutrients.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#152031] w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#1f2a3c] my-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">
                Edit Profile Details
              </h3>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="text-[#86948a] hover:text-[#d8e3fb]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Age</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={e => setEditAge(Number(e.target.value) || 28)}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Fitness Level</label>
                  <select
                    value={editExperience}
                    onChange={e => setEditExperience(e.target.value as FitnessExperience)}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1f2a3c]">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold hover:bg-[#6ffbbe]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Measurements Modal */}
      {isUpdateMeasurementsModalOpen && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#152031] w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#1f2a3c] my-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">
                Update Measurements
              </h3>
              <button
                onClick={() => setIsUpdateMeasurementsModalOpen(false)}
                className="text-[#86948a] hover:text-[#d8e3fb]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMeasurements} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Height (cm)</label>
                <input
                  type="number"
                  required
                  value={editHeight}
                  onChange={e => setEditHeight(Number(e.target.value) || 178)}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editWeight}
                  onChange={e => setEditWeight(Number(e.target.value) || 72)}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <p className="text-xs text-[#86948a] italic">
                Note: Updating weight and height will automatically recalculate your BMI, BMR, TDEE, protein targets, and daily calorie targets across FITORA.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1f2a3c]">
                <button
                  type="button"
                  onClick={() => setIsUpdateMeasurementsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold hover:bg-[#6ffbbe]"
                >
                  Update &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Goal Modal */}
      {isUpdateGoalModalOpen && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#152031] w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#1f2a3c] my-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">
                Update Fitness Goal
              </h3>
              <button
                onClick={() => setIsUpdateGoalModalOpen(false)}
                className="text-[#86948a] hover:text-[#d8e3fb]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">Primary Goal</label>
                <select
                  value={editGoal}
                  onChange={e => setEditGoal(e.target.value as FitnessGoal)}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                >
                  <option value="Build Muscle">Build Muscle (+10% caloric surplus, high hypertrophy)</option>
                  <option value="Lose Fat">Lose Fat (-20% caloric deficit, muscle preservation)</option>
                  <option value="Build Strength">Build Strength (progressive load compound lifting)</option>
                  <option value="Maintain Weight">Maintain Weight (metabolic equilibrium)</option>
                  <option value="General Fitness">General Fitness (cardiovascular &amp; mobility)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">
                  Nutrition Preference
                </label>
                <select
                  value={editDiet}
                  onChange={e => setEditDiet(e.target.value as DietPreference)}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                >
                  <option value="Non-Vegetarian">Non-Vegetarian (Chicken, Fish, Eggs &amp; Veg)</option>
                  <option value="Eggetarian">Eggetarian (Eggs &amp; Vegetarian)</option>
                  <option value="Vegetarian">Vegetarian (Paneer, Dal, Soya Chunks)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1f2a3c]">
                <button
                  type="button"
                  onClick={() => setIsUpdateGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold hover:bg-[#6ffbbe]"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#152031] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#93000a]/40 my-auto text-center">
            <div className="w-12 h-12 rounded-full bg-[#93000a]/20 text-[#ffb4ab] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>

            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] mb-1">
              Reset All Local Data?
            </h3>
            <p className="text-xs text-[#bbcabf] mb-6">
              This will restore all profile settings, logged workouts, meals, and progress records back to initial FITORA defaults. This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold border border-[#1f2a3c]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#93000a] text-white text-xs font-bold hover:bg-[#ffb4ab] hover:text-[#690005] transition-colors"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
