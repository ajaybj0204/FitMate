import React, { useEffect, useMemo, useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { ExerciseAnimation } from '../components/ExerciseAnimation';
import { LIBRARY_UI_TRANSLATIONS } from '../data/exerciseLibraryI18n';
import {
  BODY_GROUPS,
  DbExercise,
  LEVEL_LABEL,
  PHOTO_CREDIT,
  bodyGroupOf,
  categoryLabel,
  equipmentLabel,
  exercisePhotos,
  loadExerciseDb,
  popularRank,
  titleCase,
} from '../data/exerciseDb';
import { Exercise } from '../types';

interface ExerciseLibrarySectionProps {
  initialExerciseId?: string | null;
}

const PAGE_SIZE = 24;
type SortKey = 'popular' | 'name' | 'level-asc' | 'level-desc';
const LEVEL_ORDER = { beginner: 0, intermediate: 1, expert: 2 } as const;

/** Card photo: start position, crossfading to the end position on hover. */
const CardPhoto: React.FC<{ ex: DbExercise }> = ({ ex }) => {
  const [start, end] = exercisePhotos(ex);
  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-[#0b1422]">
      <img src={start} alt={`${ex.name}: start position`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      {end && (
        <img
          src={end}
          alt={`${ex.name}: end position`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      {end && (
        <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
          <span className="material-symbols-outlined text-[13px]">play_circle</span>
          <span className="hidden [@media(hover:hover)]:inline">Hover to preview</span>
          <span className="[@media(hover:hover)]:hidden">Tap for demo</span>
        </span>
      )}
    </div>
  );
};

export const ExerciseLibrarySection: React.FC<ExerciseLibrarySectionProps> = ({ initialExerciseId = null }) => {
  const { currentLanguage, savedExerciseIds, toggleFavoriteExercise, isFavoriteExercise, addExerciseToWorkoutDay, workoutSchedule } = useFitMate();
  const ui = LIBRARY_UI_TRANSLATIONS[currentLanguage] || LIBRARY_UI_TRANSLATIONS.en;

  // Library data (loaded on demand)
  const [db, setDb] = useState<DbExercise[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    loadExerciseDb().then(setDb).catch(() => setLoadError(true));
  }, []);

  // View state
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(initialExerciseId);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isAddToWorkoutModalOpen, setIsAddToWorkoutModalOpen] = useState(false);
  const [targetWorkoutDayId, setTargetWorkoutDayId] = useState<string>(workoutSchedule[0]?.id || 'monday');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [groupId, setGroupId] = useState('all');
  const [muscle, setMuscle] = useState('all');
  const [equipment, setEquipment] = useState('all');
  const [level, setLevel] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortKey>('popular');
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    if (initialExerciseId) setSelectedExerciseId(initialExerciseId);
  }, [initialExerciseId]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedExerciseId]);
  // New filters start again from the first page
  useEffect(() => setVisible(PAGE_SIZE), [searchQuery, groupId, muscle, equipment, level, category, sort, showOnlyFavorites]);

  const options = useMemo(() => {
    const list = db || [];
    const uniq = (xs: string[]) => [...new Set(xs)].sort();
    return {
      muscles: uniq(list.flatMap((e) => e.primaryMuscles)),
      equipment: uniq(list.map((e) => e.equipment)),
      categories: uniq(list.map((e) => e.category)),
    };
  }, [db]);

  const savedInLibrary = useMemo(() => (db ? db.filter((e) => savedExerciseIds.includes(e.id)).length : 0), [db, savedExerciseIds]);

  const filtered = useMemo(() => {
    if (!db) return [];
    const q = searchQuery.trim().toLowerCase();
    const group = BODY_GROUPS.find((g) => g.id === groupId);
    const list = db.filter((ex) => {
      if (showOnlyFavorites && !savedExerciseIds.includes(ex.id)) return false;
      if (group && !ex.primaryMuscles.some((m) => group.muscles.includes(m))) return false;
      if (muscle !== 'all' && !ex.primaryMuscles.includes(muscle)) return false;
      if (equipment !== 'all' && ex.equipment !== equipment) return false;
      if (level !== 'all' && ex.level !== level) return false;
      if (category !== 'all' && ex.category !== category) return false;
      if (q) {
        const hay = `${ex.name} ${ex.primaryMuscles.join(' ')} ${ex.secondaryMuscles.join(' ')} ${ex.equipment} ${ex.category}`.toLowerCase();
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    if (sort === 'popular') list.sort((a, b) => popularRank(a.id) - popularRank(b.id) || a.name.localeCompare(b.name));
    if (sort === 'level-asc') list.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.name.localeCompare(b.name));
    if (sort === 'level-desc') list.sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level] || a.name.localeCompare(b.name));
    return list;
  }, [db, searchQuery, groupId, muscle, equipment, level, category, sort, showOnlyFavorites, savedExerciseIds]);

  const activeFiltersCount = [groupId, muscle, equipment, level, category].filter((v) => v !== 'all').length + (showOnlyFavorites ? 1 : 0) + (searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setGroupId('all');
    setMuscle('all');
    setEquipment('all');
    setLevel('all');
    setCategory('all');
    setShowOnlyFavorites(false);
  };

  const selectedExercise = useMemo(() => (db && selectedExerciseId ? db.find((e) => e.id === selectedExerciseId) || null : null), [db, selectedExerciseId]);

  const handleConfirmAddToWorkout = () => {
    if (!selectedExercise) return;
    const ex = selectedExercise;
    const routineExercise: Exercise = {
      id: `ex-lib-${Date.now()}`,
      name: ex.name,
      targetMuscle: ex.primaryMuscles.map(titleCase).join(', '),
      targetMuscles: ex.primaryMuscles.map(titleCase),
      primaryMuscles: ex.primaryMuscles.map(titleCase),
      secondaryMuscles: ex.secondaryMuscles.map(titleCase),
      difficulty: LEVEL_LABEL[ex.level],
      sets: ex.category === 'stretching' ? 2 : 3,
      reps: ex.category === 'stretching' ? '30s hold' : ex.category === 'cardio' ? '45s' : '10-12',
      restSeconds: 60,
      instructions: ex.instructions.join(' '),
      formTips: [],
      imageUrl: exercisePhotos(ex)[0] || '',
      equipment: equipmentLabel(ex.equipment),
      exerciseDbId: ex.id,
      images: ex.images,
      calorieEstimate: ex.category === 'stretching' ? 10 : 30,
    };
    addExerciseToWorkoutDay(targetWorkoutDayId, routineExercise);
    setIsAddToWorkoutModalOpen(false);
  };

  const selectCls =
    'w-full bg-[#152031] border border-[#1f2a3c] focus:border-[#4edea3] rounded-xl px-3 py-2.5 text-xs text-[#d8e3fb] focus:outline-none cursor-pointer';

  // =========================================================================
  // LOADING / ERROR
  // =========================================================================
  if (loadError) {
    return (
      <div className="rounded-3xl border border-[#1f2a3c] bg-[#111c2d] p-10 text-center text-sm text-[#bbcabf]">
        The exercise library could not be loaded. Check your internet connection and try again.
      </div>
    );
  }

  if (!db) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <div className="h-36 animate-pulse rounded-3xl bg-[#111c2d]" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-[#111c2d]" />
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: EXERCISE DETAIL
  // =========================================================================
  if (selectedExercise) {
    const ex = selectedExercise;
    const isSaved = isFavoriteExercise(ex.id);
    const group = bodyGroupOf(ex);
    const related = db.filter((r) => r.id !== ex.id && r.primaryMuscles.some((m) => ex.primaryMuscles.includes(m))).sort((a, b) => Number(b.equipment === ex.equipment) - Number(a.equipment === ex.equipment)).slice(0, 6);

    return (
      <div className="flex w-full flex-col gap-6 pb-16 animate-in fade-in duration-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedExerciseId(null)}
            className="group flex items-center gap-2 rounded-xl border border-[#1f2a3c] bg-[#111c2d] px-4 py-2.5 text-xs font-semibold text-[#4edea3] shadow-md transition-all hover:bg-[#1f2a3c] hover:text-white sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>{ui.backToLibrary}</span>
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toggleFavoriteExercise(ex.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                isSaved ? 'border-[#ff6b4a] bg-[#ff6b4a]/20 text-[#ffb4ab] shadow-sm shadow-[#ff6b4a]/30' : 'border-[#1f2a3c] bg-[#152031] text-[#bbcabf] hover:bg-[#1f2a3c] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{isSaved ? 'favorite' : 'favorite_border'}</span>
              <span>{isSaved ? ui.inFavorites : ui.addToFavorites}</span>
            </button>
            <button
              onClick={() => setIsAddToWorkoutModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#4edea3] px-4 py-2 text-xs font-extrabold text-[#003824] shadow-md shadow-[#4edea3]/20 transition-all hover:scale-[1.02] hover:bg-[#6ffbbe] active:scale-[0.98] sm:text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{ui.addToWorkout}</span>
            </button>
          </div>
        </div>

        <div className="relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-[#1f2a3c] bg-[#111c2d] p-6 shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#4edea3]/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#4edea3]/30 bg-[#10b981]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#4edea3]">{categoryLabel(ex.category)}</span>
            {group && <span className="text-xs font-bold text-[#d8e3fb]">{group.emoji} {group.name}</span>}
            <span className="rounded-lg border border-[#1f2a3c] bg-[#152031] px-2 py-0.5 text-[11px] font-bold text-[#bbcabf]">{LEVEL_LABEL[ex.level]}</span>
            {ex.mechanic && <span className="rounded-lg border border-[#1f2a3c] bg-[#152031] px-2 py-0.5 text-[11px] font-bold text-[#bbcabf]">{titleCase(ex.mechanic)}</span>}
            {ex.force && <span className="rounded-lg border border-[#1f2a3c] bg-[#152031] px-2 py-0.5 text-[11px] font-bold text-[#bbcabf]">{titleCase(ex.force)}</span>}
          </div>
          <h1 className="relative font-headline text-3xl font-extrabold tracking-tight text-[#d8e3fb] sm:text-4xl">{ex.name}</h1>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <ExerciseAnimation
            exerciseName={ex.name}
            exerciseDbId={ex.id}
            images={ex.images}
            primaryMuscles={ex.primaryMuscles}
            secondaryMuscles={ex.secondaryMuscles}
            equipment={equipmentLabel(ex.equipment)}
            instructions={ex.instructions}
            mode="library"
          />
        </div>

        {related.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-headline text-lg font-bold text-[#d8e3fb]">{ui.relatedTitle}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {related.map((r) => (
                <button key={r.id} onClick={() => setSelectedExerciseId(r.id)} className="group flex flex-col gap-2 rounded-2xl border border-[#1f2a3c] bg-[#111c2d] p-2.5 text-left transition-all hover:border-[#4edea3]/40">
                  <CardPhoto ex={r} />
                  <span className="px-1 text-xs font-bold text-[#d8e3fb] group-hover:text-[#4edea3]">{r.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#1f2a3c] pt-6 sm:flex-row">
          <button
            onClick={() => setSelectedExerciseId(null)}
            className="flex items-center gap-2 rounded-xl border border-[#1f2a3c] bg-[#111c2d] px-5 py-3 text-sm font-bold text-[#4edea3] transition-all hover:bg-[#1f2a3c] hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{ui.backToLibrary}</span>
          </button>
          <p className="max-w-xl text-center text-[11px] italic leading-relaxed text-[#86948a] sm:text-right">{ui.disclaimerText}</p>
        </div>

        {isAddToWorkoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#060c16]/90 p-4 backdrop-blur-md">
            <div className="my-auto w-full max-w-md rounded-3xl border border-[#4edea3]/40 bg-[#111c2d] p-6 shadow-2xl animate-in fade-in zoom-in-95 sm:p-8">
              <div className="mb-5 flex items-center justify-between border-b border-[#1f2a3c] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4edea3]/20 text-[#4edea3]">
                    <span className="material-symbols-outlined text-[24px]">fitness_center</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">{ui.addToWorkout}</h3>
                    <p className="text-xs text-[#86948a]">Select target day in your weekly schedule</p>
                  </div>
                </div>
                <button onClick={() => setIsAddToWorkoutModalOpen(false)} className="p-1 text-[#86948a] hover:text-[#d8e3fb]" aria-label="Close">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold text-[#d8e3fb]">{ui.selectWorkoutDay}</label>
                <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
                  {workoutSchedule.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => setTargetWorkoutDayId(day.id)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        targetWorkoutDayId === day.id ? 'border-[#4edea3] bg-[#4edea3]/15 font-bold text-[#4edea3] shadow-md shadow-[#4edea3]/10' : 'border-[#1f2a3c] bg-[#152031] text-[#bbcabf] hover:bg-[#1f2a3c]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">
                          {day.dayName} • {day.splitName}
                        </div>
                        <div className="text-[10px] text-[#86948a]">
                          {day.focus} ({day.exercises.length} exercises)
                        </div>
                      </div>
                      {targetWorkoutDayId === day.id && <span className="material-symbols-outlined text-[18px] text-[#4edea3]">check_circle</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setIsAddToWorkoutModalOpen(false)} className="flex-1 rounded-xl bg-[#152031] px-4 py-3 text-xs font-bold text-[#bbcabf] hover:bg-[#1f2a3c]">
                  Cancel
                </button>
                <button onClick={handleConfirmAddToWorkout} className="flex-1 rounded-xl bg-[#4edea3] px-4 py-3 text-xs font-extrabold text-[#003824] shadow-lg shadow-[#4edea3]/20 hover:bg-[#6ffbbe]">
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
  // VIEW: LIBRARY DIRECTORY
  // =========================================================================
  const shown = filtered.slice(0, visible);

  return (
    <div className="flex w-full flex-col gap-8 pb-16">
      {/* HEADER */}
      <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-3xl border border-[#1f2a3c] bg-[#111c2d] p-6 shadow-2xl sm:p-8 md:flex-row md:items-end">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#4edea3]/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#4edea3]/30 bg-[#10b981]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#4edea3]">Real demo photos</span>
            <span className="text-xs text-[#86948a]">
              {ui.exerciseCountPrefix} <strong className="text-[#4edea3]">{filtered.length}</strong> {ui.exerciseCountSuffix}
            </span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-[#d8e3fb] sm:text-4xl">{ui.title}</h1>
          <p className="mt-1.5 text-xs leading-relaxed text-[#bbcabf] sm:text-sm">
            {db.length} exercises, each shown with real photos from start to finish position. Open any exercise to watch the demo.
          </p>
        </div>
        <div className="relative z-10">
          <button
            onClick={() => setShowOnlyFavorites((p) => !p)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all sm:text-sm ${
              showOnlyFavorites ? 'border-[#ff6b4a] bg-[#ff6b4a] text-white shadow-lg shadow-[#ff6b4a]/25' : 'border-[#1f2a3c] bg-[#152031] text-[#bbcabf] hover:bg-[#1f2a3c] hover:text-[#d8e3fb]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{showOnlyFavorites ? 'favorite' : 'favorite_border'}</span>
            <span>{ui.mySavedExercises}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${showOnlyFavorites ? 'bg-white/20 text-white' : 'bg-[#111c2d] text-[#4edea3]'}`}>{savedInLibrary}</span>
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-[#4edea3]">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={ui.searchPlaceholder}
          className="w-full rounded-2xl border border-[#1f2a3c] bg-[#111c2d] py-4 pl-12 pr-10 text-sm text-[#d8e3fb] placeholder-[#86948a] shadow-lg transition-all focus:border-[#4edea3] focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#86948a] hover:text-[#d8e3fb]" aria-label="Clear search">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* BODY-PART CHIPS */}
      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {[{ id: 'all', name: ui.allCategories, emoji: '✨' }, ...BODY_GROUPS].map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setGroupId(g.id);
              setMuscle('all');
            }}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
              groupId === g.id ? 'scale-[1.02] border-[#4edea3] bg-[#4edea3] text-[#003824] shadow-lg shadow-[#4edea3]/20' : 'border-[#1f2a3c] bg-[#111c2d] text-[#bbcabf] hover:bg-[#152031] hover:text-[#d8e3fb]'
            }`}
          >
            <span>{g.emoji}</span>
            <span>{g.name}</span>
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#1f2a3c] bg-[#111c2d] p-4 shadow-xl sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#4edea3]">tune</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#d8e3fb]">{ui.filterBy}</span>
            {activeFiltersCount > 0 && <span className="rounded-full bg-[#4edea3] px-2 py-0.5 text-[10px] font-extrabold text-[#003824]">{activeFiltersCount} Active</span>}
          </div>
          {activeFiltersCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs font-bold text-[#ffb4ab] hover:text-white">
              {ui.clearFilters}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#86948a]">{ui.targetMuscles}</span>
            <select value={muscle} onChange={(e) => setMuscle(e.target.value)} className={selectCls}>
              <option value="all">All</option>
              {options.muscles
                .filter((m) => groupId === 'all' || BODY_GROUPS.find((g) => g.id === groupId)?.muscles.includes(m))
                .map((m) => (
                  <option key={m} value={m}>
                    {titleCase(m)}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#86948a]">{ui.equipment}</span>
            <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className={selectCls}>
              <option value="all">All</option>
              {options.equipment.map((e) => (
                <option key={e} value={e}>
                  {equipmentLabel(e)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#86948a]">{ui.difficulty}</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls}>
              <option value="all">All</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Advanced</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#86948a]">{ui.movementType}</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              <option value="all">All</option>
              {options.categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#86948a]">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectCls}>
              <option value="popular">Popular first</option>
              <option value="name">A–Z</option>
              <option value="level-asc">Easiest first</option>
              <option value="level-desc">Hardest first</option>
            </select>
          </label>
        </div>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-[#1f2a3c] bg-[#111c2d] p-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-[#86948a]">search_off</span>
          <p className="text-sm text-[#bbcabf]">{ui.noExercisesFound}</p>
          <button onClick={clearAllFilters} className="rounded-xl bg-[#4edea3] px-5 py-2.5 text-xs font-bold text-[#003824] transition-colors hover:bg-[#6ffbbe]">
            {ui.clearFilters}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((ex) => {
              const isSaved = isFavoriteExercise(ex.id);
              return (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className="group relative flex cursor-pointer flex-col gap-3 rounded-3xl border border-[#1f2a3c] bg-[#111c2d] p-3.5 shadow-xl transition-all duration-200 hover:border-[#4edea3]/40 hover:bg-[#142234]"
                >
                  <CardPhoto ex={ex} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteExercise(ex.id);
                    }}
                    className={`absolute right-6 top-6 rounded-xl p-1.5 backdrop-blur transition-all ${isSaved ? 'bg-[#ff6b4a]/25 text-[#ff6b4a]' : 'bg-black/45 text-white hover:text-[#ffb4ab]'}`}
                    title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
                    aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <span className="material-symbols-outlined text-[20px]">{isSaved ? 'favorite' : 'favorite_border'}</span>
                  </button>
                  <div className="flex flex-wrap items-center gap-1.5 px-1">
                    <span className="rounded-full border border-[#4edea3]/30 bg-[#10b981]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#4edea3]">{categoryLabel(ex.category)}</span>
                    <span className="rounded-lg border border-[#1f2a3c] bg-[#152031] px-2 py-0.5 text-[10px] font-bold text-[#bbcabf]">{LEVEL_LABEL[ex.level]}</span>
                  </div>
                  <h3 className="px-1 font-headline text-base font-bold text-[#d8e3fb] transition-colors group-hover:text-[#4edea3] sm:text-lg">{ex.name}</h3>
                  <div className="space-y-1.5 border-t border-[#1f2a3c]/60 px-1 pt-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#86948a]">{ui.primary}:</span>
                      <span className="max-w-[65%] truncate text-right font-bold text-[#4edea3]">{ex.primaryMuscles.map(titleCase).join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#86948a]">{ui.equipment}:</span>
                      <span className="font-semibold text-[#d8e3fb]">{equipmentLabel(ex.equipment)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {visible < filtered.length && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="flex items-center gap-2 rounded-2xl border border-[#4edea3]/40 bg-[#152031] px-6 py-3 text-sm font-extrabold text-[#4edea3] transition-all hover:bg-[#4edea3] hover:text-[#003824]"
              >
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                Load more exercises
              </button>
              <span className="text-[11px] text-[#86948a]">
                Showing {shown.length} of {filtered.length}
              </span>
            </div>
          )}
        </>
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-[#1f2a3c] bg-[#111c2d] p-5 sm:flex-row sm:items-center sm:gap-3">
        <span className="material-symbols-outlined shrink-0 text-[24px] text-[#4edea3]">info</span>
        <p className="text-xs leading-relaxed text-[#86948a]">
          {ui.disclaimerText}{' '}
          <a href={PHOTO_CREDIT.url} target="_blank" rel="noopener noreferrer" className="text-[#5d6b7e] underline hover:text-[#86948a]">
            {PHOTO_CREDIT.label}
          </a>
        </p>
      </div>
    </div>
  );
};
