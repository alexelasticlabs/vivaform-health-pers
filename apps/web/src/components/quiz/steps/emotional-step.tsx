import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { SliderInput } from '../slider-input';

export function EmotionalStep() {
  const { answers, updateAnswer } = useQuizStore();

  return (
    <QuizCard
      title="Emotional Wellbeing"
      subtitle="Understanding your relationship with food helps create a better plan"
    >
      <div className="space-y-6">
        {/* Еда при стрессе */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you eat more when you're stressed?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.eatWhenStressed === true}
              onClick={() => updateAnswer('eatWhenStressed', true)}
            >
              Yes, stress triggers appetite
            </OptionButton>
            <OptionButton
              selected={answers.eatWhenStressed === false}
              onClick={() => updateAnswer('eatWhenStressed', false)}
            >
              No, appetite doesn't change
            </OptionButton>
          </div>
        </div>

        {/* Главная мотивация */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What motivates you the most?
          </label>
          <div className="space-y-2">
            {[
              { value: 'health', label: '💪 Health and energy' },
              { value: 'appearance', label: '✨ Appearance' },
              { value: 'performance', label: '🏃 Athletic performance' },
              { value: 'wellbeing', label: '😊 Overall wellbeing' },
              { value: 'medical', label: '🏥 Medical reasons' },
            ].map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.mainMotivation === option.value}
                onClick={() => updateAnswer('mainMotivation', option.value as 'health' | 'appearance' | 'performance' | 'wellbeing' | 'medical')}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Уровень стресса */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you rate your current stress level?
          </label>
          <SliderInput
            value={answers.stressLevel ?? 5}
            onChange={(value) => updateAnswer('stressLevel', value)}
            min={1}
            max={10}
            step={1}
            label={(value) => {
              if (value <= 3) return `${value} - Low 😌`;
              if (value <= 6) return `${value} - Medium 😐`;
              return `${value} - High 😰`;
            }}
          />
        </div>

        {/* Источник комфорта */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What helps you feel better?
          </label>
          <div className="space-y-2">
            {[
              { value: 'exercise', label: '🏃 Physical activity' },
              { value: 'food', label: '🍕 Tasty food' },
              { value: 'social', label: '👥 Socializing' },
              { value: 'rest', label: '😴 Rest and sleep' },
              { value: 'hobbies', label: '🎨 Hobbies' },
            ].map((option) => (
              <OptionButton
                key={option.value}
                selected={answers.comfortSource === option.value}
                onClick={() => updateAnswer('comfortSource', option.value as 'food' | 'exercise' | 'social' | 'rest' | 'hobbies')}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Уверенность в рутине */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How easy is it for you to stick to a new routine?
          </label>
          <SliderInput
            value={answers.routineConfidence ?? 5}
            onChange={(value) => updateAnswer('routineConfidence', value)}
            min={1}
            max={10}
            step={1}
            label={(value) => {
              if (value <= 3) return `${value} - Difficult`;
              if (value <= 6) return `${value} - Medium`;
              return `${value} - Easy`;
            }}
          />
        </div>
      </div>
    </QuizCard>
  );
}
