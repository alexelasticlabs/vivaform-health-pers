import { apiClient } from "./client";

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  tier: "FREE" | "PREMIUM";
  createdAt: string;
  updatedAt: string;
  _count: {
    nutrition: number;
    water: number;
    weight: number;
    recommendations: number;
  };
}

export interface UserStats {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  activeToday: number;
  newThisWeek: number;
}

export interface SystemStats {
  nutritionEntries: number;
  waterEntries: number;
  weightEntries: number;
  recommendations: number;
  foodItems: number;
  mealTemplates: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getAllUsers = async (page = 1, limit = 50) => {
  const response = await apiClient.get<{ users: AdminUser[]; pagination: any }>(
    `/admin/users?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await apiClient.get("/admin/stats/users");
  return response.data;
};

export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await apiClient.get("/admin/stats/system");
  return response.data;
};

export const updateUserRole = async (userId: string, role: "USER" | "ADMIN") => {
  const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const getAdminFoodItems = async (verified?: boolean, page = 1, limit = 50) => {
  const params = new URLSearchParams();
  if (verified !== undefined) params.set("verified", verified.toString());
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await apiClient.get(`/admin/food-items?${params.toString()}`);
  return response.data;
};

export const verifyFoodItem = async (foodId: string, verified: boolean) => {
  const response = await apiClient.patch(`/admin/food-items/${foodId}/verify`, { verified });
  return response.data;
};

export const deleteFoodItem = async (foodId: string) => {
  const response = await apiClient.delete(`/admin/food-items/${foodId}`);
  return response.data;
};

export const getAllUsersFiltered = async (params: { q?: string; role?: string; tier?: string; regFrom?: string; regTo?: string; sortBy?: string; sortDir?: string; page?: number; limit?: number; }) => {
  const usp = new URLSearchParams();
  for (const [k,v] of Object.entries(params || {})) if (v !== undefined && v !== null) usp.set(k, String(v));
  const { data } = await apiClient.get(`/admin/users?${usp.toString()}`);
  return data;
};

export const exportUsersCsv = async (params: { q?: string; role?: string; tier?: string; regFrom?: string; regTo?: string; sortBy?: string; sortDir?: string; }) => {
  const usp = new URLSearchParams();
  for (const [k,v] of Object.entries(params || {})) if (v !== undefined && v !== null) usp.set(k, String(v));
  const { data } = await apiClient.get(`/admin/users/export.csv?${usp.toString()}`);
  return data as { filename: string; mime: string; body: string };
};

export const getUserDetails = async (id: string) => {
  const { data } = await apiClient.get(`/admin/users/${id}`);
  return data;
};

export const listSubscriptions = async (params: { status?: string; plan?: string; page?: number; limit?: number }) => {
  const usp = new URLSearchParams();
  for (const [k,v] of Object.entries(params || {})) if (v !== undefined && v !== null) usp.set(k, String(v));
  const { data } = await apiClient.get(`/admin/subs?${usp.toString()}`);
  return data;
};

export const listTickets = async (params: { status?: string; priority?: string; assignee?: string; page?: number; limit?: number }) => {
  const usp = new URLSearchParams();
  for (const [k,v] of Object.entries(params || {})) if (v !== undefined && v !== null) usp.set(k, String(v));
  const { data } = await apiClient.get(`/admin/tickets?${usp.toString()}`);
  return data;
};

export const getTicket = async (id: string) => {
  const { data } = await apiClient.get(`/admin/tickets/${id}`);
  return data;
};

export const updateTicket = async (id: string, patch: { status?: string; priority?: string; assignedTo?: string }) => {
  const { data } = await apiClient.patch(`/admin/tickets/${id}`, patch);
  return data;
};

export const replyTicket = async (id: string, body: string) => {
  const { data } = await apiClient.patch(`/admin/tickets/${id}/reply`, { body });
  return data;
};

export const getSettings = async () => { const { data } = await apiClient.get('/admin/settings'); return data; };
export const patchSettings = async (patch: Record<string, unknown>) => { const { data } = await apiClient.patch('/admin/settings', patch); return data; };

// Re-export admin overview helpers so consumers can import from '@/api/admin'
export { getOverviewKpis, getRevenueTrend, getNewUsers, getSubsDistribution, getActivityHeatmap, getSystemHealth } from './admin-overview';
