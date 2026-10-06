import React from 'react';
import { useFitMate } from '../context/FitMateContext';
import { NavigationSection } from '../types';
import { FitoraLogo } from './FitoraLogo';

export const MobileNav: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { currentSection, navigateTo, startWorkout, toggleAIAssistant, t } = useFitMate();

  const navItems: { id: NavigationSection; label: string; icon: string }[] = [
    { id: 'dashboard', label: t('dashboard', 'Dashboard'), icon: 'dashboard' },
    { id: 'daily-plan', label: t('dailyPlan', 'Daily Plan'), icon: 'calendar_today' },
    { id: 'my-health', label: t('myHealth', 'My Health'), icon: 'favorite' },
    { id: 'workout', label: t('workout', 'Workout'), icon: 'fitness_center' },
    { id: 'exercise-library', label: t('exerciseLibrary', 'Exercise Library'), icon: 'menu_book' },
    { id: 'nutrition', label: t('nutrition', 'Nutrition'), icon: 'nutrition' },
    { id: 'analytics', label: t('analytics', 'Analytics'), icon: 'insights' },
    { id: 'progress', label: t('progress', 'Progress'), icon: 'trending_up' },
    { id: 'learn', label: t('learn', 'Learn'), icon: 'school' },
    { id: 'profile', label: t('profile', 'Profile'), icon: 'person' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Persistent on small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#111c2d]/95 backdrop-blur-xl border-t border-[#1f2a3c] z-40 flex items-center justify-around px-2">
        <button
          onClick={() => {
            navigateTo('dashboard');
            onClose();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentSection === 'dashboard' ? 'text-[#4edea3]' : 'text-[#86948a] hover:text-[#d8e3fb]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">{t('dashboard', 'Home')}</span>
        </button>

        <button
          onClick={() => {
            navigateTo('daily-plan');
            onClose();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentSection === 'daily-plan' ? 'text-[#4edea3]' : 'text-[#86948a] hover:text-[#d8e3fb]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">calendar_today</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">{t('dailyPlan', 'Plan')}</span>
        </button>

        <button
          onClick={() => {
            navigateTo('workout');
            onClose();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentSection === 'workout' ? 'text-[#4edea3]' : 'text-[#86948a] hover:text-[#d8e3fb]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">fitness_center</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">{t('workout', 'Workout')}</span>
        </button>

        <button
          onClick={() => {
            navigateTo('nutrition');
            onClose();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentSection === 'nutrition' ? 'text-[#4edea3]' : 'text-[#86948a] hover:text-[#d8e3fb]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">nutrition</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">{t('nutrition', 'Food')}</span>
        </button>

        <button
          onClick={() => {
            navigateTo('analytics');
            onClose();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentSection === 'analytics' ? 'text-[#4edea3]' : 'text-[#86948a] hover:text-[#d8e3fb]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">insights</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">{t('analytics', 'Analytics')}</span>
        </button>

        <button
          onClick={() => {
            navigateTo('profile');
            onClose();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentSection === 'profile' ? 'text-[#4edea3]' : 'text-[#86948a] hover:text-[#d8e3fb]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">{t('profile', 'Profile')}</span>
        </button>
      </div>

      {/* Slide-out Full Mobile Drawer when hamburger clicked */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-72 max-w-[80%] bg-[#111c2d] h-full p-6 flex flex-col z-10 border-r border-[#1f2a3c]">
            {/* Top brand & close */}
            <div className="flex items-center justify-between pb-6 border-b border-[#1f2a3c]">
              <div
                onClick={() => {
                  navigateTo('landing');
                  onClose();
                }}
                className="cursor-pointer"
              >
                <FitoraLogo size="sm" />
              </div>
              <button onClick={onClose} className="p-1 text-[#86948a] hover:text-[#d8e3fb]">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
              {navItems.map(item => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id);
                      onClose();
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                      isActive
                        ? 'bg-[#10b981] text-[#00422b] font-semibold'
                        : 'text-[#bbcabf] hover:bg-[#152031] hover:text-[#d8e3fb]'
                    }`}
                  >
                    <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  navigateTo('landing');
                  onClose();
                }}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  currentSection === 'landing'
                    ? 'bg-[#10b981] text-[#00422b] font-semibold'
                    : 'text-[#bbcabf] hover:bg-[#152031] hover:text-[#d8e3fb]'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">web</span>
                <span>Landing Page</span>
              </button>

              <button
                onClick={() => {
                  toggleAIAssistant(true);
                  onClose();
                }}
                className="flex items-center w-full px-4 py-3 rounded-xl bg-[#152031] text-[#4edea3] border border-[#4edea3]/20 text-sm font-semibold mt-2"
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">smart_toy</span>
                <span>FITORA AI Coach</span>
              </button>
            </nav>

            {/* Start workout button */}
            <div className="pt-4 border-t border-[#1f2a3c]">
              <button
                onClick={() => {
                  startWorkout();
                  onClose();
                }}
                className="w-full bg-[#4edea3] text-[#003824] font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Start Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
