// Core UI components
export { QuizCard } from './quiz-card';
export { SliderInput } from './slider-input';
export { BMIIndicator } from './bmi-indicator';
export { OptionPill } from './options/option-pill';
export { OptionTile } from './options/option-tile';
export { ChoiceToggle } from './options/choice-toggle';
export { QuizProgress } from './quiz-progress';
export { OptionButton } from './option-button';
// Legacy steps (for backward compatibility in tests and storybooks)
export { IntroStep } from './steps/intro-step';
export { BodyMetricsStep } from './steps/body-metrics-step';
export { GoalTimelineStep } from './steps/goal-timeline-step';
export { ActivityLevelStep } from './steps/activity-level-step';
export { FoodHabitsStep } from './steps/food-habits-step';
export { EnergyScheduleStep } from './steps/energy-schedule-step';
export { PreferencesStep } from './steps/preferences-step';
export { EmotionalStep } from './steps/emotional-step';
export { HydrationStep } from './steps/hydration-step';
export { FinalStep } from './steps/final-step';

// Enhanced funnel steps (25-step experience)
export { SplashStep } from './steps/splash-step';
export { PrimaryGoalStep } from './steps/primary-goal-step';
export { PersonalStoryStep } from './steps/personal-story-step';
export { QuickWinStep } from './steps/quick-win-step';
export { BodyTypeStep } from './steps/body-type-step';
export { MidpointCelebrationStep } from './steps/midpoint-celebration-step';
export { BodyMetricsExtendedStep } from './steps/body-metrics-extended-step';
export { AgeGenderStep } from './steps/age-gender-step';
export { HealthConditionsStep } from './steps/health-conditions-step';
export { MealTimingStep } from './steps/meal-timing-step';
export { CurrentDietStep } from './steps/current-diet-step';
export { FoodPreferencesDeepStep } from './steps/food-preferences-deep-step';
export { CookingSkillsStep } from './steps/cooking-skills-step';
export { KitchenEquipmentStep } from './steps/kitchen-equipment-step';
export { SleepPatternStep } from './steps/sleep-pattern-step';
export { StressLevelStep } from './steps/stress-level-step';
export { SocialEatingStep } from './steps/social-eating-step';
export { BudgetStep } from './steps/budget-step';
export { MotivationRankStep } from './steps/motivation-rank-step';
export { AccountabilityStep } from './steps/accountability-step';
export { TimelineStep } from './steps/timeline-step';
export { ResultsPreviewStep } from './steps/results-preview-step';
export { MealPlanPreviewStep } from './steps/meal-plan-preview-step';
export { FinalCTAStep } from './steps/final-cta-step';

// Modals & gamification
export { ExitIntentModal } from './exit-intent-modal';
export { BadgeUnlock } from './badge-unlock';

// Constants & types
export { COMMON_ALLERGENS, COMMON_AVOIDED_FOODS, type Allergen, type AvoidedFood } from './steps/quiz-constants';
export { TOTAL_STEPS as ENHANCED_TOTAL_STEPS, STEP_NAMES as ENHANCED_STEP_NAMES } from './steps/enhanced-quiz-constants';
export { QuizStepRenderer } from './quiz-step-renderer';
