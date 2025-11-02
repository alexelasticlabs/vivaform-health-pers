import type { WeightEntry } from "@vivaform/shared";

import { apiClient } from "./client";

export type WeightHistoryParams = {
  date?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export type WeightProgressResponse = {
  delta: number;
  start: WeightEntry | null;
  end: WeightEntry | null;
};

export const fetchWeightHistory = async (params?: WeightHistoryParams) => {
  const { data } = await apiClient.get<WeightEntry[]>("/weight", {
    params
  });
  return data;
};

export const fetchWeightProgress = async (params?: WeightHistoryParams) => {
  const { data } = await apiClient.get<WeightProgressResponse>("/weight/progress", {
    params
  });
  return data;
};
