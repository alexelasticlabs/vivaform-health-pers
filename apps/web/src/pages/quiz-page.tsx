import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, Lightbulb } from 'lucide-react';
import { useQuizStore, useQuizAutosave, calculateBMI } from '@/store/quiz-store';
import { submitQuiz, saveQuizPreview, getQuizPreview, captureQuizEmail } from '@/api';
import { useUserStore } from '@/store/user-store';
import { logQuizStart, logQuizSectionCompleted, logQuizSubmitSuccess, logQuizSubmitError, logQuizStepViewed, logQuizPreviewSaved, logQuizFinalStepViewed, logQuizNextClicked, logQuizBackClicked, logQuizCtaClicked } from '@/lib/analytics';
import { QuizStepRenderer, ExitIntentModal, BadgeUnlock, QuizProgress } from '@/components/quiz';
import { getVisibleQuizSteps, calcProgressPercent } from '@/features/quiz/quiz-config';
import { QUIZ_BADGES, getUnlockedBadges } from '@/components/quiz/steps/enhanced-quiz-constants';
import { canProceed } from '../features/quiz/funnel-engine';

type CueBuilder = (ctx: { percent: number; name?: string }) => string;

const MOMENTUM_CUES: Record<string, CueBuilder[]> = {
  default: [
    ({ percent, name }) => `${name ?? 'Nice'} pace — ${percent}% done`,
    ({ percent }) => `Steady progress. Completed ${percent}%`,
  ],
  goals: [
    ({ percent, name }) => `${name ?? 'Great'}, goal set. ${percent}% done`,
    ({ percent }) => `Focus captured ✅ ${percent}% complete`,
  ],
  eating: [
    ({ percent }) => `Food preferences noted — ${percent}%`,
    ({ percent }) => `Eating habits set. Progress ${percent}%`,
  ],
  preferences: [
    ({ percent }) => `Taste anchors set. ${percent}% done`,
    ({ percent, name }) => `${name ?? 'Looking good'}, we’ll tailor the menu. ${percent}%`,
  ],
  activity: [
    ({ percent }) => `Weekly rhythm captured. Progress ${percent}%`,
  ],
  behavior: [
    ({ percent }) => `Habit tips ready — ${percent}%`,
  ],
  plan_choice: [
    ({ percent }) => `Plan framework forming. Already ${percent}%`,
    ({ percent, name }) => `${name ?? 'Almost there'}, ${100 - percent}% left`,
  ],
};

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
    clientId,
    mergeServerAnswers,
  } = useQuizStore();
  
  const { debouncedSave } = useQuizAutosave();
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [newBadge, setNewBadge] = useState<(typeof QUIZ_BADGES)[number] | null>(null);
  const [lastBadgeStep, setLastBadgeStep] = useState(-1);
  const [momentumCue, setMomentumCue] = useState<string | null>(null);
  const [gentleHint, setGentleHint] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gentleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggedStartRef = useRef(false);
  const lastViewedStepRef = useRef<number | null>(null);
  const lastSectionLoggedRef = useRef<number | null>(null);
  const capturedEmailRef = useRef<string | null>(null);

  const visibleSteps = getVisibleQuizSteps(answers as any);
  const currentStepConfig = visibleSteps[currentStep] ?? visibleSteps[visibleSteps.length - 1];
  const participantName = ((answers as any)?.name as string | undefined)?.split(' ')[0];

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

    const stepId = currentStepConfig?.id ?? String(currentStep);

    // Step viewed
    if (lastViewedStepRef.current !== currentStep) {
      logQuizStepViewed(clientId, stepId);
      lastViewedStepRef.current = currentStep;
    }

    // Section completed (for previous step)
    if (currentStep > 0 && lastSectionLoggedRef.current !== currentStep) {
      const progress = calcProgressPercent(currentStep, visibleSteps.length);
      logQuizSectionCompleted(clientId, stepId, progress);
      lastSectionLoggedRef.current = currentStep;
    }

    // Final step viewed
    if (currentStep === visibleSteps.length - 1) {
      logQuizFinalStepViewed(clientId);
    }
  }, [clientId, currentStep, currentStepConfig, visibleSteps.length]);

  // Gentle hint if the participant dwells on a step
  useEffect(() => {
    if (gentleTimerRef.current) clearTimeout(gentleTimerRef.current);
    setGentleHint(null);
    // Don’t show on intro and final steps
    const isBoundary = currentStep === 0 || currentStep === visibleSteps.length - 1;
    if (isBoundary) return;
    gentleTimerRef.current = setTimeout(() => {
      const group = currentStepConfig?.group;
      const hintCopy = group === 'body_metrics'
        ? 'Approximate values are fine — you can refine later.'
        : 'You can pause anytime; your progress is saved.';
      setGentleHint(hintCopy);
    }, 28000);
    return () => {
      if (gentleTimerRef.current) clearTimeout(gentleTimerRef.current);
    };
  }, [currentStep, currentStepConfig, visibleSteps.length]);

  // Trigger autosave when answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      debouncedSave();
    }
  }, [answers, debouncedSave]);

  useEffect(() => {
    const rawEmail = (answers.email ?? '').trim().toLowerCase();
    if (!rawEmail) return;
    if (capturedEmailRef.current === rawEmail) return;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(rawEmail)) return;
    capturedEmailRef.current = rawEmail;
    void (async () => {
      try {
        await captureQuizEmail({ email: rawEmail, clientId, step: currentStep, type: 'midpoint' });
      } catch {
        // fail silently
      }
    })();
  }, [answers.email, clientId, currentStep]);

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
  }, [answers, isAuthenticated, getDraft, clientId]);


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

  // Detect exit intent (mouse leaving viewport)
  useEffect(() => {
    if (currentStep === 0 || currentStep >= visibleSteps.length - 1) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [currentStep, visibleSteps.length]);

  // Check for badge unlock
  useEffect(() => {
    const badges = getUnlockedBadges(currentStep - 1);
    const newUnlocked = badges.find(b => b.step === currentStep - 1);
    if (newUnlocked && lastBadgeStep !== currentStep - 1) {
      setNewBadge(newUnlocked);
      setLastBadgeStep(currentStep - 1);
    }
  }, [currentStep, lastBadgeStep]);

  useEffect(() => {
    return () => {
      if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
    };
  }, []);

  const canGoNext = () => canProceed(currentStep, answers as any);

  const triggerMomentumCue = (group?: string, percentOverride?: number) => {
    const cueGroup = MOMENTUM_CUES[group ?? 'default'] ?? MOMENTUM_CUES.default;
    if (!cueGroup?.length) return;
    const percent = percentOverride ?? calcProgressPercent(currentStep, visibleSteps.length);
    const template = cueGroup[Math.floor(Math.random() * cueGroup.length)];
    if (!template) return;
    setMomentumCue(template({ percent, name: participantName }));
    if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
    cueTimerRef.current = setTimeout(() => setMomentumCue(null), 2600);
  };

  const handleNext = async () => {
    const stepId = currentStepConfig?.id ?? String(currentStep);
    if (clientId) logQuizNextClicked(clientId, stepId);
    if (!canGoNext()) {
      if (currentStepConfig?.id === 'body_metrics') {
        toast.error('Please enter your age and basic body measurements to continue.');
        setValidationMessage('Please enter your age and basic body measurements (height and weight) so we can calculate your plan safely.');
      } else {
        toast.error('Please answer the question to continue');
        setValidationMessage('Please answer the question to continue');
      }
      return;
    }
    setValidationMessage(null);
    if (currentStep >= visibleSteps.length - 1) {
      await handleSubmit();
      return;
    }
    const nextPercent = calcProgressPercent(currentStep + 1, visibleSteps.length);
    triggerMomentumCue(currentStepConfig?.group, nextPercent);
    setGentleHint(null);
    nextStep();
  };

  const handleBack = () => {
    const stepId = currentStepConfig?.id ?? String(currentStep);
    if (clientId) logQuizBackClicked(clientId, stepId);
    if (currentStep === 0) return;
    setMomentumCue(null);
    prevStep();
    setGentleHint(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const draft = getDraft();
      const durationSeconds = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : undefined;

      // Guests: save quiz data to localStorage, then redirect to register
      if (!isAuthenticated) {
        // Save complete quiz data
        const quizData = {
          ...draft,
          completedAt: Date.now(),
          durationSeconds
        };

        // Save to localStorage for post-registration processing
        try {
          localStorage.setItem('vivaform-completed-quiz', JSON.stringify(quizData));

          // Log completion even for guests
          if (clientId) {
            logQuizSubmitSuccess(clientId, undefined, durationSeconds);
          }
        } catch (e) {
          console.error('Failed to save quiz data:', e);
        }

        toast.success('Quiz complete! Sign up to get your personalized plan 🎉');
        // Redirect with quiz completion flag
        navigate('/register?quiz_completed=true');
        return;
      }

      // Authenticated users: submit directly
      await submitQuiz(draft);

      // Log successful submission
      if (clientId) {
        logQuizSubmitSuccess(clientId, undefined, durationSeconds);
      }

      toast.success('Your personalized plan is ready! ✨');

      // Redirect to dashboard
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

  const handleStartOver = () => {
    if (window.confirm('Are you sure you want to start over? All your progress will be lost.')) {
      useQuizStore.getState().reset();
      toast.info('Quiz reset. Starting fresh!');
    }
  };

  const handleSaveExit = async (email: string) => {
    try {
      await captureQuizEmail({
        email: email.trim().toLowerCase(),
        clientId,
        step: currentStep,
        type: 'exit'
      });
      toast.success('Progress saved! Check your email.');
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
      toast.error('Could not save your progress. Please try again.');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-28 pt-8 md:pb-8">
      <div className="mx-auto max-w-4xl">
        {currentStepConfig?.id !== 'welcome_consent' && (
          <div className="mb-6 px-1 md:px-0">
            <QuizProgress
              currentIndex={currentStep}
              visibleSteps={visibleSteps}
              participantName={participantName}
              condensed
              showTotal={false}
              showPercent={false}
              showStageChips={false}
            />
          </div>
        )}

        {momentumCue && (
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm">
              <Sparkles size={16} className="text-amber-500" />
              <span>{momentumCue}</span>
            </div>
          </div>
        )}

        {gentleHint && (
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-4 py-2 text-sm text-gray-800 shadow-sm">
              <Lightbulb size={16} className="text-amber-500" />
              <span>{gentleHint}</span>
            </div>
          </div>
        )}
        
        {/* BMI Preview */}
        {bmiPreview && currentStep > 0 && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-white/85 dark:bg-neutral-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200 dark:border-emerald-900/40">
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
            <p className="mt-3 text-xs text-gray-500">We’ll walk through what this means for your health in an upcoming step.</p>
          </div>
        )}

        <div className="mb-2">
          {currentStepConfig && (
            <QuizStepRenderer
              step={currentStepConfig}
              onPrimaryAction={currentStepConfig.id === 'welcome_consent' ? handleNext : undefined}
            />
          )}
        </div>
        {validationMessage && (
          <p className="mx-auto mb-4 max-w-2xl text-sm font-medium text-rose-600">
            {validationMessage}
          </p>
        )}

        {/* Desktop/tablet navigation */}
        {!currentStepConfig?.id?.includes('welcome_consent') && (
          <div className="hidden max-w-2xl mx-auto gap-4 md:flex">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {currentStep >= visibleSteps.length - 1
                ? isSubmitting
                  ? 'Saving...'
                  : 'Complete Quiz →'
                : 'Next →'}
            </button>
          </div>
        )}

        {/* Mobile sticky CTA */}
        {!currentStepConfig?.id?.includes('welcome_consent') && (
          <div className="md:hidden">
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/90 p-3 backdrop-blur-md">
              <div className="mx-auto flex max-w-4xl items-center gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="shrink-0 rounded-xl border-2 border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-base font-semibold text-white"
                >
                  {currentStep >= visibleSteps.length - 1
                    ? isSubmitting
                      ? 'Saving...'
                      : 'Complete Quiz →'
                    : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exit Intent Modal */}
        {showExitIntent && (
          <ExitIntentModal
            currentStep={currentStep}
            totalSteps={visibleSteps.length}
            onSave={handleSaveExit}
            onClose={() => setShowExitIntent(false)}
          />
        )}

        {/* New Badge Unlock */}
        {newBadge && (
          <BadgeUnlock
            badge={newBadge}
            onClose={() => setNewBadge(null)}
          />
        )}
      </div>
    </div>
  );
}
