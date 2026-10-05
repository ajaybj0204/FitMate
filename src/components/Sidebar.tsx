import React from 'react';
import { useFitMate } from '../context/FitMateContext';
import { NavigationSection } from '../types';

export const Sidebar: React.FC = () => {
  const { currentSection, navigateTo, startWorkout, toggleAIAssistant } = useFitMate();

  const navItems: { id: NavigationSection; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'my-health', label: 'My Health', icon: 'favorite' },
    { id: 'workout', label: 'Workout', icon: 'fitness_center' },
    { id: 'nutrition', label: 'Nutrition', icon: 'nutrition' },
    { id: 'progress', label: 'Progress', icon: 'trending_up' },
    { id: 'learn', label: 'Learn', icon: 'school' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#111c2d] z-50 hidden lg:flex flex-col pt-8 pb-8 border-r border-[#1f2a3c]">
      {/* Brand Logo & Name */}
      <div 
        onClick={() => navigateTo('landing')}
        className="px-6 mb-8 flex items-center gap-3 cursor-pointer group select-none"
      >
        <img
          alt="FitMate Logo"
          className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5qefloapqs6OpQdjHAKGt9VjTICuAN5kXtI0BJM7ENK4W-xQmuGmftLk0RL3QHx7kbDENREWwPMyroOuMRNRL5jQ0kj0nj3FfmFN1eys5icCugKtKa-pz4GzccD_A4CJwc2JVgLdmEtk7T7O6CCre5bhtA6NS79WOII89nkwROV5Aqy3A6CuuDtpIVwpDCWdojp2r_0ST81zX9j-BUIdr-9Zf3LhAdNThH8gdtV8WULglSNv3sTclPg"
        />
        <div className="flex flex-col">
          <span className="font-headline text-2xl font-bold tracking-tight text-[#4edea3]">
            FitMate
          </span>
          <span className="text-[10px] text-[#86948a] font-medium tracking-widest uppercase">
            Personal Companion
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex items-center w-full px-5 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                isActive
                  ? 'bg-[#10b981] text-[#00422b] font-semibold shadow-md shadow-[#10b981]/20'
                  : 'text-[#bbcabf] hover:bg-[#1f2a3c] hover:text-[#d8e3fb]'
              }`}
            >
              <span className={`material-symbols-outlined mr-3 text-[22px] ${isActive ? 'text-[#00422b]' : 'text-[#86948a]'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* AI Assistant Quick Trigger */}
        <div className="pt-3 border-t border-[#1f2a3c]/60 mt-2">
          <button
            onClick={() => toggleAIAssistant(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#152031] hover:bg-[#1f2a3c] text-[#4edea3] border border-[#4edea3]/20 transition-all text-xs font-semibold group"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4edea3] group-hover:rotate-12 transition-transform">
                smart_toy
              </span>
              FitMate AI Assistant
            </span>
            <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              Ready
            </span>
          </button>
        </div>
      </nav>

      {/* Bottom CTA Button */}
      <div className="px-6 mt-auto flex flex-col gap-3">
        <button
          onClick={() => startWorkout()}
          className="w-full bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-semibold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#4edea3]/20"
        >
          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
          Start Workout
        </button>

        <button
          onClick={() => navigateTo('landing')}
          className="text-xs text-[#86948a] hover:text-[#d8e3fb] text-center transition-colors py-1"
        >
          View Landing Page
        </button>
      </div>
    </aside>
  );
};
