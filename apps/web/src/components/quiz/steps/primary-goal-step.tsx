import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard, OptionTile } from '@/components/quiz';
import { PRIMARY_GOALS } from './enhanced-quiz-constants';
import { logQuizOptionSelected } from '@/lib/analytics';
import { Badge } from '@/components/ui/badge';

export function PrimaryGoalStep() {
  const { answers, updateAnswers, clientId } = useQuizStore();

  const handleSelect = (goalId: string) => {
    updateAnswers({ primaryGoal: goalId });
    try {
      logQuizOptionSelected(clientId, 'primary_goal', 'primaryGoal', goalId);
    } catch {}
  };

  return (
    <QuizCard
      title="What is your main goal?"
      subtitle="We’ll craft a personalized plan for your goal"
      helpText="Pick the one that matters the most for you right now"
      emoji="🎯"
    >
      <div className="space-y-3">
        {PRIMARY_GOALS.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <OptionTile
              title={
                <div className="flex items-center gap-2">
                  {goal.title}
                  {goal.popular && (
                    <Badge variant="default" className="text-xs">
                      Most popular
                    </Badge>
                  )}
                </div>
              }
              description={goal.subtitle}
              selected={answers.primaryGoal === goal.id}
              onClick={() => handleSelect(goal.id)}
              aria-label={`Choose ${goal.title}`}
            />
          </motion.div>
        ))}
      </div>

      {answers.primaryGoal && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-emerald-700 dark:text-emerald-300 mt-6 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg"
        >
          Great! We’ll tailor your plan exactly for this goal. ✓
        </motion.p>
      )}
    </QuizCard>
  );
}
