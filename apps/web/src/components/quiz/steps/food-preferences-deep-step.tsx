import { QuizCard } from '@/components/quiz';
import { useQuizStore } from '@/store/quiz-store';
import { Input } from '@/components/ui/input';
import { COMMON_ALLERGENS, COMMON_AVOIDED_FOODS } from './quiz-constants';

export function FoodPreferencesDeepStep() {
  const { answers, updateAnswers } = useQuizStore();
  const prefs = answers.foodPreferences ?? {};

  const updateList = (key: keyof typeof prefs, value: string) => {
    const list = (prefs as any)[key] as string[] | undefined;
    const arr = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    updateAnswers({ foodPreferences: { ...prefs, [key]: arr } as any });
  };

  return (
    <QuizCard
      title="Food preferences and restrictions"
      subtitle="We’ll avoid what you dislike and suggest what you love"
      helpText="Separate items with commas"
      emoji="🥗"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Favorites (comma-separated)</label>
          <Input
            placeholder="e.g., Chicken, Avocado, Greek yogurt"
            value={(prefs.favorites ?? []).join(', ')}
            onChange={(e) => updateList('favorites', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Dislikes (comma-separated)</label>
          <Input
            placeholder="e.g., Mushrooms, Cilantro"
            value={(prefs.dislikes ?? []).join(', ')}
            onChange={(e) => updateList('dislikes', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Allergens (comma-separated)</label>
          <Input
            placeholder={`Common examples: ${COMMON_ALLERGENS.join(', ')}`}
            value={(prefs.allergens ?? []).join(', ')}
            onChange={(e) => updateList('allergens', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Intolerances (comma-separated)</label>
          <Input
            placeholder="e.g., Lactose, Gluten"
            value={(prefs.intolerances ?? []).join(', ')}
            onChange={(e) => updateList('intolerances', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Restrictions (comma-separated)</label>
          <Input
            placeholder={`E.g., Vegan, Vegetarian, ${COMMON_AVOIDED_FOODS.join(', ')}`}
            value={(prefs.restrictions ?? []).join(', ')}
            onChange={(e) => updateList('restrictions', e.target.value)}
          />
        </div>
      </div>
    </QuizCard>
  );
}

