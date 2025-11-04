export type SubscriptionTier = "FREE" | "PREMIUM";
export type SubscriptionPlan = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export const MEAL_TYPES = ["Breakfast", "Snack", "Lunch", "Dinner"] as const;

export const SUBSCRIPTION_PLANS = [
  {
    plan: "MONTHLY" as const,
    title: "Monthly",
    price: "$4.87",
    description: "Flexible plan — cancel anytime"
  },
  {
    plan: "QUARTERLY" as const,
    title: "Quarterly",
    price: "$17.63",
    description: "Save about 10%"
  },
  {
    plan: "ANNUAL" as const,
    title: "Annual",
    price: "$28.76",
    description: "Save about 50%"
  }
] as const;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  tier?: SubscriptionTier;
};

export type NutritionEntry = {
  id: string;
  userId?: string;
  date: string;
  mealType: string;
  food: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  createdAt?: string;
};

export type WaterEntry = {
  id: string;
  userId?: string;
  date: string;
  amountMl: number;
  createdAt?: string;
};

export type WeightEntry = {
  id: string;
  userId?: string;
  date: string;
  weightKg: number;
  note?: string | null;
  createdAt?: string;
};

export type RecommendationEntry = {
  id: string;
  userId?: string;
  date: string;
  title: string;
  body: string;
  createdAt?: string;
};

export type DailyDashboardResponse = {
  date: string;
  nutrition: {
    entries: NutritionEntry[];
    summary: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
  };
  water: {
    entries: WaterEntry[];
    totalMl: number;
  };
  weight: {
    latest: WeightEntry | null;
    progress: {
      delta: number;
      start: WeightEntry | null;
      end: WeightEntry | null;
    };
  };
  recommendations: RecommendationEntry[];
};

export type CreateNutritionEntryPayload = {
  date?: string;
  mealType: string;
  food: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type CreateWaterEntryPayload = {
  date?: string;
  amountMl: number;
};

export type CreateWeightEntryPayload = {
  date?: string;
  weightKg: number;
  note?: string;
};

// =====================
// QUIZ TYPES & CONSTANTS
// =====================

export type DietPlan = "mediterranean" | "carnivore" | "anti-inflammatory";
export type Gender = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "athlete";
export type WeightGoal = "lose" | "maintain" | "gain";
export type GoalTimeline = "1_month" | "3_months" | "6_months" | "no_rush";
export type MealComplexity = "simple" | "medium" | "complex";
export type Theme = "light" | "dark" | "auto";

export const DIET_PLANS = [
  {
    value: "mediterranean" as const,
    label: "🫒 Mediterranean",
    description: "Balanced diet with whole grains, fish, and olive oil"
  },
  {
    value: "carnivore" as const,
    label: "🥩 Carnivore",
    description: "Meat-focused diet with animal products"
  },
  {
    value: "anti-inflammatory" as const,
    label: "🌿 Anti-Inflammatory",
    description: "Focus on reducing inflammation through nutrition"
  }
] as const;

export const ACTIVITY_LEVELS = [
  {
    value: "sedentary" as const,
    label: "Sedentary",
    description: "Little to no exercise",
    multiplier: 1.2
  },
  {
    value: "light" as const,
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
    multiplier: 1.375
  },
  {
    value: "moderate" as const,
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
    multiplier: 1.55
  },
  {
    value: "active" as const,
    label: "Very Active",
    description: "Hard exercise 6-7 days/week",
    multiplier: 1.725
  },
  {
    value: "athlete" as const,
    label: "Athlete",
    description: "Very hard exercise & physical job",
    multiplier: 1.9
  }
] as const;

export const GOAL_TIMELINES = [
  { value: "1_month" as const, label: "1 month", weeksMultiplier: 4 },
  { value: "3_months" as const, label: "3 months", weeksMultiplier: 12 },
  { value: "6_months" as const, label: "6 months", weeksMultiplier: 24 },
  { value: "no_rush" as const, label: "No rush", weeksMultiplier: 52 }
] as const;

export type QuizAnswers = {
  // Step 1: Introduction
  dietPlan?: DietPlan;

  // Step 2: Body Metrics
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  goalTimeline?: GoalTimeline;

  // Step 3: Food Habits
  mealsPerDay?: number;
  skipBreakfast?: boolean;
  snackBetweenMeals?: boolean;
  fastFoodFrequency?: "never" | "rarely" | "sometimes" | "often" | "daily";
  cookAtHomeFrequency?: "never" | "rarely" | "sometimes" | "often" | "daily";

  // Step 4: Energy & Schedule
  // Step 4: Energy & Schedule
  sleepHours?: number;
  activityLevel?: ActivityLevel;
  exerciseRegularly?: boolean;
  wakeUpTime?: string; // HH:mm format
  dinnerTime?: string; // HH:mm format

  // Step 5: Preferences & Restrictions
  foodAllergies?: string[]; // ["nuts", "dairy", "gluten", etc.]
  avoidedFoods?: string[]; // ["meat", "dairy", "gluten", etc.]
  mealComplexity?: MealComplexity;
  tryNewFoods?: boolean;
  cookingTimeMinutes?: number;

  // Step 6: Emotional & Motivational
  eatWhenStressed?: boolean;
  mainMotivation?:
    | "health"
    | "appearance"
    | "performance"
    | "wellbeing"
    | "medical";
  stressLevel?: number; // 1-10
  comfortSource?: "food" | "exercise" | "social" | "rest" | "hobbies";
  routineConfidence?: number; // 1-10

  // Step 7: Hydration & Reminders
  dailyWaterMl?: number;
  wantReminders?: boolean;
  trackActivity?: boolean;

  // Step 8: Integrations & Personalization
  connectHealthApp?: boolean;
  theme?: Theme;

  // Calculated fields (computed on submit)
  gender?: Gender; // might be added later
  birthDate?: string; // might be added later
  bmi?: number;
  bmr?: number; // Basal Metabolic Rate
  tdee?: number; // Total Daily Energy Expenditure
  recommendedCalories?: number;
  weightGoal?: WeightGoal; // derived from current vs target
};

export type QuizResult = {
  bmi: number;
  bmiCategory: "underweight" | "normal" | "overweight" | "obese";
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  dailyCalorieDeficit?: number;
  weeklyWeightChangeLbs?: number;
  estimatedWeeks?: number;
  macros: {
    protein: number; // grams
    fat: number; // grams
    carbs: number; // grams
  };
  advice: string;
  goal: WeightGoal;
};

export type SubmitQuizPayload = QuizAnswers;

export type SubmitQuizResponse = {
  result: QuizResult;
  message: string;
};