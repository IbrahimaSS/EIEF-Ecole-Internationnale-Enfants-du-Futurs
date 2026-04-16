import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthStore, LoginCredentials, User } from "../types/auth";
import { ApiError } from "../services/api";
import { fetchAuthenticatedUser, loginRequest } from "../services/authService";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erreur de connexion";
};

const clearAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const authResponse = await loginRequest(credentials);
          const user = await fetchAuthenticatedUser(authResponse.token);

          set({
            user,
            token: authResponse.token,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
            error: null,
          });

          return user.role;
        } catch (error) {
          set({
            ...clearAuthState,
            isInitialized: true,
            error: getErrorMessage(error),
            isLoading: false,
          });

          throw error;
        }
      },

      initializeAuth: async () => {
        const { token, isInitialized } = get();

        if (isInitialized) {
          return;
        }

        if (!token) {
          set({ isInitialized: true, isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const user = await fetchAuthenticatedUser(token);

          set({
            user,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        } catch (_error) {
          set({
            ...clearAuthState,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }
      },

      logout: () => {
        set({
          ...clearAuthState,
          isInitialized: true,
          error: null,
        });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
