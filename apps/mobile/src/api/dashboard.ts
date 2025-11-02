import {
  CreateNutritionEntryPayload,
  CreateWaterEntryPayload,
  DailyDashboardResponse,
  NutritionEntry,
  WaterEntry
} from "@vivaform/shared";

import { request } from "./client";

export const fetchDailyDashboard = (date?: string) =>
  request<DailyDashboardResponse>("/dashboard/daily" + (date ? `?date=${date}` : ""));

export const createNutritionEntry = (payload: CreateNutritionEntryPayload) =>
  request<NutritionEntry>("/nutrition", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const createWaterEntry = (payload: CreateWaterEntryPayload) =>
  request<WaterEntry>("/water", {
    method: "POST",
    body: JSON.stringify(payload)
  });