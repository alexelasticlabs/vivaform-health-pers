import type { QuizStep, QuizOption } from '@/features/quiz/quiz-config';
import { QuizCard, OptionButton, OptionTile, SliderInput } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';

interface QuizStepRendererProps {
  step: QuizStep;
}

function isSelectedMulti(valueList: string[] | undefined, value: string): boolean {
  return !!valueList && valueList.includes(value);
}

export function QuizStepRenderer({ step }: QuizStepRendererProps) {
  const { answers, updateAnswers } = useQuizStore();

  const handleSingleSelect = (field: string, value: string) => {
    updateAnswers({ [field]: value } as any);
  };

  const handleMultiToggle = (field: string, value: string) => {
    const current = ((answers as any)[field] as string[] | undefined) ?? [];
    const exists = current.includes(value);
    const next = exists ? current.filter((v) => v !== value) : [...current, value];
    updateAnswers({ [field]: next } as any);
  };

  const renderOptions = (options: QuizOption[] = []) => {
    if (step.uiType === 'single_choice') {
      const field = step.fields[0];
      const current = (answers as any)[field] as string | undefined;
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
                onClick={() => handleSingleSelect(field, opt.value)}
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
              onClick={() => handleSingleSelect(field, opt.value)}
              className="!px-3 !py-2 text-sm"
            />
          ))}
        </div>
      );
    }

    if (step.uiType === 'multi_choice') {
      const field = step.fields[0];
      const current = ((answers as any)[field] as string[] | undefined) ?? [];
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
      const unit = answers.unit_system ?? 'us';
      const ft = answers.raw_height_ft ?? 0;
      const inch = answers.raw_height_in ?? 0;
      const lbs = answers.raw_weight_lbs ?? 0;
      const cm = answers.height_cm ?? '';
      const kg = answers.weight_kg ?? '';
      return (
        <div className="space-y-4">
          <div className="inline-flex rounded-full bg-muted p-1 text-xs font-medium">
            <button
              type="button"
              className={`px-3 py-1 rounded-full ${unit === 'us' ? 'bg-background shadow-sm' : 'opacity-70'}`}
              onClick={() => updateAnswers({ unit_system: 'us' })}
            >
              US (ft / lbs)
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full ${unit === 'metric' ? 'bg-background shadow-sm' : 'opacity-70'}`}
              onClick={() => updateAnswers({ unit_system: 'metric' })}
            >
              Metric (cm / kg)
            </button>
          </div>
          {unit === 'us' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Height (ft)</label>
                <input
                  type="number"
                  min={3}
                  max={8}
                  value={ft || ''}
                  onChange={(e) => updateAnswers({ raw_height_ft: Number(e.target.value) || 0 })}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Height (in)</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={inch || ''}
                  onChange={(e) => updateAnswers({ raw_height_in: Number(e.target.value) || 0 })}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium">Weight (lbs)</label>
                <input
                  type="number"
                  min={70}
                  max={600}
                  value={lbs || ''}
                  onChange={(e) => updateAnswers({ raw_weight_lbs: Number(e.target.value) || 0 })}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={cm}
                  onChange={(e) => updateAnswers({ height_cm: Number(e.target.value) || undefined } as any)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Weight (kg)</label>
                <input
                  type="number"
                  min={35}
                  max={250}
                  value={kg}
                  onChange={(e) => updateAnswers({ weight_kg: Number(e.target.value) || undefined } as any)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
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
    <QuizCard title={step.question} subtitle={step.subtitle} emoji={undefined} helpText={step.microcopy}>
      {renderBody()}
    </QuizCard>
  );
}
