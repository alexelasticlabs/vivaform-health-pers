import type { QuizStep, QuizOption } from '@/features/quiz/quiz-config';
import { derivePlanType } from '@/features/quiz/quiz-config';
import { QuizCard, type QuizCardVariant, OptionButton, OptionTile, SliderInput, BMIIndicator } from '@/components/quiz';
import { useQuizStore, calculateBMI } from '@/store/quiz-store';
import type { QuizAnswers } from '@/store/quiz-store';

interface QuizStepRendererProps {
  step: QuizStep;
  onPrimaryAction?: () => void;
}

const GROUP_VARIANT_MAP: Record<string, QuizCardVariant> = {
  goals: 'goals',
  preferences: 'nutrition',
  eating: 'nutrition',
  plan_choice: 'plan',
  summary: 'plan',
  milestone: 'plan',
  offer: 'plan',
};

const GROUP_EYEBROW_MAP: Record<string, string> = {
  onboarding: 'Let’s get acquainted',
  body_metrics: 'Vitals & safety',
  activity: 'Daily rhythm',
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

  const handleSingleSelect = <K extends keyof QuizAnswers>(field: K, value: QuizAnswers[K]) => {
    updateAnswers({ [field]: value } as Pick<QuizAnswers, K>);
  };

  const handleMultiToggle = <K extends keyof QuizAnswers>(field: K, value: string) => {
    const current = (answers[field] as string[] | undefined) ?? [];
    const exists = current.includes(value);
    const next = exists ? current.filter((v) => v !== value) : [...current, value];
    updateAnswers({ [field]: next as QuizAnswers[K] } as Pick<QuizAnswers, K>);
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
    if (step.id === 'welcome_consent') {
      const consentAccepted = Boolean((answers as any).consent_non_medical);
      const heroImage = (step.meta as any)?.heroImage as string | undefined;
      const socialProof = step.microcopy ?? '120,000+ people trust VivaForm • AI-personalized • Research-backed.';

      return (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[30px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-inner">
            <div className="grid items-center gap-8 p-6 md:grid-cols-[1.05fr_0.95fr] md:p-10">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  {socialProof.split('•').map((item) => (
                    <span key={item.trim()} className="rounded-full bg-white/70 px-3 py-1 shadow-sm">
                      {item.trim()}
                    </span>
                  ))}
                </div>
                <div className="space-y-3 text-emerald-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">3-minute adaptive quiz</p>
                  <h3 className="text-[clamp(1.9rem,2.5vw,2.4rem)] font-bold leading-snug">Let’s craft nutrition coaching that feels human, not generic.</h3>
                  <p className="text-sm text-emerald-900/80">
                    Answer a few story-driven questions so we can blend data, dietitian insight, and habit cues into a plan that actually fits your day.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-emerald-900/90">
                  <li className="flex items-start gap-2"><span className="text-lg leading-none text-emerald-500">✦</span><span>Macros, meal timing, and hydration nudges aligned to your primary goal.</span></li>
                  <li className="flex items-start gap-2"><span className="text-lg leading-none text-emerald-500">✦</span><span>Flexible routines that respect real life — travel, cravings, busy cycles.</span></li>
                  <li className="flex items-start gap-2"><span className="text-lg leading-none text-emerald-500">✦</span><span>Registered-dietitian input layered with behavioral design.</span></li>
                </ul>
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={!consentAccepted}
                    onClick={() => {
                      if (!consentAccepted) return;
                      onPrimaryAction?.();
                    }}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Start my personalized plan
                  </button>
                  <label className="flex items-center gap-2 text-xs text-emerald-900/70">
                    <input
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => updateAnswers({ consent_non_medical: e.target.checked } as any)}
                      className="h-4 w-4 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>I know this is educational support, not a medical diagnosis.</span>
                  </label>
                </div>
              </div>
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 scale-110 rounded-[32px] bg-gradient-to-tr from-emerald-200 via-emerald-100 to-transparent blur-3xl opacity-70" />
                <div className="relative rounded-[26px] bg-white/90 p-4 shadow-2xl backdrop-blur">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={heroImage ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'}
                      alt="Healthy, colorful meals on a table"
                      className="h-64 w-full object-cover"
                    />
                  </div>
                  <div className="mt-4 grid gap-3 text-left text-sm text-emerald-900 md:grid-cols-2">
                    <div className="rounded-2xl bg-emerald-50/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Avg. loss</p>
                      <p className="text-2xl font-bold text-emerald-900">7.4 kg</p>
                      <p className="text-[11px] text-emerald-800">within the first 8 weeks*</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Feel-good score</p>
                      <p className="text-2xl font-bold text-emerald-900">93%</p>
                      <p className="text-[11px] text-emerald-800">report higher meal confidence</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">Educational guidance only · Please consult your physician for medical care.</p>
        </div>
      );
    }

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
            <p className="font-semibold">Fast-track benefits</p>
            <ul className="mt-2 space-y-1 text-emerald-900/80">
              <li>• Adaptive meal builder & grocery lists</li>
              <li>• Smart reminders + accountability nudges</li>
              <li>• Save progress to {email ?? 'your inbox'} instantly</li>
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

    if (step.uiType === 'number_inputs' && step.meta?.dualUnits) {
      const unit = answers.unit_system ?? 'metric';
      const name = answers.name ?? '';
      const age = answers.age_years ?? '';
      const ft = answers.raw_height_ft ?? 0;
      const inch = answers.raw_height_in ?? 0;
      const lbs = answers.raw_weight_lbs ?? 0;
      const cm = answers.height_cm ?? '';
      const kg = answers.weight_kg ?? '';
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">First name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => updateAnswers({ name: e.target.value } as any)}
                placeholder="Alex"
                className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base text-foreground shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Age</label>
              <input
                type="number"
                min={18}
                max={90}
                value={age}
                onChange={(e) => updateAnswers({ age_years: Number(e.target.value) || undefined } as any)}
                placeholder="30"
                className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base text-foreground shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          <div className="inline-flex rounded-full bg-neutral-100 p-1 text-xs font-medium">
            <button
              type="button"
              className={`px-3 py-1 rounded-full transition ${unit === 'metric' ? 'bg-white shadow-sm text-emerald-700' : 'opacity-60'}`}
              onClick={() => updateAnswers({ unit_system: 'metric' } as any)}
            >
              Metric (cm / kg)
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full transition ${unit === 'us' ? 'bg-white shadow-sm text-emerald-700' : 'opacity-60'}`}
              onClick={() => updateAnswers({ unit_system: 'us' } as any)}
            >
              US (ft / lbs)
            </button>
          </div>

          {unit === 'us' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Height (ft)</label>
                <input
                  type="number"
                  min={4}
                  max={7}
                  value={ft || ''}
                  onChange={(e) => updateAnswers({ raw_height_ft: Number(e.target.value) || 0 } as any)}
                  placeholder="5"
                  className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Height (in)</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={inch || ''}
                  onChange={(e) => updateAnswers({ raw_height_in: Number(e.target.value) || 0 } as any)}
                  placeholder="8"
                  className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Weight (lbs)</label>
                <input
                  type="number"
                  min={70}
                  max={600}
                  value={lbs || ''}
                  onChange={(e) => updateAnswers({ raw_weight_lbs: Number(e.target.value) || 0 } as any)}
                  placeholder="150"
                  className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={cm}
                  onChange={(e) => updateAnswers({ height_cm: Number(e.target.value) || undefined } as any)}
                  placeholder="170"
                  className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Weight (kg)</label>
                <input
                  type="number"
                  min={35}
                  max={250}
                  value={kg}
                  onChange={(e) => updateAnswers({ weight_kg: Number(e.target.value) || undefined } as any)}
                  placeholder="65"
                  className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (step.uiType === 'info') {
      return (
        <div className="space-y-3">
          {step.microcopy && <p className="text-sm text-muted-foreground">{step.microcopy}</p>}
          {step.options && renderOptions(step.options)}
        </div>
      );
    }

    return renderOptions(step.options);
  };

  return (
    <QuizCard
      title={step.question}
      subtitle={step.subtitle}
      emoji={undefined}
      helpText={step.microcopy}
      variant={getCardVariant(step)}
      eyebrowLabel={getCardEyebrow(step)}
    >
      {renderBody()}
    </QuizCard>
  );
}
