'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sail_token', token);
          localStorage.setItem('sail_user', JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sail_token');
          localStorage.removeItem('sail_user');
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

      getUser: () => get().user,
      getToken: () => get().token,
    }),
    {
      name: 'sail-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
