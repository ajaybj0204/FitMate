import React, { useState, useMemo, useEffect } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { ExerciseAnimation } from '../components/ExerciseAnimation';
import {
  EXERCISE_CATEGORIES,
  EXERCISE_LIBRARY_DATABASE,
  ExerciseCategoryMeta,
} from '../data/exerciseLibraryData';
import {
  LIBRARY_UI_TRANSLATIONS,
  LOCALIZED_EXERCISES,
} from '../data/exerciseLibraryI18n';
import {
  BodyPartFilter,
  DifficultyFilter,
  EquipmentFilter,
  ExerciseLibraryItem,
  GoalFilter,
  MovementTypeFilter,
} from '../types/exerciseLibrary';
import { Exercise } from '../types';

interface ExerciseLibrarySectionProps {
  initialExerciseId?: string | null;
}

export const ExerciseLibrarySection: React.FC<ExerciseLibrarySectionProps> = ({
  initialExerciseId = null,
}) => {
  const {
    currentLanguage,
    savedExerciseIds,
    toggleFavoriteExercise,
    isFavoriteExercise,
    addExerciseToWorkoutDay,
    workoutSchedule,
    navigateTo,
  } = useFitMate();

  const ui = LIBRARY_UI_TRANSLATIONS[currentLanguage] || LIBRARY_UI_TRANSLATIONS.en;

  // Navigation / View State
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(initialExerciseId);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filters State
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bodyPartFilter, setBodyPartFilter] = useState<BodyPartFilter>('All');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>('All');
  const [movementTypeFilter, setMovementTypeFilter] = useState<MovementTypeFilter>('All');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // "Add to Workout" Modal state
  const [isAddToWorkoutModalOpen, setIsAddToWorkoutModalOpen] = useState(false);
  const [targetWorkoutDayId, setTargetWorkoutDayId] = useState<string>(workoutSchedule[0]?.id || 'monday');

  // Sync initial exercise if prop changes
  useEffect(() => {
    if (initialExerciseId) {
      setSelectedExerciseId(initialExerciseId);
    }
  }, [initialExerciseId]);

  // Scroll to top when selecting an exercise
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedExerciseId]);

  // Selected Exercise Object
  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null;
    return EXERCISE_LIBRARY_DATABASE.find(e => e.id === selectedExerciseId) || null;
  }, [selectedExerciseId]);

  // Localized Content Helper
  const getLocalizedExercise = (exercise: ExerciseLibraryItem) => {
    const loc = LOCALIZED_EXERCISES[exercise.id]?.[currentLanguage];
    return {
      name: loc?.name || exercise.name,
      shortDescription: loc?.shortDescription || exercise.shortDescription,
      simpleExplanation: loc?.simpleExplanation || exercise.simpleExplanation,
      scientificExplanation: loc?.scientificExplanation || exercise.scientificExplanation,
      instructions: loc?.instructions || exercise.instructions,
      formTips: loc?.formTips || exercise.formTips,
      commonMistakes: loc?.commonMistakes || exercise.commonMistakes,
      safetyNotes: loc?.safetyNotes || exercise.safetyNotes,
      benefits: loc?.benefits || exercise.benefits,
    };
  };

  // Filtered Exercises List
  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY_DATABASE.filter(ex => {
      // Favorites filter
      if (showOnlyFavorites && !savedExerciseIds.includes(ex.id)) {
        return false;
      }

      // Category filter
      if (selectedCategorySlug !== 'all') {
        const matchesCategory =
          ex.categorySlug === selectedCategorySlug ||
          ex.category.toLowerCase().includes(selectedCategorySlug.toLowerCase()) ||
          ex.bodyPart.toLowerCase().includes(selectedCategorySlug.toLowerCase());
        if (!matchesCategory) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const loc = LOCALIZED_EXERCISES[ex.id]?.[currentLanguage];
        const localizedName = loc?.name ? loc.name.toLowerCase() : '';
        const matches =
          ex.name.toLowerCase().includes(query) ||
          localizedName.includes(query) ||
          ex.primaryMuscles.some(m => m.toLowerCase().includes(query)) ||
          ex.secondaryMuscles.some(m => m.toLowerCase().includes(query)) ||
          ex.equipment.toLowerCase().includes(query) ||
          ex.bodyPart.toLowerCase().includes(query) ||
          ex.movementPattern.toLowerCase().includes(query) ||
          ex.goals.some(g => g.toLowerCase().includes(query)) ||
          ex.category.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Body Part Filter
      if (bodyPartFilter !== 'All' && ex.bodyPart !== bodyPartFilter) {
        return false;
      }

      // Goal Filter
      if (goalFilter !== 'All' && !ex.goals.includes(goalFilter)) {
        return false;
      }

      // Difficulty Filter
      if (difficultyFilter !== 'All' && ex.difficulty !== difficultyFilter) {
        return false;
      }

      // Equipment Filter
      if (equipmentFilter !== 'All' && ex.equipment !== equipmentFilter) {
        return false;
      }

      // Movement Type Filter
      if (movementTypeFilter !== 'All' && ex.exerciseType !== movementTypeFilter) {
        return false;
      }

      return true;
    });
  }, [
    showOnlyFavorites,
    savedExerciseIds,
    selectedCategorySlug,
    searchQuery,
    bodyPartFilter,
    goalFilter,
    difficultyFilter,
    equipmentFilter,
    movementTypeFilter,
    currentLanguage,
  ]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (bodyPartFilter !== 'All') count++;
    if (goalFilter !== 'All') count++;
    if (difficultyFilter !== 'All') count++;
    if (equipmentFilter !== 'All') count++;
    if (movementTypeFilter !== 'All') count++;
    if (selectedCategorySlug !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (showOnlyFavorites) count++;
    return count;
  }, [
    bodyPartFilter,
    goalFilter,
    difficultyFilter,
    equipmentFilter,
    movementTypeFilter,
    selectedCategorySlug,
    searchQuery,
    showOnlyFavorites,
  ]);

  const clearAllFilters = () => {
    setSelectedCategorySlug('all');
    setSearchQuery('');
    setBodyPartFilter('All');
    setGoalFilter('All');
    setDifficultyFilter('All');
    setEquipmentFilter('All');
    setMovementTypeFilter('All');
    setShowOnlyFavorites(false);
  };

  // Convert Library Item into a Routine Exercise Item
  const handleConfirmAddToWorkout = () => {
    if (!selectedExercise) return;
    const routineExercise: Exercise = {
      id: `ex-lib-${Date.now()}`,
      name: selectedExercise.name,
      targetMuscle: selectedExercise.primaryMuscles.join(', '),
      targetMuscles: selectedExercise.primaryMuscles,
      primaryMuscles: selectedExercise.primaryMuscles,
      secondaryMuscles: selectedExercise.secondaryMuscles,
      difficulty: selectedExercise.difficulty,
      sets: 3,
      reps: selectedExercise.exerciseType === 'Cardio' ? '45s' : '10-12',
      restSeconds: 60,
      instructions: selectedExercise.instructions[0] || 'Perform with controlled tempo and strict form.',
      formTips: selectedExercise.formTips,
      imageUrl: selectedExercise.imageUrl,
      equipment: selectedExercise.equipment,
      animationType: selectedExercise.animationType,
      calorieEstimate: Math.round((selectedExercise.calorieBurnPerMin || 7) * 4),
    };

    addExerciseToWorkoutDay(targetWorkoutDayId, routineExercise);
    setIsAddToWorkoutModalOpen(false);
  };

  // =========================================================================
  // VIEW: INDIVIDUAL DETAILED EXERCISE VIEW
  // =========================================================================
  if (selectedExercise) {
    const loc = getLocalizedExercise(selectedExercise);
    const isSaved = isFavoriteExercise(selectedExercise.id);
    const relatedList = EXERCISE_LIBRARY_DATABASE.filter(ex =>
      selectedExercise.relatedExerciseIds.includes(ex.id)
    );

    return (
      <div className="flex flex-col w-full gap-6 pb-16 animate-in fade-in duration-200">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => setSelectedExerciseId(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111c2d] hover:bg-[#1f2a3c] text-[#4edea3] hover:text-white border border-[#1f2a3c] text-xs sm:text-sm font-semibold transition-all shadow-md group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span>{ui.backToLibrary}</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Favorite toggle */}
            <button
              onClick={() => toggleFavoriteExercise(selectedExercise.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSaved
                  ? 'bg-[#ff6b4a]/20 border-[#ff6b4a] text-[#ffb4ab] shadow-sm shadow-[#ff6b4a]/30'
                  : 'bg-[#152031] border-[#1f2a3c] text-[#bbcabf] hover:text-white hover:bg-[#1f2a3c]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSaved ? 'favorite' : 'favorite_border'}
              </span>
              <span>{isSaved ? ui.inFavorites : ui.addToFavorites}</span>
            </button>

            {/* Add to workout routine button */}
            <button
              onClick={() => setIsAddToWorkoutModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-[#4edea3]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{ui.addToWorkout}</span>
            </button>
          </div>
        </div>

        {/* HERO EXERCISE BANNER */}
        <div className="bg-[#111c2d] rounded-3xl p-6 sm:p-8 border border-[#1f2a3c] shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/30">
              {selectedExercise.category}
            </span>
            <span className="text-xs text-[#86948a] font-medium">•</span>
            <span className="text-xs font-bold text-[#d8e3fb]">
              {selectedExercise.bodyPart}
            </span>
            <span className="text-xs text-[#86948a] font-medium">•</span>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#152031] text-[#9ddf2e] border border-[#1f2a3c] font-semibold">
              {selectedExercise.difficulty}
            </span>
            <span className="text-xs text-[#86948a] font-medium">•</span>
            <span className="text-xs text-[#bbcabf]">
              {ui.movementPatternLabel}: <strong className="text-[#d8e3fb]">{selectedExercise.movementPattern}</strong>
            </span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#d8e3fb] tracking-tight">
            {loc.name}
          </h1>

          <p className="text-sm sm:text-base text-[#bbcabf] max-w-3xl leading-relaxed">
            {loc.shortDescription}
          </p>

          {/* Quick Specifications Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1f2a3c]/60">
            <div className="bg-[#0c1421] p-3 rounded-2xl border border-[#1f2a3c]">
              <span className="text-[10px] text-[#86948a] uppercase font-bold block">{ui.equipment}</span>
              <span className="font-headline text-sm font-bold text-[#d8e3fb] mt-0.5 block">
                {selectedExercise.equipment}
              </span>
            </div>
            <div className="bg-[#0c1421] p-3 rounded-2xl border border-[#1f2a3c]">
              <span className="text-[10px] text-[#86948a] uppercase font-bold block">{ui.difficulty}</span>
              <span className="font-headline text-sm font-bold text-[#4edea3] mt-0.5 block">
                {selectedExercise.difficulty}
              </span>
              <span className="text-[10px] text-[#86948a] truncate block" title={selectedExercise.difficultyReason}>
                {selectedExercise.difficultyReason}
              </span>
            </div>
            <div className="bg-[#0c1421] p-3 rounded-2xl border border-[#1f2a3c]">
              <span className="text-[10px] text-[#86948a] uppercase font-bold block">{ui.movementType}</span>
              <span className="font-headline text-sm font-bold text-[#9ddf2e] mt-0.5 block">
                {selectedExercise.exerciseType}
              </span>
            </div>
            <div className="bg-[#0c1421] p-3 rounded-2xl border border-[#1f2a3c]">
              <span className="text-[10px] text-[#86948a] uppercase font-bold block">Burn Rate (est.)</span>
              <span className="font-headline text-sm font-bold text-[#ff897d] mt-0.5 block tabular-nums">
                ~{selectedExercise.calorieBurnPerMin || 7} kcal/min
              </span>
            </div>
          </div>
        </div>

        {/* 3D BIOMECHANICAL ANIMATION DEMONSTRATION SECTION */}
        <div className="bg-[#111c2d] rounded-3xl p-4 sm:p-6 border border-[#1f2a3c] shadow-2xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3] text-[22px]">
                accessibility_new
              </span>
              <h2 className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb]">
                Human Exercise Demonstration
              </h2>
            </div>
            <span className="text-xs text-[#4edea3] bg-[#0c1421] px-3 py-1 rounded-full border border-[#4edea3]/30 font-semibold">
              Realistic 3D Athlete
            </span>
          </div>

          <ExerciseAnimation
            type={selectedExercise.animationType || 'squat'}
            exerciseName={selectedExercise.name}
            targetMuscle={selectedExercise.primaryMuscles.join(', ')}
            primaryMuscles={selectedExercise.primaryMuscles}
            secondaryMuscles={selectedExercise.secondaryMuscles}
            equipment={selectedExercise.equipment}
            instructions={loc.instructions[0] || 'Perform movement with strict control.'}
            formTips={loc.formTips}
            calorieEstimate={Math.round((selectedExercise.calorieBurnPerMin || 7) * 4)}
            photoUrl={selectedExercise.imageUrl}
            mode="library"
          />
        </div>

        {/* TWO-COLUMN INSTRUCTIONS & FORM CUES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Step-by-Step Instructions */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Step-by-Step Instructions */}
            <div className="bg-[#111c2d] rounded-3xl p-6 sm:p-8 border border-[#1f2a3c] shadow-xl">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1f2a3c]">
                <div className="w-8 h-8 rounded-lg bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
                </div>
                <h3 className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb]">
                  {ui.instructionsTitle}
                </h3>
              </div>

              <ol className="flex flex-col gap-4">
                {loc.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3.5 text-xs sm:text-sm text-[#d8e3fb] leading-relaxed">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#152336] text-[#4edea3] font-extrabold text-xs shrink-0 border border-[#4edea3]/30 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>

              {/* Equipment Alternatives where applicable */}
              {selectedExercise.equipmentAlternatives.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#1f2a3c]/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a] flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[16px] text-[#4edea3]">swap_horizontal_circle</span>
                    {ui.equipmentAlternatives}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.equipmentAlternatives.map((alt, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#0c1421] text-[#bbcabf] border border-[#1f2a3c]"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SCIENTIFIC EXPLANATION: WHY THIS EXERCISE MATTERS */}
            <div className="bg-[#111c2d] rounded-3xl p-6 sm:p-8 border border-[#1f2a3c] shadow-xl flex flex-col gap-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f2a3c]">
                <div className="w-8 h-8 rounded-lg bg-[#9ddf2e]/10 text-[#9ddf2e] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb]">
                    {ui.whyItMattersTitle}
                  </h3>
                  <span className="text-xs text-[#86948a]">Physiological breakdown &amp; real-world translation</span>
                </div>
              </div>

              {/* Simple Real-World Explanation */}
              <div className="bg-[#0b1420] p-4 sm:p-5 rounded-2xl border border-[#1f2a3c]">
                <span className="text-xs font-bold text-[#4edea3] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  {ui.simpleExplanationTitle}
                </span>
                <p className="text-xs sm:text-sm text-[#bbcabf] leading-relaxed">
                  {loc.simpleExplanation}
                </p>
              </div>

              {/* Scientific & Biomechanical Explanation */}
              <div className="bg-[#0b1420] p-4 sm:p-5 rounded-2xl border border-[#9ddf2e]/30">
                <span className="text-xs font-bold text-[#9ddf2e] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[16px]">science</span>
                  {ui.scientificExplanationTitle}
                </span>
                <p className="text-xs sm:text-sm text-[#d8e3fb] leading-relaxed">
                  {loc.scientificExplanation}
                </p>
              </div>

              {/* Key Benefits List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#d8e3fb] mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#4edea3]">check_circle</span>
                  {ui.benefitsTitle}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {loc.benefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-[#152336]/60 p-3 rounded-xl border border-[#1f2a3c] text-xs text-[#bbcabf]"
                    >
                      <span className="material-symbols-outlined text-[#4edea3] text-[16px] shrink-0 mt-0.5">
                        verified
                      </span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peer-Reviewed Scientific References */}
              {selectedExercise.references.length > 0 && (
                <div className="pt-4 border-t border-[#1f2a3c]/60">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#86948a] flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-[14px]">menu_book</span>
                    {ui.referencesTitle}
                  </span>
                  <ul className="flex flex-col gap-1.5">
                    {selectedExercise.references.map((ref, i) => (
                      <li key={i} className="text-[11px] text-[#86948a] italic leading-snug">
                        • {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Form Tips, Common Mistakes, Safety, Muscles */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Primary & Secondary Muscles Card */}
            <div className="bg-[#111c2d] rounded-3xl p-6 border border-[#1f2a3c] shadow-xl">
              <h4 className="font-headline text-base font-bold text-[#d8e3fb] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-[20px]">fitness_center</span>
                Anatomical Engagement
              </h4>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4edea3] block mb-1.5">
                    {ui.primary} Muscles Worked
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedExercise.primaryMuscles.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#4edea3]/15 text-[#4edea3] font-bold text-xs border border-[#4edea3]/30"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a] block mb-1.5">
                    {ui.secondary} Stabilizers &amp; Assisting
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedExercise.secondaryMuscles.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#152336] text-[#bbcabf] font-medium text-xs border border-[#1f2a3c]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form & Technique Tips */}
            <div className="bg-[#111c2d] rounded-3xl p-6 border border-[#1f2a3c] shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#1f2a3c]">
                <span className="material-symbols-outlined text-[#4edea3] text-[20px]">task_alt</span>
                <h4 className="font-headline text-base font-bold text-[#d8e3fb]">
                  {ui.formTipsTitle}
                </h4>
              </div>

              <ul className="flex flex-col gap-2.5">
                {loc.formTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#d8e3fb] leading-relaxed">
                    <span className="material-symbols-outlined text-[#4edea3] text-[16px] shrink-0 mt-0.5">
                      check
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes to Avoid */}
            <div className="bg-[#111c2d] rounded-3xl p-6 border border-[#ffb4ab]/30 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#1f2a3c]">
                <span className="material-symbols-outlined text-[#ffb4ab] text-[20px]">cancel</span>
                <h4 className="font-headline text-base font-bold text-[#ffb4ab]">
                  {ui.commonMistakesTitle}
                </h4>
              </div>

              <ul className="flex flex-col gap-2.5">
                {loc.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#bbcabf] leading-relaxed">
                    <span className="material-symbols-outlined text-[#ffb4ab] text-[16px] shrink-0 mt-0.5">
                      close
                    </span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety & Clinical Considerations */}
            <div className="bg-[#101e18] p-5 rounded-3xl border border-[#4edea3]/40 shadow-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-[#4edea3] text-[22px] shrink-0 mt-0.5">
                health_and_safety
              </span>
              <div>
                <h5 className="font-headline text-xs font-bold text-[#4edea3] uppercase tracking-wider mb-1">
                  {ui.safetyTitle}
                </h5>
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  {loc.safetyNotes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED EXERCISES SECTION */}
        {relatedList.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#1f2a3c]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-xl font-bold text-[#d8e3fb] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3]">dataset</span>
                {ui.relatedTitle}
              </h3>
              <span className="text-xs text-[#86948a]">Alternative progressions &amp; complementary movements</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedList.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => setSelectedExerciseId(rel.id)}
                  className="bg-[#111c2d] hover:bg-[#152031] p-4 rounded-2xl border border-[#1f2a3c] hover:border-[#4edea3]/40 cursor-pointer transition-all hover:-translate-y-1 shadow-md group flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#152336] text-[#4edea3] border border-[#1f2a3c]">
                        {rel.difficulty}
                      </span>
                      <span className="text-[10px] text-[#86948a]">{rel.equipment}</span>
                    </div>
                    <h4 className="font-headline text-sm font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors">
                      {rel.name}
                    </h4>
                    <p className="text-[11px] text-[#86948a] line-clamp-2 mt-1">
                      {rel.shortDescription}
                    </p>
                  </div>

                  <div className="text-xs text-[#4edea3] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{ui.viewExercise}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Back Button & Medical Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1f2a3c]">
          <button
            onClick={() => setSelectedExerciseId(null)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#111c2d] hover:bg-[#1f2a3c] text-[#4edea3] hover:text-white border border-[#1f2a3c] text-sm font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{ui.backToLibrary}</span>
          </button>

          <p className="text-[11px] text-[#86948a] max-w-xl text-center sm:text-right leading-relaxed italic">
            {ui.disclaimerText}
          </p>
        </div>

        {/* ADD TO WORKOUT MODAL */}
        {isAddToWorkoutModalOpen && (
          <div className="fixed inset-0 bg-[#060c16]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#111c2d] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-[#4edea3]/40 my-auto animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-[#1f2a3c] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">fitness_center</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">
                      {ui.addToWorkout}
                    </h3>
                    <p className="text-xs text-[#86948a]">Select target day in your weekly schedule</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddToWorkoutModalOpen(false)}
                  className="text-[#86948a] hover:text-[#d8e3fb] p-1"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-[#d8e3fb] block mb-2">
                  {ui.selectWorkoutDay}
                </label>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {workoutSchedule.map(day => (
                    <button
                      key={day.id}
                      onClick={() => setTargetWorkoutDayId(day.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        targetWorkoutDayId === day.id
                          ? 'bg-[#4edea3]/15 border-[#4edea3] text-[#4edea3] font-bold shadow-md shadow-[#4edea3]/10'
                          : 'bg-[#152031] border-[#1f2a3c] text-[#bbcabf] hover:bg-[#1f2a3c]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{day.dayName} • {day.splitName}</div>
                        <div className="text-[10px] text-[#86948a]">{day.focus} ({day.exercises.length} exercises)</div>
                      </div>
                      {targetWorkoutDayId === day.id && (
                        <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setIsAddToWorkoutModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#152031] text-[#bbcabf] text-xs font-bold hover:bg-[#1f2a3c]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAddToWorkout}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-extrabold hover:bg-[#6ffbbe] shadow-lg shadow-[#4edea3]/20"
                >
                  Confirm &amp; Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN EXERCISE LIBRARY DIRECTORY
  // =========================================================================
  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#111c2d] p-6 sm:p-8 rounded-3xl border border-[#1f2a3c] shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/30">
              FITORA Knowledge Base
            </span>
            <span className="text-xs text-[#86948a]">
              {ui.exerciseCountPrefix} <strong className="text-[#4edea3]">{filteredExercises.length}</strong> {ui.exerciseCountSuffix}
            </span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-[#d8e3fb] tracking-tight">
            {ui.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#bbcabf] mt-1.5 leading-relaxed">
            {ui.subtitle}
          </p>
        </div>

        {/* Saved Favorites Quick Filter Toggle */}
        <div className="relative z-10 flex items-center gap-2">
          <button
            onClick={() => setShowOnlyFavorites(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
              showOnlyFavorites
                ? 'bg-[#ff6b4a] text-white border-[#ff6b4a] shadow-lg shadow-[#ff6b4a]/25'
                : 'bg-[#152031] text-[#bbcabf] hover:text-[#d8e3fb] border-[#1f2a3c] hover:bg-[#1f2a3c]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {showOnlyFavorites ? 'favorite' : 'favorite_border'}
            </span>
            <span>{ui.mySavedExercises}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              showOnlyFavorites ? 'bg-white/20 text-white' : 'bg-[#111c2d] text-[#4edea3]'
            }`}>
              {savedExerciseIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* TOP SEARCH BAR */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4edea3] text-[22px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={ui.searchPlaceholder}
          className="w-full bg-[#111c2d] border border-[#1f2a3c] focus:border-[#4edea3] rounded-2xl pl-12 pr-10 py-4 text-sm text-[#d8e3fb] placeholder-[#86948a] shadow-lg focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86948a] hover:text-[#d8e3fb] p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* HORIZONTAL CATEGORIES CAROUSEL RIBBON */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#86948a]">
            Exercise Categories
          </span>
          <span className="text-xs text-[#4edea3] font-semibold">
            {EXERCISE_CATEGORIES.length} Categories
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#1f2a3c]">
          {EXERCISE_CATEGORIES.map(cat => {
            const isSelected = selectedCategorySlug === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategorySlug(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#4edea3] text-[#003824] border-[#4edea3] shadow-lg shadow-[#4edea3]/20 scale-[1.02]'
                    : 'bg-[#111c2d] text-[#bbcabf] border-[#1f2a3c] hover:bg-[#152031] hover:text-[#d8e3fb]'
                }`}
                title={cat.description}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPREHENSIVE FILTER STRIP (DESKTOP & MOBILE ACCORDION) */}
      <div className="bg-[#111c2d] p-4 sm:p-5 rounded-2xl border border-[#1f2a3c] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">tune</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#d8e3fb]">
              {ui.filterBy}
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-[10px] bg-[#4edea3] text-[#003824] px-2 py-0.5 rounded-full font-extrabold">
                {activeFiltersCount} Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#ffb4ab] hover:underline transition-colors flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                <span>{ui.clearFilters}</span>
              </button>
            )}

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(prev => !prev)}
              className="sm:hidden text-xs text-[#4edea3] font-bold flex items-center gap-1"
            >
              <span>{isMobileFiltersOpen ? 'Hide' : 'Expand'}</span>
              <span className="material-symbols-outlined text-[16px]">
                {isMobileFiltersOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {/* Filters Grid (Visible on Desktop, toggleable on mobile) */}
        <div className={`grid grid-cols-2 sm:grid-cols-5 gap-3 ${isMobileFiltersOpen ? 'grid' : 'hidden sm:grid'}`}>
          {/* 1. Body Part */}
          <div>
            <label className="text-[10px] text-[#86948a] font-bold uppercase tracking-wider block mb-1">
              {ui.bodyPart}
            </label>
            <select
              value={bodyPartFilter}
              onChange={e => setBodyPartFilter(e.target.value as BodyPartFilter)}
              className="w-full bg-[#152031] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] font-semibold focus:outline-none focus:border-[#4edea3]"
            >
              <option value="All">All Body Parts</option>
              <option value="Full Body">Full Body</option>
              <option value="Upper Body">Upper Body</option>
              <option value="Lower Body">Lower Body</option>
              <option value="Core">Core</option>
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Arms">Arms</option>
              <option value="Legs">Legs</option>
              <option value="Glutes">Glutes</option>
              <option value="Hips">Hips</option>
            </select>
          </div>

          {/* 2. Goal */}
          <div>
            <label className="text-[10px] text-[#86948a] font-bold uppercase tracking-wider block mb-1">
              {ui.goal}
            </label>
            <select
              value={goalFilter}
              onChange={e => setGoalFilter(e.target.value as GoalFilter)}
              className="w-full bg-[#152031] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] font-semibold focus:outline-none focus:border-[#4edea3]"
            >
              <option value="All">All Goals</option>
              <option value="Strength">Strength</option>
              <option value="Muscle Growth">Muscle Growth</option>
              <option value="Fat Loss">Fat Loss</option>
              <option value="Endurance">Endurance</option>
              <option value="Mobility">Mobility</option>
              <option value="Flexibility">Flexibility</option>
              <option value="Balance">Balance</option>
              <option value="General Fitness">General Fitness</option>
              <option value="Recovery">Recovery</option>
            </select>
          </div>

          {/* 3. Difficulty */}
          <div>
            <label className="text-[10px] text-[#86948a] font-bold uppercase tracking-wider block mb-1">
              {ui.difficulty}
            </label>
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value as DifficultyFilter)}
              className="w-full bg-[#152031] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] font-semibold focus:outline-none focus:border-[#4edea3]"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* 4. Equipment */}
          <div>
            <label className="text-[10px] text-[#86948a] font-bold uppercase tracking-wider block mb-1">
              {ui.equipment}
            </label>
            <select
              value={equipmentFilter}
              onChange={e => setEquipmentFilter(e.target.value as EquipmentFilter)}
              className="w-full bg-[#152031] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] font-semibold focus:outline-none focus:border-[#4edea3]"
            >
              <option value="All">All Equipment</option>
              <option value="No Equipment">No Equipment (Bodyweight)</option>
              <option value="Dumbbell">Dumbbell</option>
              <option value="Barbell">Barbell</option>
              <option value="Kettlebell">Kettlebell</option>
              <option value="Resistance Band">Resistance Band</option>
              <option value="Cable">Cable Machine</option>
              <option value="Machine">Gym Machine</option>
            </select>
          </div>

          {/* 5. Movement Type */}
          <div>
            <label className="text-[10px] text-[#86948a] font-bold uppercase tracking-wider block mb-1">
              {ui.movementType}
            </label>
            <select
              value={movementTypeFilter}
              onChange={e => setMovementTypeFilter(e.target.value as MovementTypeFilter)}
              className="w-full bg-[#152031] border border-[#3c4a42] rounded-xl px-2.5 py-2 text-xs text-[#d8e3fb] font-semibold focus:outline-none focus:border-[#4edea3]"
            >
              <option value="All">All Types</option>
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Mobility">Mobility</option>
              <option value="Stretch">Stretch</option>
              <option value="Warm-up">Warm-up</option>
              <option value="Cool-down">Cool-down</option>
              <option value="Balance">Balance</option>
              <option value="Functional">Functional</option>
            </select>
          </div>
        </div>
      </div>

      {/* EXERCISES GRID SECTION */}
      <div>
        {filteredExercises.length === 0 ? (
          <div className="bg-[#111c2d] p-12 rounded-3xl border border-[#1f2a3c] text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#152031] text-[#86948a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">search_off</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">
              No Exercises Found
            </h3>
            <p className="text-xs sm:text-sm text-[#86948a] max-w-md">
              {ui.noExercisesFound}
            </p>
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold hover:bg-[#6ffbbe] transition-colors"
            >
              {ui.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExercises.map(exercise => {
              const loc = getLocalizedExercise(exercise);
              const isSaved = isFavoriteExercise(exercise.id);

              return (
                <div
                  key={exercise.id}
                  className="bg-[#111c2d] hover:bg-[#142234] rounded-3xl p-5 border border-[#1f2a3c] hover:border-[#4edea3]/40 shadow-xl transition-all duration-200 flex flex-col justify-between gap-4 group relative"
                >
                  {/* Top Bar with Badges & Favorite Toggle */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/30">
                          {exercise.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#152031] text-[#bbcabf] border border-[#1f2a3c]">
                          {exercise.difficulty}
                        </span>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavoriteExercise(exercise.id);
                        }}
                        className={`p-1.5 rounded-xl transition-all ${
                          isSaved
                            ? 'text-[#ff6b4a] bg-[#ff6b4a]/15'
                            : 'text-[#86948a] hover:text-[#ffb4ab] hover:bg-[#152031]'
                        }`}
                        title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isSaved ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                    </div>

                    {/* Exercise Title & Description */}
                    <h3
                      onClick={() => setSelectedExerciseId(exercise.id)}
                      className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb] group-hover:text-[#4edea3] transition-colors cursor-pointer"
                    >
                      {loc.name}
                    </h3>

                    <p className="text-xs text-[#86948a] line-clamp-2 mt-1.5 leading-relaxed">
                      {loc.shortDescription}
                    </p>
                  </div>

                  {/* Muscle & Equipment Metadata Tags */}
                  <div className="space-y-2 pt-2 border-t border-[#1f2a3c]/60">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#86948a] font-semibold">{ui.primary}:</span>
                      <span className="text-[#4edea3] font-bold truncate max-w-[65%] text-right">
                        {exercise.primaryMuscles.join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#86948a] font-semibold">{ui.secondary}:</span>
                      <span className="text-[#bbcabf] truncate max-w-[65%] text-right">
                        {exercise.secondaryMuscles.join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#86948a] font-semibold">{ui.equipment}:</span>
                      <span className="text-[#d8e3fb] font-semibold">{exercise.equipment}</span>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedExerciseId(exercise.id)}
                      className="w-full bg-[#152031] group-hover:bg-[#4edea3] text-[#4edea3] group-hover:text-[#003824] font-extrabold text-xs py-3 px-4 rounded-xl border border-[#4edea3]/30 group-hover:border-[#4edea3] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>{ui.viewExercise}</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Safety & Medical Disclaimer Footer Banner */}
      <div className="bg-[#111c2d] p-5 rounded-2xl border border-[#1f2a3c] flex items-center gap-3">
        <span className="material-symbols-outlined text-[#4edea3] text-[24px] shrink-0">
          info
        </span>
        <p className="text-xs text-[#86948a] leading-relaxed">
          {ui.disclaimerText}
        </p>
      </div>
    </div>
  );
};
