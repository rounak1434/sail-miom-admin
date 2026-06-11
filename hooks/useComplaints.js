import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { complaintsApi } from '@/api/complaintsApi';
import { toast } from 'sonner';

// Poll every 15s so complaints raised elsewhere (mobile app / another admin) appear
// live while this page is open. refetchIntervalInBackground stays false (default), so
// it only polls while the tab is focused — no wasted requests on a backgrounded tab.
const LIVE_POLL_MS = 15000;

export function useComplaints(params = {}) {
  return useQuery({
    queryKey: ['complaints', params],
    queryFn: () => complaintsApi.getAll(params),
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_POLL_MS,
  });
}

export function useComplaint(id) {
  return useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintsApi.getById(id),
    enabled: !!id,
    refetchInterval: LIVE_POLL_MS,
  });
}

export function useComplaintTimeline(id) {
  return useQuery({
    queryKey: ['complaint-timeline', id],
    queryFn: () => complaintsApi.getTimeline(id),
    enabled: !!id,
    refetchInterval: LIVE_POLL_MS,
  });
}

// Refresh everything a complaint change can affect: the list, the single
// complaint, its timeline, and the dashboard/tab counts.
function invalidateComplaintData(qc, id) {
  qc.invalidateQueries({ queryKey: ['complaints'] });
  qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
  if (id != null) {
    qc.invalidateQueries({ queryKey: ['complaint', id] });
    qc.invalidateQueries({ queryKey: ['complaint-timeline', id] });
  }
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintsApi.create,
    onSuccess: () => { toast.success('Complaint raised successfully'); invalidateComplaintData(qc); },
    onError: () => toast.error('Failed to raise complaint'),
  });
}

export function useUpdateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => complaintsApi.update(id, data),
    onSuccess: (_, { id }) => { toast.success('Complaint updated'); invalidateComplaintData(qc, id); },
    onError: () => toast.error('Failed to update complaint'),
  });
}

export function useAssignComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => complaintsApi.assign(id, data),
    onSuccess: (_, { id }) => { toast.success('Complaint assigned successfully'); invalidateComplaintData(qc, id); },
    onError: () => toast.error('Failed to assign complaint'),
  });
}

export function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => complaintsApi.updateStatus(id, data),
    onSuccess: (_, { id }) => { toast.success('Status updated'); invalidateComplaintData(qc, id); },
    onError: () => toast.error('Failed to update status'),
  });
}

export function useDeleteComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintsApi.delete,
    onSuccess: () => { toast.success('Complaint deleted'); invalidateComplaintData(qc); },
    onError: () => toast.error('Failed to delete complaint'),
  });
}
