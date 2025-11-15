import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Award, Calendar, Heart } from 'lucide-react';

const MDiv = motion.div as any;

export function ResultsPreviewStep() {
  const { answers } = useQuizStore();

  // Calculate personalized data
  const goal = answers.primaryGoal;
  const bmi = answers.body?.weight?.kg && answers.body?.height?.cm
    ? (answers.body.weight.kg / Math.pow(answers.body.height.cm / 100, 2)).toFixed(1)
    : null;

  const goalText = goal === 'lose_weight'
    ? 'Weight Loss'
    : goal === 'gain_muscle'
    ? 'Muscle Building'
    : goal === 'more_energy'
    ? 'Energy Boost'
    : 'Healthy Living';

  const estimatedCalories = answers.demographics?.age && answers.demographics?.gender
    ? (answers.demographics.gender === 'male' ? 2200 : 1800)
    : 2000;

  const timeline = answers.goals?.etaMonths ?? 3;

  return (
    <QuizCard
      title="🎉 Your personalized plan is ready!"
      subtitle="Here's a preview of what you'll get"
      emoji="✨"
    >
      <div className="space-y-4">
        {/* Hero Stats */}
        <MDiv
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Your Goal</p>
              <p className="text-2xl font-bold">{goalText}</p>
            </div>
            <Target className="w-12 h-12 opacity-80" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{timeline}</p>
              <p className="text-xs opacity-90">Months</p>
            </div>
            {bmi && (
              <div>
                <p className="text-2xl font-bold">{bmi}</p>
                <p className="text-xs opacity-90">Current BMI</p>
              </div>
            )}
            <div>
              <p className="text-2xl font-bold">{estimatedCalories}</p>
              <p className="text-xs opacity-90">Daily Calories</p>
            </div>
          </div>
        </MDiv>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-neutral-900 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold">Calorie Target</p>
            </div>
            <div className="h-3 mt-2 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '70%' }} />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              Daily target: {estimatedCalories} kcal, tailored to your {goalText.toLowerCase()} goal
            </p>
          </MDiv>

          <MDiv
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-neutral-900 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold">Macro Balance</p>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 h-3 bg-red-400 rounded" title="Protein 30%"></div>
              <div className="flex-1 h-3 bg-yellow-400 rounded" title="Carbs 40%"></div>
              <div className="flex-1 h-3 bg-green-400 rounded" title="Fats 30%"></div>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              Balanced protein/carbs/fats for optimal results
            </p>
          </MDiv>

          <MDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-neutral-900 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold">Meal Schedule</p>
            </div>
            <ul className="mt-2 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                3 meals + 2 snacks daily
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Aligned with your schedule
              </li>
            </ul>
          </MDiv>

          <MDiv
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-neutral-900 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold">Activity Plan</p>
            </div>
            <ul className="mt-2 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                3-4x per week, ~30 minutes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Beginner to advanced options
              </li>
            </ul>
          </MDiv>
        </div>

        {/* Call to Action */}
        <MDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-xl border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                You're almost there! 🎯
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Complete the quiz to unlock your full personalized plan, meal suggestions, and progress tracking tools.
              </p>
            </div>
          </div>
        </MDiv>
      </div>
    </QuizCard>
  );
}

