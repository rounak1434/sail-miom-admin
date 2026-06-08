import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/usersApi';
import { toast } from 'sonner';

export function useUsers(params = {}) {
  return useQuery({ queryKey: ['users', params], queryFn: () => usersApi.getAll(params), keepPreviousData: true });
}

// Refresh both the user list and the per-role/status count cards on the Users page.
function invalidateUserData(qc) {
  qc.invalidateQueries({ queryKey: ['users'] });
  qc.invalidateQueries({ queryKey: ['users-count'] });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { toast.success('User created successfully'); invalidateUserData(qc); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create user'),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => usersApi.update(id, data),
    onSuccess: () => { toast.success('User updated'); invalidateUserData(qc); },
    onError: () => toast.error('Failed to update user'),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => { toast.success('User deactivated'); invalidateUserData(qc); },
    onError: () => toast.error('Failed to deactivate user'),
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.activate,
    onSuccess: () => { toast.success('User activated'); invalidateUserData(qc); },
    onError: () => toast.error('Failed to activate user'),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, ...data }) => usersApi.resetPassword(id, data),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: () => toast.error('Failed to reset password'),
  });
}
