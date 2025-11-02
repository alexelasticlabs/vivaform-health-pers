import type { RecommendationEntry } from "@vivaform/shared";

import { apiClient } from "./client";

export const fetchDailyRecommendations = async (date?: string) => {
  const { data } = await apiClient.get<RecommendationEntry[]>("/recommendations", {
    params: { date }
  });
  return data;
};

export const fetchLatestRecommendations = async (limit = 5) => {
  const { data } = await apiClient.get<RecommendationEntry[]>("/recommendations/latest", {
    params: { limit }
  });
  return data;
};
