// Enhanced config-driven quiz specification for the VivaForm mobile-first funnel.
// This file defines the schema, step metadata, conditional logic, and plan derivation helpers.

export type QuizUiType = 'info' | 'single_choice' | 'multi_choice' | 'slider' | 'number_inputs';
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
  | 'cta_dual_buttons';

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
  age_years?: number;
  primary_goal?: string;
  secondary_goals?: string[];
  why_now_reasons?: string[];
  diet_history?: string;
  self_view_type?: string;
  unit_system?: 'us' | 'metric';
  height_cm?: number;
  weight_kg?: number;
  raw_height_ft?: number;
  raw_height_in?: number;
  raw_weight_lbs?: number;
  body_image?: string;
  activity_level?: string;
  work_style?: string;
  day_type?: string;
  eating_pattern?: string;
  breakfast_habit?: string;
  late_night_eating?: string;
  eating_context?: string[];
  food_likes?: string[];
  food_dislikes?: string[];
  food_allergies?: string[];
  food_avoids?: string[];
  cooking_style?: string;
  budget_level?: string;
  health_conditions?: string[];
  primary_symptom_focus?: string;
  sleep_quality_score?: number;
  stress_level_score?: number;
  emotional_eating_level?: string;
  social_triggers?: string[];
  readiness_score?: number;
  preferred_plan_type?: 'mediterranean' | 'carnivore' | 'anti_inflammatory' | 'auto';
  carnivore_safety_choice?: 'keep_carnivore' | 'switch';
  final_plan_type?: 'mediterranean' | 'carnivore' | 'anti_inflammatory';
  chosen_subscription_path?: 'premium' | 'free';
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'welcome_consent',
    group: 'onboarding',
    uiType: 'info',
    uiPattern: 'full_screen_intro',
    question: 'Find a nutrition plan that actually fits your life',
    subtitle: 'Personalized calories, macros, and meal timing guidance built around your day — no crash diets.',
    fields: ['consent_non_medical'],
    microcopy: '120,000+ people trust VivaForm • AI-personalized • Research-backed coaching.',
    badgeUnlock: 'welcome_completed',
    animationHint: 'fade_in',
    insightType: 'none',
    conditional: null,
    meta: {
      heroImage: 'https://images.unsplash.com/photo-1506086679524-493c64fdfaa6?auto=format&fit=crop&w=900&q=80',
      stage: 'start',
    },
  },
  {
    id: 'primary_goal',
    group: 'goals',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'What is your main goal right now?',
    subtitle: 'This will shape the overall direction of your plan.',
    options: [
      { value: 'weight_loss', label: 'Lose weight in a healthy way' },
      { value: 'muscle_gain', label: 'Build muscle and strength' },
      { value: 'maintenance', label: 'Maintain my current weight' },
      { value: 'energy_health', label: 'Improve my energy and overall health' },
      { value: 'food_relationship', label: 'Heal my relationship with food' },
    ],
    fields: ['primary_goal'],
    microcopy: 'Got it — we’ll tailor your plan around this.',
    badgeUnlock: 'first_step_done',
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
    meta: { stage: 'start' },
  },
  {
    id: 'preferred_plan_style',
    group: 'plan_choice',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'Which diet plan are you interested in?',
    subtitle: 'Pick the style that feels most natural — you can always adjust later.',
    options: [
      { value: 'mediterranean', label: 'Mediterranean', subtitle: 'Balanced, whole-food focus with healthy fats.' },
      { value: 'carnivore', label: 'Carnivore', subtitle: 'Animal-based, ultra-low carb plan. Check with your doctor.' },
      { value: 'anti_inflammatory', label: 'Anti-Inflammatory', subtitle: 'Reduce inflammation with plants, fiber and smart swaps.' },
      { value: 'auto', label: 'Not sure — recommend one', subtitle: 'Let VivaForm match the best fit automatically.' },
    ],
    fields: ['preferred_plan_type'],
    microcopy: 'This sets your initial direction. You can switch plans in-app anytime.',
    badgeUnlock: 'plan_style_chosen',
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
    meta: { stage: 'start' },
  },
  {
    id: 'basic_profile',
    group: 'onboarding',
    uiType: 'number_inputs',
    uiPattern: 'split_vertical_inputs',
    question: 'Tell us about your basics',
    subtitle: 'We use your name, age, height, and weight to personalize BMI and calorie targets.',
    fields: ['name', 'age_years', 'unit_system', 'height_cm', 'weight_kg', 'raw_height_ft', 'raw_height_in', 'raw_weight_lbs'],
    microcopy: 'Estimates are okay — think “170 cm” or “65 kg”. We’ll never share this data.',
    badgeUnlock: 'metrics_entered',
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
    meta: { dualUnits: true, stage: 'basics' },
  },
  {
    id: 'secondary_goals',
    group: 'goals',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Any secondary goals you care about?',
    subtitle: 'Choose all that apply. Optional, but helpful.',
    options: [
      { value: 'better_digestion', label: 'Better digestion' },
      { value: 'less_bloating', label: 'Less bloating' },
      { value: 'clearer_skin', label: 'Clearer skin' },
      { value: 'better_focus', label: 'Better focus & productivity' },
      { value: 'athletic_performance', label: 'Improved athletic performance' },
      { value: 'stable_mood', label: 'More stable mood' },
      { value: 'not_sure', label: 'I’m not sure yet' },
    ],
    fields: ['secondary_goals'],
    microcopy: 'This helps us fine-tune your plan beyond the main goal.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
  },
  {
    id: 'why_now',
    group: 'goals',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Why is this important for you right now?',
    subtitle: 'There are no wrong answers — just pick what feels true.',
    options: [
      { value: 'doctor_recommended', label: 'My doctor recommended I make changes' },
      { value: 'dont_like_feel', label: 'I don’t like how I feel in my body' },
      { value: 'low_energy', label: 'Low energy is affecting my day' },
      { value: 'need_structure', label: 'I want more structure and discipline' },
      { value: 'diets_didnt_stick', label: 'I tried diets before and they didn’t stick' },
      { value: 'recent_life_event', label: 'A recent life event' },
      { value: 'just_feel_better', label: 'I just want to feel better overall' },
    ],
    fields: ['why_now_reasons'],
    microcopy: 'Thanks for being honest — that already moves you forward.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
  },
  {
    id: 'diet_history',
    group: 'goals',
    uiType: 'single_choice',
    uiPattern: 'cards_list',
    question: 'How would you describe your past attempts with diets?',
    subtitle: 'This helps us avoid repeating what didn’t work.',
    options: [
      { value: 'never', label: 'I’ve never really tried' },
      { value: 'few_short', label: 'I tried a few times, short-term' },
      { value: 'many_years', label: 'I’ve tried many diets over the years' },
      { value: 'always', label: 'I feel like I’m always on some kind of diet' },
    ],
    fields: ['diet_history'],
    microcopy: 'We’re not here to judge — just to understand the pattern.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'self_identification',
    group: 'goals',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'Which of these feels most like you right now?',
    subtitle: 'Pick the one that feels closest, even if it’s not perfect.',
    options: [
      { value: 'busy', label: 'Busy — squeezing health into my schedule' },
      { value: 'motivated', label: 'Motivated — ready to commit if realistic' },
      { value: 'overwhelmed', label: 'Overwhelmed — need something very simple' },
      { value: 'curious', label: 'Curious — want to experiment a bit' },
    ],
    fields: ['self_view_type'],
    microcopy: 'This helps us match the tone and complexity of your plan.',
    badgeUnlock: 'identity_acknowledged',
    animationHint: 'slide_left',
    insightType: 'reflect_goal',
    conditional: null,
  },
  {
    id: 'body_image_perception',
    group: 'body_metrics',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'How do you feel about your current body?',
    subtitle: 'Your emotional experience matters as much as the numbers.',
    options: [
      { value: 'mostly_ok', label: 'Mostly okay, just a few things I’d change' },
      { value: 'not_happy', label: 'I’m not happy with it' },
      { value: 'disconnected', label: 'I feel very disconnected from it' },
      { value: 'unsure', label: 'I’m not sure / prefer not to say' },
    ],
    fields: ['body_image'],
    microcopy: 'We’ll keep this in mind when shaping your pace and tone.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'activity_level',
    group: 'activity',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'How active are you on a typical week?',
    subtitle: 'No need to impress us — honesty makes your plan better.',
    options: [
      { value: 'sedentary', label: 'Mostly sitting (desk job, little movement)' },
      { value: 'light', label: 'Lightly active (some walking, no regular workouts)' },
      { value: 'moderate', label: 'Moderately active (2–3 workouts per week)' },
      { value: 'high', label: 'Very active (4+ workouts or physically demanding job)' },
    ],
    fields: ['activity_level'],
    microcopy: 'This helps us avoid plans that are too aggressive or too low in energy.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'work_style',
    group: 'activity',
    uiType: 'single_choice',
    uiPattern: 'chips_wrap',
    question: 'What best describes your daily work or routine?',
    subtitle: 'This affects when and how you can realistically eat.',
    options: [
      { value: 'desk', label: 'Mostly at a desk or computer' },
      { value: 'on_feet', label: 'On my feet a lot' },
      { value: 'physical', label: 'Physically demanding job' },
      { value: 'shift', label: 'Shift work / changing schedule' },
      { value: 'other', label: 'Currently not working / caregiving / other' },
    ],
    fields: ['work_style'],
    microcopy: 'We’ll suggest structures that fit your real day, not a fantasy schedule.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'day_structure',
    group: 'activity',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'Are you more of a morning or evening person?',
    subtitle: 'This helps with timing of meals and energy support.',
    options: [
      { value: 'morning', label: 'Definitely a morning person' },
      { value: 'evening', label: 'More of a night owl' },
      { value: 'middle', label: 'Somewhere in the middle' },
      { value: 'depends', label: 'Depends on the day' },
    ],
    fields: ['day_type'],
    microcopy: 'We’ll work with your rhythm, not against it.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'eating_pattern',
    group: 'eating',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'Which eating pattern looks most like your usual day?',
    subtitle: 'Pick the one that feels closest.',
    options: [
      { value: 'two_meals', label: '2 big meals, not many snacks' },
      { value: 'three_four_meals', label: '3–4 regular meals' },
      { value: 'snacking', label: 'Mostly snacking through the day' },
      { value: 'chaotic', label: 'Chaotic — every day is different' },
    ],
    fields: ['eating_pattern'],
    microcopy: 'Your plan will start from your current pattern, not from an ideal one.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'breakfast_habit',
    group: 'eating',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'What about breakfast?',
    subtitle: 'No shaming — just planning around your habit.',
    options: [
      { value: 'usually', label: 'I usually eat breakfast' },
      { value: 'skip', label: 'I often skip breakfast' },
      { value: 'depends', label: 'It depends / no clear pattern' },
    ],
    fields: ['breakfast_habit'],
    microcopy: 'If you skip, we’ll adjust your plan accordingly.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'late_night_eating',
    group: 'eating',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'How often do you eat late at night?',
    subtitle: 'Helps us understand your full-day rhythm.',
    options: [
      { value: 'never', label: 'Almost never' },
      { value: '1_2', label: '1–2 times per week' },
      { value: '3_4', label: '3–4 times per week' },
      { value: 'most', label: 'Most nights' },
    ],
    fields: ['late_night_eating'],
    microcopy: 'Late-night eating isn’t “bad” — we’ll just plan for it smartly.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'social_eating_context',
    group: 'eating',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Where do you usually eat most of your meals?',
    subtitle: 'Home, office, takeout — your plan should survive all of it.',
    options: [
      { value: 'home', label: 'At home' },
      { value: 'work_desk', label: 'At work / at my desk' },
      { value: 'eating_out', label: 'Eating out / takeout' },
      { value: 'mixed', label: 'Mixed, depends on the day' },
    ],
    fields: ['eating_context'],
    microcopy: 'Select all that apply.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'food_likes',
    group: 'preferences',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'What do you genuinely enjoy eating?',
    subtitle: 'Your plan should include foods you actually like.',
    options: [
      { value: 'meat_poultry', label: 'Meat & poultry' },
      { value: 'fish_seafood', label: 'Fish & seafood' },
      { value: 'vegetables_salads', label: 'Vegetables & salads' },
      { value: 'fruits', label: 'Fruits' },
      { value: 'grains_bread', label: 'Grains & bread' },
      { value: 'sweet_foods', label: 'Sweet foods' },
      { value: 'fast_food_takeout', label: 'Fast food & takeout' },
      { value: 'dairy', label: 'Dairy' },
    ],
    fields: ['food_likes'],
    microcopy: 'A sustainable plan works with your likes, not against them.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'food_dislikes',
    group: 'preferences',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Anything you really dislike or never want in your plan?',
    subtitle: 'We’ll work around your dislikes.',
    options: [
      { value: 'most_vegetables', label: 'Most vegetables' },
      { value: 'fish_seafood', label: 'Fish and seafood' },
      { value: 'red_meat', label: 'Red meat' },
      { value: 'eggs', label: 'Eggs' },
      { value: 'dairy_products', label: 'Dairy products' },
      { value: 'open_to_most', label: 'I’m open to most foods' },
    ],
    fields: ['food_dislikes'],
    microcopy: 'Not liking something doesn’t make you “picky” — it just means we shouldn’t rely on it.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'allergies',
    group: 'preferences',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Do you have any food allergies?',
    subtitle: 'We’ll strictly avoid these in your suggestions.',
    options: [
      { value: 'gluten', label: 'Gluten' },
      { value: 'lactose', label: 'Lactose' },
      { value: 'nuts', label: 'Nuts' },
      { value: 'seafood', label: 'Seafood' },
      { value: 'eggs', label: 'Eggs' },
      { value: 'soy', label: 'Soy' },
      { value: 'fish', label: 'Fish' },
      { value: 'none', label: 'No allergies' },
    ],
    fields: ['food_allergies'],
    microcopy: 'Safety first — your plan will respect these completely.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'avoid_foods',
    group: 'preferences',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'What would you like to avoid or reduce?',
    subtitle: 'Think about ethics, health and preferences.',
    options: [
      { value: 'meat', label: 'Meat' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'sugar', label: 'Sugar' },
      { value: 'alcohol', label: 'Alcohol' },
      { value: 'caffeine', label: 'Caffeine' },
      { value: 'spicy_food', label: 'Spicy food' },
      { value: 'fried_food', label: 'Fried food' },
      { value: 'nothing_specific', label: 'Nothing specific' },
    ],
    fields: ['food_avoids'],
    microcopy: 'We’ll reduce these without turning your life upside down overnight.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'cooking_style',
    group: 'preferences',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'How do you feel about cooking?',
    subtitle: 'Effort level matters for consistency.',
    options: [
      { value: 'enjoys', label: 'I enjoy cooking and trying recipes' },
      { value: 'simple', label: 'I can cook, but prefer simple meals' },
      { value: 'minimal', label: 'I want minimal cooking and prep' },
    ],
    fields: ['cooking_style'],
    microcopy: 'We’ll match the complexity of your plan to your cooking energy.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'budget_level',
    group: 'preferences',
    uiType: 'single_choice',
    uiPattern: 'cards_grid',
    question: 'What best describes your food budget?',
    subtitle: 'Being realistic here prevents frustration later.',
    options: [
      { value: 'low', label: 'I need to keep it as low as possible' },
      { value: 'medium', label: 'Normal / flexible, but not too expensive' },
      { value: 'high', label: 'I’m okay investing more into quality food' },
    ],
    fields: ['budget_level'],
    microcopy: 'Your plan should fit your wallet as well as your body.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'health_conditions',
    group: 'health',
    uiType: 'multi_choice',
    uiPattern: 'chips_wrap',
    question: 'Do you have any of these health situations? (Optional)',
    subtitle: 'This doesn’t replace a doctor — it just helps us be more thoughtful.',
    options: [
      { value: 'digestive_issues', label: 'Digestive issues (bloating, IBS, reflux)' },
      { value: 'blood_sugar_issues', label: 'Blood sugar issues' },
      { value: 'heart_issues', label: 'High blood pressure or heart issues' },
      { value: 'joint_inflammation', label: 'Joint pain or chronic inflammation' },
      { value: 'hormonal_issues', label: 'Hormonal issues (PCOS, thyroid, etc.)' },
      { value: 'none', label: 'None / prefer not to say' },
    ],
    fields: ['health_conditions'],
    microcopy: 'We’ll avoid recommendations that ignore these realities.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'symptoms_focus',
    group: 'health',
    uiType: 'single_choice',
    uiPattern: 'cards_list',
    question: 'If you could improve just one thing in your health right now, what would it be?',
    subtitle: 'Helps us focus on what matters most to you.',
    options: [
      { value: 'energy_fatigue', label: 'Energy and fatigue' },
      { value: 'digestion_bloating', label: 'Digestion and bloating' },
      { value: 'joint_inflammation', label: 'Joint pain or inflammation' },
      { value: 'blood_sugar_cravings', label: 'Blood sugar / cravings' },
      { value: 'mood_stress', label: 'Mood and stress' },
      { value: 'overall_reset', label: 'I just want an overall reset' },
    ],
    fields: ['primary_symptom_focus'],
    microcopy: 'This will influence which benefits we emphasise in your plan.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'sleep_quality',
    group: 'health',
    uiType: 'slider',
    uiPattern: 'slider_emoji',
    question: 'How well do you usually sleep?',
    subtitle: 'Think about the last 2–4 weeks.',
    fields: ['sleep_quality_score'],
    microcopy: 'Sleep is a huge part of weight, cravings and energy — we’ll keep it in mind.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_sleep_stress',
    conditional: null,
    meta: { min: 1, max: 5, labels: ['Very poorly', 'Poor', 'Okay', 'Good', 'Very well'] },
  },
  {
    id: 'stress_level',
    group: 'health',
    uiType: 'slider',
    uiPattern: 'slider_emoji',
    question: 'How would you rate your stress level lately?',
    subtitle: 'Think average, not the single worst day.',
    fields: ['stress_level_score'],
    microcopy: 'Your plan should respect your mental load, not fight it.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_sleep_stress',
    conditional: null,
    meta: { min: 1, max: 5, labels: ['Very low', 'Low', 'Medium', 'High', 'Very high'] },
  },
  {
    id: 'emotional_eating',
    group: 'behavior',
    uiType: 'single_choice',
    uiPattern: 'chips_row',
    question: 'Do emotions influence your eating?',
    subtitle: 'Most people say yes to this at least sometimes.',
    options: [
      { value: 'none', label: 'Not really' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'very_often', label: 'Very often' },
    ],
    fields: ['emotional_eating_level'],
    microcopy: 'If food is sometimes emotional, your plan should acknowledge that.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'overeating_triggers',
    group: 'behavior',
    uiType: 'multi_choice',
    uiPattern: 'swipe_cards',
    question: 'Where do you usually “lose control” with food? (If at all)',
    subtitle: 'Swipe right if it applies, left if it doesn’t.',
    options: [
      { value: 'late_night_snacking', label: 'Evening or late-night snacking' },
      { value: 'weekends', label: 'Weekends' },
      { value: 'eating_out', label: 'Eating out or ordering in' },
      { value: 'office_snacks', label: 'Office snacks / sweets at work' },
      { value: 'rarely', label: 'I rarely feel out of control with food' },
    ],
    fields: ['social_triggers'],
    microcopy: 'We’ll give you strategies for your actual “danger zones”, not generic rules.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'reflect_pattern',
    conditional: null,
  },
  {
    id: 'readiness_scale',
    group: 'behavior',
    uiType: 'slider',
    uiPattern: 'slider_numeric',
    question: 'How ready do you feel to make changes in the next 30 days?',
    subtitle: '1 = not at all ready, 10 = fully ready.',
    fields: ['readiness_score'],
    microcopy: 'We’ll match the intensity of your plan to where you are right now.',
    badgeUnlock: 'commitment_check',
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
    meta: { min: 1, max: 10 },
  },
  {
    id: 'carnivore_safety_check',
    group: 'plan_choice',
    uiType: 'single_choice',
    uiPattern: 'two_cards_split_warning',
    question: 'Important check before choosing a Carnivore-style plan',
    subtitle: 'With chronic conditions, big changes to your diet should be done with a doctor’s support.',
    options: [
      { value: 'keep_carnivore', label: 'Keep Carnivore and I’ll discuss it with my doctor' },
      { value: 'switch', label: 'Switch me to a safer, more balanced plan' },
    ],
    fields: ['carnivore_safety_choice'],
    microcopy: 'We want your plan to be bold but safe for your situation.',
    badgeUnlock: null,
    animationHint: 'fade_in',
    insightType: 'none',
    conditional: {
      dependsOn: ['preferred_plan_type', 'health_conditions'],
      rule: 'carnivore_with_chronic_conditions',
    },
  },
  {
    id: 'progress_summary',
    group: 'summary',
    uiType: 'info',
    uiPattern: 'badge_screen',
    question: 'You’re almost done — here’s what we’ve learned',
    subtitle: 'We’re connecting your goals, habits, health and preferences into one picture.',
    options: [{ value: 'continue', label: 'Continue' }],
    fields: [],
    microcopy: 'Most people never get this far. You’ve already done the hardest part.',
    badgeUnlock: 'almost_finished',
    animationHint: 'confetti_small',
    insightType: 'reflect_goal',
    conditional: null,
  },
  {
    id: 'bmi_insight_and_plan_intro',
    group: 'summary',
    uiType: 'info',
    uiPattern: 'summary_bullets',
    question: 'Here’s your starting point and plan direction',
    subtitle: 'We’ll use your BMI plus lifestyle factors — not BMI alone — to guide your plan.',
    fields: [],
    microcopy: 'BMI is just one piece of the puzzle. Your plan also considers your habits, stress and preferences.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
  },
  {
    id: 'bmi_health_insight',
    group: 'summary',
    uiType: 'info',
    uiPattern: 'summary_bullets',
    question: 'Your BMI snapshot',
    subtitle: 'See where your BMI lands and what it means for your health.',
    fields: [],
    microcopy: 'We pair this with your routine, stress, and preferences to create a safer plan.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'plan_teaser',
    conditional: null,
    meta: { stage: 'plan' },
  },
  {
    id: 'plan_preview',
    group: 'summary',
    uiType: 'info',
    uiPattern: 'summary_bullets',
    question: 'What your plan could look like day-to-day',
    subtitle: 'We’ll show you the structure — details live inside VivaForm.',
    fields: [],
    microcopy: 'This is a starting point — your plan can grow and adapt with you.',
    badgeUnlock: 'plan_preview_unlocked',
    animationHint: 'fade_in',
    insightType: 'plan_teaser',
    conditional: null,
  },
  {
    id: 'free_vs_premium_offer',
    group: 'offer',
    uiType: 'info',
    uiPattern: 'comparison_cards',
    question: 'Get your plan inside VivaForm',
    subtitle: 'Both Free and Premium include your personalized plan. Here’s what you get with each:',
    fields: [],
    microcopy: 'Free keeps you on the basics. Premium adds dynamic meal plans, deeper insights and extra accountability so it’s much easier to stay consistent.',
    badgeUnlock: null,
    animationHint: 'slide_left',
    insightType: 'none',
    conditional: null,
  },
  {
    id: 'final_cta',
    group: 'offer',
    uiType: 'single_choice',
    uiPattern: 'cta_dual_buttons',
    question: 'Choose how you want to start',
    subtitle: 'You’re one tap away from activating your plan.',
    options: [
      { value: 'premium', label: 'Continue with Premium', subtitle: 'Full access to smart meal plans, habit tracking and insights. Cancel anytime.' },
      { value: 'free', label: 'Continue with Free plan', subtitle: 'Get your core plan today and upgrade from inside the app later.' },
    ],
    fields: ['chosen_subscription_path'],
    microcopy: 'Most people who want faster results start with Premium. You’re always in control and can switch plans later.',
    badgeUnlock: 'quiz_completed',
    animationHint: 'confetti_small',
    insightType: 'none',
    conditional: null,
  },
];

export function shouldShowStep(step: QuizStep, answers: QuizAnswersModel): boolean {
  if (!step.conditional) return true;
  if (step.conditional.rule === 'carnivore_with_chronic_conditions') {
    if (answers.preferred_plan_type !== 'carnivore') return false;
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
  const hasInflammation = conditions.includes('joint_inflammation');
  const hasHeartIssues = conditions.includes('heart_issues');
  const choice = answers.preferred_plan_type;

  if (choice === 'mediterranean') return 'mediterranean';
  if (choice === 'anti_inflammatory') return 'anti_inflammatory';
  if (choice === 'carnivore') {
    if (conditions.some((c) => c !== 'none') && answers.carnivore_safety_choice === 'switch') {
      return hasInflammation ? 'anti_inflammatory' : 'mediterranean';
    }
    return 'carnivore';
  }

  if (hasInflammation) return 'anti_inflammatory';
  const likesMeat = answers.food_likes?.includes('meat_poultry');
  const likesSeafood = answers.food_likes?.includes('fish_seafood');
  const avoidsMeat = answers.food_avoids?.includes('meat');
  if (likesMeat && likesSeafood && !avoidsMeat && !hasHeartIssues) {
    return 'carnivore';
  }
  return 'mediterranean';
}
