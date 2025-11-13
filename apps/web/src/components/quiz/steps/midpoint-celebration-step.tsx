import { motion } from 'framer-motion';
import { PartyPopper, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard } from '@/components/quiz';
import { calculateBMI } from '@/store/quiz-store';

export function MidpointCelebrationStep() {
  const { answers } = useQuizStore();

  const bmi = calculateBMI(answers);
  const goal = answers.primaryGoal;
  const dietPlan = answers.diet?.plan || 'персонализированную диету';
  const cookingTime = answers.cooking?.timeAvailable || 30;

  const goalText = goal === 'lose_weight'
    ? 'Похудеть'
    : goal === 'gain_muscle'
    ? 'Набрать мышечную массу'
    : goal === 'more_energy'
    ? 'Больше энергии'
    : 'Поддерживать здоровье';

  const completedItems = [
    { text: `Ваша цель: ${goalText}`, icon: CheckCircle },
    bmi ? { text: `Текущий BMI: ${bmi.toFixed(1)}`, icon: CheckCircle } : null,
    { text: `Предпочитаете: ${dietPlan}`, icon: CheckCircle },
    { text: `Готовы готовить: ${cookingTime} минут в день`, icon: CheckCircle },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <QuizCard
        title=""
        subtitle=""
        emoji=""
        className="border-2 border-emerald-300 dark:border-emerald-700"
      >
        <div className="text-center space-y-6 py-8">
          {/* Confetti Icon */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.2, 1, 1.2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: 2,
            }}
            className="flex justify-center"
          >
            <div className="relative">
              <PartyPopper className="h-20 w-20 text-emerald-600 dark:text-emerald-400" />
              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-emerald-500 rounded-full"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(i * 60 * Math.PI / 180) * 50,
                    y: Math.sin(i * 60 * Math.PI / 180) * 50,
                    opacity: 0,
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Отлично! Вы на полпути! 🎉
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Мы уже узнали много о вас
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              50%
            </div>
          </motion.div>

          {/* Completed Items */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3 max-w-md mx-auto"
          >
            {completedItems.map((item: any, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg"
              >
                <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium text-left">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Encouragement */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Еще 2-3 минуты для идеального плана!
              </span>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Осталось всего несколько вопросов о вашем образе жизни
              <br />
              и ваш персональный план будет готов! 🚀
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
              <TrendingUp className="h-4 w-4" />
              <span>У вас всё получится!</span>
            </div>
          </motion.div>
        </div>
      </QuizCard>
    </motion.div>
  );
}

