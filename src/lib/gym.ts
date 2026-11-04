/**
 * Gym owner side: members, fee due dates, payments, QR check-ins, inactive alerts.
 *
 * Firestore layout (access enforced by firestore.rules):
 *   gyms/{gymId}                         owner reads/writes; any signed-in user can read name/city
 *   gyms/{gymId}/members/{memberId}      owner; a linked member can read their own record
 *   gyms/{gymId}/payments/{paymentId}    owner only
 *   gyms/{gymId}/checkins/{checkinId}    owner; a linked member can add their own check-in
 *   gyms/{gymId}/invites/{inviteCode}    secret code in the invite link → memberId
 *   gyms/{gymId}/qr/{token}              secret code in the reception QR (rotatable)
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Gym, GymCheckin, GymMember, GymPayment, GymPlan, PaymentMethod } from '../types/cloud';
import { localDate } from './progression';

const listenFailed = (what: string) => (e: { code?: string; message?: string }) =>
  console.error(`FITORA: live update failed for ${what}:`, e?.code, e?.message);


/**
 * Live query that retries when refused. Right after a gym is created, the first listen can
 * reach the server before the new gym is visible to the security rules; a retry fixes it.
 */
function liveQuery<T>(what: string, start: (onData: (v: T) => void, onError: (e: { code?: string; message?: string }) => void) => () => void, cb: (v: T) => void, empty: T) {
  let stop: (() => void) | null = null;
  let stopped = false;
  let tries = 0;
  const run = () => {
    stop = start(cb, (e) => {
      if (!stopped && e?.code === 'permission-denied' && tries < 4) {
        tries++;
        window.setTimeout(() => !stopped && run(), 1200 * tries);
        return;
      }
      listenFailed(what)(e);
      cb(empty);
    });
  };
  run();
  return () => {
    stopped = true;
    stop?.();
  };
}

const need = () => {
  if (!db) throw new Error('Cloud is not set up.');
  return db;
};

const randomCode = (len = 10) => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

export const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://fit-mate-coral.vercel.app';

export const DEFAULT_PLANS: GymPlan[] = [
  { id: 'm1', name: 'Monthly', months: 1, priceInr: 1000 },
  { id: 'm3', name: 'Quarterly', months: 3, priceInr: 2700 },
  { id: 'm6', name: 'Half-yearly', months: 6, priceInr: 5000 },
  { id: 'm12', name: 'Yearly', months: 12, priceInr: 9000 },
];

// ── Dates ────────────────────────────────────────────────────────────────────

export const addMonths = (dateStr: string, months: number) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1 + months, d);
  // 31 Jan + 1 month → 28/29 Feb, not 3 Mar
  if (dt.getDate() !== d) dt.setDate(0);
  return localDate(dt);
};

export const daysBetween = (from: string, to: string) => {
  const a = new Date(from + 'T00:00:00');
  const b = new Date(to + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 864e5);
};

/** Days until the fee is due (negative = overdue). */
export const daysUntilDue = (m: Pick<GymMember, 'dueDate'>, today = localDate()) => daysBetween(today, m.dueDate);

// ── Gym ──────────────────────────────────────────────────────────────────────

export async function createGym(ownerUid: string, input: { name: string; city: string; phone: string }): Promise<string> {
  const d = need();
  const ref = doc(collection(d, 'gyms'));
  const gym: Gym = {
    id: ref.id,
    name: input.name.trim(),
    city: input.city.trim(),
    phone: input.phone.trim(),
    ownerUid,
    plans: DEFAULT_PLANS,
    inactiveAfterDays: 7,
    createdAt: Date.now(),
  };
  const batch = writeBatch(d);
  batch.set(ref, gym);
  batch.set(doc(d, 'gyms', ref.id, 'qr', randomCode(16)), { createdAt: Date.now() });
  batch.set(doc(d, 'users', ownerUid), { role: 'owner', ownedGymId: ref.id }, { merge: true });
  await batch.commit();
  return ref.id;
}

export function subscribeGym(gymId: string, cb: (g: Gym | null) => void) {
  return onSnapshot(doc(need(), 'gyms', gymId), (s) => cb(s.exists() ? (s.data() as Gym) : null), (e) => { listenFailed('gym')(e); cb(null); });
}

export async function getGym(gymId: string): Promise<Gym | null> {
  const s = await getDoc(doc(need(), 'gyms', gymId));
  return s.exists() ? (s.data() as Gym) : null;
}

export async function updateGym(gymId: string, patch: Partial<Gym>) {
  await updateDoc(doc(need(), 'gyms', gymId), patch as Record<string, unknown>);
}

// ── Members ──────────────────────────────────────────────────────────────────

export function subscribeMembers(gymId: string, cb: (list: GymMember[]) => void) {
  return liveQuery<GymMember[]>('members', (ok, bad) => onSnapshot(collection(need(), 'gyms', gymId, 'members'), (s) => ok(s.docs.map((d) => d.data() as GymMember)), bad), cb, []);
}

export async function addMember(
  gym: Gym,
  input: { name: string; phone: string; planId: string; joinedOn: string; paidNow: boolean; amountInr?: number; method?: PaymentMethod },
): Promise<GymMember> {
  const d = need();
  const plan = gym.plans.find((p) => p.id === input.planId) || gym.plans[0];
  const ref = doc(collection(d, 'gyms', gym.id, 'members'));
  const inviteCode = randomCode(12);
  const member: GymMember = {
    id: ref.id,
    name: input.name.trim(),
    phone: normalisePhone(input.phone),
    planId: plan.id,
    joinedOn: input.joinedOn,
    dueDate: input.paidNow ? addMonths(input.joinedOn, plan.months) : input.joinedOn,
    status: 'active',
    notes: '',
    uid: null,
    linkedAt: null,
    claimCode: null,
    inviteCode,
    lastVisit: null,
    createdAt: Date.now(),
  };
  const batch = writeBatch(d);
  batch.set(ref, member);
  batch.set(doc(d, 'gyms', gym.id, 'invites', inviteCode), { memberId: ref.id, createdAt: Date.now() });
  if (input.paidNow) {
    const pay = doc(collection(d, 'gyms', gym.id, 'payments'));
    const payment: GymPayment = {
      id: pay.id,
      memberId: ref.id,
      memberName: member.name,
      amountInr: input.amountInr ?? plan.priceInr,
      method: input.method || 'upi',
      paidOn: input.joinedOn,
      months: plan.months,
      newDueDate: member.dueDate,
      note: 'Joining fee',
      createdAt: Date.now(),
    };
    batch.set(pay, payment);
  }
  await batch.commit();
  return member;
}

export async function updateMember(gymId: string, memberId: string, patch: Partial<GymMember>) {
  await updateDoc(doc(need(), 'gyms', gymId, 'members', memberId), patch as Record<string, unknown>);
}

export async function deleteMember(gymId: string, member: GymMember) {
  const d = need();
  const batch = writeBatch(d);
  batch.delete(doc(d, 'gyms', gymId, 'members', member.id));
  batch.delete(doc(d, 'gyms', gymId, 'invites', member.inviteCode));
  await batch.commit();
}

// ── Payments ─────────────────────────────────────────────────────────────────

export function subscribePayments(gymId: string, cb: (list: GymPayment[]) => void) {
  const q = query(collection(need(), 'gyms', gymId, 'payments'), orderBy('createdAt', 'desc'));
  return liveQuery<GymPayment[]>('payments', (ok, bad) => onSnapshot(q, (s) => ok(s.docs.map((d) => d.data() as GymPayment)), bad), cb, []);
}

/** Records a fee payment and moves the member's due date forward. */
export async function recordPayment(gym: Gym, member: GymMember, input: { planId: string; amountInr: number; method: PaymentMethod; paidOn: string; note?: string }) {
  const d = need();
  const plan = gym.plans.find((p) => p.id === input.planId) || gym.plans[0];
  // Renewing early extends from the current due date; renewing late starts from the payment date
  const from = member.dueDate > input.paidOn ? member.dueDate : input.paidOn;
  const newDueDate = addMonths(from, plan.months);
  const pay = doc(collection(d, 'gyms', gym.id, 'payments'));
  const payment: GymPayment = {
    id: pay.id,
    memberId: member.id,
    memberName: member.name,
    amountInr: input.amountInr,
    method: input.method,
    paidOn: input.paidOn,
    months: plan.months,
    newDueDate,
    note: input.note || '',
    createdAt: Date.now(),
  };
  const batch = writeBatch(d);
  batch.set(pay, payment);
  batch.update(doc(d, 'gyms', gym.id, 'members', member.id), { dueDate: newDueDate, planId: plan.id, status: 'active' });
  await batch.commit();
  return payment;
}

export async function deletePayment(gymId: string, paymentId: string) {
  await deleteDoc(doc(need(), 'gyms', gymId, 'payments', paymentId));
}

// ── Check-ins ────────────────────────────────────────────────────────────────

export function subscribeCheckinsSince(gymId: string, sinceDate: string, cb: (list: GymCheckin[]) => void) {
  const q = query(collection(need(), 'gyms', gymId, 'checkins'), where('date', '>=', sinceDate), orderBy('date', 'desc'));
  return liveQuery<GymCheckin[]>('check-ins', (ok, bad) => onSnapshot(q, (s) => ok(s.docs.map((d) => d.data() as GymCheckin)), bad), cb, []);
}

/** Owner marks someone present at the desk. */
export async function manualCheckin(gymId: string, member: GymMember) {
  const d = need();
  const today = localDate();
  const id = `${member.id}_${today}`;
  const batch = writeBatch(d);
  batch.set(doc(d, 'gyms', gymId, 'checkins', id), { id, memberId: member.id, uid: member.uid || null, date: today, at: Date.now(), source: 'manual' } satisfies GymCheckin);
  batch.update(doc(d, 'gyms', gymId, 'members', member.id), { lastVisit: today });
  await batch.commit();
}

/** Reception QR codes: one active token; rotating it stops old photos of the QR working. */
export async function getOrCreateQrToken(gymId: string): Promise<string> {
  const d = need();
  const snap = await getDocs(collection(d, 'gyms', gymId, 'qr'));
  if (!snap.empty) return snap.docs[0].id;
  const token = randomCode(16);
  await setDoc(doc(d, 'gyms', gymId, 'qr', token), { createdAt: Date.now() });
  return token;
}

export async function rotateQrToken(gymId: string): Promise<string> {
  const d = need();
  const snap = await getDocs(collection(d, 'gyms', gymId, 'qr'));
  const token = randomCode(16);
  const batch = writeBatch(d);
  snap.docs.forEach((x) => batch.delete(x.ref));
  batch.set(doc(d, 'gyms', gymId, 'qr', token), { createdAt: Date.now() });
  await batch.commit();
  return token;
}

export const checkinUrl = (gymId: string, token: string) => `${SITE_URL}/#checkin/${gymId}/${token}`;
export const inviteUrl = (gymId: string, inviteCode: string) => `${SITE_URL}/#join/${gymId}/${inviteCode}`;

// ── Member side (person with the FITORA app) ────────────────────────────────

/** Links the signed-in user to their member record using the invite link. */
export async function claimInvite(uid: string, gymId: string, inviteCode: string): Promise<{ gym: Gym; member: GymMember }> {
  const d = need();
  const invite = await getDoc(doc(d, 'gyms', gymId, 'invites', inviteCode));
  if (!invite.exists()) throw new Error('This invite link is not valid any more. Ask your gym for a new one.');
  const memberId = (invite.data() as { memberId: string }).memberId;
  const gym = await getGym(gymId);
  if (!gym) throw new Error('Gym not found.');
  const memberRef = doc(d, 'gyms', gymId, 'members', memberId);
  await updateDoc(memberRef, { uid, linkedAt: Date.now(), claimCode: inviteCode });
  const member = (await getDoc(memberRef)).data() as GymMember;
  await setDoc(doc(d, 'users', uid), { membership: { gymId, memberId, gymName: gym.name } }, { merge: true });
  return { gym, member };
}

export function subscribeMyMembership(gymId: string, memberId: string, cb: (m: GymMember | null) => void) {
  return onSnapshot(doc(need(), 'gyms', gymId, 'members', memberId), (s) => cb(s.exists() ? (s.data() as GymMember) : null), (e) => { listenFailed('my membership')(e); cb(null); });
}

/** Member scans the reception QR → records today's visit (once per day). */
export async function selfCheckin(uid: string, gymId: string, memberId: string, token: string) {
  const d = need();
  const today = localDate();
  const id = `${memberId}_${today}`;
  await setDoc(doc(d, 'gyms', gymId, 'checkins', id), { id, memberId, uid, date: today, at: Date.now(), source: 'qr', token } satisfies GymCheckin);
  return today;
}

export async function myRecentCheckins(gymId: string, uid: string): Promise<GymCheckin[]> {
  // Filter by uid so security rules can confirm these are the caller's own check-ins
  const q = query(collection(need(), 'gyms', gymId, 'checkins'), where('uid', '==', uid));
  const s = await getDocs(q);
  return s.docs.map((x) => x.data() as GymCheckin).sort((a, b) => b.at - a.at);
}

// ── WhatsApp (opens WhatsApp with the message ready; the owner taps Send) ───

export function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

export const whatsappLink = (phone: string, text: string) => `https://wa.me/${normalisePhone(phone)}?text=${encodeURIComponent(text)}`;

const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function feeReminderText(gym: Gym, m: GymMember) {
  const plan = gym.plans.find((p) => p.id === m.planId);
  const days = daysUntilDue(m);
  const when = days < 0 ? `was due on ${fmtDate(m.dueDate)}` : days === 0 ? 'is due today' : `is due on ${fmtDate(m.dueDate)}`;
  return `Hi ${m.name.split(' ')[0]}, this is ${gym.name}. Your ${plan?.name.toLowerCase() || ''} membership fee${plan ? ` of ₹${plan.priceInr.toLocaleString('en-IN')}` : ''} ${when}. You can pay by UPI or at the desk. Thank you! 💪`;
}

export function missYouText(gym: Gym, m: GymMember, days: number | null) {
  return `Hi ${m.name.split(' ')[0]}, we haven't seen you at ${gym.name}${days ? ` for ${days} days` : ' yet'}. Everything okay? Even a short 30-minute session keeps the habit going. See you soon! 🏋️`;
}

export function inviteText(gym: Gym, m: GymMember) {
  return `Hi ${m.name.split(' ')[0]}, welcome to ${gym.name}! Track your workouts, see your fee due date and check in at the gym with FITORA (free): ${inviteUrl(gym.id, m.inviteCode)}`;
}

