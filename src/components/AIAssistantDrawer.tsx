import React, { useEffect, useRef, useState } from 'react';
import { useFitMate } from '../context/FitMateContext';

export const AIAssistantDrawer: React.FC = () => {
  const {
    isAIAssistantOpen,
    toggleAIAssistant,
    chatMessages,
    sendAIMessage,
    userProfile,
    healthMetrics,
  } = useFitMate();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAIAssistantOpen]);

  if (!isAIAssistantOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendAIMessage(inputVal.trim());
    setInputVal('');
  };

  const handlePromptClick = (prompt: string) => {
    sendAIMessage(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => toggleAIAssistant(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#111c2d] h-full shadow-2xl flex flex-col z-10 border-l border-[#1f2a3c]">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2a3c] flex items-center justify-between bg-[#152031]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center border border-[#4edea3]/20">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-base text-[#d8e3fb] flex items-center gap-2">
                FITORA AI Coach
                <span className="text-[10px] bg-[#4edea3]/20 text-[#4edea3] px-1.5 py-0.5 rounded font-bold uppercase">
                  Companion
                </span>
              </h3>
              <p className="text-xs text-[#86948a]">
                Personalized for {userProfile.name} • {healthMetrics.dailyCalorieTarget} kcal target
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleAIAssistant(false)}
            className="p-1.5 text-[#86948a] hover:text-[#d8e3fb] rounded-lg hover:bg-[#1f2a3c] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Context Banner */}
        <div className="bg-[#152031]/60 px-5 py-2.5 border-b border-[#1f2a3c] flex items-center justify-between text-[11px] text-[#bbcabf]">
          <span>
            Goal: <strong className="text-[#4edea3] font-semibold">{userProfile.goal}</strong>
          </span>
          <span>
            Weight: <strong className="text-[#d8e3fb] font-semibold">{userProfile.weightKg} kg</strong>
          </span>
          <span>
            Protein: <strong className="text-[#98da27] font-semibold">{healthMetrics.proteinTarget}g</strong>
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#4edea3] text-[#003824] font-medium rounded-br-none shadow-md'
                    : 'bg-[#152031] text-[#d8e3fb] border border-[#1f2a3c] rounded-bl-none shadow-md'
                }`}
              >
                <FormattedText text={msg.text} />
              </div>
              <span className="text-[10px] text-[#86948a] mt-1 px-1">{msg.timestamp}</span>

              {/* Suggested Prompts if available */}
              {msg.suggestedPrompts && (
                <div className="mt-3 flex flex-wrap gap-1.5 max-w-full">
                  {msg.suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(p)}
                      className="text-left text-xs bg-[#1f2a3c] hover:bg-[#2a3548] text-[#4edea3] border border-[#4edea3]/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#1f2a3c] bg-[#152031]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Ask anything about diet, calories, workouts..."
              className="flex-1 bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] placeholder-[#86948a] focus:outline-none focus:border-[#4edea3] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="bg-[#4edea3] hover:bg-[#6ffbbe] disabled:opacity-40 disabled:hover:bg-[#4edea3] text-[#003824] p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 font-semibold"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
          <p className="text-[10px] text-[#86948a] text-center mt-2">
            FITORA AI calculates estimates based on Mifflin-St Jeor &amp; WHO guidelines. Not medical advice.
          </p>
        </form>
      </div>
    </div>
  );
};

/** Light formatting for coach replies: **bold**, bullet lines and headings. Builds React nodes (no HTML injection). */
const inline = (line: string) =>
  line.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

const FormattedText: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col gap-1">
    {text.split('\n').map((raw, i) => {
      const line = raw.trimEnd();
      if (!line.trim()) return <div key={i} className="h-1" />;
      const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (bullet) {
        return (
          <div key={i} className="flex gap-2 pl-1">
            <span className="text-[#4edea3]">•</span>
            <span>{inline(bullet[1])}</span>
          </div>
        );
      }
      const heading = line.match(/^#{1,4}\s+(.*)$/);
      if (heading) return <div key={i} className="font-bold mt-1">{inline(heading[1])}</div>;
      return <div key={i}>{inline(line)}</div>;
    })}
  </div>
);
