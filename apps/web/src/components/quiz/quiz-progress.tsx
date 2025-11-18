import type { QuizStep } from '@/features/quiz/quiz-config';

type StageId = 'start' | 'basics' | 'goals' | 'plan';

interface QuizProgressProps {
  currentIndex: number;
  visibleSteps: QuizStep[];
  participantName?: string;
  condensed?: boolean;
  showTotal?: boolean;
  showPercent?: boolean;
  showStageChips?: boolean;
}

const STAGES: { id: StageId; label: string }[] = [
  { id: 'start', label: 'Welcome' },
  { id: 'basics', label: 'Basics' },
  { id: 'goals', label: 'Goals' },
  { id: 'plan', label: 'Plan' },
];

type MoodBuilder = (ctx: { name?: string }) => string;

const STAGE_MOOD: Record<StageId, MoodBuilder> = {
  start: ({ name }) => `${name ? `${name}, ` : ''}set the tone and we’ll tailor everything from here.`,
  basics: ({ name }) => `${name ? `${name}, ` : ''}these fundamentals make the rest effortless.`,
  goals: ({ name }) => `${name ? `${name}, ` : ''}your “why” is getting sharp — keep that energy.`,
  plan: ({ name }) => `${name ? `${name}, ` : ''}last stretch! We’re assembling your personalized formula.`,
};

const STAGE_THEME: Record<StageId, { bar: string; chip: string; chipActive: string; chipComplete: string }> = {
  start: {
    bar: 'from-emerald-400 via-teal-400 to-cyan-400',
    chip: 'border-emerald-100 text-emerald-700',
    chipActive: 'bg-emerald-100/80 text-emerald-800 border-emerald-300',
    chipComplete: 'text-emerald-600 border-emerald-100',
  },
  basics: {
    bar: 'from-teal-400 via-emerald-400 to-lime-400',
    chip: 'border-teal-100 text-teal-700',
    chipActive: 'bg-teal-100/70 text-teal-800 border-teal-300',
    chipComplete: 'text-teal-600 border-teal-100',
  },
  goals: {
    bar: 'from-amber-400 via-orange-400 to-rose-400',
    chip: 'border-amber-100 text-amber-700',
    chipActive: 'bg-amber-100/70 text-amber-800 border-amber-300',
    chipComplete: 'text-amber-600 border-amber-100',
  },
  plan: {
    bar: 'from-violet-400 via-purple-400 to-emerald-400',
    chip: 'border-violet-100 text-violet-700',
    chipActive: 'bg-violet-100/70 text-violet-800 border-violet-300',
    chipComplete: 'text-violet-600 border-violet-100',
  },
};

const groupStageMap: Record<string, StageId> = {
  onboarding: 'start',
  goals: 'goals',
  body_metrics: 'basics',
  activity: 'basics',
  demographics: 'start',
  lifestyle: 'basics',
  eating: 'basics',
  preferences: 'plan',
  health: 'goals',
  behavior: 'goals',
  plan_choice: 'goals',
  summary: 'plan',
  offer: 'plan',
  milestone: 'plan',
};

function getStageForStep(step: QuizStep | undefined): StageId {
  if (!step) return 'start';
  const explicit = (step.meta as any)?.stage as StageId | undefined;
  if (explicit) return explicit;
  return groupStageMap[step.group] ?? 'goals';
}

export function QuizProgress({ currentIndex, visibleSteps, participantName, condensed = false, showTotal = true, showPercent = true, showStageChips = true }: QuizProgressProps) {
  const totalSteps = visibleSteps.length;
  const rawPercent = totalSteps === 0 ? 0 : Math.round(((currentIndex + 1) / totalSteps) * 100);
  const percentage = Math.min(100, Math.max(8, rawPercent));

  const stageCounts: Record<StageId, number> = { start: 0, basics: 0, goals: 0, plan: 0 };
  const stageCompleted: Record<StageId, number> = { start: 0, basics: 0, goals: 0, plan: 0 };

  visibleSteps.forEach((step, idx) => {
    const stage = getStageForStep(step);
    stageCounts[stage] += 1;
    if (idx < currentIndex) {
      stageCompleted[stage] += 1;
    }
  });

  const currentStage = getStageForStep(visibleSteps[currentIndex]);
  const currentStageIndex = Math.max(0, STAGES.findIndex((s) => s.id === currentStage));
  const theme = STAGE_THEME[currentStage] ?? STAGE_THEME.start;
  const moodBuilder = STAGE_MOOD[currentStage] ?? STAGE_MOOD.start;
  const mood = moodBuilder({ name: participantName });

  return (
    <div className={`w-full rounded-2xl border border-emerald-100/70 bg-white/70 ${condensed ? 'px-4 py-3' : 'px-5 py-4'} shadow-sm backdrop-blur dark:border-emerald-900/40 dark:bg-neutral-900/70`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {`Stage ${Math.min(currentStageIndex + 1, STAGES.length)} · ${STAGES[currentStageIndex]?.label ?? 'Start'}`}
        </div>
        <div className="text-right text-sm font-semibold text-neutral-900 dark:text-white">
          {`Step ${Math.min(currentIndex + 1, totalSteps)}`}
          {showTotal ? ` of ${totalSteps}` : ''}
          {showPercent ? ` · ${percentage}% complete` : ''}
        </div>
      </div>
      <div className={`mt-2 ${condensed ? 'h-1' : 'h-1.5'} overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${theme.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showStageChips && (
        <div className="mt-3 flex flex-wrap gap-1 text-[11px] font-semibold">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isActive = stage.id === currentStage;
            const stageTheme = STAGE_THEME[stage.id] ?? STAGE_THEME.start;
            const baseClass = `rounded-full border px-3 py-1 transition ${stageTheme.chip}`;
            const stateClass = isActive
              ? stageTheme.chipActive
              : isCompleted
                ? stageTheme.chipComplete
                : 'opacity-60';

            return (
              <span key={stage.id} className={`${baseClass} ${stateClass}`}>
                {stage.label}
              </span>
            );
          })}
        </div>
      )}
      {!condensed && (
        <p className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-300">{mood}</p>
      )}
    </div>
  );
}
