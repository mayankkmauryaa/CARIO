import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null, // 'rider' | 'driver' | 'both'

      // Actions
      setAuth: (user, token, refreshToken, role) => set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        role: role || user?.role
      }),

      setRole: (role) => set({ role }),

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),

      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        role: null
      }),

      // Getters
      getToken: () => get().token,
      getRole: () => get().role,
      isRider: () => {
        const role = get().role;
        return role === 'rider' || role === 'both';
      },
      isDriver: () => {
        const role = get().role;
        return role === 'driver' || role === 'both';
      }
    }),
    {
      name: 'cario-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        role: state.role
      })
    }
  )
);
