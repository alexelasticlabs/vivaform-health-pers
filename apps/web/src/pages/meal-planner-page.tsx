import { useQuery } from "@tanstack/react-query";
import { Calendar, ChefHat, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getMealPlan, type DayPlan } from "../api";
import { useUserStore } from "../store/user-store";

export function MealPlannerPage() {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const isPremium = !!profile && profile.tier === "PREMIUM";

  // Load meal plan from backend
  const {
    data: mealPlan,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["meal-plan"],
    queryFn: getMealPlan,
    retry: false,
    enabled: isPremium
  });

  if (!isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meal Planner</h1>
          <p className="text-gray-600 mb-6">
            Personal meal planner is available only for premium users
          </p>
          <div className="space-y-3">
            <Link
              to="/premium"
              className="block w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition"
            >
              Upgrade to Premium
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="block w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized meal plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">
            {(error as Error).message || 'Failed to load meal plan'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return null;
  }

  const selectedDay = mealPlan.days[selectedDayIndex];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
                <p className="text-sm text-gray-600">Your personal weekly meal plan</p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              <TrendingUp className="w-4 h-4" />
              Refresh Plan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Weekly Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Weekly Averages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {mealPlan.weeklyAverages.calories}
              </p>
              <p className="text-sm text-gray-600">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {mealPlan.weeklyAverages.protein}g
              </p>
              <p className="text-sm text-gray-600">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{mealPlan.weeklyAverages.fat}g</p>
              <p className="text-sm text-gray-600">Fat</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {mealPlan.weeklyAverages.carbs}g
              </p>
              <p className="text-sm text-gray-600">Carbs</p>
            </div>
          </div>

          {/* Progress bars for target vs actual */}
          <div className="mt-6 space-y-3">
            <MacroProgress
              label="Calories"
              actual={mealPlan.weeklyAverages.calories}
              target={mealPlan.targetMacros.calories}
              color="blue"
            />
            <MacroProgress
              label="Protein"
              actual={mealPlan.weeklyAverages.protein}
              target={mealPlan.targetMacros.protein}
              color="green"
              unit="g"
            />
            <MacroProgress
              label="Fat"
              actual={mealPlan.weeklyAverages.fat}
              target={mealPlan.targetMacros.fat}
              color="yellow"
              unit="g"
            />
            <MacroProgress
              label="Carbs"
              actual={mealPlan.weeklyAverages.carbs}
              target={mealPlan.targetMacros.carbs}
              color="orange"
              unit="g"
            />
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {mealPlan.days.map((day, index) => (
            <button
              key={day.date}
              onClick={() => setSelectedDayIndex(index)}
              data-testid={`planner-day-${index}`}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition ${
                selectedDayIndex === index
                  ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="text-center">
                <p className="text-xs opacity-80">{dayNames[index]}</p>
                <p className="font-bold">{new Date(day.date).getDate()}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Day Content */}
        {selectedDay && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Meals List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Menu for {new Date(selectedDay.date).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              {selectedDay.meals.map((meal, index) => (
                <MealCard key={index} meal={meal} />
              ))}
            </div>

            {/* Daily Totals Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Totals</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Calories</span>
                    <span className="text-xl font-bold text-blue-600" data-testid="planner-total-calories">
                      {selectedDay.dailyTotals.calories}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Protein</span>
                    <span className="text-xl font-bold text-green-600">
                      {selectedDay.dailyTotals.protein}g
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Fat</span>
                    <span className="text-xl font-bold text-yellow-600">
                      {selectedDay.dailyTotals.fat}g
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Carbs</span>
                    <span className="text-xl font-bold text-orange-600">
                      {selectedDay.dailyTotals.carbs}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Meal card component
function MealCard({ meal }: { meal: DayPlan["meals"][0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
              {meal.mealType}
            </span>
            <h3 className="text-lg font-bold text-gray-900">{meal.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{meal.cookingTimeMinutes} min</span>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{meal.calories}</p>
            <p className="text-xs text-gray-500">kcal</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{meal.protein}g</p>
            <p className="text-xs text-gray-500">protein</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-600">{meal.fat}g</p>
            <p className="text-xs text-gray-500">fat</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600">{meal.carbs}g</p>
            <p className="text-xs text-gray-500">carbs</p>
          </div>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? "Collapse" : "Show ingredients and recipe →"}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Ingredients:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {meal.ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>
            {meal.instructions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Instructions:</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{meal.instructions}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Macro progress bar component
function MacroProgress({
  label,
  actual,
  target,
  color,
  unit = ""
}: {
  label: string;
  actual: number;
  target: number;
  color: string;
  unit?: string;
}) {
  const percentage = Math.min((actual / target) * 100, 100);
  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
    orange: "bg-orange-600"
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-600">
          {actual}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${colorClasses[color as keyof typeof colorClasses]} h-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
