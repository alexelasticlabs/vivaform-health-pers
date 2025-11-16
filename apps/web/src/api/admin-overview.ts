import { apiClient } from './client';

export const getOverviewKpis = async () => {
  const { data } = await apiClient.get('/admin/overview/kpis');
  return data;
};

export const getRevenueTrend = async () => {
  const { data } = await apiClient.get('/admin/overview/revenue-trend');
  return data;
};

export const getNewUsers = async (compare = false) => {
  const { data } = await apiClient.get('/admin/overview/new-users', { params: { compare: compare ? '1' : undefined } });
  return data as { current: Array<{ date: string; count: number }>; prev?: Array<{ date: string; count: number }>; };
};

export const getSubsDistribution = async () => {
  const { data } = await apiClient.get('/admin/overview/subscriptions-distribution');
  return data as { free: number; monthly: number; quarterly: number; annual: number };
};

export const getActivityHeatmap = async (from?: string, to?: string) => {
  const { data } = await apiClient.get('/admin/overview/activity-heatmap', { params: { from, to } });
  return data as Array<{ weekday: number; hour: number; count: number }>;
};

export const getSystemHealth = async () => {
  const { data } = await apiClient.get('/admin/overview/system-health');
  return data as { api: { avg: number; p95: number }; db: { status: string; latency: number }; redis: { status: string }; stripe: { status: string; lastOk?: string | null } };
};
