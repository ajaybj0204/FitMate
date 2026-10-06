import React from 'react';
import { useFitMate } from '../context/FitMateContext';
import { FitoraLogo } from '../components/FitoraLogo';

export const LandingSection: React.FC = () => {
  const { navigateTo } = useFitMate();

  return (
    <div className="flex flex-col w-full text-[#d8e3fb] pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pb-16 px-4 sm:px-6 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4edea3]/10 via-transparent to-[#111c2d] pointer-events-none" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f2a3c] w-fit border border-[#3c4a42]/50">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
              <span className="text-[11px] font-bold text-[#4edea3] uppercase tracking-wider">
                FITORA 2.0 • Intelligent Fitness Platform
              </span>
            </div>

            <div className="pt-1">
              <FitoraLogo size="xl" showBadge />
            </div>

            <p className="font-headline text-xl sm:text-2xl font-semibold text-[#98da27] leading-snug">
              Understand your body. Train smarter. Live better.
            </p>

            <p className="text-base sm:text-lg text-[#bbcabf] max-w-xl leading-relaxed">
              Your intelligent personal fitness companion for workouts, nutrition, health calculations, and progress tracking. Built for clarity, scientific precision, and long-term results.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-3">
              <button
                onClick={() => navigateTo('onboarding')}
                className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-sm px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-[#4edea3]/20 flex items-center gap-2"
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <button
                onClick={() => navigateTo('dashboard')}
                className="bg-[#1f2a3c] hover:bg-[#2a3548] text-[#d8e3fb] font-semibold text-sm px-6 py-3.5 rounded-xl border border-[#3c4a42] transition-colors"
              >
                Explore FITORA Dashboard
              </button>

              <button
                onClick={() => navigateTo('exercise-library')}
                className="bg-[#152031] hover:bg-[#1f2a3c] text-[#4edea3] font-semibold text-sm px-5 py-3.5 rounded-xl border border-[#4edea3]/30 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                <span>Exercise Library</span>
              </button>
            </div>

            {/* Quick stats trust points */}
            <div className="flex items-center gap-6 pt-4 border-t border-[#1f2a3c]/60 text-xs text-[#86948a]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">check_circle</span>
                <span>Mifflin-St Jeor Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">check_circle</span>
                <span>Indian Nutrition Database</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">check_circle</span>
                <span>100% Free &amp; Private</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#152031] p-4 sm:p-5 shadow-2xl border border-[#1f2a3c]">
              <div className="absolute -top-3 -right-2 bg-[#10b981] text-[#00422b] font-bold text-xs px-3 py-1 rounded-full shadow-lg">
                Live Preview
              </div>

              <div className="rounded-xl overflow-hidden aspect-video relative bg-[#040e1f] flex items-center justify-center border border-[#1f2a3c]">
                <img
                  className="w-full h-full object-cover"
                  alt="FITORA Dashboard Mockup"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdmNJCzFadejOHGHNZHazcN5wsA6HMJR6FbhfQn59BZ8xTVxKcbPxcChe70GriN0LiDUGCEXNNnRVQtkhtJzIwcSlS55fpScKvTEMXpnHmrTlm1h0piW-dgqWhdcYIg2V90PvYslXcKC3ymU92iSlQqeXyOadhRmszY_E8eHAaKYXoMrQNiLJZgV7Hv5sBvjDvDm6gilJntDAg_LlTC2ApkQAAQ4lGsv2N_YOz5zdg6FqKydh116c9PQ"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4edea3]">fitness_center</span>
                  <span className="text-xs font-semibold text-[#d8e3fb]">Daily Workout Streak: 14 Days</span>
                </div>
                <span className="text-xs font-bold text-[#98da27]">98% Goal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] mb-2.5">
            Everything you need to understand and improve your fitness — in one place.
          </h2>
          <p className="text-sm sm:text-base text-[#bbcabf]">
            Built for high-performance training and modern wellness tracking, delivering an immersive experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div
            onClick={() => navigateTo('onboarding')}
            className="bg-[#152031] hover:bg-[#1f2a3c] border border-[#1f2a3c] rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[26px]">person</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors">
              Personalized Fitness
            </h3>
            <p className="text-sm text-[#bbcabf] leading-relaxed">
              Customized routines tailored specifically to your body type, goals, and training experience.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigateTo('my-health')}
            className="bg-[#152031] hover:bg-[#1f2a3c] border border-[#1f2a3c] rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[26px]">calculate</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors">
              Smart Health Calculations
            </h3>
            <p className="text-sm text-[#bbcabf] leading-relaxed">
              Instant BMI, BMR, body fat percentage, and macro targets computed with clinical precision.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigateTo('workout')}
            className="bg-[#152031] hover:bg-[#1f2a3c] border border-[#1f2a3c] rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[26px]">fitness_center</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors">
              Workout Plans
            </h3>
            <p className="text-sm text-[#bbcabf] leading-relaxed">
              Extensive library of strength, cardio, HIIT, and flexibility routines with clear instructions.
            </p>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => navigateTo('nutrition')}
            className="bg-[#152031] hover:bg-[#1f2a3c] border border-[#1f2a3c] rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[26px]">nutrition</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors">
              Nutrition Guidance
            </h3>
            <p className="text-sm text-[#bbcabf] leading-relaxed">
              Clean meal plans, calorie counting, and macro breakdowns designed to fuel your performance with Indian options.
            </p>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => navigateTo('progress')}
            className="bg-[#152031] hover:bg-[#1f2a3c] border border-[#1f2a3c] rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[26px]">trending_up</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors">
              Progress Tracking
            </h3>
            <p className="text-sm text-[#bbcabf] leading-relaxed">
              Visual charts and biometric logs that record your strength gains, weight fluctuations, and milestones.
            </p>
          </div>

          {/* Card 6 */}
          <div
            onClick={() => navigateTo('learn')}
            className="bg-[#152031] hover:bg-[#1f2a3c] border border-[#1f2a3c] rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[26px]">school</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors">
              Beginner-Friendly Learning
            </h3>
            <p className="text-sm text-[#bbcabf] leading-relaxed">
              Expert guides breaking down complex physiological concepts into simple, intuitive steps.
            </p>
          </div>
        </div>
      </section>

      {/* Footer & Disclaimer */}
      <footer className="mt-8 bg-[#111c2d] py-8 px-6 rounded-2xl max-w-6xl mx-auto w-full border border-[#1f2a3c]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <FitoraLogo size="sm" />
            <span className="text-xs text-[#86948a]">© 2026 FITORA. All rights reserved.</span>
          </div>

          <div className="max-w-md text-center md:text-right">
            <p className="text-xs text-[#86948a] leading-relaxed">
              <strong className="text-[#bbcabf]">Health Disclaimer:</strong> FITORA provides general fitness and nutrition information for educational purposes only and is not a substitute for professional medical advice. Always consult a physician before beginning any new exercise or dietary regimen.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
