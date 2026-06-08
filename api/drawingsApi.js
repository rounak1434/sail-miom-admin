import api from '@/lib/axios';
import { buildQueryString } from '@/lib/utils';

export const drawingsApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get(`/drawings${buildQueryString(params)}`);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/drawings/${id}`);
    return data;
  },

  // Fetch a fresh, short-lived signed S3 URL on demand (the list endpoint
  // doesn't include one, and signed URLs expire ~1h so we mint one per click).
  getDownloadUrl: async (id) => {
    const { data } = await api.get(`/drawings/${id}/download`);
    return data.downloadUrl || data.data?.downloadUrl || null;
  },

  create: async (formData) => {
    const { data } = await api.post('/drawings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/drawings/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/drawings/${id}`);
    return data;
  },

  bulkUpload: async (formData, onProgress) => {
    const { data } = await api.post('/drawings/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    });
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get('/drawings/categories');
    // Backend returns { success: true, data: [{type, count}] } — unwrap and prepend "All"
    const items = data.data || data;
    const list = Array.isArray(items) ? items : [];
    const total = list.reduce((s, c) => s + c.count, 0);
    return [{ type: 'All', count: total }, ...list];
  },
};
