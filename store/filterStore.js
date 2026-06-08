'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFilterStore = create(
  persist(
    (set) => ({
      complaintsFilter: {
        status: '',
        priority: '',
        location_id: '',
        assigned_to: '',
        search: '',
        page: 1,
        limit: 20,
        sort: 'created_at',
        order: 'desc',
        dateFrom: '',
        dateTo: '',
      },
      drawingsFilter: {
        location_id: '',
        type: '',
        search: '',
        page: 1,
        limit: 20,
      },
      maintenanceFilter: {
        status: '',
        location_id: '',
        month: '',
        page: 1,
        limit: 20,
      },
      usersFilter: {
        role: '',
        location_id: '',
        search: '',
        page: 1,
      },
      reportsFilter: {
        type: 'complaints',
        from: '',
        to: '',
        location_id: '',
        status: '',
        priority: '',
      },

      setComplaintsFilter: (filter) =>
        set((state) => ({ complaintsFilter: { ...state.complaintsFilter, ...filter } })),
      setDrawingsFilter: (filter) =>
        set((state) => ({ drawingsFilter: { ...state.drawingsFilter, ...filter } })),
      setMaintenanceFilter: (filter) =>
        set((state) => ({ maintenanceFilter: { ...state.maintenanceFilter, ...filter } })),
      setUsersFilter: (filter) =>
        set((state) => ({ usersFilter: { ...state.usersFilter, ...filter } })),
      setReportsFilter: (filter) =>
        set((state) => ({ reportsFilter: { ...state.reportsFilter, ...filter } })),

      resetComplaintsFilter: () =>
        set({ complaintsFilter: { status: '', priority: '', location_id: '', assigned_to: '', search: '', page: 1, limit: 20, sort: 'created_at', order: 'desc', dateFrom: '', dateTo: '' } }),
    }),
    {
      name: 'sail-filters',
    }
  )
);
