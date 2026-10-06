/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FitMateProvider, useFitMate } from './context/FitMateContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Toast } from './components/Toast';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { WorkoutActiveModal } from './components/WorkoutActiveModal';

import { LandingSection } from './sections/LandingSection';
import { OnboardingSection } from './sections/OnboardingSection';
import { DashboardSection } from './sections/DashboardSection';
import { MyHealthSection } from './sections/MyHealthSection';
import { WorkoutSection } from './sections/WorkoutSection';
import { DailyPlanSection } from './sections/DailyPlanSection';
import { NutritionSection } from './sections/NutritionSection';
import { AnalyticsSection } from './sections/AnalyticsSection';
import { ProgressSection } from './sections/ProgressSection';
import { LearnSection } from './sections/LearnSection';
import { ExerciseLibrarySection } from './sections/ExerciseLibrarySection';
import { ProfileSection } from './sections/ProfileSection';
import { SmartRemindersModal } from './components/SmartRemindersModal';
import { SmartGroceryListModal } from './components/SmartGroceryListModal';

const MainAppContent: React.FC = () => {
  const { currentSection, navigateTo } = useFitMate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [learnInitialTopic, setLearnInitialTopic] = useState<string | null>(null);

  const handleOpenLearnModal = (topicId: string) => {
    setLearnInitialTopic(topicId);
    navigateTo('learn');
  };

  return (
    <div className="min-h-screen bg-[#081425] text-[#d8e3fb] flex flex-col font-sans selection:bg-[#4edea3]/30 selection:text-white">
      {/* Desktop Sidebar (hidden on mobile, visible on lg) */}
      <Sidebar />

      {/* Top Header (persistent on all views) */}
      <Header onMobileMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Viewport Content Area */}
      <div className="flex-1 lg:pl-72 pt-20 pb-20 lg:pb-8 flex flex-col">
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {currentSection === 'landing' && <LandingSection />}
          {currentSection === 'onboarding' && <OnboardingSection />}
          {currentSection === 'dashboard' && <DashboardSection />}
          {currentSection === 'my-health' && (
            <MyHealthSection onOpenLearnModal={handleOpenLearnModal} />
          )}
          {currentSection === 'workout' && <WorkoutSection />}
          {currentSection === 'exercise-library' && <ExerciseLibrarySection />}
          {currentSection === 'daily-plan' && <DailyPlanSection />}
          {currentSection === 'nutrition' && <NutritionSection />}
          {currentSection === 'analytics' && <AnalyticsSection />}
          {currentSection === 'progress' && <ProgressSection />}
          {currentSection === 'learn' && (
            <LearnSection initialTopicId={learnInitialTopic} />
          )}
          {currentSection === 'profile' && <ProfileSection />}
        </main>
      </div>

      {/* Global Modals & Interactive Overlays */}
      <WorkoutActiveModal />
      <SmartRemindersModal />
      <SmartGroceryListModal />
      <AIAssistantDrawer />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <FitMateProvider>
      <MainAppContent />
    </FitMateProvider>
  );
}
