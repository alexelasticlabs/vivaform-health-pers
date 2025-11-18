import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";

import { searchFoods, getPopularFoods, type FoodItem, type SearchFoodsResponse } from "@/api";

interface FoodAutocompleteProps {
  onSelect: (food: FoodItem) => void;
  placeholder?: string;
  className?: string;
}

/**
 * FoodAutocomplete
 *
 * Autocomplete component for searching foods.
 * Supports debounced search, categories, and popular items.
 */
export function FoodAutocomplete({ onSelect, placeholder = "Search foods...", className = "" }: FoodAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search foods API call
  const { data: searchResponse, isLoading: isSearching } = useQuery<SearchFoodsResponse>({
    queryKey: ["foods", "search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { foods: [], totalCount: 0 } as SearchFoodsResponse;

      return await searchFoods({
        query: debouncedQuery,
        limit: 10
      });
    },
    enabled: debouncedQuery.trim().length > 0
  });

  // Popular foods for empty state
  const { data: popularFoods } = useQuery<FoodItem[]>({
    queryKey: ["foods", "popular"],
    queryFn: getPopularFoods
  });

  const searchResults: FoodItem[] = searchResponse?.foods || [];

  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    setIsOpen(true);
  }, []);

  const handleSelect = useCallback((food: FoodItem) => {
    onSelect(food);
    setSearchQuery("");
    setIsOpen(false);
  }, [onSelect]);

  const displayFoods: FoodItem[] | undefined = searchQuery.trim() ? searchResults : popularFoods?.slice(0, 8);
  const showResults = isOpen && ((displayFoods?.length ?? 0) > 0 || isSearching);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow click
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">
              {searchQuery.trim() ? "Search results" : "Popular foods"}
            </span>
          </div>

          {/* Loading */}
          {isSearching && (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching foods...
            </div>
          )}

          {/* Results */}
          {displayFoods?.map((food: FoodItem) => (
            <button
              key={food.id}
              onClick={() => handleSelect(food)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{food.name}</span>
                    {food.verified && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {food.brand && (
                      <span className="text-sm text-gray-600">{food.brand}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {food.category}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-500">
                    {food.servingSize} • {food.caloriesPer100g} kcal/100g
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-600 ml-4">
                  <div className="font-medium">{food.caloriesPer100g} kcal</div>
                  <div className="text-xs">
                    Protein: {food.proteinPer100g}g • Fat: {food.fatPer100g}g • Carbs: {food.carbsPer100g}g
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* No Results */}
          {!isSearching && searchQuery.trim() && (!displayFoods || displayFoods.length === 0) && (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="mb-2">No results</div>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <Plus className="w-4 h-4" />
                Add new food
              </button>
            </div>
          )}

          {/* Empty Popular Foods */}
          {!searchQuery.trim() && (!popularFoods || (popularFoods as FoodItem[]).length === 0) && (
            <div className="px-4 py-8 text-center text-gray-500">
              Food database is empty
            </div>
          )}
        </div>
      )}
    </div>
  );
}
