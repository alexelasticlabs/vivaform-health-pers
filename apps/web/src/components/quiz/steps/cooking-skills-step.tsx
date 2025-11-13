import { QuizCard, OptionTile } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { COOKING_SKILLS } from './enhanced-quiz-constants';

export function CookingSkillsStep() {
  const { answers, updateAnswers } = useQuizStore();

  return (
    <QuizCard
      title="How comfortable are you in the kitchen?"
      subtitle="We’ll suggest recipes that match your skills"
      helpText="Pick the level that feels right"
      emoji="👨‍🍳"
    >
      <div className="space-y-3">
        {COOKING_SKILLS.map((item) => (
          <OptionTile
            key={item.level}
            title={`${item.emoji} ${item.title}`}
            description={item.description}
            selected={answers.cooking?.skillLevel === item.level}
            onClick={() => updateAnswers({ cooking: { ...answers.cooking, skillLevel: item.level } })}
          />
        ))}
      </div>
    </QuizCard>
  );
}

