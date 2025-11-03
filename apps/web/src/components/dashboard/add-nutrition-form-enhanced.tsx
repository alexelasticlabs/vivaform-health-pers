import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MEAL_TYPES, type CreateNutritionEntryPayload } from "@vivaform/shared";

import { createNutritionEntry, extractErrorMessage } from "../../api";
import { FoodAutocomplete } from "../nutrition/food-autocomplete";
import type { FoodItem } from "../../api/food";

const defaultState: CreateNutritionEntryPayload = {
  mealType: MEAL_TYPES[0],
  food: "",
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0
};

export const AddNutritionFormWithAutocomplete = ({ date }: { date: string }) => {
  const [form, setForm] = useState<CreateNutritionEntryPayload>({ ...defaultState, date });
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState("100");
  const [showManualInput, setShowManualInput] = useState(false);
  
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createNutritionEntry,
    onSuccess: () => {
      toast.success("Meal saved");
      setForm({ ...defaultState, date });
      setSelectedFood(null);
      setAmount("100");
      setShowManualInput(false);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setShowManualInput(false);
    
    // Auto-calculate macros based on amount
    const grams = Number(amount);
    const multiplier = grams / 100;
    
    setForm(prev => ({
      ...prev,
      food: food.name,
      calories: Math.round(food.caloriesPer100g * multiplier),
      protein: Number((food.proteinPer100g * multiplier).toFixed(1)),
      fat: Number((food.fatPer100g * multiplier).toFixed(1)),
      carbs: Number((food.carbsPer100g * multiplier).toFixed(1))
    }));
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    
    if (selectedFood && newAmount) {
      const grams = Number(newAmount);
      const multiplier = grams / 100;
      
      setForm(prev => ({
        ...prev,
        calories: Math.round(selectedFood.caloriesPer100g * multiplier),
        protein: Number((selectedFood.proteinPer100g * multiplier).toFixed(1)),
        fat: Number((selectedFood.fatPer100g * multiplier).toFixed(1)),
        carbs: Number((selectedFood.carbsPer100g * multiplier).toFixed(1))
      }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(form);
  };

  const handleChange = (field: keyof CreateNutritionEntryPayload) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.type === "number" ? Number(event.target.value) : event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const resetFoodSelection = () => {
    setSelectedFood(null);
    setForm(prev => ({ ...prev, food: "", calories: 0, protein: 0, fat: 0, carbs: 0 }));
    setAmount("100");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="font-medium">Meal</span>
          <select
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.mealType}
            onChange={handleChange("mealType")}
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Date & time</span>
          <input
            type="datetime-local"
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.date ?? ""}
            onChange={handleChange("date")}
          />
        </label>
      </div>

      {/* Enhanced Food Selection */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">What did you eat?</span>
          {selectedFood && (
            <button
              type="button"
              onClick={resetFoodSelection}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Change food
            </button>
          )}
        </div>

        {!selectedFood && !showManualInput ? (
          <div className="space-y-2">
            <FoodAutocomplete
              onSelect={handleFoodSelect}
              placeholder="Search food database..."
              className="w-full"
            />
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Or enter food manually
              </button>
            </div>
          </div>
        ) : selectedFood ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-green-900">{selectedFood.name}</div>
                {selectedFood.brand && (
                  <div className="text-sm text-green-700">{selectedFood.brand}</div>
                )}
                <div className="text-xs text-green-600 mt-1">
                  Per 100g: {selectedFood.caloriesPer100g} kcal • 
                  P: {selectedFood.proteinPer100g}g • 
                  F: {selectedFood.fatPer100g}g • 
                  C: {selectedFood.carbsPer100g}g
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                Verified ✓
              </span>
            </div>
          </div>
        ) : (
          <input
            type="text"
            required
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.food}
            onChange={handleChange("food")}
            placeholder="e.g. oatmeal with berries"
          />
        )}

        {/* Amount Input (only when food is selected from database) */}
        {selectedFood && (
          <div className="grid gap-1">
            <span className="text-sm font-medium">Amount (grams)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="rounded-2xl border border-border bg-background px-3 py-2"
              min="1"
              step="0.1"
              placeholder="100"
            />
          </div>
        )}
      </div>

      {/* Macronutrients */}
      <div className="grid gap-2 sm:grid-cols-4">
        <label className="grid gap-1">
          <span className="font-medium">Calories</span>
          <input
            type="number"
            required
            min="0"
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.calories}
            onChange={handleChange("calories")}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Protein (g)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.protein}
            onChange={handleChange("protein")}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Fat (g)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.fat}
            onChange={handleChange("fat")}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Carbs (g)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            className="rounded-2xl border border-border bg-background px-3 py-2"
            value={form.carbs}
            onChange={handleChange("carbs")}
          />
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Add meal"}
      </button>

      {/* Nutrition Preview (when food is selected) */}
      {selectedFood && amount && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="text-sm font-medium text-blue-900 mb-2">
            Nutrition for {amount}g of {selectedFood.name}:
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-blue-800">
            <div>
              <div className="font-medium">{form.calories}</div>
              <div>Calories</div>
            </div>
            <div>
              <div className="font-medium">{form.protein}g</div>
              <div>Protein</div>
            </div>
            <div>
              <div className="font-medium">{form.fat}g</div>
              <div>Fat</div>
            </div>
            <div>
              <div className="font-medium">{form.carbs}g</div>
              <div>Carbs</div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};