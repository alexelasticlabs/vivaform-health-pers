// Общие константы для шагов квиза (аллергены, избегаемые продукты)
// Выделены отдельно для стабильности снапшотов и переиспользования в тестах.

export const COMMON_ALLERGENS = [
  'Gluten',
  'Lactose',
  'Nuts',
  'Seafood',
  'Eggs',
  'Soy',
  'Fish'
] as const;
export type Allergen = typeof COMMON_ALLERGENS[number];

export const COMMON_AVOIDED_FOODS = [
  'Meat',
  'Dairy',
  'Sugar',
  'Alcohol',
  'Caffeine',
  'Spicy food',
  'Fried food'
] as const;
export type AvoidedFood = typeof COMMON_AVOIDED_FOODS[number];

