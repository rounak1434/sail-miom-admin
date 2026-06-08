import api from '@/lib/axios';
import { buildQueryString } from '@/lib/utils';

export const reportsApi = {
  getComplaints: async (params = {}) => {
    const { data } = await api.get(`/reports/complaints${buildQueryString(params)}`);
    return data;
  },
  getSla: async (params = {}) => {
    const { data } = await api.get(`/reports/sla${buildQueryString(params)}`);
    return data.data || data;
  },
  getMaintenance: async (params = {}) => {
    const { data } = await api.get(`/reports/maintenance${buildQueryString(params)}`);
    return data.data || data;
  },
  getContractorPerformance: async (params = {}) => {
    const { data } = await api.get(`/reports/contractor-performance${buildQueryString(params)}`);
    return Array.isArray(data) ? data : (data.data || []);
  },
  getDepartment: async (params = {}) => {
    const { data } = await api.get(`/reports/department${buildQueryString(params)}`);
    return Array.isArray(data) ? data : (data.data || []);
  },
  // FIX #5: real Excel export with date range
  exportExcel: async (params = {}) => {
    const response = await api.get(`/reports/export/excel${buildQueryString(params)}`, { responseType: 'blob' });
    return response.data;
  },
  // FIX #5: real PDF export
  exportPdf: async (params = {}) => {
    const response = await api.get(`/reports/export/pdf${buildQueryString(params)}`, { responseType: 'blob' });
    return response.data;
  },
};
