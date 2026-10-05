import { ActivityLevel, FitnessGoal, HealthMetrics, UserProfile } from '../types';

export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  explanation: string;
} {
  const heightM = heightCm / 100;
  if (heightM <= 0 || weightKg <= 0) {
    return {
      bmi: 22.0,
      category: 'Normal weight',
      explanation: 'Healthy weight-to-height ratio.',
    };
  }

  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  let category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese' = 'Normal weight';
  let explanation = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    explanation = 'Body weight is lower than standard recommended threshold for this height.';
  } else if (bmi < 25.0) {
    category = 'Normal weight';
    explanation = 'Weight falls within the optimal statistical health screening range.';
  } else if (bmi < 30.0) {
    category = 'Overweight';
    explanation = 'Body weight is higher than standard reference range. Muscle mass can contribute to this.';
  } else {
    category = 'Obese';
    explanation = 'Higher weight-to-height ratio. Recommend consulting a healthcare professional.';
  }

  return { bmi, category, explanation };
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'Male' | 'Female' | 'Other'
): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  let bmr = base + 5;
  if (sex === 'Female') {
    bmr = base - 161;
  } else if (sex === 'Other') {
    bmr = base - 78;
  }
  return Math.round(bmr);
}

export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  switch (activityLevel) {
    case 'Sedentary':
      return 1.2;
    case 'Lightly Active':
      return 1.375;
    case 'Moderately Active':
      return 1.55;
    case 'Very Active':
      return 1.725;
    default:
      return 1.55;
  }
}

export function calculateAllMetrics(profile: Partial<UserProfile>): HealthMetrics {
  const weight = profile.weightKg || 76.5;
  const height = profile.heightCm || 182;
  const age = profile.age || 28;
  const sex = profile.sex || 'Male';
  const goal: FitnessGoal = profile.goal || 'Build Muscle';
  const activityLevel: ActivityLevel = profile.activityLevel || 'Very Active';

  const { bmi, category, explanation } = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, sex);
  const multiplier = getActivityMultiplier(activityLevel);
  const tdee = Math.round(bmr * multiplier);

  const maintenanceCalories = tdee;
  const fatLossCalories = Math.round(tdee * 0.8);
  const muscleGainCalories = Math.round(tdee * 1.1);

  let dailyCalorieTarget = maintenanceCalories;
  let proteinPerKg = 1.8;

  switch (goal) {
    case 'Lose Fat':
      dailyCalorieTarget = fatLossCalories;
      proteinPerKg = 2.2;
      break;
    case 'Build Muscle':
      dailyCalorieTarget = muscleGainCalories;
      proteinPerKg = 2.0;
      break;
    case 'Build Strength':
      dailyCalorieTarget = Math.round(tdee * 1.05);
      proteinPerKg = 2.0;
      break;
    case 'Maintain Weight':
      dailyCalorieTarget = maintenanceCalories;
      proteinPerKg = 1.8;
      break;
    case 'General Fitness':
      dailyCalorieTarget = Math.round(tdee * 0.95);
      proteinPerKg = 1.6;
      break;
  }

  const proteinTarget = Math.round(weight * proteinPerKg);
  // Estimate fats at ~25% of calories
  const fatsTarget = Math.round((dailyCalorieTarget * 0.25) / 9);
  // Carbs = remainder
  const carbsCalories = dailyCalorieTarget - proteinTarget * 4 - fatsTarget * 9;
  const carbsTarget = Math.max(50, Math.round(carbsCalories / 4));

  // Water: 35ml per kg body weight + exercise buffer
  const activityBuffer = activityLevel === 'Very Active' ? 0.7 : activityLevel === 'Moderately Active' ? 0.5 : 0.3;
  const rawWater = (weight * 0.035) + activityBuffer;
  const waterTargetLiters = Math.round(rawWater * 10) / 10;
  const waterGlasses = Math.round((waterTargetLiters * 1000) / 250);

  return {
    bmi,
    bmiCategory: category,
    bmiExplanation: explanation,
    bmr,
    tdee,
    dailyCalorieTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    waterTargetLiters,
    waterGlasses,
    maintenanceCalories,
    fatLossCalories,
    muscleGainCalories,
  };
}
