import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setAuth: (accessToken: string) => void;
  logout: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (accessToken: string) =>
    set({
      accessToken,
      isAuthenticated: true,
      isInitialized: true,
    }),

  logout: () =>
    set({
      accessToken: null,
      isAuthenticated: false,
    }),

  setInitialized: () =>
    set({
      isInitialized: true,
    }),
}));
