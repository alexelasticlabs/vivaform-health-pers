import { motion } from 'framer-motion';
import { Check, TrendingUp } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard } from '@/components/quiz';

export function QuickWinStep() {
  const { answers } = useQuizStore();
  const goal = answers.primaryGoal;

  const benefits = goal === 'lose_weight'
    ? [
        'Lose 2–4 kg in a healthy way',
        'Feel more energized',
        'Improve sleep quality',
        'Build sustainable habits',
      ]
    : goal === 'gain_muscle'
    ? [
        'Gain 1–2 kg of lean muscle',
        'Increase strength and endurance',
        'Improve physique and posture',
        'Establish a training routine',
      ]
    : goal === 'more_energy'
    ? [
        'Eliminate midday fatigue',
        'Improve focus and clarity',
        'Normalize sleep rhythm',
        'Boost productivity',
      ]
    : [
        'Balance your nutrition',
        'Feel healthier and lighter',
        'Strengthen immunity',
        'Maintain weight comfortably',
      ];

  return (
    <QuizCard
      title="Awesome! Here’s what you’ll achieve"
      subtitle="In just 30 days with your personal plan"
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
                Realistic and sustainable results
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                We focus on long-term, manageable changes you can actually maintain.
                This is not a quick-fix diet — it’s a lifestyle shift.
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
          <span className="font-bold text-emerald-600">93%</span> of users reach their goals in the first month
        </motion.div>
      </div>
    </QuizCard>
  );
}
