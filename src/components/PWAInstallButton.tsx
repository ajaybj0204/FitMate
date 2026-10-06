import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold transition-all shadow-md shadow-[#4edea3]/20 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        }`}
        title="Install FITORA as a Native Mobile/Desktop App"
      >
        <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari guidance flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-[#4edea3]/40 bg-[#152031] text-[#4edea3] font-semibold hover:bg-[#1f2a3c] transition-colors ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">add_to_home_screen</span>
          <span>Add to iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#152031] p-6 shadow-2xl border border-[#1f2a3c] text-center">
              <div className="w-12 h-12 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[28px]">ios_share</span>
              </div>
              <h3 className="text-base font-headline font-bold text-[#d8e3fb]">Install FITORA on iOS</h3>
              <p className="mt-2 text-xs text-[#bbcabf] leading-relaxed text-left">
                1. Tap the <strong>Share</strong> button <span className="material-symbols-outlined text-[14px] align-middle">ios_share</span> in Safari's bottom toolbar.<br />
                2. Scroll down and tap <strong>"Add to Home Screen"</strong> <span className="material-symbols-outlined text-[14px] align-middle">add_box</span>.<br />
                3. Launch FITORA directly from your home screen for full offline immersion.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#4edea3] py-2.5 text-xs font-bold text-[#003824] hover:bg-[#6ffbbe] transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
