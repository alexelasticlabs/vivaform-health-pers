import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { MOTIVATION_FACTORS } from './enhanced-quiz-constants';
import { Button } from '@/components/ui/button';

export function MotivationRankStep() {
  const { answers, updateAnswers } = useQuizStore();
  const ranking = answers.motivation?.ranking ?? MOTIVATION_FACTORS.map(m => m.id);

  const move = (index: number, dir: -1 | 1) => {
    const next = ranking.slice();
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(j, 0, item);
    updateAnswers({ motivation: { ...(answers.motivation ?? {}), ranking: next } });
  };

  return (
    <QuizCard
      title="What motivates you the most?"
      subtitle="Rank your motivations — we’ll tailor nudges to match"
      helpText="Arrange at least your top 3"
      emoji="🏅"
    >
      <div className="space-y-2">
        {ranking.map((id, idx) => {
          const meta = MOTIVATION_FACTORS.find((m) => m.id === id);
          if (!meta) return null;
          return (
            <div key={id} className="flex items-center justify-between rounded-xl border px-3 py-2">
              <div className="text-sm font-medium">
                <span className="mr-2 text-neutral-500">{idx + 1}.</span>
                {meta.emoji} {meta.label}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => move(idx, -1)} disabled={idx === 0}>▲</Button>
                <Button variant="outline" size="sm" onClick={() => move(idx, 1)} disabled={idx === ranking.length - 1}>▼</Button>
              </div>
            </div>
          );
        })}
      </div>
    </QuizCard>
  );
}

