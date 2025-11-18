import { apiClient } from './client';

export type CreateActivityLogPayload = {
  date?: string;
  type?: string;
  steps?: number;
  durationMin?: number;
  calories?: number;
  note?: string;
};

export const createActivityLog = async (payload: CreateActivityLogPayload) => {
  const { data } = await apiClient.post<{ id: string; ok: boolean }>("/dashboard/activity", payload);
  return data;
};
