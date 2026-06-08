import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sail-miom.ddns.net/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // for httpOnly cookies
  timeout: 30000,
});

// Request interceptor: attach token from localStorage if available (client-side fallback)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sail_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401, 403, 500
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 && !error.config?.url?.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          // Clear EVERY auth artifact, otherwise the leftover cookie/zustand store
          // makes the middleware bounce /login → /dashboard in a redirect loop.
          localStorage.removeItem('sail_token');
          localStorage.removeItem('sail_user');
          localStorage.removeItem('sail-auth'); // zustand persist key
          document.cookie = 'sail_token=; path=/; max-age=0; SameSite=Lax';
          // Avoid a reload loop if we're already on the login page.
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?expired=true';
          }
        }
      } else if (status === 403) {
        console.warn('Access forbidden:', error.config?.url);
      } else if (status >= 500) {
        console.error('Server error:', status, error.config?.url);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
