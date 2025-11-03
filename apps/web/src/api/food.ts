import { apiClient } from "./client";

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  servingSize?: string;
  servingSizeGrams?: number;
  barcode?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFoodsResponse {
  foods: FoodItem[];
  totalCount: number;
}

export interface SearchFoodsParams {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export const searchFoods = async (params: SearchFoodsParams): Promise<SearchFoodsResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.query) searchParams.set("query", params.query);
  if (params.category) searchParams.set("category", params.category);
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.offset) searchParams.set("offset", params.offset.toString());
  
  const response = await apiClient.get(`/nutrition/foods/search?${searchParams.toString()}`);
  return response.data;
};

export const getFoodCategories = async (): Promise<string[]> => {
  const response = await apiClient.get("/nutrition/foods/categories");
  return response.data;
};

export const getPopularFoods = async (): Promise<FoodItem[]> => {
  const response = await apiClient.get("/nutrition/foods/popular");
  return response.data;
};