// Enhanced Quiz Configuration with Conditional Branching
// English-only interface as requested

export type QuizStepId =
  | 'welcome'
  | 'goal'
  | 'current-weight'
  | 'target-weight'
  | 'height'
  | 'age-gender'
  | 'activity-level'
  | 'dietary-preference'
  | 'health-conditions'
  | 'meal-frequency'
  | 'cooking-skills'
  | 'budget'
  | 'motivation'
  | 'timeline'
  | 'email-capture'
  | 'results';

export type QuizQuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'numeric_input'
  | 'range_slider'
  | 'image_choice'
  | 'text_short';

export interface QuizOption {
  id: string;
  label: string;
  value: string | number;
  imageUrl?: string;
  description?: string;
  emoji?: string;
}

export interface QuizQuestion {
  id: QuizStepId;
  type: QuizQuestionType;
  title: string;
  subtitle?: string;
  description?: string;
  options?: QuizOption[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
  nextStep?: QuizStepId | ((answer: any, allAnswers: Record<string, any>) => QuizStepId);
  progressWeight?: number; // For weighted progress bar
}

// Enhanced Quiz Configuration with Conditional Branching
export const ENHANCED_QUIZ_CONFIG: QuizQuestion[] = [
  {
    id: 'welcome',
    type: 'single_choice',
    title: 'Welcome to Your Personal Health Journey! 🌟',
    subtitle: 'Let\'s create your custom nutrition plan in just 2 minutes',
    description: 'Answer a few questions to get a personalized plan tailored to your goals',
    options: [
      { id: 'start', label: 'Get Started', value: 'start', emoji: '🚀' },
    ],
    nextStep: 'goal',
    progressWeight: 1,
  },
  {
    id: 'goal',
    type: 'image_choice',
    title: 'What\'s your primary health goal?',
    subtitle: 'Choose the one that matters most to you right now',
    options: [
      {
        id: 'lose',
        label: 'Lose Weight',
        value: 'lose',
        imageUrl: '/images/quiz/goal-lose.jpg',
        description: 'Achieve a healthier weight',
        emoji: '📉'
      },
      {
        id: 'maintain',
        label: 'Maintain Weight',
        value: 'maintain',
        imageUrl: '/images/quiz/goal-maintain.jpg',
        description: 'Stay at your current weight',
        emoji: '⚖️'
      },
      {
        id: 'gain',
        label: 'Build Muscle',
        value: 'gain',
        imageUrl: '/images/quiz/goal-gain.jpg',
        description: 'Gain lean muscle mass',
        emoji: '💪'
      },
      {
        id: 'health',
        label: 'Improve Health',
        value: 'health',
        imageUrl: '/images/quiz/goal-health.jpg',
        description: 'Feel better overall',
        emoji: '🌱'
      },
    ],
    nextStep: 'current-weight',
    progressWeight: 8,
  },
  {
    id: 'current-weight',
    type: 'numeric_input',
    title: 'What\'s your current weight?',
    subtitle: 'We need this to calculate your personalized plan',
    validation: { required: true, min: 30, max: 300 },
    nextStep: (answer, allAnswers) => {
      // Conditional: if goal is maintain, skip target weight
      return allAnswers.goal === 'maintain' ? 'height' : 'target-weight';
    },
    progressWeight: 8,
  },
  {
    id: 'target-weight',
    type: 'numeric_input',
    title: 'What\'s your target weight?',
    subtitle: 'Set a realistic goal that you\'d like to achieve',
    validation: { required: true, min: 30, max: 300 },
    nextStep: 'height',
    progressWeight: 8,
  },
  {
    id: 'height',
    type: 'numeric_input',
    title: 'How tall are you?',
    subtitle: 'Enter your height in centimeters',
    validation: { required: true, min: 100, max: 250 },
    nextStep: 'age-gender',
    progressWeight: 7,
  },
  {
    id: 'age-gender',
    type: 'single_choice',
    title: 'Tell us a bit about yourself',
    subtitle: 'This helps us calculate your calorie needs accurately',
    options: [
      { id: 'male-young', label: '18-30 years old, Male', value: 'male-young', emoji: '👨' },
      { id: 'male-mid', label: '31-50 years old, Male', value: 'male-mid', emoji: '👨‍💼' },
      { id: 'male-senior', label: '51+ years old, Male', value: 'male-senior', emoji: '👴' },
      { id: 'female-young', label: '18-30 years old, Female', value: 'female-young', emoji: '👩' },
      { id: 'female-mid', label: '31-50 years old, Female', value: 'female-mid', emoji: '👩‍💼' },
      { id: 'female-senior', label: '51+ years old, Female', value: 'female-senior', emoji: '👵' },
      { id: 'other', label: 'Prefer not to say', value: 'other', emoji: '🙂' },
    ],
    nextStep: 'activity-level',
    progressWeight: 7,
  },
  {
    id: 'activity-level',
    type: 'image_choice',
    title: 'How active are you?',
    subtitle: 'Be honest - this affects your daily calorie needs',
    options: [
      {
        id: 'sedentary',
        label: 'Sedentary',
        value: 'sedentary',
        description: 'Little to no exercise',
        emoji: '🛋️',
        imageUrl: '/images/quiz/activity-sedentary.jpg',
      },
      {
        id: 'light',
        label: 'Lightly Active',
        value: 'light',
        description: 'Light exercise 1-3 days/week',
        emoji: '🚶',
        imageUrl: '/images/quiz/activity-light.jpg',
      },
      {
        id: 'moderate',
        label: 'Moderately Active',
        value: 'moderate',
        description: 'Moderate exercise 3-5 days/week',
        emoji: '🏃',
        imageUrl: '/images/quiz/activity-moderate.jpg',
      },
      {
        id: 'active',
        label: 'Very Active',
        value: 'active',
        description: 'Hard exercise 6-7 days/week',
        emoji: '🏋️',
        imageUrl: '/images/quiz/activity-active.jpg',
      },
      {
        id: 'athlete',
        label: 'Athlete',
        value: 'athlete',
        description: 'Very hard exercise & physical job',
        emoji: '🏆',
        imageUrl: '/images/quiz/activity-athlete.jpg',
      },
    ],
    nextStep: 'dietary-preference',
    progressWeight: 9,
  },
  {
    id: 'dietary-preference',
    type: 'single_choice',
    title: 'Do you follow any dietary preference?',
    subtitle: 'We\'ll tailor your meal plan accordingly',
    options: [
      { id: 'none', label: 'No Restrictions', value: 'none', emoji: '🍽️' },
      { id: 'vegetarian', label: 'Vegetarian', value: 'vegetarian', emoji: '🥗' },
      { id: 'vegan', label: 'Vegan', value: 'vegan', emoji: '🌱' },
      { id: 'pescatarian', label: 'Pescatarian', value: 'pescatarian', emoji: '🐟' },
      { id: 'keto', label: 'Keto/Low-Carb', value: 'keto', emoji: '🥑' },
      { id: 'paleo', label: 'Paleo', value: 'paleo', emoji: '🥩' },
      { id: 'mediterranean', label: 'Mediterranean', value: 'mediterranean', emoji: '🫒' },
    ],
    nextStep: (answer) => {
      // Conditional: if specific diet or health goal, ask about health conditions
      return answer === 'keto' || answer === 'paleo' ? 'health-conditions' : 'meal-frequency';
    },
    progressWeight: 8,
  },
  {
    id: 'health-conditions',
    type: 'multi_choice',
    title: 'Do you have any health conditions we should know about?',
    subtitle: 'Select all that apply - this helps us keep you safe',
    options: [
      { id: 'none', label: 'None', value: 'none', emoji: '✅' },
      { id: 'diabetes', label: 'Diabetes', value: 'diabetes', emoji: '💉' },
      { id: 'heart', label: 'Heart Conditions', value: 'heart', emoji: '❤️' },
      { id: 'high-bp', label: 'High Blood Pressure', value: 'high-bp', emoji: '📊' },
      { id: 'thyroid', label: 'Thyroid Issues', value: 'thyroid', emoji: '🦋' },
      { id: 'pcos', label: 'PCOS', value: 'pcos', emoji: '🔬' },
      { id: 'ibs', label: 'IBS/Digestive Issues', value: 'ibs', emoji: '🤢' },
      { id: 'allergies', label: 'Food Allergies', value: 'allergies', emoji: '⚠️' },
    ],
    nextStep: 'meal-frequency',
    progressWeight: 7,
  },
  {
    id: 'meal-frequency',
    type: 'single_choice',
    title: 'How many meals do you prefer per day?',
    subtitle: 'Choose what works best with your lifestyle',
    options: [
      { id: '2', label: '2 meals (Intermittent Fasting)', value: 2, emoji: '⏰' },
      { id: '3', label: '3 meals (Traditional)', value: 3, emoji: '🍽️' },
      { id: '4', label: '4-5 meals (Frequent)', value: 5, emoji: '🥘' },
      { id: 'flexible', label: 'Flexible - I\'ll decide', value: 'flexible', emoji: '🔄' },
    ],
    nextStep: 'cooking-skills',
    progressWeight: 6,
  },
  {
    id: 'cooking-skills',
    type: 'single_choice',
    title: 'How comfortable are you with cooking?',
    subtitle: 'Be honest - we\'ll match recipes to your skill level',
    options: [
      { id: 'beginner', label: 'Beginner (5-15 min meals)', value: 'beginner', emoji: '🍳', description: 'Simple, quick recipes' },
      { id: 'intermediate', label: 'Intermediate (15-30 min)', value: 'intermediate', emoji: '👨‍🍳', description: 'Some cooking experience' },
      { id: 'advanced', label: 'Advanced (30+ min)', value: 'advanced', emoji: '👨‍🍳⭐', description: 'Love to cook!' },
      { id: 'no-cook', label: 'No Cooking', value: 'no-cook', emoji: '🥙', description: 'Meal prep or ready-made' },
    ],
    nextStep: 'budget',
    progressWeight: 6,
  },
  {
    id: 'budget',
    type: 'range_slider',
    title: 'What\'s your weekly food budget?',
    subtitle: 'Slide to set your comfortable spending range',
    validation: { min: 20, max: 200 },
    nextStep: 'motivation',
    progressWeight: 5,
  },
  {
    id: 'motivation',
    type: 'single_choice',
    title: 'What motivates you most?',
    subtitle: 'Understanding this helps us keep you on track',
    options: [
      { id: 'appearance', label: 'Looking Good', value: 'appearance', emoji: '😍' },
      { id: 'health', label: 'Feeling Healthy', value: 'health', emoji: '💚' },
      { id: 'energy', label: 'More Energy', value: 'energy', emoji: '⚡' },
      { id: 'confidence', label: 'Confidence Boost', value: 'confidence', emoji: '💪' },
      { id: 'medical', label: 'Medical Reasons', value: 'medical', emoji: '🏥' },
      { id: 'performance', label: 'Athletic Performance', value: 'performance', emoji: '🏆' },
    ],
    nextStep: 'timeline',
    progressWeight: 7,
  },
  {
    id: 'timeline',
    type: 'single_choice',
    title: 'When would you like to see results?',
    subtitle: 'Set realistic expectations for sustainable success',
    options: [
      { id: '1-month', label: '1 Month', value: '1-month', emoji: '🚀', description: 'Fast track' },
      { id: '3-months', label: '3 Months', value: '3-months', emoji: '📈', description: 'Balanced approach' },
      { id: '6-months', label: '6 Months', value: '6-months', emoji: '🎯', description: 'Sustainable change' },
      { id: 'no-rush', label: 'No Rush', value: 'no-rush', emoji: '🌱', description: 'Lifestyle change' },
    ],
    nextStep: 'email-capture',
    progressWeight: 6,
  },
  {
    id: 'email-capture',
    type: 'text_short',
    title: 'Almost there! Where should we send your plan? 📧',
    subtitle: 'Enter your email to get your personalized nutrition plan',
    description: 'We\'ll never spam you. Unsubscribe anytime.',
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    nextStep: 'results',
    progressWeight: 8,
  },
  {
    id: 'results',
    type: 'single_choice',
    title: '🎉 Your Personalized Plan is Ready!',
    subtitle: 'Review your results and start your journey',
    options: [
      { id: 'view', label: 'View My Plan', value: 'view', emoji: '📊' },
      { id: 'signup', label: 'Sign Up to Save', value: 'signup', emoji: '💾' },
    ],
    nextStep: undefined, // End of quiz
    progressWeight: 10,
  },
];

// Helper to get next step with conditional logic
export function getNextStep(
  currentStepId: QuizStepId,
  answer: any,
  allAnswers: Record<string, any>
): QuizStepId | undefined {
  const currentStep = ENHANCED_QUIZ_CONFIG.find(q => q.id === currentStepId);
  if (!currentStep) return undefined;

  if (typeof currentStep.nextStep === 'function') {
    return currentStep.nextStep(answer, allAnswers);
  }
  return currentStep.nextStep;
}

// Calculate weighted progress
export function calculateProgress(currentStepId: QuizStepId): number {
  const currentIndex = ENHANCED_QUIZ_CONFIG.findIndex(q => q.id === currentStepId);
  if (currentIndex === -1) return 0;

  const completedSteps = ENHANCED_QUIZ_CONFIG.slice(0, currentIndex + 1);
  const totalWeight = ENHANCED_QUIZ_CONFIG.reduce((sum, q) => sum + (q.progressWeight || 1), 0);
  const completedWeight = completedSteps.reduce((sum, q) => sum + (q.progressWeight || 1), 0);

  return Math.round((completedWeight / totalWeight) * 100);
}

