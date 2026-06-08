import api from '@/lib/axios';
import { buildQueryString } from '@/lib/utils';

export const complaintsApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get(`/complaints${buildQueryString(params)}`);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/complaints/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post('/complaints', payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/complaints/${id}`, payload);
    return data;
  },

  assign: async (id, payload) => {
    const { data } = await api.put(`/complaints/${id}/assign`, payload);
    return data;
  },

  updateStatus: async (id, payload) => {
    const { data } = await api.put(`/complaints/${id}/status`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/complaints/${id}`);
    return data;
  },

  getTimeline: async (id) => {
    const { data } = await api.get(`/complaints/${id}/timeline`);
    return data.data ?? data;
  },

  addComment: async (id, payload) => {
    const { data } = await api.post(`/complaints/${id}/comments`, payload);
    return data;
  },

  addAttachments: async (id, files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const { data } = await api.post(`/complaints/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteAttachment: async (id, attachmentId) => {
    const { data } = await api.delete(`/complaints/${id}/attachments/${attachmentId}`);
    return data;
  },

  export: async (params) => {
    // Backend exposes the Excel export under /reports/export/excel
    const response = await api.get(`/reports/export/excel${buildQueryString(params)}`, { responseType: 'blob' });
    return response.data;
  },
};
