import { motion } from 'framer-motion';
import { PartyPopper, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard } from '@/components/quiz';
import { calculateBMI } from '@/store/quiz-store';

const MDiv = motion.div as any;

export function MidpointCelebrationStep() {
  const { answers } = useQuizStore();

  const bmi = calculateBMI(answers);
  const goal = answers.primaryGoal;
  const dietPlan = answers.diet?.plan || 'a personalized diet';
  const cookingTime = answers.cooking?.timeAvailable || 30;

  const goalText = goal === 'lose_weight'
    ? 'Lose weight'
    : goal === 'gain_muscle'
    ? 'Build muscle'
    : goal === 'more_energy'
    ? 'Gain more energy'
    : 'Stay healthy';

  const completedItems = [
    { text: `Your goal: ${goalText}`, icon: CheckCircle },
    bmi ? { text: `Current BMI: ${bmi.bmi}`, icon: CheckCircle } : null,
    { text: `Preferred: ${dietPlan}`, icon: CheckCircle },
    { text: `Ready to cook: ${cookingTime} min/day`, icon: CheckCircle },
  ].filter(Boolean);

  return (
    <MDiv
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <QuizCard
        title=""
        subtitle=""
        emoji=""
      >
        <div className="text-center space-y-6 py-8">
          {/* Confetti Icon */}
          <MDiv
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
                <MDiv
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
          </MDiv>

          {/* Main Message */}
          <MDiv
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Great job! You’re halfway there! 🎉
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Here’s what we’ve learned so far
            </p>
          </MDiv>

          {/* Progress Bar */}
          <MDiv
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              50%
            </div>
          </MDiv>

          {/* Completed Items */}
          <MDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3 max-w-md mx-auto"
          >
            {completedItems.map((item: any, index) => (
              <MDiv
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg"
              >
                <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium text-left">{item.text}</span>
              </MDiv>
            ))}
          </MDiv>

          {/* Encouragement */}
          <MDiv
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Just 2–3 more minutes to get your perfect plan!
              </span>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Only a few lifestyle questions left
              <br />
              and your personalized plan will be ready! 🚀
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
              <TrendingUp className="h-4 w-4" />
              <span>You’ve got this!</span>
            </div>
          </MDiv>
        </div>
      </QuizCard>
    </MDiv>
  );
}
