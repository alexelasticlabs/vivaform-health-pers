/**
 * Recipe System Types
 */

export type RecipeCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert'
  | 'smoothie'
  | 'salad';

export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'low-carb'
  | 'high-protein'
  | 'paleo';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  dietaryTags: DietaryTag[];
  difficulty: DifficultyLevel;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  nutrition: NutritionInfo;
  ingredients: Ingredient[];
  instructions: string[];
  image?: string;
  videoUrl?: string;
  tips?: string[];
  createdBy: string;
  verified: boolean;
  rating?: number;
  ratingCount?: number;
  isFavorite?: boolean;
  createdAt: Date;
}

export interface RecipeFilters {
  category?: RecipeCategory;
  dietaryTags?: DietaryTag[];
  difficulty?: DifficultyLevel;
  maxPrepTime?: number;
  maxCalories?: number;
  minProtein?: number;
  search?: string;
  onlyFavorites?: boolean;
}
