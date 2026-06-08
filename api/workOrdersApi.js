import api from '@/lib/axios';

export const workOrdersApi = {
  getWorkOrders: async (params = {}) => {
    const { data } = await api.get('/work-orders', { params });
    return data;
  },

  getWorkOrderById: async (id) => {
    const { data } = await api.get(`/work-orders/${id}`);
    return data;
  },

  createWorkOrder: async (payload) => {
    const { data } = await api.post('/work-orders', payload);
    return data;
  },

  updateWorkOrder: async (id, payload) => {
    const { data } = await api.put(`/work-orders/${id}`, payload);
    return data;
  },

  deleteWorkOrder: async (id) => {
    const { data } = await api.delete(`/work-orders/${id}`);
    return data;
  },
};
