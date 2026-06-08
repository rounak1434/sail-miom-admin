import api from '@/lib/axios';

export const dashboardApi = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return data.data || data;
  },

  getComplaintsChart: async (period = 'week') => {
    const { data } = await api.get(`/dashboard/complaints-chart?period=${period}`);
    return data.data || data;
  },

  getLocationStats: async () => {
    const { data } = await api.get('/dashboard/location-stats');
    return Array.isArray(data) ? data : (data.data || []);
  },

  getRecentActivity: async () => {
    const { data } = await api.get('/dashboard/recent-activity');
    return Array.isArray(data) ? data : (data.data || []);
  },
};
