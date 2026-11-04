import React, { useEffect, useMemo, useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { loadExerciseDb, type DbExercise } from '../data/exerciseDb';
import { generatePlan } from '../lib/planGenerator';
import type { UserProfile } from '../types';

const GOALS: UserProfile['goal'][] = ['Build Muscle', 'Build Strength', 'Lose Fat', 'General Fitness', 'Maintain Weight'];
const LEVELS: UserProfile['experience'][] = ['Beginner', 'Intermediate', 'Advanced'];

/** "Build my plan": a weekly plan from days per week, gym/home, goal and experience. */
export const PlanBuilderModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userProfile, updateProfile, replaceSchedule } = useFitMate();
  const [db, setDb] = useState<DbExercise[] | null>(null);
  const [days, setDays] = useState(Math.min(6, Math.max(2, userProfile.workoutDaysPerWeek || 3)));
  const [location, setLocation] = useState<UserProfile['workoutLocation']>(userProfile.workoutLocation);
  const [goal, setGoal] = useState<UserProfile['goal']>(userProfile.goal);
  const [experience, setExperience] = useState<UserProfile['experience']>(userProfile.experience);

  useEffect(() => {
    loadExerciseDb().then(setDb).catch(() => setDb([]));
  }, []);

  const plan = useMemo(() => (db && db.length ? generatePlan(db, { workoutDaysPerWeek: days, workoutLocation: location, goal, experience }) : null), [db, days, location, goal, experience]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${active ? 'bg-[#4edea3] text-[#003824] border-[#4edea3]' : 'bg-[#111c2d] text-[#bbcabf] border-[#1f2a3c] hover:border-[#4edea3]/50'}`;

  return (
    <div className="fixed inset-0 z-[70] bg-[#060c16]/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Build my plan">
      <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] w-full max-w-2xl p-5 sm:p-6 my-auto shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">Build my weekly plan</h3>
            <p className="text-xs text-[#86948a] mt-0.5">Pick what fits your week. Your workout history and suggestions are kept.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-[#86948a] hover:text-white hover:bg-[#1f2a3c]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <Row label="Days per week">
            {[2, 3, 4, 5, 6].map((d) => <button key={d} className={chip(days === d)} onClick={() => setDays(d)}>{d}</button>)}
          </Row>
          <Row label="Where">
            {(['Full Gym', 'Home Workout'] as const).map((l) => <button key={l} className={chip(location === l)} onClick={() => setLocation(l)}>{l === 'Full Gym' ? 'Gym' : 'Home (dumbbells)'}</button>)}
          </Row>
          <Row label="Goal">
            {GOALS.map((g) => <button key={g} className={chip(goal === g)} onClick={() => setGoal(g)}>{g}</button>)}
          </Row>
          <Row label="Experience">
            {LEVELS.map((x) => <button key={x} className={chip(experience === x)} onClick={() => setExperience(x)}>{x}</button>)}
          </Row>
        </div>

        <div className="mt-4 bg-[#0b1420] rounded-xl border border-[#1f2a3c] p-3.5 max-h-[40vh] overflow-y-auto">
          {!plan ? (
            <div className="h-24 animate-pulse" />
          ) : (
            <>
              <p className="text-xs text-[#4edea3] font-semibold mb-2">{plan.summary}</p>
              {plan.days.filter((d) => !d.isRest).map((d) => (
                <div key={d.id} className="py-2 border-b border-[#1f2a3c] last:border-0">
                  <div className="text-sm font-bold text-[#d8e3fb]">{d.dayName}: {d.splitName} <span className="text-[11px] text-[#86948a] font-normal">· ~{d.durationMinutes} min</span></div>
                  <div className="text-[11px] text-[#bbcabf] mt-0.5">{d.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(' · ')}</div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-sm font-semibold border border-[#1f2a3c]">Keep current plan</button>
          <button
            disabled={!plan}
            onClick={() => {
              if (!plan) return;
              replaceSchedule(plan.days);
              updateProfile({ workoutDaysPerWeek: days, workoutLocation: location, goal, experience });
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-sm font-bold disabled:opacity-40"
          >
            Use this plan
          </button>
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-[11px] font-bold uppercase tracking-wider text-[#86948a] mb-1.5">{label}</div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);
