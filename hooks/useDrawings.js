import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { drawingsApi } from '@/api/drawingsApi';
import { toast } from 'sonner';

export function useDrawings(params = {}) {
  return useQuery({ queryKey: ['drawings', params], queryFn: () => drawingsApi.getAll(params), placeholderData: keepPreviousData });
}

export function useDrawingCategories() {
  return useQuery({ queryKey: ['drawing-categories'], queryFn: drawingsApi.getCategories });
}

// Refresh the drawing list, the category counts, and the dashboard
// (which shows a total-drawings stat).
function invalidateDrawingData(qc) {
  qc.invalidateQueries({ queryKey: ['drawings'] });
  qc.invalidateQueries({ queryKey: ['drawing-categories'] });
  qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
}

export function useUploadDrawing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: drawingsApi.create,
    onSuccess: () => { toast.success('Drawing uploaded successfully'); invalidateDrawingData(qc); },
    onError: () => toast.error('Failed to upload drawing'),
  });
}

export function useUpdateDrawing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => drawingsApi.update(id, payload),
    onSuccess: () => { toast.success('Drawing updated'); invalidateDrawingData(qc); },
    onError: () => toast.error('Failed to update drawing'),
  });
}

export function useBulkUploadDrawing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => drawingsApi.bulkUpload(formData),
    onSuccess: (res) => {
      toast.success(res?.message || 'Drawings uploaded');
      invalidateDrawingData(qc);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Bulk upload failed'),
  });
}

export function useDeleteDrawing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: drawingsApi.delete,
    onSuccess: () => { toast.success('Drawing deleted'); invalidateDrawingData(qc); },
    onError: () => toast.error('Failed to delete drawing'),
  });
}
