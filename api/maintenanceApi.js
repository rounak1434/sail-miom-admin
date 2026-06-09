import api from '@/lib/axios';
import { buildQueryString } from '@/lib/utils';

export const maintenanceApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get(`/maintenance${buildQueryString(params)}`);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/maintenance/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post('/maintenance', payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/maintenance/${id}`, payload);
    return data;
  },

  // Use the dedicated complete endpoint so the backend also auto-schedules the next cycle.
  complete: async (id, payload) => {
    const { data } = await api.put(`/maintenance/${id}/complete`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/maintenance/${id}`);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return (data.data || data).maintenanceStats || { overdue: 0, dueToday: 0, dueThisWeek: 0, completedThisMonth: 0 };
  },
};
