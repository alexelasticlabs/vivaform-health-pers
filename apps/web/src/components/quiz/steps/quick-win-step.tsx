import { motion } from 'framer-motion';
import { Check, TrendingUp } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard } from '@/components/quiz';
import { Button } from '@/components/ui/button';

export function QuickWinStep() {
  const { answers } = useQuizStore();
  const goal = answers.primaryGoal;

  const benefits = goal === 'lose_weight'
    ? [
        'Потерять 2-4 кг здоровым способом',
        'Чувствовать больше энергии',
        'Улучшить качество сна',
        'Выработать здоровые привычки',
      ]
    : goal === 'gain_muscle'
    ? [
        'Набрать 1-2 кг мышечной массы',
        'Увеличить силу и выносливость',
        'Улучшить форму тела',
        'Сформировать режим тренировок',
      ]
    : goal === 'more_energy'
    ? [
        'Избавиться от дневной усталости',
        'Улучшить концентрацию',
        'Нормализовать сон',
        'Повысить работоспособность',
      ]
    : [
        'Сбалансировать питание',
        'Улучшить самочувствие',
        'Укрепить иммунитет',
        'Поддерживать вес',
      ];

  return (
    <QuizCard
      title="Отлично! Вот что вы сможете достичь"
      subtitle="Всего через 30 дней с персональным планом"
      emoji="🎉"
    >
      <div className="space-y-4">
        {/* Progress bar animation */}
        <div className="relative h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </div>

        {/* Benefits list */}
        <div className="space-y-3 mt-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.15 }}
              className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950 dark:to-transparent rounded-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.15, type: 'spring' }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </motion.div>
              <span className="text-sm font-medium flex-1">{benefit}</span>
            </motion.div>
          ))}
        </div>

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Реалистичные результаты
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Мы фокусируемся на устойчивых изменениях, которые вы сможете поддерживать
                долгосрочно. Это не быстрая диета — это образ жизни!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Success rate */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center text-sm text-neutral-600 dark:text-neutral-400"
        >
          <span className="font-bold text-emerald-600">93%</span> наших пользователей достигают
          своих целей в первый месяц
        </motion.div>
      </div>
    </QuizCard>
  );
}

