import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // This admin portal is for SUPERADMIN/ADMIN only. Engineers, contractors,
      // staff and public users belong on the mobile app — refuse them here even
      // though the backend authenticated them.
      const role = String(data.user?.role || '').toUpperCase();
      if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
        toast.error('This portal is for administrators only. Please use the SAIL-MIOM mobile app.');
        return;
      }
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      // Redirect is handled by the login page effect so it can honor the ?from= param.
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => toast.success('Password changed successfully'),
    onError: () => toast.error('Failed to change password'),
  });

  return {
    user,
    token,
    isAuthenticated,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
