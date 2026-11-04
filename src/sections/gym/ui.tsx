import React from 'react';
import type { GymMember } from '../../types/cloud';
import { daysBetween, daysUntilDue } from '../../lib/gym';
import { localDate } from '../../lib/progression';

export const inputCls =
  'w-full bg-[#0b1420] border border-[#2a3a52] focus:border-[#4edea3] rounded-xl px-3 py-2.5 text-sm text-[#d8e3fb] placeholder:text-[#5d6b80] focus:outline-none';
export const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-[#86948a]';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[#152031] rounded-2xl border border-[#1f2a3c] p-4 sm:p-5 ${className}`}>{children}</div>
);

export const Btn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'whatsapp'; icon?: string; small?: boolean }
> = ({ variant = 'ghost', icon, small, className = '', children, ...rest }) => {
  const styles = {
    primary: 'bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold',
    ghost: 'bg-[#111c2d] hover:bg-[#1f2a3c] text-[#d8e3fb] border border-[#1f2a3c] font-semibold',
    danger: 'bg-[#2a1416] hover:bg-[#3a1a1e] text-[#ffb4ab] border border-[#ffb4ab]/30 font-semibold',
    whatsapp: 'bg-[#1f7a4a] hover:bg-[#25935a] text-white font-bold',
  }[variant];
  return (
    <button
      {...rest}
      className={`${styles} ${small ? 'px-2.5 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs sm:text-sm'} rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {icon && <span className={`material-symbols-outlined ${small ? 'text-[15px]' : 'text-[18px]'}`}>{icon}</span>}
      {children}
    </button>
  );
};

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-[70] bg-[#060c16]/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
    <div className={`bg-[#152031] rounded-2xl border border-[#1f2a3c] w-full ${wide ? 'max-w-2xl' : 'max-w-md'} p-5 sm:p-6 my-auto shadow-2xl`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">{title}</h3>
        <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-[#86948a] hover:text-white hover:bg-[#1f2a3c]">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const Stat: React.FC<{ label: string; value: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue'; icon: string; onClick?: () => void }> = ({ label, value, tone = 'blue', icon, onClick }) => {
  const c = { green: 'text-[#4edea3] bg-[#4edea3]/10', amber: 'text-[#ffb95f] bg-[#ffb95f]/10', red: 'text-[#ffb4ab] bg-[#ffb4ab]/10', blue: 'text-[#9ecaff] bg-[#9ecaff]/10' }[tone];
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={`text-left bg-[#152031] rounded-2xl border border-[#1f2a3c] p-4 flex items-center gap-3 ${onClick ? 'hover:border-[#4edea3]/40 transition-colors' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="font-headline text-xl font-extrabold text-[#d8e3fb] tabular-nums leading-tight">{value}</div>
        <div className="text-[11px] text-[#86948a] font-semibold">{label}</div>
      </div>
    </Tag>
  );
};

export const fmtDate = (d?: string | null) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** Fee status chip: paid till / due soon / overdue. */
export const FeeBadge: React.FC<{ member: GymMember }> = ({ member }) => {
  if (member.status !== 'active') {
    return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#2a3a52] text-[#bbcabf]">{member.status === 'paused' ? 'Paused' : 'Left'}</span>;
  }
  const d = daysUntilDue(member);
  if (d < 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb4ab]/15 text-[#ffb4ab]">Overdue {-d}d</span>;
  if (d <= 7) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffb95f]/15 text-[#ffb95f]">{d === 0 ? 'Due today' : `Due in ${d}d`}</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4edea3]/12 text-[#4edea3]">Paid till {fmtDate(member.dueDate)}</span>;
};

/** Days since last visit, or null if never visited. */
export const daysSinceVisit = (lastVisit?: string | null) => (lastVisit ? daysBetween(lastVisit, localDate()) : null);

export const visitText = (lastVisit?: string | null) => {
  const d = daysSinceVisit(lastVisit);
  if (d === null) return 'No visits yet';
  if (d === 0) return 'Visited today';
  if (d === 1) return 'Visited yesterday';
  return `Last visit ${d} days ago`;
};
