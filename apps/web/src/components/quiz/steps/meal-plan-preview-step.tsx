import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { motion } from 'framer-motion';
import { Coffee, Sun, Moon, Apple, ChefHat } from 'lucide-react';

const MDiv = motion.div as any;

export function MealPlanPreviewStep() {
  const { answers } = useQuizStore();

  const goal = answers.primaryGoal;
  const cookingLevel = answers.cooking?.skillLevel || 'beginner';

  // Customize meals based on goal
  const mealPlan = goal === 'lose_weight'
    ? {
        breakfast: { name: 'Greek Yogurt Bowl', emoji: '🥣', cal: 320, desc: 'Greek yogurt with berries and almonds' },
        snack1: { name: 'Apple & Almond Butter', emoji: '🍎', cal: 150, desc: 'Fresh apple slices with almond butter' },
        lunch: { name: 'Grilled Chicken Salad', emoji: '🥗', cal: 420, desc: 'Mixed greens, chicken, avocado, olive oil' },
        snack2: { name: 'Protein Shake', emoji: '🥤', cal: 180, desc: 'Protein powder, banana, almond milk' },
        dinner: { name: 'Baked Salmon', emoji: '🍣', cal: 480, desc: 'Salmon with roasted vegetables' },
        total: 1550
      }
    : goal === 'gain_muscle'
    ? {
        breakfast: { name: 'Protein Pancakes', emoji: '🥞', cal: 450, desc: 'Oat pancakes with peanut butter' },
        snack1: { name: 'Greek Yogurt', emoji: '🥛', cal: 200, desc: 'Greek yogurt with honey and granola' },
        lunch: { name: 'Chicken & Rice Bowl', emoji: '🍚', cal: 580, desc: 'Grilled chicken, brown rice, vegetables' },
        snack2: { name: 'Protein Bar', emoji: '🍫', cal: 220, desc: 'High-protein snack bar' },
        dinner: { name: 'Beef Stir-Fry', emoji: '🍽️', cal: 620, desc: 'Lean beef with quinoa and veggies' },
        total: 2070
      }
    : {
        breakfast: { name: 'Oatmeal with Berries', emoji: '🥣', cal: 350, desc: 'Steel-cut oats with fresh berries' },
        snack1: { name: 'Mixed Nuts', emoji: '🥜', cal: 160, desc: 'Handful of mixed nuts' },
        lunch: { name: 'Turkey Wrap', emoji: '🌯', cal: 450, desc: 'Whole wheat wrap with turkey and veggies' },
        snack2: { name: 'Hummus & Carrots', emoji: '🥕', cal: 130, desc: 'Fresh carrots with hummus' },
        dinner: { name: 'Grilled Fish', emoji: '🐟', cal: 520, desc: 'White fish with sweet potato' },
        total: 1610
      };

  const difficulty = cookingLevel === 'beginner' ? 'Easy' : cookingLevel === 'intermediate' ? 'Medium' : 'Advanced';

  return (
    <QuizCard
      title="🍱 A day on your personalized plan"
      subtitle="Here's what a typical day could look like"
      emoji="📅"
    >
      <div className="space-y-4">
        {/* Header with total calories */}
        <MDiv
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Daily Target</p>
              <p className="text-3xl font-bold">{mealPlan.total} kcal</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Difficulty</p>
              <p className="text-xl font-semibold">{difficulty}</p>
            </div>
          </div>
        </MDiv>

        {/* Meal Timeline */}
        <div className="space-y-3">
          <MDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-xl border-l-4 border-amber-500"
          >
            <div className="flex-shrink-0">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Coffee className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-900 dark:text-amber-100">
                  {mealPlan.breakfast.emoji} Breakfast
                </span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{mealPlan.breakfast.cal} kcal</span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">{mealPlan.breakfast.desc}</p>
            </div>
          </MDiv>

          <MDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border-l-4 border-green-500"
          >
            <div className="flex-shrink-0">
              <Apple className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-green-900 dark:text-green-100">
                  {mealPlan.snack1.emoji} Morning Snack
                </span>
                <span className="text-sm font-bold text-green-700 dark:text-green-300">{mealPlan.snack1.cal} kcal</span>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">{mealPlan.snack1.desc}</p>
            </div>
          </MDiv>

          <MDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border-l-4 border-blue-500"
          >
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Sun className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {mealPlan.lunch.emoji} Lunch
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{mealPlan.lunch.cal} kcal</span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">{mealPlan.lunch.desc}</p>
            </div>
          </MDiv>

          <MDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl border-l-4 border-purple-500"
          >
            <div className="flex-shrink-0">
              <Apple className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-purple-900 dark:text-purple-100">
                  {mealPlan.snack2.emoji} Afternoon Snack
                </span>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{mealPlan.snack2.cal} kcal</span>
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-200">{mealPlan.snack2.desc}</p>
            </div>
          </MDiv>

          <MDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl border-l-4 border-indigo-500"
          >
            <div className="flex-shrink-0">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Moon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                  {mealPlan.dinner.emoji} Dinner
                </span>
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{mealPlan.dinner.cal} kcal</span>
              </div>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">{mealPlan.dinner.desc}</p>
            </div>
          </MDiv>
        </div>

        {/* Summary */}
        <MDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl border border-emerald-200 dark:border-emerald-800"
        >
          <div className="flex items-start gap-3">
            <ChefHat className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                Personalized to your preferences ✨
              </p>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                All meals are tailored to your cooking skills, dietary restrictions, and food preferences.
                Plus, you get full recipes with step-by-step instructions!
              </p>
            </div>
          </div>
        </MDiv>
      </div>
    </QuizCard>
  );
}

