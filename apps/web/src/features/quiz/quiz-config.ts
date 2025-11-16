// Lean quiz configuration (12 steps) powering the VivaForm funnel.
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

export interface QuizAnswersModel {
  consent_non_medical?: boolean;
  name?: string;
  email?: string;
  age_years?: number;
  unit_system?: 'us' | 'metric';
  height_cm?: number;
  weight_kg?: number;
  raw_height_ft?: number;
  raw_height_in?: number;
  raw_weight_lbs?: number;
  primary_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'energy_health' | 'food_relationship';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'high';
  food_likes?: string[];
  health_conditions?: string[];
  cooking_style?: 'speed' | 'balanced' | 'chef' | 'no_cook';
  budget_level?: 'lean' | 'balanced' | 'premium';
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
    id: 'email_capture',
    group: 'onboarding',
    uiType: 'text_input',
    uiPattern: 'text_capture',
    question: 'Where should we send your draft plan and progress link?',
    subtitle: 'We hold your personalized slot for 24 hours — no spam, just your plan + reminders.',
    fields: ['email'],
    microcopy: 'We’ll email a quick-start checklist and save your progress automatically.',
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
    id: 'food_identity',
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
    microcopy: 'No judgment — this keeps cravings in check.',
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
    id: 'momentum_social_proof',
    group: 'milestone',
    uiType: 'info',
    uiPattern: 'milestone_card',
    question: '✨ Quick win unlocked',
    subtitle: 'We just mapped your calorie range. Here’s what happens next.',
    fields: [],
    microcopy: '“Down 4.1 kg in 5 weeks without cutting social dinners.” — Maya, VivaForm member',
    badgeUnlock: 'momentum_badge',
    animationHint: 'pulse',
    insightType: 'plan_teaser',
    conditional: null,
    meta: {
      testimonialName: 'Maya',
      urgencyCopy: 'Premium spots refresh nightly — 18 left today',
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
    id: 'budget_level',
    group: 'preferences',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'What’s your weekly food budget comfort zone?',
    subtitle: 'We’ll recommend swaps + shopping lists that match.',
    options: [
      { value: 'lean', label: 'Lean & mindful', subtitle: 'Under $70 / week', emoji: '💡' },
      { value: 'balanced', label: 'Balanced', subtitle: '$70–$120 / week', emoji: '⚖️' },
      { value: 'premium', label: 'Premium lifestyle', subtitle: '$120+ / week', emoji: '🌟' },
    ],
    fields: ['budget_level'],
    microcopy: 'Budget cues influence grocery layouts and optional premium swaps.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'plan_summary',
    group: 'summary',
    uiType: 'info',
    uiPattern: 'summary_bullets',
    question: 'Here’s what we’ve unlocked for you',
    subtitle: 'Review the highlights before locking your plan.',
    fields: [],
    microcopy: 'Goal, calorie range, preferred flavors, and coaching cadence are now mapped.',
    badgeUnlock: 'summary_unlocked',
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
    meta: {
      showSummary: true,
      stage: 'plan',
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
    if ((answers as QuizAnswersModel).final_plan_type !== 'carnivore') return false;
    const conditions = answers.health_conditions ?? [];
    return conditions.some((c) => c !== 'none');
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
}
