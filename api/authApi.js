import api from '@/lib/axios';

function setAuthCookie(token) {
  if (typeof document !== 'undefined') {
    document.cookie = `sail_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
}

function clearAuthCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'sail_token=; path=/; max-age=0; SameSite=Lax';
  }
}

export const authApi = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.token) setAuthCookie(data.token);
    return data;
  },

  logout: async () => {
    clearAuthCookie();
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
  },

  refresh: async () => {
    const { data } = await api.post('/auth/refresh');
    if (data.token) setAuthCookie(data.token);
    return data;
  },

  changePassword: async (payload) => {
    const { data } = await api.put('/auth/change-password', payload);
    return data;
  },

  // Email-based reset. forgotPassword always resolves the same way (the backend
  // does not reveal whether the email matched an account).
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async ({ token, newPassword }) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },
};
