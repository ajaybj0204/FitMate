import React from 'react';
import { useFitMate } from '../context/FitMateContext';

export const SmartRemindersModal: React.FC = () => {
  const { reminders, toggleReminder, isRemindersModalOpen, setIsRemindersModalOpen, showToast } =
    useFitMate();

  if (!isRemindersModalOpen) return null;

  const handleRequestPush = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('System notifications enabled! You will receive timely cues. 🔔');
      } else {
        showToast('Notifications permission was dismissed or blocked.', 'info');
      }
    } else {
      showToast('Notifications are simulated in-app via toast notifications.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#152031] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-[#1f2a3c] my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2a3c]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">alarm</span>
            </div>
            <div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb]">
                Smart Fitness Reminders
              </h3>
              <p className="text-xs text-[#86948a]">
                Habit stacking alerts for hydration, workouts &amp; recovery
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRemindersModalOpen(false)}
            className="text-[#86948a] hover:text-[#d8e3fb] p-1.5 rounded-lg hover:bg-[#1f2a3c]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Reminders List */}
        <div className="divide-y divide-[#1f2a3c]/70 my-4 max-h-80 overflow-y-auto pr-1">
          {reminders.map(rem => (
            <div key={rem.id} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                    rem.enabled
                      ? 'bg-[#4edea3]/20 text-[#4edea3]'
                      : 'bg-[#1f2a3c] text-[#86948a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{rem.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#d8e3fb]">{rem.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#111c2d] text-[#86948a] border border-[#1f2a3c]">
                      {rem.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#bbcabf] mt-0.5 leading-relaxed">{rem.desc}</p>
                </div>
              </div>

              {/* Switch Toggle */}
              <button
                onClick={() => toggleReminder(rem.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rem.enabled ? 'bg-[#4edea3]' : 'bg-[#1f2a3c]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#081425] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    rem.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Browser notification permission banner */}
        <div className="bg-[#111c2d] p-3.5 rounded-xl border border-[#1f2a3c] flex items-center justify-between gap-3 text-xs mb-4">
          <div className="flex items-center gap-2 text-[#bbcabf]">
            <span className="material-symbols-outlined text-[#4edea3] text-[18px]">notifications_active</span>
            <span>Receive native device alerts?</span>
          </div>
          <button
            onClick={handleRequestPush}
            className="px-3 py-1.5 bg-[#1f2a3c] hover:bg-[#4edea3] hover:text-[#003824] text-[#d8e3fb] font-semibold rounded-lg transition-colors text-xs"
          >
            Allow
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setIsRemindersModalOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] font-bold text-xs hover:bg-[#6ffbbe] transition-transform hover:scale-[1.01]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
