import { QuizCard } from '@/components/quiz';
import { Button } from '@/components/ui/button';

export function FinalCTAStep({ onContinue }: { onContinue: () => void }) {
  return (
    <QuizCard
      title="Join 50,000+ people transforming their health"
      subtitle="You’re one step away from your full plan"
      emoji="🚀"
    >
      <div className="space-y-4">
        <div className="rounded-xl border p-4 text-sm">
          <p className="font-semibold mb-1">What people say</p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-700">
            <li>“Lost 12 kg in 3 months!” — Anna, 32</li>
            <li>“Finally have energy for my day.” — Michael, 28</li>
          </ul>
        </div>
        <Button size="lg" onClick={onContinue} className="w-full md:w-auto px-10">
          Get my full plan →
        </Button>
      </div>
    </QuizCard>
  );
}

