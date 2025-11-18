import type { QuizStep, QuizOption } from '@/features/quiz/quiz-config';
import { derivePlanType } from '@/features/quiz/quiz-config';
import { QuizCard, OptionButton, OptionTile, SliderInput, BMIIndicator } from '@/components/quiz';
import type { QuizCardVariant } from '@/components/quiz/quiz-card';
import { useQuizStore, calculateBMI } from '@/store/quiz-store';
import type { QuizAnswers } from '@/store/quiz-store';
import { useEffect, useState } from 'react';
import { logCalculatingScreenViewed, logDemographicVariantShown } from '@/lib/analytics';

interface QuizStepRendererProps {
  step: QuizStep;
  onPrimaryAction?: () => void;
}

interface StageHeaderConfig {
  stage: string;
  step: string;
  progress: number;
}

const STAGE_HEADERS: Record<string, StageHeaderConfig> = {
  primary_goal: { stage: 'Stage 1 · Goals', step: 'Step 1 of 3', progress: 33 },
  gender_identity: { stage: 'Stage 1 · Goals', step: 'Step 2 of 3', progress: 66 },
  body_metrics: { stage: 'Stage 2 · Basics', step: 'Step 1 of 2', progress: 50 },
  weight_loss_rebound: { stage: 'Stage 2 · Basics', step: 'Step 2 of 2', progress: 100 },
};

const GOAL_EMOJIS: Record<string, string> = {
  weight_loss: '⚖️',
  muscle_gain: '💪',
  maintenance: '🛡️',
  energy_health: '⚡',
  food_relationship: '🧠',
};

const GENDER_EMOJIS: Record<string, string> = {
  female: '💃',
  male: '🏃‍♂️',
  non_binary: '🌈',
  prefer_not_say: '🤍',
};

const WEIGHT_HISTORY_EMOJIS: Record<string, string> = {
  first_time: '🚀',
  lost_and_kept_off: '✅',
  lost_and_regained: '🔁',
  not_weight_focused: '🧭',
};

interface SelectionCardProps {
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
}

function SelectionCard({ label, description, icon, selected, onClick }: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition duration-200 ${
        selected
          ? 'border-emerald-500 bg-emerald-50/80 shadow-md'
          : 'border-gray-200 bg-white/90 hover:border-emerald-200 hover:bg-emerald-50/40'
      }`}
      aria-pressed={selected}
    >
      {icon && (
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
      )}
      <div className="flex-1">
        <p className="font-semibold text-foreground">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {selected && (
        <svg className="h-6 w-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}

function StageProgressBar({ info }: { info?: StageHeaderConfig }) {
  if (!info) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
        <span>{info.stage}</span>
        <span>{info.step}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-200"
          style={{ width: `${info.progress}%` }}
        />
      </div>
    </div>
  );
}

const GROUP_VARIANT_MAP: Record<string, QuizCardVariant> = {
  goals: 'goals',
  preferences: 'nutrition',
  eating: 'nutrition',
  plan_choice: 'plan',
  summary: 'plan',
  milestone: 'plan',
  offer: 'plan',
  lifestyle: 'default',
  demographics: 'goals',
};

const GROUP_EYEBROW_MAP: Record<string, string> = {
  onboarding: 'Let’s get acquainted',
  body_metrics: 'Vitals & safety',
  activity: 'Daily rhythm',
  demographics: 'Profile basics',
  lifestyle: 'Lifestyle pulse',
  goals: 'Your focus',
  eating: 'Food personality',
  preferences: 'Nutrition vibe check',
  behavior: 'Mindset pulse',
  plan_choice: 'Plan builder',
  summary: 'Launch checklist',
  milestone: 'Momentum checkpoint',
  offer: 'Plan activation',
};

function getCardVariant(step: QuizStep): QuizCardVariant {
  const metaVariant = (step.meta as any)?.cardVariant as QuizCardVariant | undefined;
  if (metaVariant) return metaVariant;
  return GROUP_VARIANT_MAP[step.group] ?? 'default';
}

function getCardEyebrow(step: QuizStep): string | undefined {
  return (step.meta as any)?.eyebrow ?? GROUP_EYEBROW_MAP[step.group];
}

function isSelectedMulti(valueList: string[] | undefined, value: string): boolean {
  return !!valueList && valueList.includes(value);
}

export function QuizStepRenderer({ step, onPrimaryAction }: QuizStepRendererProps) {
  const { answers, updateAnswers } = useQuizStore();
  const [showGenderWhy, setShowGenderWhy] = useState(false);
  const [weightHistoryBmiExpanded, setWeightHistoryBmiExpanded] = useState(true);

  useEffect(() => {
    setShowGenderWhy(false);
    setWeightHistoryBmiExpanded(true);
  }, [step.id]);

  // Precompute analytics-related demographic variables so we can call hooks unconditionally
  const isCalculatingPlan = step.id === 'calculating_plan';
  let demographicData: {
    genderLabel: string;
    ageBucket: string;
    etaMonths: number | undefined;
    variantIndex: number;
    heroClaim: string;
  } | null = null;

  if (isCalculatingPlan) {
    const gender = answers.gender ?? 'prefer_not_say';
    const genderLabel = gender === 'female' ? 'women' : gender === 'male' ? 'men' : 'people';
    const age = answers.age_years ?? 0;
    const ageBucket = age >= 10 ? `${Math.floor(age / 10) * 10}s` : 'all ages';
    const variants = [
      `${answers.name ? `${answers.name}, ` : ''}steady beats extreme — we’ll pace it together.`,
      `People in their ${ageBucket} often notice gentle changes within a few weeks.`,
      `Small nutrition shifts compound — we’ll keep it realistic for you.`
    ];
    const variantIndex = Math.floor(Math.random() * variants.length);
    const heroClaim = variants[variantIndex];
    const cm = answers.height_cm;
    const kg = answers.weight_kg;
    let etaMonths: number | undefined;
    if (cm && kg) {
      const heightM = cm / 100;
      const targetKgAtBmi25 = 24.9 * (heightM * heightM);
      const diff = Math.max(0, kg - targetKgAtBmi25);
      if (diff > 0) {
        const monthlyLossSafe = 2;
        etaMonths = Math.min(12, Math.max(1, Math.ceil(diff / monthlyLossSafe)));
      }
    }
    demographicData = { genderLabel, ageBucket, etaMonths, variantIndex, heroClaim };
  }

  // Hook must not be inside conditional branches; guard logic inside effect instead
  useEffect(() => {
    if (!isCalculatingPlan || !demographicData) return;
    const clientId = useQuizStore.getState().clientId;
    const { genderLabel, ageBucket, etaMonths, variantIndex, heroClaim } = demographicData;
    const demographic = `${genderLabel}_${ageBucket}`;
    if (clientId) {
      logCalculatingScreenViewed(clientId, demographic, etaMonths);
      logDemographicVariantShown(clientId, `variant_${variantIndex}`, demographic, heroClaim);
    }
  }, [isCalculatingPlan, demographicData]);

  const handleSingleSelect = <K extends keyof QuizAnswers>(field: K, value: QuizAnswers[K]) => {
    updateAnswers({ [field]: value } as Pick<QuizAnswers, K>);
  };

  const handleMultiToggle = <K extends keyof QuizAnswers>(field: K, value: string) => {
    const current = (answers[field] as string[] | undefined) ?? [];
    const exists = current.includes(value);
    const next = exists ? current.filter((v) => v !== value) : [...current, value];
    updateAnswers({ [field]: next as QuizAnswers[K] } as Pick<QuizAnswers, K>);
  };

  const renderIntroStep = () => {
    if (step.id !== 'welcome_consent') return null;
    const consentAccepted = Boolean((answers as any).consent_non_medical);
    const bullets = [
      'Realistic meal timings for your schedule',
      'Nutrition nudges, not strict rules',
      'Progress tracking and weekly check-ins',
    ];
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div
          className="relative overflow-hidden rounded-[32px] border border-emerald-100/80 bg-white/95 shadow-2xl"
          style={{ minHeight: '60vh', maxHeight: '75vh' }}
        >
          <div className="grid h-full gap-8 p-6 md:grid-cols-2 md:p-10">
            <div className="flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                  <span className="rounded-full bg-emerald-100/80 px-3 py-1">Let’s get acquainted</span>
                  <span className="rounded-full bg-emerald-100/80 px-3 py-1">3-minute adaptive quiz</span>
                </div>
                <div>
                  <h1 className="text-[clamp(1.9rem,2.6vw,2.4rem)] font-bold leading-snug text-emerald-950">{step.question}</h1>
                  <p className="mt-3 text-base text-emerald-900/80">{step.subtitle}</p>
                </div>
                <ul className="space-y-3 text-sm text-emerald-900">
                  {bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-lg leading-none text-emerald-500">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-semibold text-emerald-900/70">
                  {step.microcopy ?? 'Educational guidance only — not a substitute for medical advice.'}
                </p>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!consentAccepted}
                  onClick={() => {
                    if (!consentAccepted) return;
                    onPrimaryAction?.();
                  }}
                >
                  Start quiz
                </button>
                <label className="flex items-start gap-2 text-sm text-emerald-900/80">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                    checked={consentAccepted}
                    onChange={(e) => updateAnswers({ consent_non_medical: e.target.checked } as any)}
                  />
                  <span>I understand this is educational support, not a medical diagnosis.</span>
                </label>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Takes about 3 minutes · 9 quick steps</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative mx-auto w-full max-w-sm rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-600/90 to-teal-500/90 p-5 text-white shadow-2xl">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-emerald-100/80">
                  <span>Sample plan snapshot</span>
                  <span>Week 4</span>
                </div>
                <p className="mt-4 text-sm text-emerald-50/90">Plan confidence</p>
                <p className="text-4xl font-bold">92%</p>
                <div className="mt-4 grid gap-3 rounded-2xl bg-white/10 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Average progress</span>
                    <span className="font-semibold">+2.4 kg lean</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Weekly check-ins</span>
                    <span className="font-semibold">Every Sunday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Meal timing score</span>
                    <span className="font-semibold">8.7 / 10</span>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-white/15 p-3 text-xs text-emerald-50/90">
                  <p>“Steady, doable wins beat extremes. We’ll pace it with you.”</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGoalStep = () => {
    if (step.id !== 'primary_goal') return null;
    const field = step.fields[0] as keyof QuizAnswers;
    const current = answers[field] as string | undefined;
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <StageProgressBar info={STAGE_HEADERS[step.id]} />
        <div className="rounded-[32px] border border-emerald-100 bg-white/95 p-6 shadow-lg md:p-8">
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            Your focus
          </span>
          <h2 className="mt-4 text-[clamp(1.6rem,2.3vw,2rem)] font-bold leading-snug text-emerald-950">{step.question}</h2>
          <p className="mt-2 text-base text-neutral-600">{step.subtitle}</p>
          <div className="mt-6 space-y-3">
            {(step.options ?? []).map((opt) => (
              <SelectionCard
                key={opt.value}
                label={opt.label}
                icon={GOAL_EMOJIS[opt.value] ?? '✨'}
                selected={current === opt.value}
                onClick={() => handleSingleSelect(field, opt.value as QuizAnswers[typeof field])}
              />
            ))}
          </div>
          <p className="mt-6 text-sm font-medium text-emerald-700">Nice — this helps us set realistic expectations.</p>
        </div>
      </div>
    );
  };

  const renderGenderStep = () => {
    if (step.id !== 'gender_identity') return null;
    const field = step.fields[0] as keyof QuizAnswers;
    const current = answers[field] as string | undefined;
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <StageProgressBar info={STAGE_HEADERS[step.id]} />
        <div className="rounded-[32px] border border-emerald-100 bg-white/95 p-6 shadow-lg md:p-8">
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            Personalization seed
          </span>
          <h2 className="mt-4 text-[clamp(1.6rem,2.3vw,2rem)] font-bold leading-snug text-emerald-950">What’s your gender?</h2>
          <p className="mt-2 text-base text-neutral-600">Used to adjust calorie and nutrient estimates.</p>
          <p className="text-sm text-neutral-500">Optional and only used for personalization — never shared.</p>
          <div className="mt-6 space-y-3">
            {(step.options ?? []).map((opt) => (
              <SelectionCard
                key={opt.value}
                label={opt.label}
                icon={GENDER_EMOJIS[opt.value] ?? '🙂'}
                selected={current === opt.value}
                onClick={() => handleSingleSelect(field, opt.value as QuizAnswers[typeof field])}
              />
            ))}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowGenderWhy((prev) => !prev)}
              className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
            >
              Why do we ask?
            </button>
            {showGenderWhy && (
              <div className="mt-2 max-w-sm rounded-2xl border border-emerald-100 bg-white/95 p-3 text-sm text-neutral-700 shadow-md">
                We only use this to keep calorie and nutrient ranges safe. Skip anytime — it’s never shared with other members.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBasicsStep = () => {
    if (step.id !== 'body_metrics') return null;
    const unit = (answers.unit_system ?? 'metric') as 'metric' | 'us';
    const age = answers.age_years ?? '';
    const heightCm = answers.height_cm ?? '';
    const weightKg = answers.weight_kg ?? '';
    const heightFt = answers.raw_height_ft ?? '';
    const heightIn = answers.raw_height_in ?? '';
    const weightLbs = answers.raw_weight_lbs ?? '';
    const heightFtNumber = typeof answers.raw_height_ft === 'number' ? answers.raw_height_ft : 0;
    const heightInNumber = typeof answers.raw_height_in === 'number' ? answers.raw_height_in : 0;
    const bmiPreview = calculateBMI(answers);

    const ageWarning =
      typeof answers.age_years === 'number' && (answers.age_years < 18 || answers.age_years > 75)
        ? 'If you are outside this range, consider checking in with your physician too.'
        : null;
    const heightWarning =
      typeof answers.height_cm === 'number' && (answers.height_cm < 135 || answers.height_cm > 210)
        ? 'Double-check your height — an estimate is fine.'
        : null;
    const weightWarningMetric =
      typeof answers.weight_kg === 'number' && (answers.weight_kg < 40 || answers.weight_kg > 200)
        ? 'If this looks off, tweak it so macros stay safe.'
        : null;
    const weightWarningImperial =
      typeof answers.raw_weight_lbs === 'number' &&
      answers.raw_weight_lbs > 0 &&
      (answers.raw_weight_lbs < 90 || answers.raw_weight_lbs > 440)
        ? 'If this feels inaccurate, adjust before continuing.'
        : null;

    const convertImperialHeightToCm = (ftVal: number, inchVal: number) => {
      const totalInches = ftVal * 12 + inchVal;
      if (!totalInches) return undefined;
      return Math.round(totalInches * 2.54 * 10) / 10;
    };

    const convertLbsToKg = (lbsVal: number) => {
      if (!lbsVal) return undefined;
      return parseFloat((lbsVal * 0.45359237).toFixed(1));
    };

    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <StageProgressBar info={STAGE_HEADERS[step.id]} />
        <div className="rounded-[32px] border border-emerald-100 bg-white/95 p-6 shadow-lg md:p-8">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Vitals & safety
          </span>
          <h2 className="mt-4 text-[clamp(1.6rem,2.3vw,2rem)] font-bold leading-snug text-emerald-950">Your stats</h2>
          <p className="mt-2 text-base text-neutral-600">Approximate values are okay — you can edit them later.</p>
          <div className="mt-4 inline-flex rounded-full bg-neutral-100 p-1 text-xs font-medium">
            <button
              type="button"
              className={`px-3 py-1 rounded-full transition ${unit === 'metric' ? 'bg-white shadow-sm text-emerald-700' : 'text-neutral-500'}`}
              onClick={() => updateAnswers({ unit_system: 'metric' } as any)}
            >
              Metric (cm / kg)
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full transition ${unit === 'us' ? 'bg-white shadow-sm text-emerald-700' : 'text-neutral-500'}`}
              onClick={() => updateAnswers({ unit_system: 'us' } as any)}
            >
              US (ft / lbs)
            </button>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">Age</label>
                <input
                  type="number"
                  min={18}
                  max={90}
                  value={age}
                  onChange={(e) => updateAnswers({ age_years: Number(e.target.value) || undefined } as any)}
                  placeholder="30"
                  className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                {ageWarning && <p className="mt-1 text-xs text-amber-600">{ageWarning}</p>}
              </div>
              {unit === 'metric' ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">Height (cm)</label>
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={heightCm}
                    onChange={(e) => updateAnswers({ height_cm: Number(e.target.value) || undefined } as any)}
                    placeholder="170"
                    className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  {heightWarning && <p className="mt-1 text-xs text-amber-600">{heightWarning}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">Height (ft)</label>
                    <input
                      type="number"
                      min={4}
                      max={7}
                      value={heightFt || ''}
                      onChange={(e) => {
                        const nextValue = Number(e.target.value) || 0;
                        const cmFromImperial = convertImperialHeightToCm(nextValue, heightInNumber);
                        updateAnswers({
                          raw_height_ft: nextValue,
                          height_cm: cmFromImperial ?? undefined,
                        } as any);
                      }}
                      placeholder="5"
                      className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">Height (in)</label>
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={heightIn || ''}
                      onChange={(e) => {
                        const nextValue = Number(e.target.value) || 0;
                        const cmFromImperial = convertImperialHeightToCm(heightFtNumber, nextValue);
                        updateAnswers({
                          raw_height_in: nextValue,
                          height_cm: cmFromImperial ?? undefined,
                        } as any);
                      }}
                      placeholder="8"
                      className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {unit === 'metric' ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">Weight (kg)</label>
                  <input
                    type="number"
                    min={35}
                    max={250}
                    value={weightKg}
                    onChange={(e) => updateAnswers({ weight_kg: Number(e.target.value) || undefined } as any)}
                    placeholder="65"
                    className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  {weightWarningMetric && <p className="mt-1 text-xs text-amber-600">{weightWarningMetric}</p>}
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">Weight (lbs)</label>
                  <input
                    type="number"
                    min={70}
                    max={600}
                    value={weightLbs || ''}
                    onChange={(e) => {
                      const nextValue = Number(e.target.value) || 0;
                      const kgFromLbs = convertLbsToKg(nextValue);
                      updateAnswers({
                        raw_weight_lbs: nextValue,
                        weight_kg: kgFromLbs ?? undefined,
                      } as any);
                    }}
                    placeholder="150"
                    className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  {weightWarningImperial && <p className="mt-1 text-xs text-amber-600">{weightWarningImperial}</p>}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-white/90 px-4 py-4">
            {bmiPreview ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Your BMI</p>
                    <p className="text-2xl font-bold text-emerald-700">{bmiPreview.bmi}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-900">{bmiPreview.category}</p>
                </div>
                <p className="mt-2 text-xs text-neutral-500">We’ll explain what this means for you later in the quiz.</p>
              </>
            ) : (
              <p className="text-sm text-neutral-600">We’ll calculate this once you add your height and weight.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeightHistoryStep = () => {
    if (step.id !== 'weight_loss_rebound') return null;
    const field = step.fields[0] as keyof QuizAnswers;
    const current = answers[field] as string | undefined;
    const bmiPreview = calculateBMI(answers);
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <StageProgressBar info={STAGE_HEADERS[step.id]} />
        {bmiPreview && (
          <div className="rounded-2xl border border-emerald-100 bg-white/95 px-4 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-emerald-900">
                {weightHistoryBmiExpanded ? (
                  <>
                    BMI:&nbsp;
                    <span className="text-xl font-bold text-emerald-700">{bmiPreview.bmi}</span>
                    <span className="ml-2 text-sm text-emerald-900/80">· {bmiPreview.category}</span>
                  </>
                ) : (
                  `BMI: ${bmiPreview.bmi} · ${bmiPreview.category}`
                )}
              </p>
              <button
                type="button"
                onClick={() => setWeightHistoryBmiExpanded((prev) => !prev)}
                className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
              >
                {weightHistoryBmiExpanded ? 'Hide details' : 'Show details'}
              </button>
            </div>
            {weightHistoryBmiExpanded && (
              <p className="mt-2 text-xs text-neutral-500">Rounded from your height and weight. We’ll unpack it later in the quiz.</p>
            )}
          </div>
        )}
        <div className="rounded-[32px] border border-emerald-100 bg-white/95 p-6 shadow-lg md:p-8">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Vitals & safety
          </span>
          <h2 className="mt-4 text-[clamp(1.6rem,2.3vw,2rem)] font-bold leading-snug text-emerald-950">Have you tried losing weight before?</h2>
          <p className="mt-2 text-base text-neutral-600">Understanding your story helps us prevent rebound weight.</p>
          <div className="mt-6 space-y-3">
            {(step.options ?? []).map((opt) => (
              <SelectionCard
                key={opt.value}
                label={opt.label}
                icon={WEIGHT_HISTORY_EMOJIS[opt.value] ?? '✨'}
                selected={current === opt.value}
                onClick={() => handleSingleSelect(field, opt.value as QuizAnswers[typeof field])}
              />
            ))}
          </div>
          {current && (
            <div className="mt-5 rounded-2xl bg-emerald-50/70 px-4 py-2 text-sm font-medium text-emerald-900">
              Got it — we’ll factor this into your plan.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOptions = (options: QuizOption[] = []) => {
    if (step.uiType === 'single_choice') {
      const field = step.fields[0] as keyof QuizAnswers;
      const current = answers[field] as string | undefined;
      if (step.uiPattern === 'cards_grid' || step.uiPattern === 'cards_list' || step.uiPattern === 'two_cards_split' || step.uiPattern === 'two_cards_split_warning') {
        return (
          <div className="space-y-3">
            {options.map((opt) => (
              <OptionTile
                key={opt.value}
                title={opt.label}
                description={opt.subtitle ?? opt.description}
                emoji={opt.emoji}
                selected={current === opt.value}
                onClick={() => handleSingleSelect(field, opt.value as QuizAnswers[typeof field])}
              />
            ))}
          </div>
        );
      }
      // chips-like
      return (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <OptionButton
              key={opt.value}
              label={opt.label}
              description={opt.subtitle}
              emoji={opt.emoji}
              selected={current === opt.value}
              onClick={() => handleSingleSelect(field, opt.value as QuizAnswers[typeof field])}
              className="!px-3 !py-2 text-sm"
            />
          ))}
        </div>
      );
    }

    if (step.uiType === 'multi_choice') {
      const field = step.fields[0] as keyof QuizAnswers;
      const current = (answers[field] as string[] | undefined) ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <OptionButton
              key={opt.value}
              label={opt.label}
              description={opt.subtitle}
              emoji={opt.emoji}
              selected={isSelectedMulti(current, opt.value)}
              onClick={() => handleMultiToggle(field, opt.value)}
              className="!px-3 !py-2 text-sm"
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const renderBody = () => {
    if (step.id === 'momentum_social_proof') {
      const testimonial = step.microcopy ?? 'Members see change within the first 3 weeks when they finish this quiz.';
      const urgency = typeof step.meta?.urgencyCopy === 'string' ? (step.meta.urgencyCopy as string) : 'Premium seats refresh nightly.';
      const firstName = (answers.name ?? '').split(' ')[0] || undefined;
      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Momentum unlocked</p>
            <h3 className="mt-2 text-[clamp(1.4rem,2vw,1.8rem)] font-bold text-emerald-900">{firstName ? `${firstName}, ` : ''}your calorie range is dialed in.</h3>
            <p className="mt-3 text-sm text-emerald-900/80">Next we personalize macros, meal timing, and reminders so you don’t lose steam.</p>
            <div className="mt-4 rounded-2xl bg-white/90 p-4 text-sm text-emerald-900 shadow-sm">
              <p className="font-semibold">Member story</p>
              <p className="mt-1 text-emerald-800/80">{testimonial}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm font-medium text-amber-900">
            <span className="mr-2 text-base">⏳</span>
            {urgency}
          </div>
        </div>
      );
    }

    if (step.id === 'premium_value_teaser') {
      const proofCopy = typeof step.microcopy === 'string'
        ? step.microcopy
        : 'Premium spots refresh nightly — upgrading early keeps your streak boosts alive.';
      return (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-indigo-100 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">Premium (Step 11 sneak peek)</p>
              <h4 className="mt-2 text-lg font-semibold text-indigo-900">Keeps streak boosts + habit nudges alive</h4>
              <ul className="mt-4 space-y-2 text-sm text-indigo-900/80">
                <li>• Adaptive meal builder + grocery automation</li>
                <li>• Coach nudges + hydration/reminder texts</li>
                <li>• Macro recalculations during Optimization Week 2</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Free path</p>
              <h4 className="mt-2 text-lg font-semibold text-gray-800">Keeps blueprint + weekly check-ins</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Static calorie + macro targets</li>
                <li>• Manual grocery planning</li>
                <li>• Upgrade anytime without losing progress</li>
              </ul>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
            <p className="font-semibold">Social proof</p>
            <p className="mt-1">{proofCopy}</p>
          </div>
        </div>
      );
    }

    if (step.id === 'calculating_plan') {
      const planType = answers.final_plan_type ?? derivePlanType(answers);
      const firstName = (answers.name ?? '').split(' ')[0] || 'Member';
      const progress = 82; // pseudo progress for animation feel
      const months = demographicData?.etaMonths ?? 3;
      const heroClaim = demographicData?.heroClaim ?? '';
      const goalMap: Record<string, string> = {
        weight_loss: 'Steady fat loss',
        muscle_gain: 'Lean muscle gain',
        maintenance: 'Maintenance & accountability',
        energy_health: 'Energy + metabolic health',
        food_relationship: 'Gentle nutrition reset',
      };
      const goalSummary = goalMap[answers.primary_goal ?? ''] ?? 'Balanced progress';
      const insightBullets = [
        `Goal locked: ${goalSummary}`,
        answers.weekly_rhythm ? `Weekly rhythm: ${(answers.weekly_rhythm ?? '').replace(/_/g, ' ')}` : 'Lifestyle synced',
        answers.eating_habits?.length ? `${answers.eating_habits.length} habit cues logged` : 'Habit cues unlocked',
      ];
      const macroSplit: Record<string, { carbs: number; protein: number; fats: number }> = {
        mediterranean: { carbs: 45, protein: 30, fats: 25 },
        carnivore: { carbs: 5, protein: 55, fats: 40 },
        anti_inflammatory: { carbs: 40, protein: 30, fats: 30 },
      };
      const macros = macroSplit[planType ?? 'mediterranean'];
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 text-sm text-emerald-900 shadow-sm">
            <p className="font-semibold">{heroClaim}</p>
            <p className="mt-1 text-emerald-900/80">We’ll focus on sustainable, confidence‑building steps — no crash tactics.</p>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Crunching the numbers</p>
            <h3 className="mt-1 text-lg font-bold text-emerald-900">{firstName}, we’re syncing macros, meal timing, and habit cues.</h3>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-emerald-900/70">{progress}% complete · pulling latest member data + RD heuristics</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Live insights</p>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                {insightBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Macro preview</p>
              <div className="mt-3 space-y-3">
                {['Carbs', 'Protein', 'Fats'].map((label) => {
                  const key = label.toLowerCase() as 'carbs' | 'protein' | 'fats';
                  const value = macros[key];
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm font-medium text-emerald-900">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-neutral-100">
                        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Estimated timeline</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-emerald-900/90">
                <span>Phase 1</span>
                <span>{months} {months === 1 ? 'month' : 'months'}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-neutral-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.min(100, (months / 12) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-emerald-900/70">We pace change safely — gentle, consistent progress beats crash diets.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 p-4 text-sm text-muted-foreground">
            Coach note: when your plan is ready, we can email a gentle Phase 1 checklist — totally optional.
          </div>
        </div>
      );
    }

    if (step.id === 'member_testimonials') {
      const quotes = [
        {
          name: 'Kara · lost 8 kg',
          text: '“Phase 1 killed the night snacking. The weekly recap emails make it impossible to ghost myself.”',
        },
        {
          name: 'Sam · down 2 sizes',
          text: '“The anti-inflammatory plan stopped the bloating in 10 days. I finally trust my hunger again.”',
        },
        {
          name: 'Andre · more energy',
          text: '“Macro recalculations after travel are clutch. I stay on track without feeling punished.”',
        },
      ];
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {quotes.map((quote) => (
              <div key={quote.name} className="rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
                <p className="text-sm text-emerald-900">{quote.text}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">{quote.name}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-900">
            <p className="font-semibold">Live community signal</p>
            <p className="mt-1">4.8★ satisfaction this week · 120k members active · Coach replies in under 12h.</p>
          </div>
        </div>
      );
    }

    if (step.uiType === 'text_input') {
      const field = step.fields[0] as keyof QuizAnswers;
      const value = (answers[field] as string | undefined) ?? '';
      const placeholder = typeof step.meta?.placeholder === 'string' ? (step.meta.placeholder as string) : '';
      const helper = typeof step.meta?.helper === 'string' ? (step.meta.helper as string) : undefined;
      return (
        <div className="space-y-3">
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            value={value}
            placeholder={placeholder || 'you@example.com'}
            onChange={(e) => handleSingleSelect(field, e.target.value as QuizAnswers[typeof field])}
            className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-base text-foreground shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {helper && <p className="text-sm text-muted-foreground">{helper}</p>}
        </div>
      );
    }

    if (step.id === 'plan_summary') {
      const planType = answers.final_plan_type ?? derivePlanType(answers);
      const goalMap: Record<string, string> = {
        weight_loss: 'Steady fat loss with metabolic guardrails',
        muscle_gain: 'Lean muscle gain with adequate recovery calories',
        maintenance: 'Maintenance with habit accountability',
        energy_health: 'Energy-first routine with balanced macros',
        food_relationship: 'Gentle nutrition reset with mindful cues',
      };
      const activityMap: Record<string, string> = {
        sedentary: 'Desk-heavy weeks · low stress start',
        light: 'Light movement · flexible fueling blocks',
        moderate: 'Moderate training · split macros',
        high: 'High output · higher protein cadence',
      };
      const cookingMap: Record<string, string> = {
        speed: '5–15 min builds',
        balanced: '20–30 min balanced prep',
        chef: 'Full-flavor chef style',
        no_cook: 'Assembly + ready-to-eat focus',
      };
      const budgetMap: Record<string, string> = {
        lean: 'Budget-friendly grocery list',
        balanced: 'Balanced grocery basket',
        premium: 'Premium produce + specialty swaps',
      };
      const flavorSummary = (answers.food_likes ?? []).length
        ? `${answers.food_likes?.length} flavor cues locked`
        : 'Flexible flavor profile';
      const summaryItems = [
        { label: 'Goal focus', value: goalMap[answers.primary_goal ?? ''] ?? 'Balanced progress' },
        { label: 'Lifestyle', value: activityMap[answers.activity_level ?? ''] ?? 'Adaptive cadence' },
        { label: 'Flavor guardrails', value: flavorSummary },
        { label: 'Cooking style', value: cookingMap[answers.cooking_style ?? ''] ?? 'Adjustable prep' },
        { label: 'Budget vibe', value: budgetMap[answers.budget_level ?? ''] ?? 'Flexible spending plan' },
      ];
      const planCopy: Record<string, { title: string; description: string }> = {
        mediterranean: {
          title: 'Mediterranean metabolic reset',
          description: 'Whole-food focus with smart carbs + healthy fats.',
        },
        carnivore: {
          title: 'Protein-forward performance plan',
          description: 'Higher protein, low inflammatory triggers, fast satiety.',
        },
        anti_inflammatory: {
          title: 'Anti-inflammatory harmony plan',
          description: 'Fiber-rich plates, calm digestion, hormone support.',
        },
      };
      const planSummary = planCopy[planType ?? 'mediterranean'];
      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-emerald-900">Personalized insights</h3>
            <ul className="mt-4 space-y-3">
              {summaryItems.map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-sm text-neutral-800">
                  <span className="mt-0.5 text-emerald-500">•</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{item.label}</p>
                    <p className="text-sm font-medium text-neutral-900">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Recommended plan</p>
            <h3 className="mt-2 text-xl font-semibold">{planSummary.title}</h3>
            <p className="mt-1 text-sm text-white/90">{planSummary.description}</p>
          </div>
        </div>
      );
    }

    if (step.id === 'final_offer') {
      const seatsMessage = step.microcopy ?? 'Premium seats refresh nightly — lock one now or keep the free path.';
      const email = answers.email;
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
            <p className="font-semibold">What Premium adds (optional)</p>
            <ul className="mt-2 space-y-1 text-emerald-900/80">
              <li>• Adaptive meal builder & gentle reminders</li>
              <li>• Extra accountability tools when you want them</li>
              <li>• Save progress to {email ?? 'your inbox'} for convenience</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm font-medium text-amber-900">
            {seatsMessage}
          </div>
          {renderOptions(step.options)}
        </div>
      );
    }

    if (step.id === 'bmi_health_insight') {
      const bmiData = calculateBMI(answers as any);
      const gender = answers.gender ?? 'prefer_not_say';
      const avatarEmoji = gender === 'female' ? '🏃‍♀️' : gender === 'male' ? '🏃‍♂️' : '🏃';
      const avatarBg = gender === 'female' ? 'from-pink-100 to-rose-50' : gender === 'male' ? 'from-blue-100 to-cyan-50' : 'from-violet-100 to-indigo-50';
      const riskCopy: Record<string, string[]> = {
        Underweight: [
          'Potential nutrient deficiencies and lower energy availability.',
          'We’ll focus on steady nourishment to rebuild strength.',
        ],
        Normal: [
          'Great baseline! We’ll help you maintain energy and lean mass.',
          'Staying consistent with habits protects metabolic health.',
        ],
        Overweight: [
          'Elevated risk for blood sugar swings and inflammation.',
          'Balanced macros and steady meals can stabilize cravings.',
        ],
        Obese: [
          'Higher risk of heart strain, insulin resistance, and joint stress.',
          'We start gently — realistic calorie shifts, hydration, and recovery.',
        ],
      };

      return (
        <div className="space-y-5">
          <div className={`flex items-center gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br ${avatarBg} p-4 shadow-sm`}>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/80 text-2xl">
              <span aria-hidden>{avatarEmoji}</span>
            </div>
            <div className="text-sm text-emerald-900">
              <p className="font-semibold">Live snapshot</p>
              <p className="text-emerald-900/80">We adapt visuals and coaching to your profile.</p>
            </div>
          </div>
          {bmiData ? (
            <BMIIndicator bmi={bmiData.bmi} />
          ) : (
            <div className="rounded-2xl border border-dashed border-emerald-200 p-6 text-sm text-muted-foreground">
              Share your height and weight so we can calculate a precise BMI snapshot.
            </div>
          )}
          {bmiData && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <h3 className="text-base font-semibold text-emerald-800">What this means</h3>
              <p className="text-sm text-emerald-900/80">Healthy BMI range is 18.5–24.9. We combine this with your lifestyle answers to tailor calorie targets.</p>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                {riskCopy[bmiData.category as keyof typeof riskCopy]?.map((item) => (
                  <li key={item} className="flex items-start gap-2"><span className="mt-0.5 text-emerald-600">•</span><span>{item}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (step.uiType === 'slider') {
      const field = step.fields[0];
      const value = ((answers as any)[field] as number | undefined) ?? (step.meta?.min as number | 0) ?? 0;
      const min = (step.meta?.min as number | undefined) ?? 1;
      const max = (step.meta?.max as number | undefined) ?? 10;
      return (
        <SliderInput
          value={value}
          min={min}
          max={max}
          onChange={(v) => updateAnswers({ [field]: v } as any)}
          label={step.subtitle}
        />
      );
    }

    if (step.uiType === 'dual_input') {
      const [fieldCurrent, fieldTarget] = step.fields as [keyof QuizAnswers, keyof QuizAnswers];
      const options = step.options ?? [];
      const current = (answers[fieldCurrent] as string | undefined) ?? '';
      const target = (answers[fieldTarget] as string | undefined) ?? '';
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Current size</label>
            <select
              className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base text-foreground shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={current}
              onChange={(e) => updateAnswers({ [fieldCurrent]: e.target.value || undefined } as any)}
            >
              <option value="">Select…</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Target size</label>
            <select
              className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base text-foreground shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={target}
              onChange={(e) => updateAnswers({ [fieldTarget]: e.target.value || undefined } as any)}
            >
              <option value="">Select…</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (step.uiType === 'info') {
      const infoCopy = typeof step.microcopy === 'string' ? step.microcopy : undefined;
      return (
        <div className="space-y-3">
          {infoCopy && <p className="text-sm text-muted-foreground">{infoCopy}</p>}
          {step.options && renderOptions(step.options)}
        </div>
      );
    }

    return renderOptions(step.options);
  };

  const helpText = step.uiType !== 'info' && typeof step.microcopy === 'string' ? step.microcopy : undefined;

  const customStep =
    renderIntroStep() ??
    renderGoalStep() ??
    renderGenderStep() ??
    renderBasicsStep() ??
    renderWeightHistoryStep();

  if (customStep) {
    return customStep;
  }

  return (
    <QuizCard
      title={step.question}
      subtitle={step.subtitle}
      emoji={undefined}
      helpText={helpText}
      variant={getCardVariant(step)}
      eyebrowLabel={getCardEyebrow(step)}
    >
      {renderBody()}
    </QuizCard>
  );
}
