/**
 * Meal Suggestions Widget
 * AI-powered meal recommendations based on user goals and nutrition targets
 */

import React from 'react';
import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { Button } from '@/components/ui/button';

interface MealSuggestion {
  id: string;
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
  matchScore: number; // 0-100
  quickAdd?: boolean;
}

interface MealSuggestionsWidgetProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  userGoal: 'lose_weight' | 'gain_weight' | 'maintain' | 'build_muscle';
  remainingCalories: number;
  remainingProtein: number;
  className?: string;
}

export const MealSuggestionsWidget: React.FC<MealSuggestionsWidgetProps> = ({
  mealType,
  userGoal,
  remainingCalories,
  remainingProtein,
  className,
}) => {
  // Mock AI-powered suggestions
  const suggestions: MealSuggestion[] = [
    {
      id: '1',
      title: 'Grilled Chicken & Quinoa Bowl',
      description: '200g chicken, 100g quinoa, mixed veggies',
      calories: 450,
      protein: 48,
      carbs: 42,
      fat: 10,
      reason: 'Perfect protein balance for muscle building',
      matchScore: 95,
      quickAdd: true,
    },
    {
      id: '2',
      title: 'Greek Yogurt Parfait',
      description: 'Greek yogurt, berries, granola, honey',
      calories: 320,
      protein: 24,
      carbs: 38,
      fat: 8,
      reason: 'High protein, fits your calorie budget',
      matchScore: 88,
      quickAdd: true,
    },
    {
      id: '3',
      title: 'Salmon & Sweet Potato',
      description: '150g salmon, 200g sweet potato, asparagus',
      calories: 520,
      protein: 42,
      carbs: 48,
      fat: 16,
      reason: 'Omega-3 rich, great for recovery',
      matchScore: 82,
    },
  ];

  const getMealIcon = () => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
    }
  };

  const getGoalMessage = () => {
    switch (userGoal) {
      case 'lose_weight':
        return 'Low-calorie, high-satiety options';
      case 'gain_weight':
        return 'Calorie-dense, nutrient-rich meals';
      case 'maintain':
        return 'Balanced macros for maintenance';
      case 'build_muscle':
        return 'High-protein muscle-building meals';
    }
  };

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getMealIcon()}</span>
          <div>
            <h3 className="font-bold capitalize text-slate-900 dark:text-white">
              {mealType} Suggestions
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{getGoalMessage()}</p>
          </div>
        </div>
        <Sparkles className="h-5 w-5 text-emerald-600" />
      </div>

      {/* Remaining targets */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
        <div className="text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400">Calories Left</div>
          <div className="font-bold text-slate-900 dark:text-white">{remainingCalories}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400">Protein Left</div>
          <div className="font-bold text-slate-900 dark:text-white">{remainingProtein}g</div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group relative overflow-hidden rounded-xl border border-slate-200 p-4 transition-all hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:hover:border-emerald-500"
          >
            {/* Match score badge */}
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Target className="h-3 w-3" />
              {suggestion.matchScore}% match
            </div>

            {/* Title and description */}
            <h4 className="mb-1 pr-20 font-semibold text-slate-900 dark:text-white">
              {suggestion.title}
            </h4>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              {suggestion.description}
            </p>

            {/* Macros */}
            <div className="mb-3 flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-600 dark:text-slate-400">Cal:</span>
                <span className="font-semibold">{suggestion.calories}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-600 dark:text-slate-400">P:</span>
                <span className="font-semibold">{suggestion.protein}g</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-600 dark:text-slate-400">C:</span>
                <span className="font-semibold">{suggestion.carbs}g</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-600 dark:text-slate-400">F:</span>
                <span className="font-semibold">{suggestion.fat}g</span>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20">
              <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <p className="text-xs text-blue-800 dark:text-blue-300">{suggestion.reason}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {suggestion.quickAdd && (
                <Button size="sm" className="flex-1 gap-1">
                  <Zap className="h-3 w-3" />
                  Quick Add
                </Button>
              )}
              <Button size="sm" variant="outline" className="flex-1">
                View Recipe
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Show more */}
      <Button variant="ghost" className="mt-3 w-full">
        See More Suggestions →
      </Button>
    </div>
  );
};
