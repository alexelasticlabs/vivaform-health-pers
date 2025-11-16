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

// === Feature Toggles ===
export const listFeatureToggles = async () => {
  const { data } = await apiClient.get('/admin/feature-toggles');
  return data;
};

export const getFeatureToggle = async (key: string) => {
  const { data } = await apiClient.get(`/admin/feature-toggles/${key}`);
  return data;
};

export const updateFeatureToggle = async (key: string, dto: { enabled?: boolean; rolloutPercent?: number; description?: string; metadata?: any }) => {
  const { data } = await apiClient.patch(`/admin/feature-toggles/${key}`, dto);
  return data;
};

// === Audit Logs ===
export const getAuditLogs = async (filters: { action?: string; entity?: string; userId?: string; page?: number; limit?: number }) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(filters || {})) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v));
  }
  const { data } = await apiClient.get(`/admin/audit-logs?${usp.toString()}`);
  return data;
};

// === Support ===
export const listTickets = async (params: { status?: string; priority?: string; assignee?: string; page?: number; limit?: number }) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v));
  }
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

// === Subscriptions ===
export const listSubscriptions = async (params: { status?: string; plan?: string; page?: number; limit?: number }) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v));
  }
  const { data } = await apiClient.get(`/admin/subs?${usp.toString()}`);
  return data;
};

// === Settings ===
export const getSettings = async () => {
  const { data } = await apiClient.get('/admin/settings');
  return data;
};

export const patchSettings = async (patch: Record<string, unknown>) => {
  const { data } = await apiClient.patch('/admin/settings', patch);
  return data;
};

export const adminApi = {
  getAllUsers,
  getAllUsersFiltered,
  getUserStats,
  getSystemStats,
  updateUserRole,
  getAdminFoodItems,
  verifyFoodItem,
  deleteFoodItem,
  exportUsersCsv,
  listFeatureToggles,
  getFeatureToggle,
  updateFeatureToggle,
  getAuditLogs,
  listTickets,
  getTicket,
  updateTicket,
  replyTicket,
  listSubscriptions,
  getSettings,
  patchSettings,
};

// Re-export admin overview helpers so consumers can import from '@/api/admin'
export { getOverviewKpis, getRevenueTrend, getNewUsers, getSubsDistribution, getActivityHeatmap, getSystemHealth } from './admin-overview';
