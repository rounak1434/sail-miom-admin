import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';

export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.getStats, staleTime: 1000 * 60 });
}

export function useComplaintsChart(period = 'week') {
  return useQuery({ queryKey: ['complaints-chart', period], queryFn: () => dashboardApi.getComplaintsChart(period) });
}

export function useLocationStats() {
  return useQuery({ queryKey: ['location-stats'], queryFn: dashboardApi.getLocationStats });
}

export function useRecentActivity() {
  return useQuery({ queryKey: ['recent-activity'], queryFn: dashboardApi.getRecentActivity, refetchInterval: 30000 });
}
