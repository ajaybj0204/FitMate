/** Data saved to the cloud (Firestore) or, for guests, to this browser. */

export interface LoggedSet {
  weightKg: number;
  reps: number;
}

export interface ExerciseLog {
  /** exerciseDbId when known, else the plan exercise id */
  key: string;
  name: string;
  exerciseDbId?: string;
  equipment?: string;
  targetReps?: string;
  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;
  /** Local date YYYY-MM-DD */
  date: string;
  startedAt: number;
  endedAt: number;
  durationMin: number;
  dayId: string;
  splitName: string;
  quick?: boolean;
  exercises: ExerciseLog[];
  totalVolumeKg: number;
  setsCount: number;
}

export type AccountRole = 'member' | 'owner';

export interface AccountDoc {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role?: AccountRole;
  /** Gym this person owns (owners) */
  ownedGymId?: string | null;
  /** Gym membership this person has linked (members) */
  membership?: { gymId: string; memberId: string; gymName: string } | null;
  createdAt: number;
}

// ── Gym owner side ───────────────────────────────────────────────────────────

export interface GymPlan {
  id: string;
  name: string;
  months: number;
  priceInr: number;
}

export interface Gym {
  id: string;
  name: string;
  city: string;
  phone: string;
  ownerUid: string;
  plans: GymPlan[];
  /** Days without a visit before a member counts as "at risk" */
  inactiveAfterDays: number;
  createdAt: number;
}

export type MemberStatus = 'active' | 'paused' | 'left';

export interface GymMember {
  id: string;
  name: string;
  phone: string;
  planId: string;
  joinedOn: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD, membership paid until
  status: MemberStatus;
  notes?: string;
  /** Set when the member links their FITORA account via invite */
  uid?: string | null;
  linkedAt?: number | null;
  claimCode?: string | null;
  /** Owner-only: code inside the invite link */
  inviteCode: string;
  lastVisit?: string | null;
  createdAt: number;
}

export type PaymentMethod = 'upi' | 'cash' | 'card' | 'bank';

export interface GymPayment {
  id: string;
  memberId: string;
  memberName: string;
  amountInr: number;
  method: PaymentMethod;
  paidOn: string; // YYYY-MM-DD
  months: number;
  newDueDate: string;
  note?: string;
  createdAt: number;
}

export interface GymCheckin {
  id: string;
  memberId: string;
  uid?: string | null;
  date: string; // YYYY-MM-DD
  at: number;
  source: 'qr' | 'manual';
  token?: string;
}
