import { useQuizStore } from '../../../store/quiz-store';
import { QuizCard } from '../quiz-card';
import { OptionButton } from '../option-button';
import { SliderInput } from '../slider-input';

export function EmotionalStep() {
  const { answers, updateAnswer } = useQuizStore();

  return (
    <QuizCard
      title="Эмоциональная сфера"
      subtitle="Понимание вашей связи с едой поможет создать лучший план"
    >
      <div className="space-y-6">
        {/* Еда при стрессе */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Вы едите больше, когда испытываете стресс?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton
              selected={answers.eatWhenStressed === true}
              onClick={() => updateAnswer('eatWhenStressed', true)}
            >
              Да, стресс вызывает аппетит
            </OptionButton>
            <OptionButton
              selected={answers.eatWhenStressed === false}
              onClick={() => updateAnswer('eatWhenStressed', false)}
            >
              Нет, аппетит не меняется
            </OptionButton>
          </div>
        </div>

        {/* Главная мотивация */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Что вас больше всего мотивирует?
          </label>
          <div className="space-y-2">
            {[
              { value: 'health', label: '💪 Здоровье и энергия' },
              { value: 'appearance', label: '✨ Внешний вид' },
              { value: 'performance', label: '🏃 Спортивные результаты' },
              { value: 'wellbeing', label: '😊 Общее самочувствие' },
              { value: 'medical', label: '🏥 Медицинские показания' },
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
            Как вы оцениваете свой текущий уровень стресса?
          </label>
          <SliderInput
            value={answers.stressLevel ?? 5}
            onChange={(value) => updateAnswer('stressLevel', value)}
            min={1}
            max={10}
            step={1}
            label={(value) => {
              if (value <= 3) return `${value} - Низкий 😌`;
              if (value <= 6) return `${value} - Средний 😐`;
              return `${value} - Высокий 😰`;
            }}
          />
        </div>

        {/* Источник комфорта */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Что помогает вам чувствовать себя лучше?
          </label>
          <div className="space-y-2">
            {[
              { value: 'exercise', label: '🏃 Физическая активность' },
              { value: 'food', label: '🍕 Вкусная еда' },
              { value: 'social', label: '👥 Общение с близкими' },
              { value: 'rest', label: '😴 Отдых и сон' },
              { value: 'hobbies', label: '🎨 Хобби и увлечения' },
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
            Насколько легко вам придерживаться новой рутины?
          </label>
          <SliderInput
            value={answers.routineConfidence ?? 5}
            onChange={(value) => updateAnswer('routineConfidence', value)}
            min={1}
            max={10}
            step={1}
            label={(value) => {
              if (value <= 3) return `${value} - Сложно`;
              if (value <= 6) return `${value} - Средне`;
              return `${value} - Легко`;
            }}
          />
        </div>
      </div>
    </QuizCard>
  );
}
