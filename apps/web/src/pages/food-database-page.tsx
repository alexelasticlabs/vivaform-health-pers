/**
 * Food Database Page
 * Browse, search, and manage food items with nutrition info
 */

import React, { useState } from 'react';
import { Search, Star, Verified, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  verified: boolean;
  isFavorite?: boolean;
  category: string;
  barcode?: string;
}

export const FoodDatabasePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);

  // Mock food database
  const foods: FoodItem[] = [
    {
      id: '1',
      name: 'Chicken Breast',
      servingSize: 100,
      servingUnit: 'g',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      verified: true,
      isFavorite: true,
      category: 'Meat & Protein',
    },
    {
      id: '2',
      name: 'Brown Rice',
      servingSize: 100,
      servingUnit: 'g',
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      verified: true,
      category: 'Grains',
    },
    {
      id: '3',
      name: 'Avocado',
      servingSize: 100,
      servingUnit: 'g',
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      verified: true,
      isFavorite: true,
      category: 'Fruits & Vegetables',
    },
    {
      id: '4',
      name: 'Greek Yogurt',
      brand: 'Fage Total 0%',
      servingSize: 100,
      servingUnit: 'g',
      calories: 59,
      protein: 10.3,
      carbs: 3.6,
      fat: 0.4,
      sugar: 3.6,
      verified: true,
      category: 'Dairy',
      barcode: '5201000000000',
    },
    {
      id: '5',
      name: 'Almonds',
      servingSize: 28,
      servingUnit: 'g',
      calories: 164,
      protein: 6,
      carbs: 6,
      fat: 14,
      fiber: 3.5,
      verified: true,
      category: 'Nuts & Seeds',
    },
  ];

  const categories = ['All', 'Meat & Protein', 'Grains', 'Fruits & Vegetables', 'Dairy', 'Nuts & Seeds', 'Other'];

  const filteredFoods = foods.filter((food) => {
    if (searchQuery && !food.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && selectedCategory !== 'All' && food.category !== selectedCategory) return false;
    if (showOnlyVerified && !food.verified) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/10">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Food Database 🍽️</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Thousands of verified foods with complete nutrition info
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search foods by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Food
            </Button>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat || (!selectedCategory && cat === 'All') ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
              >
                {cat}
              </Button>
            ))}
            <Button
              variant={showOnlyVerified ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowOnlyVerified(!showOnlyVerified)}
              className="gap-2"
            >
              <Verified className="h-4 w-4" />
              Verified Only
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Found {filteredFoods.length} {filteredFoods.length === 1 ? 'food' : 'foods'}
        </div>

        {/* Food list */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>

        {/* Empty state */}
        {filteredFoods.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Search className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-700" />
            <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">No foods found</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Food card component
const FoodCard: React.FC<{ food: FoodItem }> = ({ food }) => {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white">{food.name}</h3>
              {food.verified && (
                <Verified className="h-4 w-4 fill-emerald-500 text-emerald-500" />
              )}
              {food.isFavorite && <Star className="h-4 w-4 fill-amber-500 text-amber-500" />}
            </div>
            {food.brand && <p className="text-sm text-slate-600 dark:text-slate-400">{food.brand}</p>}
            <p className="text-xs text-slate-500">
              {food.servingSize}
              {food.servingUnit} • {food.category}
            </p>
          </div>
        </div>

        {/* Macros bar */}
        <div className="mb-3 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
          <div className="text-center">
            <div className="mb-1 text-xl font-bold text-orange-600">{food.calories}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">cal</div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-xl font-bold text-red-600">{food.protein}g</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">protein</div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-xl font-bold text-blue-600">{food.carbs}g</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">carbs</div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-xl font-bold text-purple-600">{food.fat}g</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">fat</div>
          </div>
        </div>

        {/* Additional info */}
        {(food.fiber || food.sugar) && (
          <div className="mb-3 flex gap-3 text-xs text-slate-600 dark:text-slate-400">
            {food.fiber && (
              <span>
                <strong className="text-slate-900 dark:text-white">Fiber:</strong> {food.fiber}g
              </span>
            )}
            {food.sugar && (
              <span>
                <strong className="text-slate-900 dark:text-white">Sugar:</strong> {food.sugar}g
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            Add to Meal
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};
