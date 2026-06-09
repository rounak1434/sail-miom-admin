import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '@/api/maintenanceApi';
import { toast } from 'sonner';

export function useMaintenance(params = {}) {
  return useQuery({ queryKey: ['maintenance', params], queryFn: () => maintenanceApi.getAll(params), keepPreviousData: true });
}

// Refresh the schedule list, the maintenance stat cards, and the dashboard
// (which surfaces overdue/due maintenance counts).
export function invalidateMaintenanceData(qc) {
  qc.invalidateQueries({ queryKey: ['maintenance'] });
  qc.invalidateQueries({ queryKey: ['maintenance-stats'] });
  qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => { toast.success('Maintenance schedule created'); invalidateMaintenanceData(qc); },
    onError: () => toast.error('Failed to create schedule'),
  });
}

export function useUpdateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => maintenanceApi.update(id, data),
    onSuccess: () => { toast.success('Schedule updated'); invalidateMaintenanceData(qc); },
    onError: () => toast.error('Failed to update schedule'),
  });
}

export function useDeleteMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: maintenanceApi.delete,
    onSuccess: () => { toast.success('Schedule deleted'); invalidateMaintenanceData(qc); },
    onError: () => toast.error('Failed to delete schedule'),
  });
}
