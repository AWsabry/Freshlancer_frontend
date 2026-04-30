import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: !!authService.getCurrentUser(),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    const response = await authService.login(email, password);
    set({ user: response.data.user, isAuthenticated: true });
    return response;
  },

  register: async (userData) => {
    const response = await authService.register(userData);
    // Response is already unwrapped by interceptor, so structure is:
    // { status: 'success', token: '...', data: { user: {...} } }
    const user = response.data?.user || response.user;
    if (user) {
      set({ user, isAuthenticated: true });
    }
    return response;
  },

  logout: async () => {
    // Clear auth service storage
    await authService.logout();
    // Reset all state
    set({ user: null, isAuthenticated: false });
  },
}));
