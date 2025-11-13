import { getCurrentPhase, getUnlockedBadges, QUIZ_PHASES } from './steps/enhanced-quiz-constants';

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function QuizProgress({ currentStep, totalSteps }: QuizProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const phase = getCurrentPhase(currentStep - 1); // currentStep is 1-indexed
  const badges = getUnlockedBadges(currentStep - 1);

  return (
    <div className="w-full">
      {/* Phase indicators */}
      <div className="flex items-center justify-between mb-3 gap-2">
        {Object.values(QUIZ_PHASES).map((p) => {
          const isActive = p.id === phase.id;
          const isCompleted = currentStep - 1 > p.steps[p.steps.length - 1];
          return (
            <div
              key={p.id}
              className={`flex-1 text-center py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 scale-105'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              <span className="mr-1">{p.emoji}</span>
              <span className="hidden sm:inline">{p.name}</span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
        <div className="flex items-center gap-2">
          {badges.length > 0 && (
            <div className="flex gap-1">
              {badges.slice(-2).map((b) => (
                <span key={b.id} title={b.description} className="text-lg">
                  {b.emoji}
                </span>
              ))}
            </div>
          )}
          <span className="text-lg font-bold text-emerald-600">{percentage}%</span>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-600 h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
