/**
 * Recipe Book Page
 * Browse, search, and filter healthy recipes
 */

import React, { useState } from 'react';
import { Search, Heart, Clock, Users, ChefHat, Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Recipe, RecipeFilters, RecipeCategory, DietaryTag } from '@/types/recipes.types';

export const RecipesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Mock recipes data
  const recipes: Recipe[] = [
    {
      id: '1',
      title: 'High-Protein Oatmeal Bowl',
      description: 'Start your day with this protein-packed breakfast that keeps you full until lunch',
      category: 'breakfast',
      dietaryTags: ['vegetarian', 'high-protein'],
      difficulty: 'easy',
      prepTime: 5,
      cookTime: 10,
      servings: 1,
      nutrition: {
        calories: 420,
        protein: 32,
        carbs: 48,
        fat: 12,
        fiber: 8,
      },
      ingredients: [
        { id: '1', name: 'Oats', amount: 50, unit: 'g' },
        { id: '2', name: 'Protein powder', amount: 30, unit: 'g' },
        { id: '3', name: 'Almond milk', amount: 250, unit: 'ml' },
        { id: '4', name: 'Banana', amount: 1, unit: 'medium' },
        { id: '5', name: 'Berries', amount: 50, unit: 'g', optional: true },
        { id: '6', name: 'Honey', amount: 1, unit: 'tbsp', optional: true },
      ],
      instructions: [
        'Mix oats with almond milk in a bowl',
        'Microwave for 2-3 minutes, stirring halfway',
        'Stir in protein powder',
        'Top with sliced banana and berries',
        'Drizzle with honey if desired',
      ],
      image: '🥣',
      createdBy: 'Vivaform Team',
      verified: true,
      rating: 4.8,
      ratingCount: 234,
      isFavorite: false,
      createdAt: new Date('2025-01-15'),
      tips: [
        'Use vanilla or chocolate protein powder for extra flavor',
        'Prep overnight oats version by refrigerating overnight',
      ],
    },
    {
      id: '2',
      title: 'Grilled Chicken Salad',
      description: 'Fresh, light, and packed with lean protein and veggies',
      category: 'lunch',
      dietaryTags: ['high-protein', 'gluten-free', 'dairy-free'],
      difficulty: 'easy',
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      nutrition: {
        calories: 380,
        protein: 42,
        carbs: 18,
        fat: 16,
        fiber: 6,
      },
      ingredients: [
        { id: '1', name: 'Chicken breast', amount: 200, unit: 'g' },
        { id: '2', name: 'Mixed greens', amount: 100, unit: 'g' },
        { id: '3', name: 'Cherry tomatoes', amount: 100, unit: 'g' },
        { id: '4', name: 'Cucumber', amount: 1, unit: 'medium' },
        { id: '5', name: 'Olive oil', amount: 2, unit: 'tbsp' },
        { id: '6', name: 'Lemon juice', amount: 1, unit: 'tbsp' },
      ],
      instructions: [
        'Season chicken with salt, pepper, and herbs',
        'Grill chicken for 6-7 minutes per side',
        'Chop vegetables and mix in a large bowl',
        'Slice grilled chicken and place on top',
        'Drizzle with olive oil and lemon juice',
      ],
      image: '🥗',
      createdBy: 'Chef Maria',
      verified: true,
      rating: 4.6,
      ratingCount: 189,
      isFavorite: true,
      createdAt: new Date('2025-01-10'),
    },
    {
      id: '3',
      title: 'Keto Avocado Toast',
      description: 'Low-carb twist on the classic with cloud bread',
      category: 'breakfast',
      dietaryTags: ['keto', 'low-carb', 'vegetarian'],
      difficulty: 'medium',
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      nutrition: {
        calories: 320,
        protein: 18,
        carbs: 8,
        fat: 24,
        fiber: 6,
      },
      ingredients: [
        { id: '1', name: 'Eggs', amount: 3, unit: 'large' },
        { id: '2', name: 'Cream cheese', amount: 60, unit: 'g' },
        { id: '3', name: 'Avocado', amount: 1, unit: 'large' },
        { id: '4', name: 'Cherry tomatoes', amount: 50, unit: 'g' },
        { id: '5', name: 'Everything bagel seasoning', amount: 1, unit: 'tsp' },
      ],
      instructions: [
        'Make cloud bread: separate egg whites and yolks',
        'Whip egg whites until stiff peaks form',
        'Mix yolks with cream cheese',
        'Fold mixtures together gently',
        'Bake at 150°C for 20 minutes',
        'Top with mashed avocado and tomatoes',
      ],
      image: '🥑',
      createdBy: 'Keto Kitchen',
      verified: true,
      rating: 4.9,
      ratingCount: 412,
      isFavorite: false,
      createdAt: new Date('2025-01-05'),
    },
  ];

  const categories: { value: RecipeCategory; label: string; icon: string }[] = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snacks', icon: '🍎' },
    { value: 'dessert', label: 'Desserts', icon: '🍰' },
    { value: 'smoothie', label: 'Smoothies', icon: '🥤' },
    { value: 'salad', label: 'Salads', icon: '🥗' },
  ];

  // Removed unused dietaryTags constant to satisfy lint

  const filteredRecipes = recipes.filter((recipe) => {
    if (filters.category && recipe.category !== filters.category) return false;
    if (filters.onlyFavorites && !recipe.isFavorite) return false;
    if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/10">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Recipe Book 📖</h1>
          <p className="text-slate-600 dark:text-slate-400">Healthy recipes to help you reach your goals</p>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={!filters.category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, category: undefined })}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={filters.category === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setFilters({
                    ...filters,
                    category: filters.category === cat.value ? undefined : cat.value,
                  })
                }
                className="gap-2"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
            <Button
              variant={filters.onlyFavorites ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, onlyFavorites: !filters.onlyFavorites })}
              className="gap-2"
            >
              <Heart className="h-4 w-4" />
              Favorites
            </Button>
          </div>
        </div>

        {/* Recipe grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
          ))}
        </div>

        {/* Empty state */}
        {filteredRecipes.length === 0 && (
          <div className="py-12 text-center">
            <ChefHat className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">No recipes found</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Try adjusting your filters</p>
          </div>
        )}

        {/* Recipe detail modal */}
        {selectedRecipe && <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
      </div>
    </div>
  );
};

// Recipe card component
const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:scale-105 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Image */}
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 text-6xl dark:from-emerald-950/20 dark:to-teal-950/20">
        {recipe.image}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">{recipe.title}</h3>
          {recipe.isFavorite && <Heart className="h-5 w-5 flex-shrink-0 fill-red-500 text-red-500" />}
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{recipe.description}</p>

        {/* Meta info */}
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <Clock className="h-3 w-3" />
            {recipe.prepTime + recipe.cookTime}min
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <Users className="h-3 w-3" />
            {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <Flame className="h-3 w-3" />
            {recipe.nutrition.calories}cal
          </div>
          {recipe.rating && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="h-3 w-3 fill-amber-500" />
              {recipe.rating}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              {tag}
            </span>
          ))}
          {recipe.dietaryTags.length > 2 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              +{recipe.dietaryTags.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Recipe detail modal component
const RecipeDetailModal: React.FC<{ recipe: Recipe; onClose: () => void }> = ({ recipe, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">{recipe.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">by {recipe.createdBy}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column - image and meta */}
            <div className="space-y-4">
              <div className="flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-8xl dark:from-emerald-950/20 dark:to-teal-950/20">
                {recipe.image}
              </div>

              {/* Nutrition facts */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h3 className="mb-3 font-bold text-slate-900 dark:text-white">Nutrition (per serving)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Calories</span>
                    <span className="font-semibold">{recipe.nutrition.calories}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Protein</span>
                    <span className="font-semibold">{recipe.nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Carbs</span>
                    <span className="font-semibold">{recipe.nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Fat</span>
                    <span className="font-semibold">{recipe.nutrition.fat}g</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Button className="w-full">Add to Meal Plan</Button>
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Save to Favorites
                </Button>
              </div>
            </div>

            {/* Right column - ingredients and instructions */}
            <div className="space-y-6 lg:col-span-2">
              {/* Ingredients */}
              <div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                        {ingredient.optional && <span className="text-xs text-slate-500"> (optional)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Instructions</h3>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-slate-700 dark:text-slate-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              {recipe.tips && recipe.tips.length > 0 && (
                <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20">
                  <h3 className="mb-2 font-bold text-blue-900 dark:text-blue-200">💡 Pro Tips</h3>
                  <ul className="space-y-1">
                    {recipe.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-blue-800 dark:text-blue-300">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
