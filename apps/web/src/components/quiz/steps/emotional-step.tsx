import { QuizCard, SliderInput, OptionTile, ChoiceToggle } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { logQuizOptionSelected } from '@/lib/analytics';

export function EmotionalStep() {
  const { answers, updateAnswers } = useQuizStore();

  return (
    <QuizCard
      title="Emotional Wellbeing"
      subtitle="Understanding your relationship with food helps create a better plan"
      helpText="Emotions affect appetite and choices. This shapes supportive habits."
    >
      <div className="space-y-6">
        {/* Stress eating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you eat more when you're stressed?
          </label>
          <ChoiceToggle
            label="I eat more when I'm stressed"
            selected={!!answers.habits?.eatWhenStressed}
            onClick={() => { const v = !answers.habits?.eatWhenStressed; updateAnswers({ habits: { eatWhenStressed: v } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'emotional', 'habits.eatWhenStressed', v); } catch {} }}
          />
        </div>

        {/* Main motivation */}
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
              <OptionTile
                key={option.value}
                title={option.label}
                selected={answers.habits?.mainMotivation === option.value}
                onClick={() => { const v = option.value as 'health' | 'appearance' | 'performance' | 'wellbeing' | 'medical'; updateAnswers({ habits: { mainMotivation: v } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'emotional', 'habits.mainMotivation', v); } catch {} }}
                aria-label={`Motivation: ${option.label}`}
              />
            ))}
          </div>
        </div>

        {/* Stress level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you rate your current stress level?
          </label>
          <SliderInput
            value={answers.habits?.stressLevel ?? 5}
            onChange={(value) => { updateAnswers({ habits: { stressLevel: value } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'emotional', 'habits.stressLevel', value); } catch {} }}
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

        {/* Comfort source */}
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
              <OptionTile
                key={option.value}
                title={option.label}
                selected={answers.habits?.comfortSource === option.value}
                onClick={() => { const v = option.value as 'food' | 'exercise' | 'social' | 'rest' | 'hobbies'; updateAnswers({ habits: { comfortSource: v } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'emotional', 'habits.comfortSource', v); } catch {} }}
                aria-label={`Comfort source: ${option.label}`}
              />
            ))}
          </div>
        </div>

        {/* Routine confidence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How easy is it for you to stick to a new routine?
          </label>
          <SliderInput
            value={answers.habits?.routineConfidence ?? 5}
            onChange={(value) => { updateAnswers({ habits: { routineConfidence: value } }); try { logQuizOptionSelected(useQuizStore.getState().clientId, 'emotional', 'habits.routineConfidence', value); } catch {} }}
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
