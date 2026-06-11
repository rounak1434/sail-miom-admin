import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s — keep admin views fresh without hammering the API
      gcTime: 1000 * 60 * 10, // 10 minutes (v5 rename of cacheTime)
      // Fail fast when the backend is unreachable instead of hanging on skeletons.
      retry: 1,
      retryDelay: 800,
      // Auto-refresh when the admin returns to the tab so changes made elsewhere
      // (mobile app, another admin) show up without a manual reload.
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
