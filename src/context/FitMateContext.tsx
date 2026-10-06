import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AchievementBadge,
  ChatMessage,
  DailyPlanItem,
  Exercise,
  GroceryItem,
  HealthMetrics,
  Meal,
  NavigationSection,
  ProgressEntry,
  SetLog,
  SleepLog,
  SmartReminder,
  StepsLog,
  SupportedLanguage,
  UserProfile,
  WorkoutDay,
} from '../types';
import {
  INITIAL_ACHIEVEMENTS,
  INITIAL_DAILY_PLAN,
  INITIAL_GROCERY_ITEMS,
  INITIAL_MEALS,
  INITIAL_PROGRESS_ENTRIES,
  INITIAL_REMINDERS,
  INITIAL_SLEEP_LOG,
  INITIAL_STEPS_LOG,
  INITIAL_USER_PROFILE,
  WORKOUT_DAYS,
} from '../data/mockData';
import { calculateAllMetrics } from '../utils/healthCalculations';
import { TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEYS = {
  PROFILE: 'fitmate_profile_v1',
  MEALS: 'fitmate_meals_v1',
  PROGRESS: 'fitmate_progress_v1',
  COMPLETED_WORKOUTS: 'fitmate_completed_workouts_v1',
  LANGUAGE: 'fitmate_lang_v1',
  HYDRATION: 'fitmate_hydration_v1',
  SLEEP: 'fitmate_sleep_v1',
  STEPS: 'fitmate_steps_v1',
  DAILY_PLAN: 'fitmate_daily_plan_v1',
  REMINDERS: 'fitmate_reminders_v1',
  GROCERY: 'fitmate_grocery_v1',
  OVERLOAD: 'fitmate_overload_v1',
  SCHEDULE: 'fitmate_schedule_v1',
  FAVORITES: 'fitmate_favorite_exercises_v1',
};

interface FitMateContextType {
  // Navigation & History
  currentSection: NavigationSection;
  navigateTo: (section: NavigationSection) => void;
  goBack: () => void;
  canGoBack: boolean;

  // Language & i18n
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;

  // User Profile & Metrics
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetAllData: () => void;
  healthMetrics: HealthMetrics;

  // Workouts & Progressive Overload
  workoutSchedule: WorkoutDay[];
  selectedScheduleDayId: string;
  setSelectedScheduleDayId: (dayId: string) => void;
  isWorkoutMode: boolean;
  activeWorkoutDay: WorkoutDay;
  activeExerciseIndex: number;
  activeSetIndex: number;
  activeSetsLog: SetLog[];
  updateSetWeight: (setNumber: number, weightKg: number) => void;
  updateSetReps: (setNumber: number, actualReps: number) => void;
  totalWorkoutVolumeKg: number;
  previousBestForExercise: { weight: number; reps: number } | null;
  substituteExercise: (dayId: string, exerciseIndex: number, newExercise: Exercise) => void;
  addExerciseToWorkoutDay: (dayId: string, exercise: Exercise) => void;

  // Exercise Library Favorites
  savedExerciseIds: string[];
  toggleFavoriteExercise: (id: string) => void;
  isFavoriteExercise: (id: string) => boolean;

  // Rest Timer
  isTimerRunning: boolean;
  restTimerSeconds: number;
  startWorkout: (dayId?: string) => void;
  closeWorkoutMode: () => void;
  completeSet: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  toggleRestTimer: () => void;
  resetRestTimer: () => void;
  finishWorkoutEarly: () => void;
  isWorkoutCompleteModalOpen: boolean;
  workoutSummary: {
    duration: string;
    exercisesCount: number;
    setsCount: number;
    totalVolumeKg: number;
    caloriesBurned: number;
  } | null;
  closeCompleteModal: () => void;

  // Nutrition
  meals: Meal[];
  toggleMealCompletion: (mealId: string) => void;
  addCustomMeal: (meal: Omit<Meal, 'id'>) => void;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFats: number;

  // Hydration
  hydrationMl: number;
  waterGoalMl: number;
  addWaterMl: (amountMl: number) => void;
  resetWater: () => void;

  // Steps & Sleep Recovery
  stepsLog: StepsLog;
  logSteps: (steps: number) => void;
  sleepLog: SleepLog;
  logSleep: (hours: number, minutes: number, quality: SleepLog['sleepQuality']) => void;

  // Daily Plan
  dailyPlanItems: DailyPlanItem[];
  toggleDailyPlanItem: (id: string) => void;

  // Smart Reminders
  reminders: SmartReminder[];
  toggleReminder: (id: string) => void;
  isRemindersModalOpen: boolean;
  setIsRemindersModalOpen: (open: boolean) => void;

  // Smart Grocery List
  groceryItems: GroceryItem[];
  toggleGroceryItem: (id: string) => void;
  addMealToGrocery: (meal: Meal) => void;
  isGroceryModalOpen: boolean;
  setIsGroceryModalOpen: (open: boolean) => void;

  // Achievements
  achievements: AchievementBadge[];

  // Progress
  progressEntries: ProgressEntry[];
  addProgressEntry: (entry: Omit<ProgressEntry, 'id'>) => void;

  // AI Assistant
  isAIAssistantOpen: boolean;
  toggleAIAssistant: (open?: boolean) => void;
  chatMessages: ChatMessage[];
  sendAIMessage: (text: string) => void;

  // Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const FitMateContext = createContext<FitMateContextType | undefined>(undefined);

export const FitMateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & History Stack
  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<NavigationSection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Language state & translation helper
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved && ['en', 'kn', 'te', 'ta', 'ml'].includes(saved)) {
        return saved as SupportedLanguage;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {}
    showToast(`Language updated to ${lang.toUpperCase()}`, 'info');
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[currentLanguage];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USER_PROFILE;
  });

  // Calculate Health Metrics dynamically
  const healthMetrics = useMemo(() => {
    return calculateAllMetrics(userProfile);
  }, [userProfile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Profile & calculations updated successfully!');
  };

  // Navigation handlers with History Stack
  const navigateTo = (section: NavigationSection) => {
    if (section === currentSection) return;
    setNavigationHistory(prev => [...prev, currentSection]);
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ section }, '', `#${section}`);
    } catch {}
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const prevSection = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentSection(prevSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentSection('dashboard');
    }
  };

  const canGoBack = navigationHistory.length > 0 && currentSection !== 'dashboard';

  // Listen to browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.section) {
        setCurrentSection(e.state.section);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Hydration state
  const [hydrationMl, setHydrationMl] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HYDRATION);
      if (saved) return Number(saved);
    } catch {}
    return 1800; // Realistic default
  });

  const waterGoalMl = Math.round(healthMetrics.waterTargetLiters * 1000);

  const addWaterMl = (amount: number) => {
    setHydrationMl(prev => {
      const next = prev + amount;
      try {
        localStorage.setItem(STORAGE_KEYS.HYDRATION, String(next));
      } catch {}
      return next;
    });
    showToast(`Logged +${amount}ml water! 💧`, 'info');
  };

  const resetWater = () => {
    setHydrationMl(0);
    try {
      localStorage.setItem(STORAGE_KEYS.HYDRATION, '0');
    } catch {}
    showToast('Hydration counter reset for today.', 'info');
  };

  // Steps & Sleep logs
  const [stepsLog, setStepsLog] = useState<StepsLog>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STEPS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STEPS_LOG;
  });

  const logSteps = (newSteps: number) => {
    setStepsLog(prev => {
      const updated: StepsLog = {
        ...prev,
        currentSteps: newSteps,
        distanceKm: Number((newSteps * 0.00076).toFixed(1)),
        caloriesBurned: Math.round(newSteps * 0.045),
      };
      try {
        localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Logged ${newSteps.toLocaleString()} steps today! 👟`);
  };

  const [sleepLog, setSleepLog] = useState<SleepLog>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SLEEP);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SLEEP_LOG;
  });

  const logSleep = (hours: number, minutes: number, quality: SleepLog['sleepQuality']) => {
    // Score based on duration & quality
    const baseScore = Math.min(100, Math.round((hours + minutes / 60) / 8 * 85));
    const qualityBonus = quality === 'Deep' ? 15 : quality === 'Restful' ? 10 : quality === 'Fair' ? 0 : -10;
    const finalScore = Math.max(30, Math.min(100, baseScore + qualityBonus));

    const updated: SleepLog = {
      date: 'Today',
      sleepHours: hours,
      sleepMinutes: minutes,
      sleepQuality: quality,
      recoveryScore: finalScore,
      restingHeartRate: 54,
    };
    setSleepLog(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SLEEP, JSON.stringify(updated));
    } catch {}
    showToast(`Sleep logged: ${hours}h ${minutes}m. Recovery Score: ${finalScore}% 🌙`);
  };

  // Daily Plan state
  const [dailyPlanItems, setDailyPlanItems] = useState<DailyPlanItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAILY_PLAN);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DAILY_PLAN;
  });

  const toggleDailyPlanItem = (id: string) => {
    setDailyPlanItems(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item));
      try {
        localStorage.setItem(STORAGE_KEYS.DAILY_PLAN, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Smart Reminders
  const [reminders, setReminders] = useState<SmartReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REMINDERS;
  });
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);

  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const next = prev.map(rem => {
        if (rem.id === id) {
          const enabled = !rem.enabled;
          showToast(enabled ? `Reminder activated: ${rem.title}` : `Reminder paused: ${rem.title}`, 'info');
          return { ...rem, enabled };
        }
        return rem;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Smart Grocery List
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GROCERY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_GROCERY_ITEMS;
  });
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);

  const toggleGroceryItem = (id: string) => {
    setGroceryItems(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item));
      try {
        localStorage.setItem(STORAGE_KEYS.GROCERY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addMealToGrocery = (meal: Meal) => {
    const ingredients = meal.ingredients;
    if (!ingredients || ingredients.length === 0) return;
    const newItems: GroceryItem[] = ingredients.map((ing, idx) => ({
      id: `groc-${Date.now()}-${idx}`,
      name: ing,
      quantity: '1 serving',
      category: meal.dietaryType === 'non-veg' ? 'Protein & Dairy' : 'Produce',
      estimatedCostInr: Math.round((meal.costInr || 50) / ingredients.length),
      checked: false,
    }));
    setGroceryItems(prev => [...newItems, ...prev]);
    showToast(`Added ${ingredients.length} ingredients from "${meal.name}" to grocery list! 🛒`);
  };

  // Meals
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEALS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    } catch {}
  }, [meals]);

  const toggleMealCompletion = (mealId: string) => {
    setMeals(prev =>
      prev.map(m => {
        if (m.id === mealId) {
          const newState = !m.completed;
          showToast(newState ? `Marked "${m.name}" as eaten! 🥗` : `Unmarked "${m.name}".`, 'info');
          return { ...m, completed: newState };
        }
        return m;
      })
    );
  };

  const addCustomMeal = (meal: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...meal,
      id: `meal-${Date.now()}`,
    };
    setMeals(prev => [newMeal, ...prev]);
    showToast(`Added custom meal: ${meal.name}`);
  };

  const consumedCalories = useMemo(() => {
    return meals.filter(m => m.completed).reduce((sum, m) => sum + m.calories, 0);
  }, [meals]);

  const consumedProtein = useMemo(() => {
    return meals.filter(m => m.completed).reduce((sum, m) => sum + m.protein, 0);
  }, [meals]);

  const consumedCarbs = useMemo(() => {
    return meals.filter(m => m.completed).reduce((sum, m) => sum + m.carbs, 0);
  }, [meals]);

  const consumedFats = useMemo(() => {
    return meals.filter(m => m.completed).reduce((sum, m) => sum + m.fats, 0);
  }, [meals]);

  // Progress Entries
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROGRESS_ENTRIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressEntries));
    } catch {}
  }, [progressEntries]);

  const addProgressEntry = (entry: Omit<ProgressEntry, 'id'>) => {
    const newEntry: ProgressEntry = {
      ...entry,
      id: `prog-${Date.now()}`,
    };
    setProgressEntries(prev => [...prev, newEntry]);
    updateProfile({ weightKg: entry.weightKg });
    showToast('Progress entry saved and trajectory updated! 📈');
  };

  // Workout Schedule & Customization
  const [workoutSchedule, setWorkoutSchedule] = useState<WorkoutDay[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return WORKOUT_DAYS;
  });

  const substituteExercise = (dayId: string, exerciseIndex: number, newExercise: Exercise) => {
    setWorkoutSchedule(prev => {
      const next = prev.map(day => {
        if (day.id === dayId) {
          const updatedExercises = [...day.exercises];
          updatedExercises[exerciseIndex] = newExercise;
          return { ...day, exercises: updatedExercises };
        }
        return day;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Substituted exercise with "${newExercise.name}"! 🔄`);
  };

  const addExerciseToWorkoutDay = (dayId: string, exercise: Exercise) => {
    setWorkoutSchedule(prev => {
      const next = prev.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            exercises: [...day.exercises, exercise],
            durationMinutes: day.durationMinutes + 10,
          };
        }
        return day;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Added "${exercise.name}" to your scheduled workout! 🏋️`);
  };

  // Exercise Library Favorites
  const [savedExerciseIds, setSavedExerciseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['lib-barbell-squat', 'lib-barbell-bench-press', 'lib-pullups', 'lib-plank'];
  });

  const toggleFavoriteExercise = (id: string) => {
    setSavedExerciseIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      } catch {}
      showToast(exists ? 'Removed from saved favorites' : 'Saved to favorites! ⭐', 'info');
      return updated;
    });
  };

  const isFavoriteExercise = (id: string) => savedExerciseIds.includes(id);

  const [selectedScheduleDayId, setSelectedScheduleDayId] = useState<string>('monday');
  const [isWorkoutMode, setIsWorkoutMode] = useState<boolean>(false);
  const [activeDayId, setActiveDayId] = useState<string>('monday');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [activeSetIndex, setActiveSetIndex] = useState<number>(1);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isWorkoutCompleteModalOpen, setIsWorkoutCompleteModalOpen] = useState<boolean>(false);
  const [workoutSummary, setWorkoutSummary] = useState<{
    duration: string;
    exercisesCount: number;
    setsCount: number;
    totalVolumeKg: number;
    caloriesBurned: number;
  } | null>(null);

  // Progressive Overload records: exerciseId -> { maxWeight: number, reps: number, date: string }
  const [overloadHistory, setOverloadHistory] = useState<Record<string, { weight: number; reps: number }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OVERLOAD);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'ex-1': { weight: 60, reps: 8 },
      'ex-2': { weight: 18, reps: 10 },
      'ex-7': { weight: 45, reps: 10 },
      'ex-10': { weight: 80, reps: 6 },
    };
  });

  // Active workout set-by-set logging
  const [activeSetsLog, setActiveSetsLog] = useState<SetLog[]>([]);

  const activeWorkoutDay = useMemo(() => {
    return workoutSchedule.find(d => d.id === activeDayId) || workoutSchedule[0];
  }, [workoutSchedule, activeDayId]);

  const currentExercise = activeWorkoutDay?.exercises[activeExerciseIndex];

  // Set-by-set weight and rep updater
  const updateSetWeight = (setNumber: number, weightKg: number) => {
    setActiveSetsLog(prev =>
      prev.map(s => (s.setNumber === setNumber ? { ...s, weightKg } : s))
    );
  };

  const updateSetReps = (setNumber: number, actualReps: number) => {
    setActiveSetsLog(prev =>
      prev.map(s => (s.setNumber === setNumber ? { ...s, actualReps } : s))
    );
  };

  const totalWorkoutVolumeKg = useMemo(() => {
    return activeSetsLog
      .filter(s => s.completed)
      .reduce((acc, s) => acc + s.weightKg * s.actualReps, 0);
  }, [activeSetsLog]);

  const previousBestForExercise = useMemo(() => {
    if (!currentExercise) return null;
    return overloadHistory[currentExercise.id] || null;
  }, [currentExercise, overloadHistory]);

  // Rest Timer ticking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            showToast('Rest timer finished! Time for next set 💪', 'info');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restTimerSeconds]);

  const initSetsForExercise = (exercise: Exercise) => {
    const defaultWt = exercise.defaultWeightKg || 20;
    const defaultReps = parseInt(exercise.reps.split('-')[0]) || 10;
    const sets: SetLog[] = Array.from({ length: exercise.sets }, (_, i) => ({
      setNumber: i + 1,
      targetReps: defaultReps,
      actualReps: defaultReps,
      weightKg: defaultWt,
      completed: false,
    }));
    setActiveSetsLog(sets);
  };

  const startWorkout = (dayId?: string) => {
    const targetDayId = dayId || selectedScheduleDayId || 'monday';
    const targetDay = workoutSchedule.find(d => d.id === targetDayId) || workoutSchedule[0];
    if (targetDay.isRest || targetDay.exercises.length === 0) {
      showToast('Today is scheduled as a Rest & Recovery day. Take it easy!', 'info');
      return;
    }
    setActiveDayId(targetDayId);
    setActiveExerciseIndex(0);
    setActiveSetIndex(1);
    setRestTimerSeconds(targetDay.exercises[0]?.restSeconds || 60);
    setIsTimerRunning(false);
    setIsWorkoutMode(true);
    setIsWorkoutCompleteModalOpen(false);
    if (targetDay.exercises[0]) {
      initSetsForExercise(targetDay.exercises[0]);
    }
  };

  const closeWorkoutMode = () => {
    setIsWorkoutMode(false);
    setIsTimerRunning(false);
  };

  const completeSet = () => {
    if (!currentExercise) return;

    // Mark current set as completed in log
    setActiveSetsLog(prev =>
      prev.map(s => (s.setNumber === activeSetIndex ? { ...s, completed: true } : s))
    );

    // Save overload record
    const curSet = activeSetsLog.find(s => s.setNumber === activeSetIndex);
    if (curSet && curSet.weightKg > 0) {
      setOverloadHistory(prev => {
        const next = {
          ...prev,
          [currentExercise.id]: {
            weight: curSet.weightKg,
            reps: curSet.actualReps,
          },
        };
        try {
          localStorage.setItem(STORAGE_KEYS.OVERLOAD, JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    if (activeSetIndex < currentExercise.sets) {
      setActiveSetIndex(prev => prev + 1);
      setRestTimerSeconds(currentExercise.restSeconds);
      setIsTimerRunning(true);
      showToast(`Set ${activeSetIndex} logged! Rest timer started (${currentExercise.restSeconds}s).`);
    } else {
      // Completed all sets for this exercise
      if (activeExerciseIndex < activeWorkoutDay.exercises.length - 1) {
        const nextIdx = activeExerciseIndex + 1;
        const nextEx = activeWorkoutDay.exercises[nextIdx];
        setActiveExerciseIndex(nextIdx);
        setActiveSetIndex(1);
        initSetsForExercise(nextEx);
        setRestTimerSeconds(nextEx.restSeconds);
        setIsTimerRunning(true);
        showToast(`Finished ${currentExercise.name}! Moving to ${nextEx.name}. 🎉`);
      } else {
        finishWorkout();
      }
    }
  };

  const nextExercise = () => {
    if (activeExerciseIndex < activeWorkoutDay.exercises.length - 1) {
      const nextIdx = activeExerciseIndex + 1;
      const nextEx = activeWorkoutDay.exercises[nextIdx];
      setActiveExerciseIndex(nextIdx);
      setActiveSetIndex(1);
      initSetsForExercise(nextEx);
      setRestTimerSeconds(nextEx.restSeconds);
      setIsTimerRunning(false);
    } else {
      finishWorkout();
    }
  };

  const prevExercise = () => {
    if (activeExerciseIndex > 0) {
      const prevIdx = activeExerciseIndex - 1;
      const prevEx = activeWorkoutDay.exercises[prevIdx];
      setActiveExerciseIndex(prevIdx);
      setActiveSetIndex(1);
      initSetsForExercise(prevEx);
      setRestTimerSeconds(prevEx.restSeconds);
      setIsTimerRunning(false);
    }
  };

  const toggleRestTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const resetRestTimer = () => {
    setRestTimerSeconds(currentExercise?.restSeconds || 60);
    setIsTimerRunning(false);
  };

  const finishWorkout = () => {
    setIsWorkoutMode(false);
    setIsTimerRunning(false);

    const totalSets = activeWorkoutDay.exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const estimatedCalories = Math.round(activeWorkoutDay.durationMinutes * 8.5);

    const summary = {
      duration: `${activeWorkoutDay.durationMinutes}m`,
      exercisesCount: activeWorkoutDay.exercises.length,
      setsCount: totalSets,
      totalVolumeKg: Math.max(1200, totalWorkoutVolumeKg || 3450),
      caloriesBurned: estimatedCalories,
    };
    setWorkoutSummary(summary);
    setIsWorkoutCompleteModalOpen(true);

    // Increment completed workouts and streak
    setUserProfile(prev => {
      const updated = {
        ...prev,
        completedWorkoutsCount: prev.completedWorkoutsCount + 1,
        streakDays: prev.streakDays + 1,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Add Progress History Entry with estimated calories
    const todayStr = new Date().toISOString().split('T')[0];
    const latestEntry = progressEntries[0];
    const newProgressEntry: ProgressEntry = {
      id: `prog-wo-${Date.now()}`,
      date: todayStr,
      weightKg: userProfile.weightKg,
      waistInches: latestEntry ? latestEntry.waistInches : 31.5,
      chestInches: latestEntry ? latestEntry.chestInches : 39.5,
      armsInches: latestEntry ? latestEntry.armsInches : 15.0,
      thighsInches: latestEntry ? latestEntry.thighsInches : 22.8,
      bodyFatPercent: latestEntry?.bodyFatPercent || 15.0,
      notes: `Finished ${activeWorkoutDay.splitName} Workout (${activeWorkoutDay.exercises.length} exercises, ${totalSets} sets, ${summary.totalVolumeKg}kg total volume). ~${estimatedCalories} kcal burned (est).`,
    };
    setProgressEntries(prev => [newProgressEntry, ...prev]);

    // Save completed workout session history
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.COMPLETED_WORKOUTS);
      const list = existing ? JSON.parse(existing) : [];
      list.push({
        id: `cw-${Date.now()}`,
        date: todayStr,
        dayId: activeWorkoutDay.id,
        splitName: activeWorkoutDay.splitName,
        caloriesBurned: estimatedCalories,
        totalVolumeKg: summary.totalVolumeKg,
        durationMinutes: activeWorkoutDay.durationMinutes,
        exercisesCount: activeWorkoutDay.exercises.length,
        setsCount: totalSets,
      });
      localStorage.setItem(STORAGE_KEYS.COMPLETED_WORKOUTS, JSON.stringify(list));
    } catch {}

    showToast(`Outstanding! Workout marked as complete! ~${estimatedCalories} kcal burned. 🎉`, 'success');
  };

  const finishWorkoutEarly = () => {
    finishWorkout();
  };

  const closeCompleteModal = () => {
    setIsWorkoutCompleteModalOpen(false);
  };

  // Achievements
  const achievements = useMemo(() => {
    return INITIAL_ACHIEVEMENTS.map(ach => {
      if (ach.id === 'ach-2') {
        return { ...ach, progress: userProfile.streakDays, unlocked: userProfile.streakDays >= 14 };
      }
      if (ach.id === 'ach-1') {
        return { ...ach, unlocked: userProfile.completedWorkoutsCount >= 1 };
      }
      return ach;
    });
  }, [userProfile]);

  // AI Assistant Chat state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${userProfile.name}! 👋 I am your FITORA AI Fitness & Nutrition Coach. Grounded in exercise biomechanics and tailored Indian nutrition, your daily target is ${healthMetrics.dailyCalorieTarget} kcal with ${healthMetrics.proteinTarget}g protein. How can I guide your progress today?`,
      timestamp: 'Just now',
      suggestedPrompts: [
        'How to apply progressive overload on Bench Press?',
        'Suggest budget Indian vegetarian meals under ₹150',
        'How does Mifflin-St Jeor calculate my BMR?',
        'What should I eat before my workout?',
      ],
    },
  ]);

  const toggleAIAssistant = (open?: boolean) => {
    setIsAIAssistantOpen(prev => (open !== undefined ? open : !prev));
  };

  const sendAIMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setChatMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('overload') || lower.includes('progressive')) {
        reply = `**Progressive Overload Strategy for ${userProfile.name}**:\n1. **Weight**: Increase load by 1.25–2.5 kg once you hit the top of your target rep range (e.g. 10 reps).\n2. **Reps**: If you cannot add weight, aim for +1 extra clean repetition with identical cadence.\n3. **Volume**: Total volume = Sets × Reps × Weight. Track your session volume in the active workout mode to verify week-over-week growth.`;
      } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('cheap')) {
        reply = `**Budget-Friendly Indian High-Protein Staples**:\n• **Soya Chunks**: ₹120/kg (~520g protein/kg) = only **₹0.23 per gram of protein**! (The most cost-effective source in India).\n• **Farm Eggs**: ~₹6.5 per egg (6g protein) = ~**₹1.1 per gram of protein**.\n• **Yellow Moong Dal / Sprouts**: ₹130/kg = ~**₹1.4 per gram of protein**.\n• **Low-fat Paneer**: ₹360/kg = ~**₹2.0 per gram of protein**.\nCheck the new "Smart Grocery List" in the Nutrition section for automated cost estimation!`;
      } else if (lower.includes('protein')) {
        reply = `Based on your body weight of ${userProfile.weightKg} kg and your primary goal of "${userProfile.goal}", your estimated daily protein target is **${healthMetrics.proteinTarget} grams** (~${Math.round(healthMetrics.proteinTarget / 4)}g per meal across 4 meals). Good choices include eggs, paneer, chicken breast, lentils, curd, and soya chunks.`;
      } else if (lower.includes('sleep') || lower.includes('recovery')) {
        reply = `During deep slow-wave sleep (stages 3 & 4), up to **70% of your daily Human Growth Hormone (HGH)** is pulsed. Sleeping less than 7 hours blunts muscle protein synthesis and increases cortisol. Aim for 7.5 to 8.5 hours in a dark, cool bedroom.`;
      } else if (lower.includes('bmr') || lower.includes('mifflin')) {
        reply = `Your BMR (Basal Metabolic Rate) is calculated using the **Mifflin-St Jeor formula**:\n10 × weight (${userProfile.weightKg}kg) + 6.25 × height (${userProfile.heightCm}cm) - 5 × age (${userProfile.age}) + 5 = **${healthMetrics.bmr} kcal/day**.\nThis is the base energy your vital organs consume at complete rest.`;
      } else {
        reply = `According to your current blueprint, you're tracking towards **${userProfile.goal}** with an activity multiplier of ${userProfile.activityLevel}. Keep prioritizing your daily ${healthMetrics.proteinTarget}g protein and ${healthMetrics.waterTargetLiters}L hydration! Let me know if you want workout adjustments or recipe recommendations.`;
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: reply,
        timestamp: 'Just now',
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const resetAllData = () => {
    try {
      localStorage.clear();
    } catch {}
    setUserProfile(INITIAL_USER_PROFILE);
    setMeals(INITIAL_MEALS);
    setProgressEntries(INITIAL_PROGRESS_ENTRIES);
    setHydrationMl(1800);
    setDailyPlanItems(INITIAL_DAILY_PLAN);
    setReminders(INITIAL_REMINDERS);
    setGroceryItems(INITIAL_GROCERY_ITEMS);
    showToast('All local FITORA data has been reset to defaults.', 'info');
  };

  return (
    <FitMateContext.Provider
      value={{
        currentSection,
        navigateTo,
        goBack,
        canGoBack,
        currentLanguage,
        setLanguage,
        t,
        userProfile,
        updateProfile,
        resetAllData,
        healthMetrics,
        workoutSchedule,
        selectedScheduleDayId,
        setSelectedScheduleDayId,
        isWorkoutMode,
        activeWorkoutDay,
        activeExerciseIndex,
        activeSetIndex,
        activeSetsLog,
        updateSetWeight,
        updateSetReps,
        totalWorkoutVolumeKg,
        previousBestForExercise,
        substituteExercise,
        addExerciseToWorkoutDay,
        savedExerciseIds,
        toggleFavoriteExercise,
        isFavoriteExercise,
        isTimerRunning,
        restTimerSeconds,
        startWorkout,
        closeWorkoutMode,
        completeSet,
        nextExercise,
        prevExercise,
        toggleRestTimer,
        resetRestTimer,
        finishWorkoutEarly,
        isWorkoutCompleteModalOpen,
        workoutSummary,
        closeCompleteModal,
        meals,
        toggleMealCompletion,
        addCustomMeal,
        consumedCalories,
        consumedProtein,
        consumedCarbs,
        consumedFats,
        hydrationMl,
        waterGoalMl,
        addWaterMl,
        resetWater,
        stepsLog,
        logSteps,
        sleepLog,
        logSleep,
        dailyPlanItems,
        toggleDailyPlanItem,
        reminders,
        toggleReminder,
        isRemindersModalOpen,
        setIsRemindersModalOpen,
        groceryItems,
        toggleGroceryItem,
        addMealToGrocery,
        isGroceryModalOpen,
        setIsGroceryModalOpen,
        achievements,
        progressEntries,
        addProgressEntry,
        isAIAssistantOpen,
        toggleAIAssistant,
        chatMessages,
        sendAIMessage,
        toast,
        showToast,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </FitMateContext.Provider>
  );
};

export const useFitMate = () => {
  const context = useContext(FitMateContext);
  if (!context) {
    throw new Error('useFitMate must be used within a FitMateProvider');
  }
  return context;
};

// FITORA Brand Aliases
export const useFitora = useFitMate;
export const FitoraProvider = FitMateProvider;
export const FitoraContext = FitMateContext;
