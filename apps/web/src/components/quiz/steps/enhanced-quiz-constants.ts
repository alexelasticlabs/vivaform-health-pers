﻿﻿// Enhanced quiz constants for 30-step interactive quiz
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
  'meal_timing',
  'current_diet',
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
    title: '🎯 Lose weight',
    subtitle: 'Reduce body fat in a healthy, sustainable way',
    popular: true,
    description: 'Reach your goal weight with a personalized nutrition plan'
  },
  {
    id: 'gain_muscle',
    title: '💪 Build muscle',
    subtitle: 'Develop a stronger and leaner physique',
    description: 'Increase muscle mass with the right nutrition and training'
  },
  {
    id: 'stay_healthy',
    title: '🌿 Stay healthy',
    subtitle: 'Maintain weight and overall well-being',
    description: 'Balanced nutrition to support your health and lifestyle'
  },
  {
    id: 'more_energy',
    title: '⚡ More energy',
    subtitle: 'Feel energized throughout the day',
    description: 'Boost energy levels with smarter meal timing and choices'
  }
] as const;

// Personal Story Pain Points (Step 2)
export const PAIN_POINTS = [
  { id: 'no_energy', emoji: '😴', text: 'Not enough energy to work out' },
  { id: 'junk_food', emoji: '🍕', text: 'Hard to resist junk food' },
  { id: 'no_time', emoji: '⏰', text: 'No time to cook' },
  { id: 'dont_know', emoji: '🤷', text: 'Don’t know where to start' },
  { id: 'tracking', emoji: '📊', text: 'Hard to track progress' },
  { id: 'motivation', emoji: '😔', text: 'Lose motivation quickly' }
] as const;

// Body Types (Step 4)
export const BODY_TYPES = [
  {
    id: 'ectomorph',
    title: 'Ectomorph',
    emoji: '🏃',
    description: 'Lean frame, faster metabolism',
    characteristics: ['Often taller', 'Narrower build', 'Hard to gain weight']
  },
  {
    id: 'mesomorph',
    title: 'Mesomorph',
    emoji: '💪',
    description: 'Athletic frame, moderate metabolism',
    characteristics: ['Naturally muscular', 'Broad shoulders', 'Gains muscle easily']
  },
  {
    id: 'endomorph',
    title: 'Endomorph',
    emoji: '🧘',
    description: 'Sturdier frame, slower metabolism',
    characteristics: ['Heavier bone structure', 'Rounder physique', 'Gains weight easily']
  }
] as const;

// Health Conditions (Step 7)
export const HEALTH_CONDITIONS = [
  { id: 'diabetes', label: 'Type 2 diabetes', requiresCareful: true },
  { id: 'hypertension', label: 'Hypertension', requiresCareful: true },
  { id: 'pcos', label: 'PCOS / Polycystic ovary syndrome', requiresCareful: true },
  { id: 'hypothyroid', label: 'Hypothyroidism', requiresCareful: true },
  { id: 'none', label: 'No health conditions', requiresCareful: false }
] as const;

// Cooking Skills (Step 11)
export const COOKING_SKILLS = [
  {
    level: 'beginner',
    emoji: '🍳',
    title: 'Beginner',
    description: 'I can handle the basics',
    examples: ['Scrambled eggs', 'Simple salads', 'Sandwiches']
  },
  {
    level: 'intermediate',
    emoji: '👨‍🍳',
    title: 'Intermediate',
    description: 'I cook a few dishes regularly',
    examples: ['Soups', 'Stir-fries', 'Baking']
  },
  {
    level: 'advanced',
    emoji: '⭐',
    title: 'Advanced',
    description: 'I enjoy experimenting in the kitchen',
    examples: ['Complex recipes', 'Baking', 'Creative dishes']
  }
] as const;

// Kitchen Equipment (Step 12)
export const KITCHEN_EQUIPMENT = [
  { id: 'oven', label: 'Oven', icon: '🔥' },
  { id: 'multicooker', label: 'Multicooker', icon: '🍲' },
  { id: 'blender', label: 'Blender', icon: '🥤' },
  { id: 'microwave', label: 'Microwave', icon: '📡' },
  { id: 'grill', label: 'Grill', icon: '🔥' },
  { id: 'airfryer', label: 'Air fryer', icon: '💨' }
] as const;

// Sleep Quality (Step 15)
export const SLEEP_QUALITY = [
  { value: 'excellent', label: 'Excellent', emoji: '😊', hours: '7-9' },
  { value: 'good', label: 'Good', emoji: '🙂', hours: '6-7' },
  { value: 'fair', label: 'Fair', emoji: '😐', hours: '5-6' },
  { value: 'poor', label: 'Poor', emoji: '😔', hours: '<5' }
] as const;

// Stress Factors (Step 16)
export const STRESS_FACTORS = [
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'finances', label: 'Finances', emoji: '💰' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'relationships', label: 'Relationships', emoji: '❤️' },
  { id: 'none', label: 'No stress', emoji: '😌' }
] as const;

// Social Eating Frequency (Step 17)
export const SOCIAL_EATING = [
  { frequency: 'daily', label: 'Every day', emoji: '🍽️' },
  { frequency: 'few_per_week', label: '3-5 times per week', emoji: '👥' },
  { frequency: 'weekly', label: '1-2 times per week', emoji: '🗓️' },
  { frequency: 'rarely', label: 'Rarely', emoji: '🏠' }
] as const;

// Budget Ranges (Step 18)
export const BUDGET_RANGES = [
  { id: 'low', label: 'Budget', range: '< $40', emoji: '💵' },
  { id: 'medium', label: 'Moderate', range: '$40-$80', emoji: '💳' },
  { id: 'high', label: 'Comfortable', range: '$80-$150', emoji: '💰' },
  { id: 'premium', label: 'Premium', range: '$150+', emoji: '💎' }
] as const;

// Motivation Factors (Step 19) - for ranking
export const MOTIVATION_FACTORS = [
  { id: 'scale', label: 'See results on the scale', emoji: '⚖️' },
  { id: 'clothes', label: 'Fit into favorite clothes', emoji: '👗' },
  { id: 'health', label: 'Improve health', emoji: '❤️' },
  { id: 'energy', label: 'Have more energy', emoji: '⚡' },
  { id: 'looks', label: 'Look better', emoji: '✨' },
  { id: 'example', label: 'Be a role model for loved ones', emoji: '🌟' }
] as const;

// Accountability Options (Step 20)
export const ACCOUNTABILITY_OPTIONS = [
  {
    type: 'friend',
    title: '👥 With a friend',
    description: 'Invite a friend to a challenge',
    benefits: ['Mutual support', 'Friendly competition', 'More fun together']
  },
  {
    type: 'community',
    title: '🌍 Community',
    description: 'Join a supportive group',
    benefits: ['Peer support', 'Knowledge exchange', 'Motivation']
  },
  {
    type: 'coach',
    title: '🎯 Coach',
    description: 'Get personal guidance',
    benefits: ['Personal coach', 'Tailored plan', 'Accountability']
  },
  {
    type: 'solo',
    title: '🦸 I got this',
    description: 'Do it on your own',
    benefits: ['Full freedom', 'Your own pace', 'Self-discipline']
  }
] as const;

// Gamification: Badges
export const QUIZ_BADGES = [
  { id: 'starter', name: 'Starter', emoji: '🏁', step: 0, description: 'Started the quiz' },
  { id: 'focused', name: 'Focused', emoji: '🎯', step: 3, description: 'Locked your core metrics' },
  { id: 'momentum', name: 'Momentum', emoji: '⚡', step: 7, description: 'Cleared the lifestyle checkpoint' },
  { id: 'champion', name: 'Champion', emoji: '🏆', step: 11, description: 'Finished the quiz!' }
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
