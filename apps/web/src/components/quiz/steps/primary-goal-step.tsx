import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { QuizCard, OptionTile } from '@/components/quiz';
import { PRIMARY_GOALS } from './enhanced-quiz-constants';
import { logQuizOptionSelected } from '@/lib/analytics';

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
        {PRIMARY_GOALS.map((goal, index) => {
          const isPopular = 'popular' in goal && (goal as any).popular;
          const description = isPopular ? `${goal.subtitle} · Most popular` : goal.subtitle;
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <OptionTile
                title={goal.title}
                description={description}
                selected={answers.primaryGoal === goal.id}
                onClick={() => handleSelect(goal.id)}
                aria-label={`Choose ${goal.title}`}
              />
            </motion.div>
          );
        })}
      </div>
    </QuizCard>
  );
}
