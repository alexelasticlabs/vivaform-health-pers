// Adaptive quiz configuration (18 visible steps + conditional safety) powering the VivaForm funnel.
// Defines schema, conditional logic, and helper utilities for progress + plan derivation.

export type QuizUiType = 'info' | 'single_choice' | 'multi_choice' | 'slider' | 'number_inputs' | 'text_input';
export type QuizUiPattern =
  | 'full_screen_intro'
  | 'checkbox_confirm'
  | 'chips_row'
  | 'chips_wrap'
  | 'cards_grid'
  | 'cards_list'
  | 'two_cards_split'
  | 'two_cards_split_warning'
  | 'split_vertical_inputs'
  | 'slider_emoji'
  | 'slider_numeric'
  | 'swipe_cards'
  | 'badge_screen'
  | 'two_column_stack'
  | 'summary_bullets'
  | 'comparison_cards'
  | 'cta_dual_buttons'
  | 'text_capture'
  | 'milestone_card';

export interface QuizOption {
  value: string;
  label: string;
  subtitle?: string;
  description?: string;
  emoji?: string;
}

export interface QuizStep {
  id: string;
  group: string;
  uiType: QuizUiType;
  uiPattern: QuizUiPattern;
  question: string;
  subtitle?: string;
  options?: QuizOption[];
  fields: string[];
  microcopy?: string;
  badgeUnlock?: string | null;
  animationHint?: 'fade_in' | 'slide_left' | 'slide_right' | 'confetti_small' | 'pulse';
  insightType?: 'none' | 'reflect_goal' | 'reflect_pattern' | 'reflect_sleep_stress' | 'plan_teaser';
  conditional?: {
    dependsOn: string[];
    rule: QuizConditionalRule;
  } | null;
  meta?: Record<string, unknown>;
}

export type QuizConditionalRule = 'carnivore_with_chronic_conditions';

const CARNIVORE_BLOCKERS = new Set(['blood_sugar', 'heart_guard', 'inflammation', 'gut_support', 'thyroid']);

export function hasCarnivoreSafetyRisk(answers: QuizAnswersModel): boolean {
  const conditions = answers.health_conditions ?? [];
  return conditions.some((condition) => condition !== 'none' && CARNIVORE_BLOCKERS.has(condition));
}

export interface QuizAnswersModel {
  consent_non_medical?: boolean;
  name?: string;
  email?: string;
  age_years?: number;
  gender?: 'female' | 'male' | 'non_binary' | 'prefer_not_say';
  unit_system?: 'us' | 'metric';
  height_cm?: number;
  weight_kg?: number;
  raw_height_ft?: number;
  raw_height_in?: number;
  raw_weight_lbs?: number;
  primary_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'energy_health' | 'food_relationship';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'high';
  weight_loss_rebound?: 'first_time' | 'lost_and_kept_off' | 'lost_and_regained';
  last_ideal_weight_timing?: 'under_6_months' | 'six_to_twelve_months' | 'one_to_three_years' | 'over_three_years';
  weekly_rhythm?: 'desk_bound' | 'balanced_mix' | 'travel_shift' | 'high_output';
  sleep_quality?: number;
  food_likes?: string[];
  eating_habits?: string[];
  health_conditions?: string[];
  protein_preferences?: string[];
  food_allergies?: string[];
  food_intolerances?: string[];
  diet_preference?: 'mediterranean' | 'carnivore' | 'anti_inflammatory';
  diet_safety_override?: 'mediterranean' | 'anti_inflammatory';
  cooking_style?: 'speed' | 'balanced' | 'chef' | 'no_cook';
  cooking_confidence?: 'beginner' | 'intermediate' | 'expert';
  cooking_skill_tags?: string[];
  budget_level?: 'lean' | 'balanced' | 'premium';
  clothing_size_current?: string;
  clothing_size_goal?: string;
  chosen_subscription_path?: 'premium' | 'free';
  final_plan_type?: 'mediterranean' | 'carnivore' | 'anti_inflammatory';
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'welcome_consent',
    group: 'onboarding',
    uiType: 'info',
    uiPattern: 'full_screen_intro',
    question: 'Find a nutrition plan that actually fits your life',
    subtitle: '94% of members see measurable change in the first 30 days. Let’s make you next.',
    fields: ['consent_non_medical'],
    microcopy: '120,000+ people trust VivaForm • AI-personalized • Limited premium spots reset nightly',
    badgeUnlock: 'welcome_completed',
    animationHint: 'fade_in',
    insightType: 'none',
    conditional: null,
    meta: {
      heroImage: 'https://images.unsplash.com/photo-1484981138541-3d074aa97716?auto=format&fit=crop&w=1100&q=80',
      stage: 'start',
    },
  },
  {
    id: 'primary_goal',
    group: 'goals',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'What is your main goal right now?',
    subtitle: 'Your answer means we can anchor calories, macros, and accountability cues.',
    options: [
      { value: 'weight_loss', label: 'Lose weight in a healthy way' },
      { value: 'muscle_gain', label: 'Build muscle and strength' },
      { value: 'maintenance', label: 'Maintain my current weight' },
      { value: 'energy_health', label: 'Boost energy & overall health' },
      { value: 'food_relationship', label: 'Improve my relationship with food' },
    ],
    fields: ['primary_goal'],
    microcopy: 'Great — we’ll tailor the experience around this North Star.',
    badgeUnlock: 'goal_locked',
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
    meta: { stage: 'start' },
  },
  {
    id: 'gender_identity',
    group: 'demographics',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'What’s your gender?',
    subtitle: 'We tailor hormone, metabolism, and tone guidance to match.',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'non_binary', label: 'Non-binary' },
      { value: 'prefer_not_say', label: 'Prefer not to say' },
    ],
    fields: ['gender'],
    microcopy: 'Used for motivational stats and medical disclaimers — never shared.',
    badgeUnlock: 'demographics_logged',
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
    meta: {
      stage: 'start',
      eyebrow: 'Personalization seed',
    },
  },
  {
    id: 'body_metrics',
    group: 'body_metrics',
    uiType: 'number_inputs',
    uiPattern: 'split_vertical_inputs',
    question: 'Let’s log your basics',
    subtitle: 'Even rough estimates help us shape a safe calorie range and progress curve.',
    fields: ['name', 'age_years', 'unit_system', 'height_cm', 'weight_kg', 'raw_height_ft', 'raw_height_in', 'raw_weight_lbs'],
    microcopy: 'We keep this encrypted. Think “170 cm / 70 kg” or “5’7” / 155 lb”.',
    badgeUnlock: 'metrics_entered',
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
    meta: { dualUnits: true, stage: 'basics' },
  },
  {
    id: 'weight_history',
    group: 'body_metrics',
    uiType: 'single_choice',
    uiPattern: 'cards_list',
    question: 'Have you successfully lost weight before but struggled to keep it off?',
    subtitle: 'Understanding your story helps us prevent rebound weight.',
    options: [
      { value: 'first_time', label: 'This is my first serious attempt' },
      { value: 'lost_and_kept_off', label: 'I lost weight and kept most of it off' },
      { value: 'lost_and_regained', label: 'I lost weight but gained it back' },
    ],
    fields: ['weight_loss_rebound'],
    microcopy: 'Pick the option that feels most true right now.',
    badgeUnlock: 'history_logged',
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
    meta: {
      stage: 'basics',
    },
  },
  {
    id: 'ideal_weight_timing',
    group: 'body_metrics',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'When was the last time you felt comfortable at your ideal weight?',
    subtitle: 'We use this to set realistic cadence and accountability touchpoints.',
    options: [
      { value: 'under_6_months', label: 'Within 6 months' },
      { value: 'six_to_twelve_months', label: '6–12 months ago' },
      { value: 'one_to_three_years', label: '1–3 years ago' },
      { value: 'over_three_years', label: '3+ years ago' },
    ],
    fields: ['last_ideal_weight_timing'],
    microcopy: 'Honesty keeps the plan sustainable and non-rushed.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
    meta: {
      stage: 'basics',
    },
  },
  {
    id: 'bmi_health_insight',
    group: 'body_metrics',
    uiType: 'info',
    uiPattern: 'two_column_stack',
    question: 'Live health snapshot',
    subtitle: 'We translate your height + weight into a risk-aware baseline.',
    fields: [],
    microcopy: 'Enter height + weight to unlock BMI insights, hydration cues, and calorie guardrails.',
    badgeUnlock: 'bmi_preview',
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
    meta: {
      stage: 'basics',
    },
  },
  {
    id: 'email_capture',
    group: 'onboarding',
    uiType: 'text_input',
    uiPattern: 'text_capture',
    question: 'Where should we send your kickoff kit + saved progress?',
    subtitle: 'Step 7 of 18. We lock your spot for 24 hours and send the “Phase 1” blueprint instantly.',
    fields: ['email'],
    microcopy: 'Bonus: You’ll get the Optimization (Week 2) reminders and coach nudges in your inbox.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
    meta: {
      placeholder: 'you@example.com',
      helper: 'Used for progress saves & premium alerts. Unsubscribe anytime.',
      stage: 'basics',
    },
  },
  {
    id: 'activity_level',
    group: 'activity',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'How active is a typical week for you?',
    subtitle: 'Honesty keeps your calorie and recovery plan realistic.',
    options: [
      { value: 'sedentary', label: 'Mostly sitting (desk job, little movement)' },
      { value: 'light', label: 'Lightly active (some walking, few workouts)' },
      { value: 'moderate', label: 'Moderately active (2–3 intentional workouts)' },
      { value: 'high', label: 'Very active (4+ workouts or physical job)' },
    ],
    fields: ['activity_level'],
    microcopy: 'We translate this into energy availability and recovery cues.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
    meta: { stage: 'basics' },
  },
  {
    id: 'weekly_rhythm',
    group: 'lifestyle',
    uiType: 'single_choice',
    uiPattern: 'cards_list',
    question: 'What’s your typical week like?',
    subtitle: 'Lifestyle cues help us time meals, hydration, and recovery nudges.',
    options: [
      { value: 'desk_bound', label: 'Desk-bound · long sitting blocks' },
      { value: 'balanced_mix', label: 'Balanced mix · meetings + movement' },
      { value: 'travel_shift', label: 'Travel/shift work · unpredictable schedule' },
      { value: 'high_output', label: 'High-output · physically demanding' },
    ],
    fields: ['weekly_rhythm'],
    microcopy: 'Pick the one that matches most weeks — we adjust when things get hectic.',
    badgeUnlock: 'lifestyle_logged',
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
    meta: {
      stage: 'basics',
      eyebrow: 'Lifestyle pulse',
    },
  },
  {
    id: 'sleep_quality',
    group: 'lifestyle',
    uiType: 'slider',
    uiPattern: 'slider_numeric',
    question: 'How is your sleep lately?',
    subtitle: '1 = running on fumes · 5 = consistently rested',
    fields: ['sleep_quality'],
    microcopy: 'Sleep scores steer your recovery cues and late-night craving coaching.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_sleep_stress',
    conditional: null,
    meta: {
      stage: 'basics',
      min: 1,
      max: 5,
    },
  },
  {
    id: 'diet_choice',
    group: 'plan_choice',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'Which diet plan are you interested in?',
    subtitle: 'Pick the framework you want to anchor. We’ll still adapt macros + meal timing for safety.',
    options: [
      {
        value: 'mediterranean',
        label: 'Mediterranean',
        subtitle: 'Balanced macros, heart-healthy fats, flexible carbs.',
        emoji: '🫒',
      },
      {
        value: 'carnivore',
        label: 'Carnivore',
        subtitle: 'Protein-forward, ultra-low carb. Strict safety screening applies.',
        emoji: '🥩',
      },
      {
        value: 'anti_inflammatory',
        label: 'Anti-Inflammatory',
        subtitle: 'Fiber-rich, hormone-friendly, calmer digestion.',
        emoji: '🌿',
      },
    ],
    fields: ['diet_preference'],
    microcopy: 'This choice influences recipes, grocery lists, and coaching cues.',
    badgeUnlock: 'plan_intent_locked',
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
    meta: { stage: 'plan_choice' },
  },
  {
    id: 'eating_habits',
    group: 'eating',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'How would you describe your eating habits?',
    subtitle: 'Owning your rhythm helps us balance cravings, stress, and structure.',
    options: [
      { value: 'structured', label: 'Structured meals' },
      { value: 'stress_snacking', label: 'Stress or emotion-based snacking' },
      { value: 'skip_meals', label: 'Skip meals then overeat' },
      { value: 'late_night', label: 'Late-night cravings' },
      { value: 'on_the_go', label: 'Mostly on-the-go bites' },
      { value: 'mindful', label: 'Mindful / intuitive eater' },
    ],
    fields: ['eating_habits'],
    microcopy: 'Pick all that resonate — honesty unlocks better nudges.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'premium_value_teaser',
    group: 'milestone',
    uiType: 'info',
    uiPattern: 'comparison_cards',
    question: 'Premium unlock at Step 11 keeps streak boosts active',
    subtitle: 'See exactly what the upgrade adds before you decide.',
    fields: [],
    microcopy: 'Premium spots refresh nightly — 92% of members who upgrade by Step 18 complete Phase 2.',
    badgeUnlock: 'premium_preview',
    animationHint: 'pulse',
    insightType: 'plan_teaser',
    conditional: null,
    meta: {
      stage: 'plan',
      eyebrow: 'Premium upsell',
    },
  },
  {
    id: 'flavor_identity',
    group: 'eating',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Which food vibes feel non‑negotiable?',
    subtitle: 'Pick all that resonate — this influences plan flavor + macros.',
    options: [
      { value: 'plant_forward', label: 'Bright veggies & bowls' },
      { value: 'hearty_meals', label: 'Savory, protein-heavy plates' },
      { value: 'seafood_focus', label: 'Seafood & Mediterranean flavors' },
      { value: 'sweet_balance', label: 'Need room for sweet treats' },
      { value: 'simple_swaps', label: 'Keep it simple — minimal cooking' },
    ],
    fields: ['food_likes'],
    microcopy: 'Flavor guardrails keep the plan craveable.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'protein_preference',
    group: 'preferences',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Which proteins feel best to you?',
    subtitle: 'Tell us the staples you love so we can keep cravings satisfied.',
    options: [
      { value: 'lean_poultry', label: 'Lean poultry' },
      { value: 'grassfed_beef', label: 'Beef & game' },
      { value: 'seafood', label: 'Seafood & omega-rich fish' },
      { value: 'plant_power', label: 'Plant-based proteins' },
      { value: 'eggs', label: 'Eggs & breakfast proteins' },
      { value: 'dairy', label: 'Dairy / yogurt' },
    ],
    fields: ['protein_preferences'],
    microcopy: 'Pick everything you actually enjoy eating week to week.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
    meta: {
      stage: 'plan',
    },
  },
  {
    id: 'allergy_callout',
    group: 'preferences',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Any allergies or intolerances we must avoid?',
    subtitle: 'We’ll block recipes that conflict with these.',
    options: [
      { value: 'none', label: 'No allergies' },
      { value: 'gluten', label: 'Gluten' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'eggs', label: 'Eggs' },
      { value: 'nuts', label: 'Tree nuts / peanuts' },
      { value: 'shellfish', label: 'Shellfish' },
      { value: 'soy', label: 'Soy' },
      { value: 'nightshades', label: 'Nightshades' },
    ],
    fields: ['food_allergies'],
    microcopy: 'Add more later in your dashboard if needed.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'intolerance_callout',
    group: 'preferences',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Any sensitivities or intolerances worth noting?',
    subtitle: 'Helps us prioritize gut-friendly swaps.',
    options: [
      { value: 'lactose', label: 'Lactose sensitive' },
      { value: 'fodmap', label: 'Low FODMAP' },
      { value: 'histamine', label: 'Histamine-sensitive' },
      { value: 'spicy', label: 'Spicy foods' },
      { value: 'caffeine', label: 'Caffeine timing' },
      { value: 'other', label: 'Other (will flag to coach)' },
    ],
    fields: ['food_intolerances'],
    microcopy: 'Add more detail later — we just need a heads-up.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'health_check',
    group: 'health',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Any health guardrails we should respect?',
    subtitle: 'Select all that apply so we can keep things safe.',
    options: [
      { value: 'none', label: 'No major concerns' },
      { value: 'blood_sugar', label: 'Blood sugar or insulin resistance' },
      { value: 'thyroid', label: 'Thyroid or hormone support' },
      { value: 'heart_guard', label: 'Heart / blood pressure focus' },
      { value: 'gut_support', label: 'Digestive sensitivity' },
      { value: 'inflammation', label: 'Inflammation / autoimmune focus' },
    ],
    fields: ['health_conditions'],
    microcopy: 'We’ll flag anything that warrants a safer macro split.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'carnivore_safety',
    group: 'plan_choice',
    uiType: 'single_choice',
    uiPattern: 'two_cards_split_warning',
    question: 'Carnivore is locked for safety right now',
    subtitle: 'We spotted health flags that make high-fat/high-protein extremes risky. Pick a safer blueprint.',
    options: [
      {
        value: 'mediterranean',
        label: 'Switch to Mediterranean',
        subtitle: 'Steady energy, cardiometabolic support, still protein-forward.',
      },
      {
        value: 'anti_inflammatory',
        label: 'Go Anti-Inflammatory',
        subtitle: 'Gut calming, hormone friendly, recovery-focused meals.',
      },
    ],
    fields: ['diet_safety_override'],
    microcopy: 'We’ll note your interest in Carnivore for future check-ins, but physician clearance is required.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: {
      dependsOn: ['diet_preference', 'health_conditions'],
      rule: 'carnivore_with_chronic_conditions',
    },
    meta: {
      stage: 'plan_choice',
    },
  },
  {
    id: 'cooking_style',
    group: 'preferences',
    uiType: 'single_choice',
    uiPattern: 'cards_list',
    question: 'How do you like to prep meals?',
    subtitle: 'We’ll match recipe complexity + time commitment.',
    options: [
      { value: 'speed', label: 'Speed mode', subtitle: '5–15 min meals, minimal cleanup' },
      { value: 'balanced', label: 'Balanced', subtitle: '20–30 min, can chop a little' },
      { value: 'chef', label: 'Chef vibes', subtitle: 'Love detailed recipes & flavor' },
      { value: 'no_cook', label: 'No-cook / assembly', subtitle: 'Prefer ready-to-eat or minimal prep' },
    ],
    fields: ['cooking_style'],
    microcopy: 'Your plan adjusts complexity so it’s realistic on busy weeks.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
  },
  {
    id: 'cooking_confidence',
    group: 'preferences',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'How confident are you in the kitchen?',
    subtitle: 'We’ll calibrate prep instructions to match.',
    options: [
      { value: 'beginner', label: 'Just starting' },
      { value: 'intermediate', label: 'Comfortable with basics' },
      { value: 'expert', label: 'Confident home chef' },
    ],
    fields: ['cooking_confidence'],
    microcopy: 'No judgment — this only affects how detailed instructions feel.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
  },
  {
    id: 'cooking_skill_tags',
    group: 'preferences',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Pick the kitchen moves you enjoy (or want to learn)',
    subtitle: 'Helps us suggest tutorials + shortcuts that fit.',
    options: [
      { value: 'sheet_pan', label: 'Sheet-pan meals' },
      { value: 'instant_pot', label: 'Instant Pot / slow cooker' },
      { value: 'grilling', label: 'Grilling / searing' },
      { value: 'batch_cooking', label: 'Batch cooking' },
      { value: 'smoothie_bowls', label: 'Smoothies & bowls' },
      { value: 'no_cook', label: 'No-cook assembly' },
    ],
    fields: ['cooking_skill_tags'],
    microcopy: 'Pick all that sound fun — we’ll rotate them into your plan.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
  },
  {
    id: 'clothing_size_current',
    group: 'goals',
    uiType: 'single_choice',
    uiPattern: 'chips_wrap',
    question: 'What size clothes do you usually wear right now?',
    subtitle: 'Helps us set milestone photos + measurement reminders.',
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
      { value: 'xxl', label: 'XXL+' },
    ],
    fields: ['clothing_size_current'],
    microcopy: 'You can swap to EU / UK sizing later inside the app.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
  },
  {
    id: 'clothing_size_goal',
    group: 'goals',
    uiType: 'single_choice',
    uiPattern: 'chips_wrap',
    question: 'What size would feel amazing to wear comfortably?',
    subtitle: 'We turn this into a progress visualization + habit prompts.',
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
      { value: 'xxl', label: 'XXL+' },
    ],
    fields: ['clothing_size_goal'],
    microcopy: 'We’ll pace change safely — no crash timelines.',
    badgeUnlock: 'style_targets_logged',
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
  },
  {
    id: 'calculating_plan',
    group: 'milestone',
    uiType: 'info',
    uiPattern: 'two_column_stack',
    question: 'Calculating your personal plan',
    subtitle: 'We’re blending macros, habit cues, and recovery targets based on everything you shared.',
    fields: [],
    microcopy: 'This takes ~4 seconds. In the meantime, see how people like you are progressing.',
    badgeUnlock: 'summary_unlocked',
    animationHint: 'pulse',
    insightType: 'plan_teaser',
    conditional: null,
    meta: {
      stage: 'plan',
    },
  },
  {
    id: 'member_testimonials',
    group: 'milestone',
    uiType: 'info',
    uiPattern: 'milestone_card',
    question: 'Real members, real receipts',
    subtitle: 'Screenshots, accountability threads, and before/afters from the VivaForm community.',
    fields: [],
    microcopy: '“Down 8 kg in 90 days and kept it off for a year.” — Kara · “Fewer binges, more energy.” — Sam',
    badgeUnlock: 'social_proof_gallery',
    animationHint: 'fade_in',
    insightType: 'plan_teaser',
    conditional: null,
    meta: {
      stage: 'plan',
      eyebrow: 'Testimonials',
    },
  },
  {
    id: 'final_offer',
    group: 'offer',
    uiType: 'single_choice',
    uiPattern: 'cta_dual_buttons',
    question: 'Choose how you want to activate your plan',
    subtitle: 'Premium includes adaptive meal plans, smart reminders, and live accountability. Free keeps the essentials.',
    options: [
      {
        value: 'premium',
        label: 'Continue with Premium (recommended)',
        subtitle: 'Lock progress vault, AI meal builder, coach nudges · 14-day refund window',
      },
      {
        value: 'free',
        label: 'Start with Free plan',
        subtitle: 'Core blueprint + weekly check-ins · upgrade anytime',
      },
    ],
    fields: ['chosen_subscription_path'],
    microcopy: 'Limited premium seats roll over nightly — claim one now or keep the free path.',
    badgeUnlock: 'quiz_completed',
    animationHint: 'confetti_small',
    insightType: 'none',
    conditional: null,
    meta: {
      stage: 'plan',
    },
  },
];

export function shouldShowStep(step: QuizStep, answers: QuizAnswersModel): boolean {
  if (!step.conditional) return true;
  if (step.conditional.rule === 'carnivore_with_chronic_conditions') {
    const wantsCarnivore = (answers.diet_preference ?? answers.final_plan_type) === 'carnivore';
    if (!wantsCarnivore) return false;
    if (answers.diet_safety_override) return false;
    return hasCarnivoreSafetyRisk(answers);
  }
  return true;
}

export function getVisibleQuizSteps(answers: QuizAnswersModel): QuizStep[] {
  return QUIZ_STEPS.filter((step) => shouldShowStep(step, answers));
}

export function calcProgressPercent(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(100, Math.round(((currentIndex + 1) / totalSteps) * 100));
}

export function derivePlanType(answers: QuizAnswersModel): QuizAnswersModel['final_plan_type'] {
  const conditions = answers.health_conditions ?? [];
  const hasHeartOrBp = conditions.includes('heart_guard') || conditions.includes('blood_sugar');
  const hasInflammation = conditions.includes('inflammation') || conditions.includes('gut_support');
  const goal = answers.primary_goal;
  const likesHearty = answers.food_likes?.includes('hearty_meals');
  const likesPlants = answers.food_likes?.includes('plant_forward');
  const likesSeafood = answers.food_likes?.includes('seafood_focus');

  const heuristicPlan = (): QuizAnswersModel['final_plan_type'] => {
    if (likesPlants || hasInflammation || goal === 'energy_health' || goal === 'food_relationship') {
      return 'anti_inflammatory';
    }
    if (!hasHeartOrBp && (goal === 'muscle_gain' || likesHearty)) {
      return 'carnivore';
    }
    if (!hasHeartOrBp && likesSeafood && goal === 'muscle_gain') {
      return 'carnivore';
    }
    return 'mediterranean';
  };

  const preference = answers.diet_preference;
  const override = answers.diet_safety_override;

  if (override) {
    return override;
  }

  if (preference && preference !== 'carnivore') {
    return preference;
  }

  if (preference === 'carnivore') {
    if (hasCarnivoreSafetyRisk(answers)) {
      if (hasInflammation) {
        return 'anti_inflammatory';
      }
      return 'mediterranean';
    }
    return 'carnivore';
  }

  const plan = heuristicPlan();
  if (plan === 'carnivore' && hasCarnivoreSafetyRisk(answers)) {
    return hasInflammation ? 'anti_inflammatory' : 'mediterranean';
  }
  return plan;
}
