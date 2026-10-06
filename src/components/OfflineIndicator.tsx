import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/90 text-[#001f28] px-4 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md animate-in fade-in">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Offline Mode — All workouts, trackers &amp; local data remain functional.</span>
    </div>
  );
};
