import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ChatMessage,
  HealthMetrics,
  Meal,
  NavigationSection,
  ProgressEntry,
  UserProfile,
  WorkoutDay,
} from '../types';
import {
  EDUCATIONAL_TOPICS,
  INITIAL_MEALS,
  INITIAL_PROGRESS_ENTRIES,
  INITIAL_USER_PROFILE,
  WORKOUT_DAYS,
} from '../data/mockData';
import { calculateAllMetrics } from '../utils/healthCalculations';

const STORAGE_KEYS = {
  PROFILE: 'fitmate_profile_v1',
  MEALS: 'fitmate_meals_v1',
  PROGRESS: 'fitmate_progress_v1',
  COMPLETED_WORKOUTS: 'fitmate_completed_workouts_v1',
};

interface FitMateContextType {
  currentSection: NavigationSection;
  navigateTo: (section: NavigationSection) => void;
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetAllData: () => void;
  healthMetrics: HealthMetrics;
  
  // Workouts
  workoutSchedule: WorkoutDay[];
  selectedScheduleDayId: string;
  setSelectedScheduleDayId: (dayId: string) => void;
  isWorkoutMode: boolean;
  activeWorkoutDay: WorkoutDay;
  activeExerciseIndex: number;
  activeSetIndex: number;
  isTimerRunning: boolean;
  restTimerSeconds: number;
  isWorkoutCompleteModalOpen: boolean;
  workoutSummary: { duration: string; exercisesCount: number; setsCount: number } | null;
  startWorkout: (dayId?: string) => void;
  closeWorkoutMode: () => void;
  completeSet: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  toggleRestTimer: () => void;
  resetRestTimer: () => void;
  finishWorkoutEarly: () => void;
  closeCompleteModal: () => void;

  // Nutrition
  meals: Meal[];
  toggleMealCompletion: (mealId: string) => void;
  addCustomMeal: (meal: Omit<Meal, 'id'>) => void;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFats: number;

  // Progress
  progressEntries: ProgressEntry[];
  addProgressEntry: (entry: Omit<ProgressEntry, 'id'>) => void;

  // AI Assistant
  isAIAssistantOpen: boolean;
  toggleAIAssistant: (open?: boolean) => void;
  chatMessages: ChatMessage[];
  sendAIMessage: (text: string) => void;

  // Notifications / Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const FitMateContext = createContext<FitMateContextType | undefined>(undefined);

export const FitMateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3800);
  };

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
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
      } catch {
        // ignore
      }
      return updated;
    });
    showToast('Profile & metrics updated successfully!');
  };

  const resetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.MEALS);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_WORKOUTS);
    } catch {
      // ignore
    }
    setUserProfile(INITIAL_USER_PROFILE);
    setMeals(INITIAL_MEALS);
    setProgressEntries(INITIAL_PROGRESS_ENTRIES);
    showToast('All local FitMate data has been reset to defaults.', 'info');
  };

  // Meals
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEALS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_MEALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    } catch {
      // ignore
    }
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

  // Progress
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROGRESS_ENTRIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressEntries));
    } catch {
      // ignore
    }
  }, [progressEntries]);

  const addProgressEntry = (entry: Omit<ProgressEntry, 'id'>) => {
    const newEntry: ProgressEntry = {
      ...entry,
      id: `prog-${Date.now()}`,
    };
    setProgressEntries(prev => [...prev, newEntry]);
    // Also update current profile weight
    updateProfile({ weightKg: entry.weightKg });
    showToast('Progress entry saved and trajectory updated! 📈');
  };

  // Workout state
  const workoutSchedule = WORKOUT_DAYS;
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
  } | null>(null);

  const activeWorkoutDay = useMemo(() => {
    return workoutSchedule.find(d => d.id === activeDayId) || workoutSchedule[0];
  }, [workoutSchedule, activeDayId]);

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
  };

  const closeWorkoutMode = () => {
    setIsWorkoutMode(false);
    setIsTimerRunning(false);
  };

  const completeSet = () => {
    const currentEx = activeWorkoutDay.exercises[activeExerciseIndex];
    if (!currentEx) return;

    if (activeSetIndex < currentEx.sets) {
      setActiveSetIndex(prev => prev + 1);
      // Start rest timer
      setRestTimerSeconds(currentEx.restSeconds);
      setIsTimerRunning(true);
      showToast(`Set ${activeSetIndex} completed! Rest timer started (${currentEx.restSeconds}s).`);
    } else {
      // Completed all sets for this exercise
      if (activeExerciseIndex < activeWorkoutDay.exercises.length - 1) {
        setActiveExerciseIndex(prev => prev + 1);
        setActiveSetIndex(1);
        const nextEx = activeWorkoutDay.exercises[activeExerciseIndex + 1];
        setRestTimerSeconds(nextEx.restSeconds);
        setIsTimerRunning(true);
        showToast(`Finished ${currentEx.name}! Moving to ${nextEx.name}. 🎉`);
      } else {
        // Entire workout finished!
        finishWorkout();
      }
    }
  };

  const nextExercise = () => {
    if (activeExerciseIndex < activeWorkoutDay.exercises.length - 1) {
      setActiveExerciseIndex(prev => prev + 1);
      setActiveSetIndex(1);
      const nextEx = activeWorkoutDay.exercises[activeExerciseIndex + 1];
      setRestTimerSeconds(nextEx.restSeconds);
      setIsTimerRunning(false);
    } else {
      finishWorkout();
    }
  };

  const prevExercise = () => {
    if (activeExerciseIndex > 0) {
      setActiveExerciseIndex(prev => prev - 1);
      setActiveSetIndex(1);
      const prevEx = activeWorkoutDay.exercises[activeExerciseIndex - 1];
      setRestTimerSeconds(prevEx.restSeconds);
      setIsTimerRunning(false);
    }
  };

  const toggleRestTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const resetRestTimer = () => {
    const currentEx = activeWorkoutDay.exercises[activeExerciseIndex];
    setRestTimerSeconds(currentEx?.restSeconds || 60);
    setIsTimerRunning(false);
  };

  const finishWorkout = () => {
    setIsWorkoutMode(false);
    setIsTimerRunning(false);

    const totalSets = activeWorkoutDay.exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const summary = {
      duration: `${activeWorkoutDay.durationMinutes}m`,
      exercisesCount: activeWorkoutDay.exercises.length,
      setsCount: totalSets,
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
      } catch {
        // ignore
      }
      return updated;
    });

    showToast('Outstanding! Workout marked as complete! 🎉', 'success');
  };

  const finishWorkoutEarly = () => {
    finishWorkout();
  };

  const closeCompleteModal = () => {
    setIsWorkoutCompleteModalOpen(false);
  };

  // AI Assistant Chat state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${userProfile.name}! 👋 I am your FitMate Fitness Assistant. Based on your profile (${userProfile.weightKg}kg, ${userProfile.goal} goal, ${userProfile.activityLevel}), your daily target is ${healthMetrics.dailyCalorieTarget} kcal with ${healthMetrics.proteinTarget}g protein. How can I help you today?`,
      timestamp: 'Just now',
      suggestedPrompts: [
        'How much protein should I eat today?',
        'Suggest high-protein Indian vegetarian meals',
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

    // Intelligent response generator grounded in active user profile
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('protein')) {
        reply = `Based on your body weight of ${userProfile.weightKg} kg and your primary goal of "${userProfile.goal}", your estimated daily protein target is **${healthMetrics.proteinTarget} grams** (~${Math.round(healthMetrics.proteinTarget / 4)}g per meal across 4 meals). Good high-protein choices include Greek yogurt, eggs, paneer, chicken breast, lentils, and soya chunks.`;
      } else if (lower.includes('vegetarian') || lower.includes('veg') || lower.includes('indian')) {
        reply = `Great vegetarian protein sources in Indian diets include:\n• **Paneer**: ~18g protein per 100g\n• **Soya Chunks**: ~52g protein per 100g dry weight (the highest vegetarian source!)\n• **Curd / Greek Yogurt**: ~10-15g per bowl\n• **Moong Dal Chilla / Sprouts**: ~14-20g per serving\n• **Lentils / Dal**: Pair with rice for a complete amino acid profile.`;
      } else if (lower.includes('bmr') || lower.includes('mifflin')) {
        reply = `Your BMR (Basal Metabolic Rate) is calculated using the **Mifflin-St Jeor formula**:\n10 × weight (${userProfile.weightKg}kg) + 6.25 × height (${userProfile.heightCm}cm) - 5 × age (${userProfile.age}) + 5 = **${healthMetrics.bmr} kcal/day**.\nThis is the base energy your vital organs consume at complete rest.`;
      } else if (lower.includes('pre-workout') || lower.includes('before workout')) {
        reply = `For optimal workout performance, consume a mix of fast-digesting complex carbs and moderate protein 60–90 minutes beforehand. Good examples: a banana with 1 tbsp peanut butter, oatmeal with almond milk, or a sprouts poha bowl. Keep fats low right before lifting so digestion doesn't slow you down.`;
      } else if (lower.includes('deficit') || lower.includes('fat loss')) {
        reply = `Your Total Daily Energy Expenditure (TDEE) is **${healthMetrics.tdee} kcal**. To achieve steady fat loss of ~0.5kg per week without losing muscle, your recommended target is a moderate 20% deficit: **${healthMetrics.fatLossCalories} kcal/day**, paired with at least ${healthMetrics.proteinTarget}g of protein.`;
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

  const navigateTo = (section: NavigationSection) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FitMateContext.Provider
      value={{
        currentSection,
        navigateTo,
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
        isTimerRunning,
        restTimerSeconds,
        isWorkoutCompleteModalOpen,
        workoutSummary,
        startWorkout,
        closeWorkoutMode,
        completeSet,
        nextExercise,
        prevExercise,
        toggleRestTimer,
        resetRestTimer,
        finishWorkoutEarly,
        closeCompleteModal,
        meals,
        toggleMealCompletion,
        addCustomMeal,
        consumedCalories,
        consumedProtein,
        consumedCarbs,
        consumedFats,
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
