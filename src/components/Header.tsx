import React, { useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC<{ onMobileMenuClick?: () => void }> = ({ onMobileMenuClick }) => {
  const {
    currentSection,
    navigateTo,
    goBack,
    canGoBack,
    currentLanguage,
    setLanguage,
    t,
    userProfile,
    searchQuery,
    setSearchQuery,
    toggleAIAssistant,
    setIsRemindersModalOpen,
    hydrationMl,
    addWaterMl,
  } = useFitMate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Workout Scheduled Today',
      desc: 'Monday Push (Chest & Triceps) is ready for you.',
      time: '15m ago',
      unread: true,
      icon: 'fitness_center',
    },
    {
      id: 2,
      title: 'Hydration Target Milestone',
      desc: `Logged ${(hydrationMl / 1000).toFixed(1)}L water today! Consistent cellular hydration.`,
      time: '2h ago',
      unread: false,
      icon: 'water_drop',
    },
    {
      id: 3,
      title: `Streak Record: ${userProfile.streakDays} Days 🔥`,
      desc: 'You are in the top 5% of consistent athletes this month.',
      time: 'Yesterday',
      unread: false,
      icon: 'local_fire_department',
    },
  ];

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#081425]/90 backdrop-blur-xl z-40 flex items-center justify-between px-3 sm:px-8 border-b border-[#1f2a3c]">
      {/* Left: Back Button & Mobile Menu & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 text-[#bbcabf] hover:text-[#d8e3fb] rounded-lg bg-[#152031] border border-[#1f2a3c]"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* In-app Back Navigation Button */}
        {canGoBack && (
          <button
            onClick={goBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#152031] hover:bg-[#1f2a3c] text-[#bbcabf] hover:text-[#d8e3fb] border border-[#1f2a3c] text-xs font-semibold transition-all shrink-0"
            title="Navigate back to previous section"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">{t('back', 'Back')}</span>
          </button>
        )}

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a] text-[18px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#152031] border border-[#3c4a42]/60 rounded-xl pl-9 pr-7 py-2 text-[#d8e3fb] text-xs sm:text-sm placeholder-[#86948a] focus:outline-none focus:border-[#4edea3] transition-colors"
            placeholder="Search workouts, meals, guides..."
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86948a] hover:text-[#d8e3fb]"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 relative">
        {/* Quick Hydration Tap */}
        <button
          onClick={() => addWaterMl(250)}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#152031] hover:bg-[#1f2a3c] text-[#4edea3] border border-[#1f2a3c] text-xs font-medium transition-all"
          title="Quick log 250ml water"
        >
          <span className="material-symbols-outlined text-[16px]">water_drop</span>
          <span className="font-bold">+250ml</span>
        </button>

        {/* Multilingual Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLanguageMenuOpen(prev => !prev)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#152031] hover:bg-[#1f2a3c] text-[#d8e3fb] border border-[#1f2a3c] text-xs font-semibold transition-all"
            title="Switch Language / ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">translate</span>
            <span className="font-headline">{currentLangObj.nativeName}</span>
            <span className="material-symbols-outlined text-[16px] text-[#86948a]">expand_more</span>
          </button>

          {isLanguageMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsLanguageMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-[#152031] rounded-2xl border border-[#1f2a3c] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#86948a] tracking-wider border-b border-[#1f2a3c] mb-1">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-[#4edea3]/20 text-[#4edea3] font-bold'
                        : 'text-[#d8e3fb] hover:bg-[#1f2a3c]'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-[#86948a] uppercase">{lang.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Smart Reminders Quick Button */}
        <button
          onClick={() => setIsRemindersModalOpen(true)}
          className="hidden sm:flex p-2 text-[#bbcabf] hover:text-[#d8e3fb] rounded-xl hover:bg-[#152031] transition-colors"
          title="Smart Fitness Reminders"
        >
          <span className="material-symbols-outlined text-[20px]">alarm</span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton compact />

        {/* AI Assistant Button */}
        <button
          onClick={() => toggleAIAssistant(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#152031] border border-[#4edea3]/30 text-[#4edea3] hover:bg-[#1f2a3c] text-xs font-semibold transition-all shadow-sm"
          title="Open FITORA AI Coach"
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="relative p-2 text-[#bbcabf] hover:text-[#d8e3fb] rounded-xl hover:bg-[#152031] transition-colors"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4edea3] rounded-full ring-2 ring-[#081425]"></span>
          </button>

          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#152031] rounded-2xl border border-[#1f2a3c] shadow-2xl p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2a3c]">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-semibold text-sm text-[#d8e3fb]">Notifications</span>
                    <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] font-bold px-1.5 py-0.5 rounded">1 New</span>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[#86948a] hover:text-[#d8e3fb]"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="divide-y divide-[#1f2a3c]/60 max-h-72 overflow-y-auto mt-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 flex items-start gap-3 hover:bg-[#1f2a3c]/50 rounded-xl transition-colors cursor-pointer ${
                        n.unread ? 'bg-[#1f2a3c]/20' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-[#d8e3fb]">{n.title}</h4>
                          <span className="text-[10px] text-[#86948a]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#bbcabf] mt-0.5">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#1f2a3c] mt-2 text-center">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigateTo('daily-plan');
                    }}
                    className="text-xs text-[#4edea3] hover:underline font-medium"
                  >
                    View Daily Performance Plan →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Badge */}
        <div
          onClick={() => navigateTo('profile')}
          className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-[#152031] transition-colors group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#4edea3]/40 shadow-sm relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcoQbNT5W3T6QG7ZBQOA2FE7_zwK7MNUOcYJb2mT_4KbUp1bzpcqalyKcpKzobaym_xYhW_GKmUD3m01w91D4Dx57_8yqow0Ncn9XHu9vjWLyU-sMcmemXlizh43Hfg1ZfJaCGifXc4NI2KOdDBKzbGXjZ4IUsDe8--Qgt_pTp7VHzW7vKJB6gz_DoEKGmleBaw_OGY6vGOYhqIN5AkvMxucWI_E7c9nUcp7ubGZq9rpZCi27mz6JrLQ"
              alt="Alex Rivera"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors leading-none">
              {userProfile.name}
            </span>
            <span className="text-[10px] text-[#86948a] leading-tight mt-0.5">
              {userProfile.streakDays}d Streak 🔥
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
