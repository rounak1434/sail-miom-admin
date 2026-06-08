import api from '@/lib/axios';

export const settingsApi = {
  getLocations: async () => { const { data } = await api.get('/settings/locations'); return Array.isArray(data) ? data : (data.data || data); },
  createLocation: async (payload) => { const { data } = await api.post('/settings/locations', payload); return data; },
  updateLocation: async (id, payload) => { const { data } = await api.put(`/settings/locations/${id}`, payload); return data; },
  deleteLocation: async (id) => { const { data } = await api.delete(`/settings/locations/${id}`); return data; },
  getInstallationTypes: async () => { const { data } = await api.get('/settings/installation-types'); return Array.isArray(data) ? data : (data.data || data); },
  createInstallationType: async (payload) => { const { data } = await api.post('/settings/installation-types', payload); return data; },
  updateInstallationType: async (id, payload) => { const { data } = await api.put(`/settings/installation-types/${id}`, payload); return data; },
  deleteInstallationType: async (id) => { const { data } = await api.delete(`/settings/installation-types/${id}`); return data; },
  getInstallations: async (params = {}) => { const { data } = await api.get('/settings/installations', { params }); return Array.isArray(data) ? data : (data.data || []); },
  createInstallation: async (payload) => { const { data } = await api.post('/settings/installations', payload); return data; },
  updateInstallation: async (id, payload) => { const { data } = await api.put(`/settings/installations/${id}`, payload); return data; },
  deleteInstallation: async (id) => { const { data } = await api.delete(`/settings/installations/${id}`); return data; },
  getSlaConfig: async () => { const { data } = await api.get('/settings/sla-config'); return data.data || data; },
  updateSlaConfig: async (payload) => { const { data } = await api.put('/settings/sla-config', payload); return data; },
};
