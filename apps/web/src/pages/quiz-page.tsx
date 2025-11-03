import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuizStore } from '../store/quiz-store';
import { submitQuiz } from '../api/quiz';
import { useUserStore } from '../store/user-store';
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

const TOTAL_STEPS = 10; // Expanded to 10 steps

export function QuizPage() {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const {
    currentStep,
    answers,
    result,
    isSubmitting,
    setResult,
    setSubmitting,
    nextStep,
    prevStep,
  } = useQuizStore();

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
      const response = await submitQuiz(answers);
      setResult(response.result);
      toast.success('Your personalized plan is ready!');
      nextStep(); // Move to results page
    } catch (error) {
      toast.error('Failed to calculate your plan. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    // Results page
    if (currentStep >= TOTAL_STEPS) {
      return (
        <div className="max-w-2xl mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-lg">
          {result ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Your Plan is Ready!
                </h1>
                <p className="text-gray-600">
                  Here's your personalized nutrition roadmap
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">BMI</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.bmi.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {result.bmiCategory}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Daily Calories</div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.recommendedCalories} kcal
                  </div>
                  <div className="text-xs text-gray-500">Recommended intake</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Protein</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {result.macros.protein}g
                  </div>
                  <div className="text-xs text-gray-500">per day</div>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">TDEE</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {result.tdee} kcal
                  </div>
                  <div className="text-xs text-gray-500">Total energy</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">
                  💡 Personalized Advice
                </h3>
                <p className="text-sm text-gray-700">{result.advice}</p>
              </div>

              {result.estimatedWeeks !== undefined && result.estimatedWeeks > 0 && (
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    Estimated timeline:{' '}
                    <span className="font-bold text-yellow-700">
                      ~{result.estimatedWeeks} weeks
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate('/register', { state: { fromQuiz: true } })}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Continue → Create Your Account
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Calculating your plan...</p>
            </div>
          )}
        </div>
      );
    }

    // Regular steps
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {currentStep < TOTAL_STEPS && (
          <QuizProgress currentStep={currentStep + 1} totalSteps={TOTAL_STEPS} />
        )}

        <div className="mb-8">{renderStep()}</div>

        {currentStep < TOTAL_STEPS && (
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === TOTAL_STEPS - 1
                ? isSubmitting
                  ? 'Calculating...'
                  : 'Calculate My Plan →'
                : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
