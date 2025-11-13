import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard } from '@/components/quiz';
import { PAIN_POINTS } from './enhanced-quiz-constants';
import { logQuizOptionSelected } from '@/lib/analytics';
import { Checkbox } from '@/components/ui/checkbox';

export function PersonalStoryStep() {
  const { answers, updateAnswers, clientId } = useQuizStore();
  const selectedPoints = answers.painPoints || [];

  const handleToggle = (pointId: string) => {
    const newSelection = selectedPoints.includes(pointId)
      ? selectedPoints.filter((p) => p !== pointId)
      : [...selectedPoints, pointId];

    updateAnswers({ painPoints: newSelection });

    try {
      logQuizOptionSelected(clientId, 'personal_story', 'painPoints', newSelection.join(','));
    } catch {}
  };

  const isSelected = (pointId: string) => selectedPoints.includes(pointId);

  return (
    <QuizCard
      title="Что мешает вам достичь цели?"
      subtitle="Выберите всё, что относится к вам (можно выбрать несколько)"
      helpText="Это поможет нам создать план, учитывающий ваши трудности"
      emoji="💭"
    >
      <div className="space-y-3">
        {PAIN_POINTS.map((point, index) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <label
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected(point.id)
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <Checkbox
                checked={isSelected(point.id)}
                onCheckedChange={() => handleToggle(point.id)}
              />
              <span className="text-2xl">{point.emoji}</span>
              <span className="flex-1 text-sm font-medium">{point.text}</span>
            </label>
          </motion.div>
        ))}
      </div>

      {selectedPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Выбрано: {selectedPoints.length}</strong>
            <br />
            Мы учтем эти факторы при создании вашего плана! 💡
          </p>
        </motion.div>
      )}
    </QuizCard>
  );
}

