/**
 * Onboarding Flow Component
 * Interactive onboarding for new users
 */

import React, { useState } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { Button } from '@/components/ui/button';
import type { OnboardingStep } from '@/types/dashboard.types';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Vivaform! 👋',
      description: 'Let\'s set you up for success with a quick 3-minute tour',
      component: 'welcome',
      completed: false,
      skippable: true,
      order: 0,
    },
    {
      id: 'set-goal',
      title: 'Set Your Primary Goal',
      description: 'What would you like to achieve?',
      component: 'goal-selection',
      completed: false,
      skippable: false,
      order: 1,
    },
    {
      id: 'log-first-meal',
      title: 'Log Your First Meal',
      description: 'Start tracking your nutrition journey',
      component: 'first-meal',
      completed: false,
      skippable: true,
      order: 2,
    },
    {
      id: 'explore-dashboard',
      title: 'Explore Your Dashboard',
      description: 'See how everything works together',
      component: 'dashboard-tour',
      completed: false,
      skippable: true,
      order: 3,
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStepIndex);
    setCompletedSteps(newCompleted);

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Progress bar */}
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold">
                {currentStepIndex + 1}
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>

            {/* Skip button */}
            {currentStep.skippable && (
              <button
                onClick={handleSkip}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Skip for now
              </button>
            )}
          </div>

          {/* Step content */}
          <div className="mb-8">
            <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">{currentStep.title}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{currentStep.description}</p>

            {/* Step-specific content */}
            <div className="mt-6">
              {currentStep.component === 'welcome' && <WelcomeStep />}
              {currentStep.component === 'goal-selection' && <GoalSelectionStep />}
              {currentStep.component === 'first-meal' && <FirstMealStep />}
              {currentStep.component === 'dashboard-tour' && <DashboardTourStep />}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    idx === currentStepIndex && 'bg-emerald-500 w-8',
                    idx < currentStepIndex && 'bg-emerald-500',
                    idx > currentStepIndex && 'bg-slate-300 dark:bg-slate-700'
                  )}
                />
              ))}
            </div>

            <Button onClick={handleNext} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              {isLastStep ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual step components

const WelcomeStep: React.FC = () => (
  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 dark:border-slate-800 dark:from-emerald-950/20 dark:to-teal-950/20">
    <div className="mb-4 flex items-center gap-3">
      <Sparkles className="h-8 w-8 text-emerald-600" />
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">You're in the right place!</h3>
    </div>

    <p className="mb-4 text-slate-700 dark:text-slate-300">
      Vivaform helps you track your nutrition, reach your health goals, and build lasting healthy habits.
    </p>

    <ul className="space-y-2">
      {[
        'Track meals and nutrition effortlessly',
        'Get personalized insights and recommendations',
        'Monitor your progress with beautiful visualizations',
        'Achieve your health goals faster',
      ].map((feature, idx) => (
        <li key={idx} className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const GoalSelectionStep: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goals = [
    { id: 'lose_weight', label: 'Lose Weight', icon: '📉', color: 'emerald' },
    { id: 'gain_weight', label: 'Gain Weight', icon: '📈', color: 'blue' },
    { id: 'maintain', label: 'Maintain Weight', icon: '⚖️', color: 'purple' },
    { id: 'build_muscle', label: 'Build Muscle', icon: '💪', color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {goals.map((goal) => (
        <button
          key={goal.id}
          onClick={() => setSelectedGoal(goal.id)}
          className={cn(
            'rounded-xl border-2 p-6 text-left transition-all hover:scale-105',
            selectedGoal === goal.id
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
          )}
        >
          <div className="mb-2 text-4xl">{goal.icon}</div>
          <h4 className="font-bold text-slate-900 dark:text-white">{goal.label}</h4>
        </button>
      ))}
    </div>
  );
};

const FirstMealStep: React.FC = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
    <p className="mb-4 text-slate-600 dark:text-slate-400">
      Let's log your first meal to see how easy it is! Don't worry, you can always edit or delete it later.
    </p>

    <div className="space-y-3">
      <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="text-2xl">🌅</span>
        <div className="text-left">
          <div className="font-semibold">Breakfast</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">7:00 - 10:00</div>
        </div>
      </button>

      <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="text-2xl">☀️</span>
        <div className="text-left">
          <div className="font-semibold">Lunch</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">12:00 - 14:00</div>
        </div>
      </button>

      <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="text-2xl">🌙</span>
        <div className="text-left">
          <div className="font-semibold">Dinner</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">18:00 - 21:00</div>
        </div>
      </button>
    </div>
  </div>
);

const DashboardTourStep: React.FC = () => (
  <div className="space-y-4">
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
      <h4 className="mb-2 font-bold text-emerald-900 dark:text-emerald-200">📊 Dashboard</h4>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Your personalized hub showing health score, daily metrics, and progress
      </p>
    </div>

    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
      <h4 className="mb-2 font-bold text-blue-900 dark:text-blue-200">⚡ Quick Actions</h4>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Log meals, water, weight, and activity with one tap
      </p>
    </div>

    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
      <h4 className="mb-2 font-bold text-purple-900 dark:text-purple-200">🏆 Achievements</h4>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Earn rewards and unlock features as you build healthy habits
      </p>
    </div>
  </div>
);
