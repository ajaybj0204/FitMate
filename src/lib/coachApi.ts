/** Calls FITORA's server-side AI coach (/api/coach) with the signed-in user's ID token. */
import { auth } from './firebase';

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}
export interface FoodEstimate {
  items: FoodItem[];
  totals: { calories: number; protein: number; carbs: number; fats: number };
  note: string;
}

export class CoachError extends Error {}

async function call<T>(payload: Record<string, unknown>): Promise<T> {
  const user = auth?.currentUser;
  if (!user) throw new CoachError('Sign in to use the AI coach.');
  const token = await user.getIdToken();
  let r: Response;
  try {
    r = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new CoachError('No internet connection. The AI coach needs to be online.');
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new CoachError((j as { error?: string }).error || 'The AI coach is unavailable right now.');
  return j as T;
}

export const askCoach = (message: string, context: unknown, history: { role: 'user' | 'assistant'; text: string }[]) =>
  call<{ reply: string }>({ mode: 'chat', message, context, history }).then((r) => r.reply);

export const estimateFood = (text: string) => call<FoodEstimate>({ mode: 'food', text });
