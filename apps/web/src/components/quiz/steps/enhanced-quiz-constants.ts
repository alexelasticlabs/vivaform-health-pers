// Enhanced quiz constants for 30-step interactive quiz
// Phase-based structure for better engagement

// Quiz Phases
export const QUIZ_PHASES = {
  HOOK: { id: 1, name: 'Hook', steps: [0, 1, 2, 3, 4], emoji: '🎯' },
  ENGAGE: { id: 2, name: 'Engage', steps: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14], emoji: '💡' },
  COMMIT: { id: 3, name: 'Commit', steps: [15, 16, 17, 18, 19, 20, 21], emoji: '💪' },
  CONVERT: { id: 4, name: 'Convert', steps: [22, 23, 24], emoji: '🚀' }
} as const;

export const TOTAL_STEPS = 25; // 0-24 (25 steps total)

export const STEP_NAMES = [
  // Phase 1: Hook (0-4)
  'splash',
  'primary_goal',
  'personal_story',
  'quick_win',
  'body_type',

  // Phase 2: Engage (5-14)
  'body_metrics',
  'age_gender',
  'health_conditions',
  'current_diet',
  'meal_timing',
  'food_preferences',
  'cooking_skills',
  'kitchen_equipment',
  'midpoint_celebration',
  'activity_level',

  // Phase 3: Commit (15-21)
  'sleep_pattern',
  'stress_level',
  'social_eating',
  'budget',
  'motivation',
  'accountability',
  'timeline',

  // Phase 4: Convert (22-24)
  'results_preview',
  'meal_plan_preview',
  'final_cta'
] as const;

export type StepName = typeof STEP_NAMES[number];

// Primary Goals (Step 1)
export const PRIMARY_GOALS = [
  {
    id: 'lose_weight',
    title: '🎯 Похудеть',
    subtitle: 'Сбросить лишний вес здоровым способом',
    popular: true,
    description: 'Достигните желаемого веса с персональным планом питания'
  },
  {
    id: 'gain_muscle',
    title: '💪 Набрать мышечную массу',
    subtitle: 'Построить сильное тело',
    description: 'Увеличьте мышечную массу с правильным питанием и тренировками'
  },
  {
    id: 'stay_healthy',
    title: '🌿 Поддерживать здоровье',
    subtitle: 'Оставаться в форме',
    description: 'Сбалансированное питание для поддержания здоровья'
  },
  {
    id: 'more_energy',
    title: '⚡ Больше энергии',
    subtitle: 'Чувствовать себя бодрее каждый день',
    description: 'Повысьте уровень энергии через правильное питание'
  }
] as const;

// Personal Story Pain Points (Step 2)
export const PAIN_POINTS = [
  { id: 'no_energy', emoji: '😴', text: 'Нет энергии для тренировок' },
  { id: 'junk_food', emoji: '🍕', text: 'Не могу отказаться от вредной еды' },
  { id: 'no_time', emoji: '⏰', text: 'Нет времени готовить' },
  { id: 'dont_know', emoji: '🤷', text: 'Не знаю с чего начать' },
  { id: 'tracking', emoji: '📊', text: 'Сложно отслеживать прогресс' },
  { id: 'motivation', emoji: '😔', text: 'Теряю мотивацию быстро' }
] as const;

// Body Types (Step 4)
export const BODY_TYPES = [
  {
    id: 'ectomorph',
    title: 'Эктоморф',
    emoji: '🏃',
    description: 'Худощавое телосложение, быстрый метаболизм',
    characteristics: ['Высокий', 'Тонкие кости', 'Сложно набрать вес']
  },
  {
    id: 'mesomorph',
    title: 'Мезоморф',
    emoji: '💪',
    description: 'Атлетичное телосложение, средний метаболизм',
    characteristics: ['Мускулистый', 'Широкие плечи', 'Легко набирает мышцы']
  },
  {
    id: 'endomorph',
    title: 'Эндоморф',
    emoji: '🧘',
    description: 'Плотное телосложение, медленный метаболизм',
    characteristics: ['Крупные кости', 'Округлые формы', 'Легко набирает вес']
  }
] as const;

// Health Conditions (Step 7)
export const HEALTH_CONDITIONS = [
  { id: 'diabetes', label: 'Диабет 2 типа', requiresCareful: true },
  { id: 'hypertension', label: 'Гипертония', requiresCareful: true },
  { id: 'pcos', label: 'PCOS/Поликистоз', requiresCareful: true },
  { id: 'hypothyroid', label: 'Гипотиреоз', requiresCareful: true },
  { id: 'none', label: 'Нет заболеваний', requiresCareful: false }
] as const;

// Cooking Skills (Step 11)
export const COOKING_SKILLS = [
  {
    level: 'beginner',
    emoji: '🍳',
    title: 'Новичок',
    description: 'Могу сварить яйца и сделать бутерброд',
    examples: ['Яичница', 'Салат', 'Бутерброды']
  },
  {
    level: 'intermediate',
    emoji: '👨‍🍳',
    title: 'Любитель',
    description: 'Готовлю несколько блюд регулярно',
    examples: ['Супы', 'Жаркое', 'Выпечка']
  },
  {
    level: 'advanced',
    emoji: '⭐',
    title: 'Опытный',
    description: 'Люблю экспериментировать на кухне',
    examples: ['Сложные блюда', 'Выпечка', 'Эксперименты']
  }
] as const;

// Kitchen Equipment (Step 12)
export const KITCHEN_EQUIPMENT = [
  { id: 'oven', label: 'Духовка', icon: '🔥' },
  { id: 'multicooker', label: 'Мультиварка', icon: '🍲' },
  { id: 'blender', label: 'Блендер', icon: '🥤' },
  { id: 'microwave', label: 'Микроволновка', icon: '📡' },
  { id: 'grill', label: 'Гриль', icon: '🔥' },
  { id: 'airfryer', label: 'Air Fryer', icon: '💨' }
] as const;

// Sleep Quality (Step 15)
export const SLEEP_QUALITY = [
  { value: 'excellent', label: 'Отличное', emoji: '😊', hours: '7-9' },
  { value: 'good', label: 'Хорошее', emoji: '🙂', hours: '6-7' },
  { value: 'fair', label: 'Среднее', emoji: '😐', hours: '5-6' },
  { value: 'poor', label: 'Плохое', emoji: '😔', hours: '<5' }
] as const;

// Stress Factors (Step 16)
export const STRESS_FACTORS = [
  { id: 'work', label: 'Работа', emoji: '💼' },
  { id: 'family', label: 'Семья', emoji: '👨‍👩‍👧' },
  { id: 'finances', label: 'Финансы', emoji: '💰' },
  { id: 'health', label: 'Здоровье', emoji: '🏥' },
  { id: 'relationships', label: 'Отношения', emoji: '❤️' },
  { id: 'none', label: 'Нет стресса', emoji: '😌' }
] as const;

// Social Eating Frequency (Step 17)
export const SOCIAL_EATING = [
  { frequency: 'daily', label: 'Каждый день', emoji: '🍽️' },
  { frequency: 'few_per_week', label: '3-5 раз в неделю', emoji: '👥' },
  { frequency: 'weekly', label: '1-2 раза в неделю', emoji: '🗓️' },
  { frequency: 'rarely', label: 'Редко', emoji: '🏠' }
] as const;

// Budget Ranges (Step 18)
export const BUDGET_RANGES = [
  { id: 'low', label: 'Бюджетный', range: '< 3,000 ₽', emoji: '💵' },
  { id: 'medium', label: 'Средний', range: '3,000-6,000 ₽', emoji: '💳' },
  { id: 'high', label: 'Комфортный', range: '6,000-10,000 ₽', emoji: '💰' },
  { id: 'premium', label: 'Премиум', range: '> 10,000 ₽', emoji: '💎' }
] as const;

// Motivation Factors (Step 19) - for ranking
export const MOTIVATION_FACTORS = [
  { id: 'scale', label: 'Увидеть результаты на весах', emoji: '⚖️' },
  { id: 'clothes', label: 'Влезть в любимую одежду', emoji: '👗' },
  { id: 'health', label: 'Улучшить здоровье', emoji: '❤️' },
  { id: 'energy', label: 'Больше энергии', emoji: '⚡' },
  { id: 'looks', label: 'Лучше выглядеть', emoji: '✨' },
  { id: 'example', label: 'Быть примером для близких', emoji: '🌟' }
] as const;

// Accountability Options (Step 20)
export const ACCOUNTABILITY_OPTIONS = [
  {
    type: 'friend',
    title: '👥 С другом',
    description: 'Пригласить друга в challenge',
    benefits: ['Взаимная поддержка', 'Соревнование', 'Веселее вместе']
  },
  {
    type: 'community',
    title: '🌍 Сообщество',
    description: 'Присоединиться к группе',
    benefits: ['Группа поддержки', 'Обмен опытом', 'Мотивация']
  },
  {
    type: 'coach',
    title: '🎯 Коуч',
    description: 'Персональная поддержка',
    benefits: ['Личный коуч', 'Индивидуальный план', 'Постоянная связь']
  },
  {
    type: 'solo',
    title: '🦸 Сам справлюсь',
    description: 'Самостоятельное достижение цели',
    benefits: ['Свобода действий', 'Свой темп', 'Самодисциплина']
  }
] as const;

// Gamification: Badges
export const QUIZ_BADGES = [
  { id: 'starter', name: 'Starter', emoji: '🏁', step: 0, description: 'Начал квиз' },
  { id: 'focused', name: 'Focused', emoji: '🎯', step: 4, description: 'Завершил Phase 1' },
  { id: 'committed', name: 'Committed', emoji: '💪', step: 14, description: 'Завершил Phase 2' },
  { id: 'champion', name: 'Champion', emoji: '🏆', step: 24, description: 'Завершил квиз!' }
] as const;

// Helper function to get current phase
export function getCurrentPhase(step: number): typeof QUIZ_PHASES[keyof typeof QUIZ_PHASES] {
  if (step <= 4) return QUIZ_PHASES.HOOK;
  if (step <= 14) return QUIZ_PHASES.ENGAGE;
  if (step <= 21) return QUIZ_PHASES.COMMIT;
  return QUIZ_PHASES.CONVERT;
}

// Helper function to get phase progress
export function getPhaseProgress(step: number): number {
  const phase = getCurrentPhase(step);
  const phaseStart = phase.steps[0];
  const phaseEnd = phase.steps[phase.steps.length - 1];
  const phaseLength = phaseEnd - phaseStart + 1;
  const currentInPhase = step - phaseStart + 1;
  return Math.round((currentInPhase / phaseLength) * 100);
}

// Helper function to check if badge unlocked
export function getUnlockedBadges(currentStep: number) {
  return QUIZ_BADGES.filter(badge => currentStep >= badge.step);
}

