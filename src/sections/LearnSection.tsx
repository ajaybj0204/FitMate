import React, { useMemo, useState } from 'react';
import { EDUCATIONAL_TOPICS } from '../data/mockData';
import { EducationalTopic } from '../types';

export const LearnSection: React.FC<{ initialTopicId?: string | null }> = ({
  initialTopicId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeModalTopic, setActiveModalTopic] = useState<EducationalTopic | null>(() => {
    if (initialTopicId) {
      return EDUCATIONAL_TOPICS.find(t => t.id === initialTopicId) || null;
    }
    return null;
  });

  const filteredTopics = useMemo(() => {
    return EDUCATIONAL_TOPICS.filter(topic => {
      const matchesCategory =
        selectedCategory === 'all' || topic.category === selectedCategory;
      const matchesSearch =
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.whatIsIt.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Hero / Intro Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-[#4edea3] text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span>FitMate Academy</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb] mb-2">
            Learn Fitness — Made Simple
          </h1>
          <p className="text-sm sm:text-base text-[#bbcabf] leading-relaxed">
            No complex medical jargon. Just clear, actionable breakdowns of every fitness, physiological, and nutrition concept you need to reach your peak performance.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86948a] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search concepts (e.g. BMR, Protein)..."
            className="w-full bg-[#152031] border border-[#3c4a42] py-2.5 pl-10 pr-4 rounded-xl text-sm text-[#d8e3fb] placeholder-[#86948a] focus:outline-none focus:border-[#4edea3] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86948a] hover:text-[#d8e3fb]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Topics' },
          { id: 'nutrition', label: 'Nutrition' },
          { id: 'metabolism', label: 'Metabolism & Energy' },
          { id: 'body', label: 'Body Composition' },
          { id: 'training', label: 'Training & Recovery' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#4edea3] text-[#003824] shadow-md shadow-[#4edea3]/20'
                : 'bg-[#152031] hover:bg-[#1f2a3c] text-[#bbcabf] hover:text-[#d8e3fb] border border-[#1f2a3c]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map(topic => (
          <div
            key={topic.id}
            onClick={() => setActiveModalTopic(topic)}
            className="bg-[#152031] hover:bg-[#1f2a3c] border border-[#1f2a3c] rounded-2xl p-6 flex flex-col justify-between transition-all shadow-xl group cursor-pointer hover:-translate-y-1"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="px-2.5 py-0.5 bg-[#111c2d] text-[#4edea3] text-[10px] font-bold rounded-md uppercase tracking-wider border border-[#1f2a3c]">
                  {topic.categoryLabel}
                </span>
                <span className="material-symbols-outlined text-[#86948a] group-hover:text-[#4edea3] transition-colors text-[20px]">
                  arrow_forward
                </span>
              </div>

              <h3 className="font-headline text-xl font-bold text-[#d8e3fb] mb-2 group-hover:text-[#4edea3] transition-colors">
                {topic.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#bbcabf] line-clamp-3 leading-relaxed">
                {topic.shortDesc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#1f2a3c] flex items-center text-[#4edea3] text-xs font-semibold gap-1">
              <span>Learn concept</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="bg-[#152031] rounded-2xl p-12 text-center border border-[#1f2a3c]">
          <span className="material-symbols-outlined text-[#86948a] text-[40px] mb-2">
            search_off
          </span>
          <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">No concepts found</h3>
          <p className="text-xs text-[#86948a] mt-1">
            Try adjusting your search query or reset the filter to "All Topics".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#111c2d] text-xs font-semibold text-[#4edea3] border border-[#4edea3]/30"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Concept Detail Modal */}
      {activeModalTopic && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#152031] max-w-2xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative border border-[#1f2a3c] my-auto">
            {/* Close button */}
            <button
              onClick={() => setActiveModalTopic(null)}
              className="absolute top-5 right-5 text-[#86948a] hover:text-[#d8e3fb] p-1.5 rounded-lg bg-[#111c2d] hover:bg-[#1f2a3c] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Modal Header */}
            <div className="mb-5">
              <span className="px-2.5 py-0.5 bg-[#10b981]/20 text-[#4edea3] text-[10px] font-bold rounded uppercase tracking-wider">
                {activeModalTopic.categoryLabel}
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] mt-2">
                {activeModalTopic.title}
              </h2>
            </div>

            {/* Structured Explanation Grid */}
            <div className="space-y-4">
              {/* 1. What is it? */}
              <div className="bg-[#111c2d] p-4 sm:p-5 rounded-xl border border-[#1f2a3c]">
                <h4 className="text-[#4edea3] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">help</span>
                  What is it?
                </h4>
                <p className="text-xs sm:text-sm text-[#bbcabf] leading-relaxed">
                  {activeModalTopic.whatIsIt}
                </p>
              </div>

              {/* 2. Why does it matter? */}
              <div className="bg-[#111c2d] p-4 sm:p-5 rounded-xl border border-[#1f2a3c]">
                <h4 className="text-[#4edea3] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  Why does it matter?
                </h4>
                <p className="text-xs sm:text-sm text-[#bbcabf] leading-relaxed">
                  {activeModalTopic.whyItMatters}
                </p>
              </div>

              {/* 3. Simple example */}
              <div className="bg-[#111c2d] p-4 sm:p-5 rounded-xl border border-[#1f2a3c]">
                <h4 className="text-[#4edea3] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  Simple Real-World Example
                </h4>
                <p className="text-xs sm:text-sm text-[#bbcabf] leading-relaxed italic">
                  "{activeModalTopic.simpleExample}"
                </p>
              </div>

              {/* 4. Common Misconception / Remember this */}
              <div className="bg-[#10b981]/10 p-4 sm:p-5 rounded-xl border border-[#4edea3]/25">
                <h4 className="text-[#4edea3] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">bookmark</span>
                  Common Misconception &amp; Takeaway
                </h4>
                <p className="text-xs sm:text-sm text-[#d8e3fb] font-medium leading-relaxed">
                  {activeModalTopic.commonMisconception}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModalTopic(null)}
                className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl hover:scale-[1.02] transition-transform"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
