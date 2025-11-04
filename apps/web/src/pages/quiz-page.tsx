import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useQuizStore, useQuizAutosave, calculateBMI } from '../store/quiz-store';
import { submitQuiz, saveQuizPreview, getQuizPreview } from '../api/quiz';
import { useUserStore } from '../store/user-store';
import { logQuizStart, logQuizSectionCompleted, logQuizSubmitSuccess, logQuizSubmitError, logQuizStepViewed, logQuizPreviewSaved, logQuizFinalStepViewed, logQuizNextClicked, logQuizBackClicked, logQuizCtaClicked } from '../lib/analytics';
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
import { FinalStep } from '../components/quiz/steps/final-step';

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
    mergeServerAnswers,
  } = useQuizStore();
  
  const { debouncedSave } = useQuizAutosave();
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loggedStartRef = useRef(false);
  const lastViewedStepRef = useRef<number | null>(null);
  const lastSectionLoggedRef = useRef<number | null>(null);
  
  // Calculate BMI preview in real-time
  const bmiPreview = calculateBMI(answers);

  // Log quiz start on mount
  useEffect(() => {
    if (clientId && !loggedStartRef.current) {
      logQuizStart(clientId);
      setQuizStartTime(Date.now());
      loggedStartRef.current = true;
    }
  }, [clientId]);

  // Log section completion and step view when step changes (guard against StrictMode double-effects)
  useEffect(() => {
    if (!clientId) return;

    // Step viewed
    if (lastViewedStepRef.current !== currentStep) {
      logQuizStepViewed(clientId, STEP_NAMES[currentStep] ?? String(currentStep));
      lastViewedStepRef.current = currentStep;
    }

    // Section completed (for previous step)
    if (currentStep > 0 && lastSectionLoggedRef.current !== currentStep) {
      const progress = Math.round((currentStep / TOTAL_STEPS) * 100);
      logQuizSectionCompleted(clientId, STEP_NAMES[currentStep - 1], progress);
      lastSectionLoggedRef.current = currentStep;
    }

    // Final step viewed
    if (currentStep === TOTAL_STEPS - 1) {
      logQuizFinalStepViewed(clientId);
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

  // Debounced server-side preview autosave for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return;
    if (Object.keys(answers).length === 0) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      try {
        const draft = getDraft();
        void saveQuizPreview(draft).then(() => {
          if (clientId) logQuizPreviewSaved(clientId);
        }).catch(() => {
          // Non-fatal: ignore if endpoint not available
        });
      } catch {
        // ignore
      }
    }, 600);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [answers, isAuthenticated, getDraft]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      toast.info("You're already logged in. Redirecting to dashboard...");
      navigate("/app");
    }
  }, [isAuthenticated, navigate]);

  // Restore server preview draft for authenticated users (once)
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) return;
    (async () => {
      try {
        const data = await getQuizPreview();
        if (!cancelled && data?.answers) {
          mergeServerAnswers(data.answers);
        }
      } catch {
        // non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, mergeServerAnswers]);

  const canGoNext = () => {
    switch (currentStep) {
      case 0: {
        return !!answers.diet?.plan;
      }
      case 1: {
        const hasHeight = !!answers.body?.height?.cm || (answers.body?.height?.ft !== undefined);
        const hasWeight = !!answers.body?.weight?.kg || !!answers.body?.weight?.lb;
        return hasHeight && hasWeight;
      }
      case 2: {
        return answers.goals?.etaMonths !== undefined;
      }
      case 3: {
        return !!answers.habits?.activityLevel;
      }
      case 4: {
        return answers.habits?.mealsPerDay !== undefined;
      }
      case 5: {
        return answers.habits?.sleepHours !== undefined;
      }
      case 6: {
        return (
          answers.habits?.foodAllergies !== undefined ||
          answers.habits?.mealComplexity !== undefined
        );
      }
      case 7: {
        return answers.habits?.mainMotivation !== undefined;
      }
      case 8: {
        return answers.habits?.dailyWaterMl !== undefined;
      }
      default:
        return true;
    }
  };

  const handleNext = () => {
    // Log CTA and next click
    if (clientId) {
      const stepId = STEP_NAMES[currentStep] ?? String(currentStep);
      logQuizNextClicked(clientId, stepId);
      // Placement unknown here; specific buttons will also log placement CTA
    }
    if (!canGoNext()) {
      toast.error('Please answer the question to continue');
      setValidationMessage('Please answer the question to continue');
      return;
    }
    setValidationMessage(null);

    if (currentStep === TOTAL_STEPS - 1) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (clientId) {
      const stepId = STEP_NAMES[currentStep] ?? String(currentStep);
      logQuizBackClicked(clientId, stepId);
    }
    prevStep();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const draft = getDraft();
      const durationSeconds = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : undefined;

      // Guests: skip submit (requires auth), go to register
      if (!isAuthenticated) {
        toast.info('Create a free account to view your full plan.');
        navigate('/register');
        return;
      }

      await submitQuiz(draft);

      // Log successful submission
      if (clientId) {
        logQuizSubmitSuccess(clientId, undefined, durationSeconds);
      }

      toast.success('Your personalized plan is ready! ✨');

      // Redirect to dashboard for authenticated users
      navigate('/app');
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
      case 9:
        return <FinalStep />;
      default:
        return <div>Step {currentStep + 1}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-28 pt-8 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Sticky progress under header */}
        <div className="sticky top-16 z-40 -mx-4 mb-6 border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md md:static md:top-auto md:-mx-0 md:border-none md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-0">
          <QuizProgress currentStep={currentStep + 1} totalSteps={TOTAL_STEPS} />
        </div>
        
        {/* Saved indicator */}
        {showSavedIndicator && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check size={16} />
            <span className="text-sm font-medium">Saved ✓</span>
          </div>
        )}
        
        {/* BMI Preview */}
        {bmiPreview && currentStep > 0 && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Your BMI</p>
                <p className="text-2xl font-bold text-emerald-600">{bmiPreview.bmi}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-300">Category</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{bmiPreview.category}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-2">{renderStep()}</div>
        {validationMessage && (
          <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
            {validationMessage}
          </div>
        )}

        {/* Desktop/tablet navigation */}
        <div className="hidden max-w-2xl mx-auto gap-4 md:flex">
          {currentStep > 0 && (
            <button
              onClick={() => {
                if (clientId) logQuizCtaClicked(clientId, 'desktop_nav', 'Back', STEP_NAMES[currentStep] ?? String(currentStep));
                handleBack();
              }}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => {
              if (clientId) {
                const label = currentStep === TOTAL_STEPS - 1 ? 'Complete Quiz' : 'Next';
                logQuizCtaClicked(clientId, 'desktop_nav', label, STEP_NAMES[currentStep] ?? String(currentStep));
              }
              handleNext();
            }}
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

        {/* Mobile sticky CTA */}
        <div className="md:hidden">
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/90 p-3 backdrop-blur-md">
            <div className="mx-auto flex max-w-4xl items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => {
                    if (clientId) logQuizCtaClicked(clientId, 'mobile_sticky', 'Back', STEP_NAMES[currentStep] ?? String(currentStep));
                    handleBack();
                  }}
                  className="shrink-0 rounded-xl border-2 border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={() => {
                  if (clientId) {
                    const label = currentStep === TOTAL_STEPS - 1 ? 'Complete Quiz' : 'Next';
                    logQuizCtaClicked(clientId, 'mobile_sticky', label, STEP_NAMES[currentStep] ?? String(currentStep));
                  }
                  handleNext();
                }}
                disabled={!canGoNext() || isSubmitting}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </div>
  );
}
