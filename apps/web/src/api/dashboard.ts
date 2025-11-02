import {
  CreateNutritionEntryPayload,
  CreateWaterEntryPayload,
  CreateWeightEntryPayload,
  DailyDashboardResponse,
  NutritionEntry,
  WaterEntry,
  WeightEntry
} from "@vivaform/shared";

import { apiClient } from "./client";

export const fetchDailyDashboard = async (date?: string) => {
  const { data } = await apiClient.get<DailyDashboardResponse>("/dashboard/daily", {
    params: { date }
  });
  return data;
};

export const createNutritionEntry = async (payload: CreateNutritionEntryPayload) => {
  const { data } = await apiClient.post<NutritionEntry>("/nutrition", payload);
  return data;
};

export const createWaterEntry = async (payload: CreateWaterEntryPayload) => {
  const { data } = await apiClient.post<WaterEntry>("/water", payload);
  return data;
};

export const createWeightEntry = async (payload: CreateWeightEntryPayload) => {
  const { data } = await apiClient.post<WeightEntry>("/weight", payload);
  return data;
};