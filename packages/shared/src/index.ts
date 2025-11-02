export type SubscriptionTier = "FREE" | "PREMIUM";
export type SubscriptionPlan = "monthly" | "quarterly" | "annual";

export const MEAL_TYPES = ["Breakfast", "Snack", "Lunch", "Dinner"] as const;

export const SUBSCRIPTION_PLANS = [
  {
    plan: "monthly" as const,
    title: "Monthly",
    price: "$4.87",
    description: "Flexible plan — cancel anytime"
  },
  {
    plan: "quarterly" as const,
    title: "Quarterly",
    price: "$17.63",
    description: "Save about 10%"
  },
  {
    plan: "annual" as const,
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