import api from '@/lib/axios';
import { buildQueryString } from '@/lib/utils';

export const usersApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get(`/users${buildQueryString(params)}`);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post('/users', payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  deactivate: async (id) => {
    const { data } = await api.put(`/users/${id}/deactivate`);
    return data;
  },

  activate: async (id) => {
    const { data } = await api.put(`/users/${id}/activate`);
    return data;
  },

  resetPassword: async (id, payload) => {
    const { data } = await api.put(`/users/${id}/reset-password`, payload);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/users/me');
    return data.data || data;
  },

  updateMe: async (payload) => {
    const { data } = await api.put('/users/me', payload);
    return data.data || data;
  },
};
