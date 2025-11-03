import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useQuizStore, useQuizAutosave, calculateBMI } from '../store/quiz-store';
import { submitQuiz } from '../api/quiz';
import { useUserStore } from '../store/user-store';
import { logQuizStart, logQuizSectionCompleted, logQuizSubmitSuccess, logQuizSubmitError } from '../lib/analytics';
import { QuizProgress } from '../components/quiz/quiz-progress';
import { IntroStep } from '../components/quiz/steps/intro-step';
import { BodyMetricsStep } from '../components/quiz/steps/body-metrics-step';
import { GoalTimelineStep } from '../components/quiz/steps/goal-timeline-step';
import { ActivityLevelStep } from '../components/quiz/steps/activity-level-step';
import { FoodHabitsStep } from '../components/quiz/steps/food-habits-step';
import { EnergyScheduleStep } from '../components/quiz/steps/energy-schedule-step';
import { PreferencesStep } from '../components/quiz/steps/preferences-step';
import { EmotionalStep } from '../components/quiz/steps/emotional-step';
import { HydrationStep } from '../components/quiz/steps/hydration-step';

const TOTAL_STEPS = 10;

const STEP_NAMES = [
  'intro',
  'body_metrics',
  'goal_timeline',
  'activity_level',
  'food_habits',
  'energy_schedule',
  'preferences',
  'emotional',
  'hydration',
  'final',
];

export function QuizPage() {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const {
    currentStep,
    answers,
    isSubmitting,
    setSubmitting,
    nextStep,
    prevStep,
    getDraft,
    lastSaved,
    clientId,
  } = useQuizStore();
  
  const { debouncedSave } = useQuizAutosave();
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  
  // Calculate BMI preview in real-time
  const bmiPreview = calculateBMI(answers);

  // Log quiz start on mount
  useEffect(() => {
    if (clientId) {
      logQuizStart(clientId);
      setQuizStartTime(Date.now());
    }
  }, [clientId]);

  // Log section completion when step changes
  useEffect(() => {
    if (currentStep > 0 && clientId) {
      const progress = Math.round((currentStep / TOTAL_STEPS) * 100);
      logQuizSectionCompleted(clientId, STEP_NAMES[currentStep - 1], progress);
    }
  }, [currentStep, clientId]);

  // Show saved indicator when lastSaved changes
  useEffect(() => {
    if (lastSaved) {
      setShowSavedIndicator(true);
      const timer = setTimeout(() => setShowSavedIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  // Trigger autosave when answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      debouncedSave();
    }
  }, [answers, debouncedSave]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      toast.info("You're already logged in. Redirecting to dashboard...");
      navigate("/app");
    }
  }, [isAuthenticated, navigate]);

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return !!answers.dietPlan;
      case 1:
        return !!answers.heightCm && !!answers.currentWeightKg;
      case 2:
        return !!answers.goalTimeline;
      case 3:
        return !!answers.activityLevel;
      case 4:
        return answers.mealsPerDay !== undefined;
      case 5:
        return answers.sleepHours !== undefined;
      case 6:
        return (answers.foodAllergies !== undefined || answers.mealComplexity !== undefined);
      case 7:
        return answers.mainMotivation !== undefined;
      case 8:
        return answers.dailyWaterMl !== undefined;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canGoNext()) {
      toast.error('Please answer the question to continue');
      return;
    }

    if (currentStep === TOTAL_STEPS - 1) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const draft = getDraft();
      const durationSeconds = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : undefined;
      
      await submitQuiz(draft);
      
      // Log successful submission
      if (clientId) {
        logQuizSubmitSuccess(clientId, undefined, durationSeconds);
      }
      
      toast.success('Your personalized plan is ready! ✨');
      
      // Redirect to register or dashboard
      if (isAuthenticated) {
        navigate('/app');
      } else {
        navigate('/register');
      }
    } catch (error) {
      // Log submission error
      if (clientId) {
        logQuizSubmitError(clientId, error instanceof Error ? error.message : 'Unknown error');
      }
      
      toast.error('Failed to save your plan. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <IntroStep />;
      case 1:
        return <BodyMetricsStep />;
      case 2:
        return <GoalTimelineStep />;
      case 3:
        return <ActivityLevelStep />;
      case 4:
        return <FoodHabitsStep />;
      case 5:
        return <EnergyScheduleStep />;
      case 6:
        return <PreferencesStep />;
      case 7:
        return <EmotionalStep />;
      case 8:
        return <HydrationStep />;
      default:
        return <div>Step {currentStep + 1}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <QuizProgress currentStep={currentStep + 1} totalSteps={TOTAL_STEPS} />
        
        {/* Saved indicator */}
        {showSavedIndicator && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check size={16} />
            <span className="text-sm font-medium">Saved ✓</span>
          </div>
        )}
        
        {/* BMI Preview */}
        {bmiPreview && currentStep > 0 && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your BMI</p>
                <p className="text-2xl font-bold text-emerald-600">{bmiPreview.bmi}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-semibold text-gray-900">{bmiPreview.category}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">{renderStep()}</div>

        {/* Navigation buttons */}
        <div className="flex gap-4 max-w-2xl mx-auto">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canGoNext() || isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {currentStep === TOTAL_STEPS - 1
              ? isSubmitting
                ? 'Saving...'
                : 'Complete Quiz →'
              : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
