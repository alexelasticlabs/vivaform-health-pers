/**
 * Dashboard V2 API Client
 * API calls for the new dashboard features
 */

import { apiClient } from './client';
import type { DailyDashboardResponse } from '@/types/dashboard.types';

/**
 * Fetch comprehensive daily dashboard data
 */
export const fetchDailyDashboardV2 = async (date?: string): Promise<DailyDashboardResponse> => {
  const params = date ? { date } : {};
  const { data } = await apiClient.get<DailyDashboardResponse>('/dashboard/v2/daily', { params });
  return data;
};

/**
 * Get user achievements
 */
export const fetchUserAchievements = async () => {
  const { data } = await apiClient.get('/achievements');
  return data;
};

/**
 * Get user streaks
 */
export const fetchUserStreaks = async () => {
  const { data } = await apiClient.get('/streaks');
  return data;
};

/**
 * Update user goal
 */
export const updateUserGoal = async (goalData: {
  type: string;
  target: number;
  deadline?: Date;
}) => {
  const { data } = await apiClient.patch('/profile/goal', goalData);
  return data;
};

/**
 * Track analytics event
 */
export const trackDashboardEvent = async (event: {
  name: string;
  properties: Record<string, any>;
}) => {
  const { data } = await apiClient.post('/analytics/track', event);
  return data;
};

/**
 * Get health score history
 */
export const fetchHealthScoreHistory = async (days: number = 30) => {
  const { data } = await apiClient.get('/dashboard/v2/health-score-history', {
    params: { days },
  });
  return data;
};
