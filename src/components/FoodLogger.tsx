import React, { useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { useAuth } from '../context/AuthContext';
import { estimateFood, type FoodEstimate } from '../lib/coachApi';
import type { Meal } from '../types';

const MEAL_TYPES: Meal['mealType'][] = ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Pre-workout', 'Post-workout'];

const guessMealType = (): Meal['mealType'] => {
  const h = new Date().getHours();
  if (h < 11) return 'Breakfast';
  if (h < 16) return 'Lunch';
  if (h < 19) return 'Snack';
  return 'Dinner';
};

/** "Type what you ate" → AI estimate of calories and macros → add to today. */
export const FoodLogger: React.FC = () => {
  const { addCustomMeal, userProfile } = useFitMate();
  const { user, cloudEnabled, signIn } = useAuth();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<FoodEstimate | null>(null);
  const [mealType, setMealType] = useState<Meal['mealType']>(guessMealType);

  const estimate = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const r = await estimateFood(text);
      if (!r.items.length) setError(r.note || "That didn't look like food. Try something like \"2 rotis, dal, curd\".");
      else setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const add = () => {
    if (!result) return;
    const t = result.totals;
    addCustomMeal({
      name: text.length > 60 ? text.slice(0, 57) + '…' : text,
      mealType,
      time: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      calories: t.calories,
      protein: t.protein,
      carbs: t.carbs,
      fats: t.fats,
      dietaryType: userProfile.dietPreference === 'Non-Vegetarian' ? 'non-veg' : userProfile.dietPreference === 'Eggetarian' ? 'egg' : 'veg',
      portion: result.items.map((i) => `${i.quantity} ${i.name}`).join(', '),
      description: `Logged by you. AI estimate${result.note ? `: ${result.note}` : ''}`,
      recipe: '',
      imageUrl: '',
      completed: true,
    });
    setText('');
    setResult(null);
  };

  return (
    <div className="bg-[#152031] rounded-2xl border border-[#1f2a3c] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#4edea3]">edit_note</span>
        <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">Log what you ate</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4edea3]/15 text-[#4edea3] px-2 py-0.5 rounded-full">AI estimate</span>
      </div>
      <p className="text-xs text-[#86948a] -mt-1">Type it the way you'd say it. Indian home food and portions are understood.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 500))}
        rows={2}
        placeholder="e.g. 3 chapati, 1 katori dal, aloo gobi, a bowl of curd"
        className="w-full bg-[#0b1420] border border-[#2a3a52] focus:border-[#4edea3] rounded-xl px-3 py-2.5 text-sm text-[#d8e3fb] placeholder:text-[#5d6b80] focus:outline-none resize-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select value={mealType} onChange={(e) => setMealType(e.target.value as Meal['mealType'])} aria-label="Meal" className="bg-[#0b1420] border border-[#2a3a52] rounded-xl px-3 py-2 text-xs text-[#d8e3fb]">
          {MEAL_TYPES.map((m) => <option key={m}>{m}</option>)}
        </select>
        {cloudEnabled && !user ? (
          <button onClick={signIn} className="px-4 py-2 rounded-xl bg-[#111c2d] border border-[#4edea3]/40 text-[#4edea3] text-xs font-bold">Sign in to use AI food logging</button>
        ) : (
          <button onClick={estimate} disabled={busy || text.trim().length < 3} className="px-4 py-2 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-xs font-bold disabled:opacity-40 flex items-center gap-1.5">
            <span className={`material-symbols-outlined text-[16px] ${busy ? 'animate-spin' : ''}`}>{busy ? 'progress_activity' : 'calculate'}</span>
            {busy ? 'Estimating…' : 'Estimate'}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[#ffb4ab]">{error}</p>}
      {result && (
        <div className="bg-[#0b1420] rounded-xl border border-[#1f2a3c] p-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#86948a] text-left"><th className="py-1 font-semibold">Item</th><th className="py-1 font-semibold text-right">kcal</th><th className="py-1 font-semibold text-right">Protein</th></tr>
            </thead>
            <tbody>
              {result.items.map((i, k) => (
                <tr key={k} className="border-t border-[#1f2a3c] text-[#d8e3fb]">
                  <td className="py-1.5">{i.name} <span className="text-[#86948a]">({i.quantity})</span></td>
                  <td className="py-1.5 text-right tabular-nums">{i.calories}</td>
                  <td className="py-1.5 text-right tabular-nums">{i.protein} g</td>
                </tr>
              ))}
              <tr className="border-t border-[#2a3a52] font-bold text-[#4edea3]">
                <td className="py-1.5">Total</td>
                <td className="py-1.5 text-right tabular-nums">{result.totals.calories}</td>
                <td className="py-1.5 text-right tabular-nums">{result.totals.protein} g</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[11px] text-[#86948a] mt-2">
            Carbs {result.totals.carbs} g · Fats {result.totals.fats} g. Estimates can be off by 20% or more, mostly because of oil and ghee.{result.note ? ` ${result.note}` : ''}
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={add} className="px-4 py-2 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold">Add to today</button>
            <button onClick={() => setResult(null)} className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold border border-[#1f2a3c]">Discard</button>
          </div>
        </div>
      )}
    </div>
  );
};
