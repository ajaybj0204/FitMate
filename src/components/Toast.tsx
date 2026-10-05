import React from 'react';
import { useFitMate } from '../context/FitMateContext';

export const Toast: React.FC = () => {
  const { toast } = useFitMate();

  if (!toast) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1f2a3c] text-[#d8e3fb] px-5 py-3.5 rounded-xl shadow-2xl border border-[#4edea3]/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 max-w-md"
    >
      <span className="material-symbols-outlined text-[#4edea3] text-[22px] shrink-0">
        {toast.type === 'warning' ? 'warning' : toast.type === 'info' ? 'info' : 'check_circle'}
      </span>
      <span className="text-sm font-medium leading-tight">{toast.message}</span>
    </div>
  );
};
