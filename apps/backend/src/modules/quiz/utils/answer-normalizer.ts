import type {
  ActivityLevel,
  MealComplexity,
  QuizAnswers,
} from '@vivaform/shared';

const CM_PER_INCH = 2.54;
const KG_PER_POUND = 0.45359237;

// Lookup tables keep the heuristics in one place and make future tweaks easier.
const ACTIVITY_ALIASES: Record<string, ActivityLevel> = {
  sedentary: 'sedentary',
  desk_bound: 'sedentary',
  office: 'sedentary',
  light: 'light',
  casual: 'light',
  commuting: 'light',
  balanced: 'moderate',
  moderate: 'moderate',
  shift_worker: 'moderate',
  traveler: 'moderate',
  active: 'active',
  high_output: 'active',
  intense: 'athlete',
  athlete: 'athlete',
};

const MEAL_COMPLEXITY_BY_STYLE: Record<string, MealComplexity> = {
  no_cook: 'simple',
  speed: 'simple',
  simple: 'simple',
  balanced: 'medium',
  homestyle: 'medium',
  foodie: 'medium',
  chef: 'complex',
  adventurous: 'complex',
};

const COOKING_TIME_BY_STYLE: Record<string, number> = {
  no_cook: 5,
  speed: 15,
  simple: 15,
  balanced: 25,
  homestyle: 30,
  foodie: 30,
  chef: 40,
  adventurous: 35,
};

const COOKING_TIME_BY_COMPLEXITY: Record<MealComplexity, number> = {
  simple: 15,
  medium: 25,
  complex: 40,
};

const MOTIVATION_BY_GOAL: Record<string, QuizAnswers['mainMotivation']> = {
  weight_loss: 'appearance',
  fat_loss: 'appearance',
  tone_up: 'appearance',
  muscle_gain: 'performance',
  performance: 'performance',
  energy: 'wellbeing',
  healthy_habits: 'health',
  lifestyle: 'health',
  maintenance: 'wellbeing',
  stress_relief: 'wellbeing',
  medical_condition: 'medical',
  digestive_relief: 'medical',
  postpartum: 'health',
};

const GOAL_TIMELINE_BY_GOAL: Record<string, QuizAnswers['goalTimeline']> = {
  weight_loss: '3_months',
  fat_loss: '3_months',
  tone_up: '6_months',
  muscle_gain: '6_months',
  maintenance: 'no_rush',
  lifestyle: 'no_rush',
  reboot: '1_month',
  medical_condition: '6_months',
  digestive_relief: '6_months',
};

const SLEEP_QUALITY_TO_HOURS: Record<number, number> = {
  1: 5.5,
  2: 6.2,
  3: 7,
  4: 7.5,
  5: 8,
};

const DIET_PLAN_ALIASES: Partial<Record<string, QuizAnswers['dietPlan']>> = {
  mediterranean: 'mediterranean',
  mediterranean_style: 'mediterranean',
  anti_inflammatory: 'anti-inflammatory',
  antiinflammatory: 'anti-inflammatory',
  antiinflam: 'anti-inflammatory',
  carnivore: 'carnivore',
  high_protein: 'carnivore',
};

const DIET_PLAN_LITERALS: ReadonlyArray<QuizAnswers['dietPlan']> = ['mediterranean', 'carnivore', 'anti-inflammatory'];

const EXERCISE_FREQUENCY_HINTS: Record<string, boolean | undefined> = {
  never: false,
  rarely: false,
  sometimes: true,
  weekly: true,
  often: true,
  daily: true,
  always: true,
  unsure: undefined,
};

const HABIT_FREQUENCY_ALIASES: Record<string, QuizAnswers['fastFoodFrequency']> = {
  never: 'never',
  none: 'never',
  rarely: 'rarely',
  occasionally: 'sometimes',
  sometimes: 'sometimes',
  weekly: 'often',
  often: 'often',
  daily: 'daily',
  everyday: 'daily',
};

const COMFORT_SOURCE_ALIASES: Record<string, QuizAnswers['comfortSource']> = {
  food: 'food',
  eating: 'food',
  snacks: 'food',
  exercise: 'exercise',
  workout: 'exercise',
  fitness: 'exercise',
  social: 'social',
  friends: 'social',
  people: 'social',
  rest: 'rest',
  sleep: 'rest',
  relax: 'rest',
  hobbies: 'hobbies',
  crafts: 'hobbies',
  creativity: 'hobbies',
};

const THEME_ALIASES: Record<string, QuizAnswers['theme']> = {
  light: 'light',
  bright: 'light',
  dark: 'dark',
  night: 'dark',
  auto: 'auto',
  system: 'auto',
  system_default: 'auto',
};

const WEIGHT_HISTORY_ALIASES: Record<string, QuizAnswers['weightHistory']> = {
  never_tried: 'never_tried',
  lost_and_regained: 'lost_and_regained',
  lost_and_maintained: 'lost_and_maintained',
};

const WEIGHT_HISTORY_LAST_IDEAL_ALIASES: Record<string, QuizAnswers['weightHistoryLastIdeal']> = {
  lt_1y: 'lt_1y',
  last_year: 'lt_1y',
  one_to_three_years: '1_3y',
  one_three_years: '1_3y',
  _1_3y: '1_3y',
  three_to_five_years: '3_5y',
  three_five_years: '3_5y',
  _3_5y: '3_5y',
  gt_5y: 'gt_5y',
  more_than_five_years: 'gt_5y',
  never: 'never',
};

const EAT_OUT_FREQUENCY_ALIASES: Record<string, QuizAnswers['eatOutFrequency']> = {
  never: 'never',
  rarely: 'rarely',
  sometimes: 'sometimes',
  weekly: 'often',
  often: 'often',
  daily: 'often',
};

type NumberOptions = {
  min?: number;
  max?: number;
  precision?: number;
};

export function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function normalizeNumber(value: unknown, options: NumberOptions = {}): number | undefined {
  const numeric = toNumber(value);
  if (numeric === undefined) {
    return undefined;
  }
  if (options.min !== undefined && numeric < options.min) {
    return undefined;
  }
  if (options.max !== undefined && numeric > options.max) {
    return undefined;
  }
  if (typeof options.precision === 'number') {
    const factor = 10 ** options.precision;
    return Math.round(numeric * factor) / factor;
  }
  return numeric;
}

export function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }
    const normalized = entry.trim();
    if (!normalized) {
      continue;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(normalized);
  }
  return result.length ? result : undefined;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return undefined;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function mapHabitFrequencyValue(raw?: string): QuizAnswers['fastFoodFrequency'] | undefined {
  if (!raw) {
    return undefined;
  }
  const key = normalizeKey(raw);
  return HABIT_FREQUENCY_ALIASES[key];
}

function mapComfortSourceValue(raw?: string): QuizAnswers['comfortSource'] | undefined {
  if (!raw) {
    return undefined;
  }
  const key = normalizeKey(raw);
  return COMFORT_SOURCE_ALIASES[key];
}

function mapThemeValue(raw?: string): QuizAnswers['theme'] | undefined {
  if (!raw) {
    return undefined;
  }
  const key = normalizeKey(raw);
  return THEME_ALIASES[key];
}

function mapGender(payload: any): QuizAnswers['gender'] | undefined {
  const raw = firstString(payload?.gender, payload?.sex, payload?.profile_gender);
  if (!raw) {
    return undefined;
  }
  const normalized = normalizeKey(raw);
  if (['female', 'f', 'woman', 'she'].includes(normalized)) {
    return 'female';
  }
  if (['male', 'm', 'man', 'he'].includes(normalized)) {
    return 'male';
  }
  return 'other';
}

function mergeDistinct(...lists: Array<string[] | undefined>): string[] | undefined {
  const combined = lists.filter((list): list is string[] => Array.isArray(list)).flat();
  if (!combined.length) {
    return undefined;
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of combined) {
    const key = entry.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(entry);
    }
  }
  return result.length ? result : undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    if (['yes', 'y', 'true', '1', 'always'].includes(normalized)) {
      return true;
    }
    if (['no', 'n', 'false', '0', 'never'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
}

export function extractHeightCm(payload: any): number | undefined {
  const direct = normalizeNumber(
    payload?.height_cm ?? payload?.heightCm ?? payload?.body?.heightCm,
    { min: 80, max: 250, precision: 1 },
  );
  if (direct !== undefined) {
    return direct;
  }

  const meters = normalizeNumber(payload?.height_m ?? payload?.heightM, {
    min: 0.9,
    max: 2.5,
    precision: 2,
  });
  if (meters !== undefined) {
    return normalizeNumber(meters * 100, { min: 80, max: 250, precision: 1 });
  }

  const feet = normalizeNumber(
    payload?.height_ft ?? payload?.raw_height_ft ?? payload?.body?.height?.ft,
    { min: 2, max: 8, precision: 0 },
  );
  const inches = normalizeNumber(
    payload?.height_in ?? payload?.raw_height_in ?? payload?.body?.height?.in,
    { min: 0, max: 11, precision: 0 },
  );
  if (feet !== undefined || inches !== undefined) {
    const totalInches = (feet ?? 0) * 12 + (inches ?? 0);
    if (totalInches > 0) {
      return normalizeNumber(totalInches * CM_PER_INCH, {
        min: 80,
        max: 250,
        precision: 1,
      });
    }
  }

  return undefined;
}

export function extractWeightKg(payload: any): number | undefined {
  const direct = normalizeNumber(
    payload?.weight_kg ?? payload?.weightKg ?? payload?.body?.weightKg,
    { min: 35, max: 300, precision: 1 },
  );
  if (direct !== undefined) {
    return direct;
  }

  const pounds = normalizeNumber(
    payload?.weight_lb ?? payload?.raw_weight_lbs ?? payload?.body?.weight?.lb,
    { min: 70, max: 650, precision: 1 },
  );
  if (pounds !== undefined) {
    return normalizeNumber(pounds * KG_PER_POUND, { min: 35, max: 300, precision: 1 });
  }

  return undefined;
}

export function mapDietPreference(payload: any): QuizAnswers['dietPlan'] | undefined {
  const raw = firstString(
    payload?.diet_plan,
    payload?.dietPlan,
    payload?.final_plan_type,
    payload?.diet_preference,
  );
  if (!raw) {
    return undefined;
  }
  const key = normalizeKey(raw);
  const alias = DIET_PLAN_ALIASES[key];
  if (alias) {
    return alias;
  }

  const literalCandidate = key.replace(/_/g, '-') as QuizAnswers['dietPlan'];
  if (DIET_PLAN_LITERALS.includes(literalCandidate)) {
    return literalCandidate;
  }

  return undefined;
}

export function mapActivityLevel(payload: any): ActivityLevel | undefined {
  const raw = firstString(
    payload?.activity_level,
    payload?.activityLevel,
    payload?.weekly_rhythm,
    payload?.habits?.activityLevel,
  );
  if (!raw) {
    return undefined;
  }
  const key = normalizeKey(raw);
  return ACTIVITY_ALIASES[key];
}

export function mapSleepHours(payload: any): number | undefined {
  const direct = normalizeNumber(payload?.sleep_hours ?? payload?.sleepHours, {
    min: 3,
    max: 12,
    precision: 1,
  });
  if (direct !== undefined) {
    return direct;
  }

  const slider = normalizeNumber(payload?.sleep_quality ?? payload?.sleepQuality, {
    min: 1,
    max: 5,
    precision: 0,
  });
  if (slider !== undefined) {
    return SLEEP_QUALITY_TO_HOURS[slider];
  }

  return undefined;
}

export function mapMealComplexity(payload: any): MealComplexity | undefined {
  const direct = firstString(payload?.meal_complexity, payload?.mealComplexity);
  if (direct) {
    const normalized = normalizeKey(direct);
    if (['simple', 'medium', 'complex'].includes(normalized)) {
      return normalized as MealComplexity;
    }
  }

  const style = firstString(payload?.cooking_style, payload?.cookingStyle);
  if (style) {
    const key = normalizeKey(style);
    if (MEAL_COMPLEXITY_BY_STYLE[key]) {
      return MEAL_COMPLEXITY_BY_STYLE[key];
    }
  }

  const confidence = firstString(payload?.cooking_confidence, payload?.cookingConfidence);
  if (confidence) {
    const key = normalizeKey(confidence);
    if (key === 'beginner') {
      return 'simple';
    }
    if (['intermediate', 'comfortable'].includes(key)) {
      return 'medium';
    }
    if (['expert', 'chef'].includes(key)) {
      return 'complex';
    }
  }

  return undefined;
}

export function mapCookingTimeMinutes(payload: any): number | undefined {
  const direct = normalizeNumber(
    payload?.cooking_time_minutes ?? payload?.cookingTimeMinutes,
    { min: 5, max: 120, precision: 0 },
  );
  if (direct !== undefined) {
    return direct;
  }

  const style = firstString(payload?.cooking_style, payload?.cookingStyle);
  if (style) {
    const key = normalizeKey(style);
    if (COOKING_TIME_BY_STYLE[key] !== undefined) {
      return COOKING_TIME_BY_STYLE[key];
    }
  }

  const complexity = mapMealComplexity(payload);
  if (complexity) {
    return COOKING_TIME_BY_COMPLEXITY[complexity];
  }

  return undefined;
}

export function mapExerciseRegularly(payload: any): boolean | undefined {
  const direct = toBoolean(
    payload?.exercise_regularly ?? payload?.exerciseRegularly ?? payload?.habits?.exercise,
  );
  if (direct !== undefined) {
    return direct;
  }

  const frequencyKey = firstString(payload?.exercise_frequency, payload?.workout_frequency);
  if (frequencyKey) {
    const normalized = normalizeKey(frequencyKey);
    if (normalized in EXERCISE_FREQUENCY_HINTS) {
      return EXERCISE_FREQUENCY_HINTS[normalized];
    }
  }

  const activityLevel = mapActivityLevel(payload);
  if (!activityLevel) {
    return undefined;
  }
  return ['moderate', 'active', 'athlete'].includes(activityLevel);
}

export function mapMainMotivation(payload: any): QuizAnswers['mainMotivation'] | undefined {
  const raw = firstString(payload?.primary_goal, payload?.goal, payload?.main_motivation);
  if (!raw) {
    return undefined;
  }
  const key = normalizeKey(raw);
  return MOTIVATION_BY_GOAL[key];
}

function deriveGoalTimeline(payload: any): QuizAnswers['goalTimeline'] {
  const raw = firstString(payload?.primary_goal, payload?.goal);
  if (raw) {
    const key = normalizeKey(raw);
    if (GOAL_TIMELINE_BY_GOAL[key]) {
      return GOAL_TIMELINE_BY_GOAL[key];
    }
  }
  return '3_months';
}

function deriveRoutineConfidence(payload: any): number | undefined {
  const direct = normalizeNumber(payload?.routine_confidence ?? payload?.routineConfidence, {
    min: 1,
    max: 10,
    precision: 0,
  });
  if (direct !== undefined) {
    return direct;
  }

  const stress = normalizeNumber(payload?.stress_level, { min: 1, max: 10, precision: 0 });
  if (stress !== undefined) {
    return Math.max(1, Math.min(10, 11 - stress));
  }

  const sleepQuality = normalizeNumber(payload?.sleep_quality, { min: 1, max: 5, precision: 0 });
  if (sleepQuality !== undefined) {
    return Math.max(1, Math.min(10, 4 + sleepQuality));
  }

  return undefined;
}

function deriveDailyWaterMl(payload: any, currentWeightKg?: number): number | undefined {
  const direct = normalizeNumber(payload?.daily_water_ml ?? payload?.water_ml, {
    min: 500,
    max: 6000,
    precision: 0,
  });
  if (direct !== undefined) {
    return direct;
  }

  if (currentWeightKg !== undefined) {
    const estimated = Math.round(currentWeightKg * 30);
    return Math.min(4500, Math.max(1500, estimated));
  }

  return undefined;
}

export function buildLegacyQuizAnswers(payload: any): QuizAnswers {
  const dietPlan = mapDietPreference(payload);
  const heightCm = extractHeightCm(payload);
  const currentWeightKg = extractWeightKg(payload);
  const explicitTarget = normalizeNumber(
    payload?.target_weight_kg ?? payload?.goal_weight_kg ?? payload?.desired_weight_kg,
    { min: 35, max: 250, precision: 1 },
  );
  const targetWeightKg = explicitTarget ?? currentWeightKg ?? undefined;
  const activityLevel = mapActivityLevel(payload);
  const sleepHours = mapSleepHours(payload);
  const mealComplexity = mapMealComplexity(payload) ?? 'medium';
  const cookingTimeMinutes =
    mapCookingTimeMinutes(payload) ?? COOKING_TIME_BY_COMPLEXITY[mealComplexity];
  const exerciseRegularly =
    mapExerciseRegularly(payload) ??
    (activityLevel ? (['moderate', 'active', 'athlete'] as ActivityLevel[]).includes(activityLevel) : undefined);
  const mealsPerDay = normalizeNumber(payload?.meals_per_day ?? payload?.mealsPerDay, {
    min: 1,
    max: 6,
    precision: 0,
  });
  const eatingHabits = new Set(toStringArray(payload?.eating_habits) ?? []);
  const skipBreakfast =
    toBoolean(payload?.skip_breakfast ?? payload?.skipBreakfast) ??
    (eatingHabits.has('skip_breakfast') ? true : undefined);
  const snackBetweenMeals =
    toBoolean(payload?.snack_between_meals ?? payload?.snackBetweenMeals) ??
    (eatingHabits.has('grazer') || eatingHabits.has('on_the_go') ? true : undefined);
  const tryNewFoods =
    toBoolean(payload?.try_new_foods ?? payload?.adventurous_eater) ??
    (normalizeKey(firstString(payload?.cooking_style) ?? '') === 'adventurous' ? true : undefined);
  const foodAllergies = toStringArray(payload?.food_allergies);
  const avoidedFoods = mergeDistinct(
    toStringArray(payload?.food_intolerances),
    toStringArray(payload?.avoid_foods),
    toStringArray(payload?.food_dislikes),
  );
  const eatWhenStressed = eatingHabits.has('stress_snacking') ? true : undefined;
  const mainMotivation = mapMainMotivation(payload);
  const routineConfidence = deriveRoutineConfidence(payload);
  const dailyWaterMl = deriveDailyWaterMl(payload, currentWeightKg) ?? 2000;
  const wantReminders = toBoolean(
    payload?.want_reminders ?? payload?.notifications_opt_in ?? payload?.reminders,
  );
  const trackActivity = toBoolean(payload?.track_activity ?? payload?.activity_tracking);
  const fastFoodFrequency = mapHabitFrequencyValue(
    firstString(payload?.fast_food_frequency, payload?.fastFoodFrequency),
  );
  const cookAtHomeFrequency = mapHabitFrequencyValue(
    firstString(payload?.cook_at_home_frequency, payload?.cookAtHomeFrequency),
  );
  const wakeUpTime = firstString(payload?.wake_up_time, payload?.wakeUpTime);
  const dinnerTime = firstString(payload?.dinner_time, payload?.dinnerTime);
  const stressLevel = normalizeNumber(
    payload?.stress_level ?? payload?.stressLevel,
    { min: 1, max: 10, precision: 0 },
  );
  const comfortSource = mapComfortSourceValue(firstString(payload?.comfort_source, payload?.comfortSource));
  const connectHealthApp = toBoolean(
    payload?.connect_health_app ?? payload?.connectHealthApp,
  );
  const theme = mapThemeValue(firstString(payload?.theme ?? payload?.app_theme));
  const gender = mapGender(payload);
  const birthDate = firstString(
    payload?.birth_date ?? payload?.birthDate ?? payload?.dob,
  );

  const weightHistory = (() => {
    const key = normalizeKey(
      firstString(payload?.weight_history, payload?.weightHistory) ?? '',
    );
    return WEIGHT_HISTORY_ALIASES[key];
  })();

  const weightHistoryLastIdeal = (() => {
    const key = normalizeKey(
      firstString(
        payload?.weight_history_last_ideal,
        payload?.weightHistoryLastIdeal,
      ) ?? '',
    );
    return WEIGHT_HISTORY_LAST_IDEAL_ALIASES[key];
  })();

  const clothesSizeCurrent = firstString(
    payload?.clothes_size_current,
    payload?.clothesSizeCurrent,
  );

  const clothesSizeTarget = firstString(
    payload?.clothes_size_target,
    payload?.clothesSizeTarget,
  );

  const meatPreferences = toStringArray(
    payload?.meat_preferences ?? payload?.meatPreferences,
  );

  const preferredCookingStyles = toStringArray(
    payload?.preferred_cooking_styles ?? payload?.preferredCookingStyles,
  );

  const lateEatingValue = toBoolean(
    payload?.late_eating ?? payload?.lateEating,
  );
  const lateEating =
    lateEatingValue !== undefined
      ? lateEatingValue
      : eatingHabits.has('late_eating')
        ? true
        : undefined;

  const eatOutFrequency = (() => {
    const key = normalizeKey(
      firstString(payload?.eat_out_frequency, payload?.eatOutFrequency) ?? '',
    );
    return EAT_OUT_FREQUENCY_ALIASES[key];
  })();

  const answers: QuizAnswers = {
    dietPlan,
    heightCm,
    currentWeightKg,
    targetWeightKg,
    goalTimeline: deriveGoalTimeline(payload),
    mealsPerDay,
    skipBreakfast,
    snackBetweenMeals,
    sleepHours,
    activityLevel,
    exerciseRegularly,
    mealComplexity,
    tryNewFoods,
    cookingTimeMinutes,
    foodAllergies,
    avoidedFoods,
    eatWhenStressed,
    mainMotivation,
    routineConfidence,
    dailyWaterMl,
    wantReminders,
    trackActivity,
    fastFoodFrequency,
    cookAtHomeFrequency,
    wakeUpTime,
    dinnerTime,
    stressLevel,
    comfortSource,
    connectHealthApp,
    theme,
    gender,
    birthDate,
    weightHistory,
    weightHistoryLastIdeal,
    clothesSizeCurrent,
    clothesSizeTarget,
    lateEating,
    eatOutFrequency,
    meatPreferences,
    preferredCookingStyles,
  };

  return answers;
}
