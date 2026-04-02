import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthStore, LoginCredentials, User } from '../types/auth';

// Utilisateurs mockés pour la démo
const mockUsers: Record<string, { password: string; user: User }> = {
  'admin@eief.edu.gn': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@eief.edu.gn',
      firstName: 'Ibrahima',
      lastName: 'Soumah',
      role: 'admin',
      telephone: '+224 622 123 456'
    }
  },
  'enseignant@eief.edu.gn': {
    password: 'prof123',
    user: {
      id: '2',
      email: 'enseignant@eief.edu.gn',
      firstName: 'Aïssatou',
      lastName: 'Diallo',
      role: 'enseignant',
      telephone: '+224 623 456 789',
      matiere: 'Mathématiques'
    }
  },
  'parent@eief.edu.gn': {
    password: 'parent123',
    user: {
      id: '3',
      email: 'parent@eief.edu.gn',
      firstName: 'Mamadou',
      lastName: 'Bah',
      role: 'parent',
      telephone: '+224 624 789 012',
      enfants: ['eleve1', 'eleve2']
    }
  },
  'eleve@eief.edu.gn': {
    password: 'eleve123',
    user: {
      id: '4',
      email: 'eleve@eief.edu.gn',
      firstName: 'Fatoumata',
      lastName: 'Camara',
      role: 'eleve',
      telephone: '+224 625 012 345',
      classe: '3ème A'
    }
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 1000));

          const mockUser = mockUsers[credentials.email];
          
          if (!mockUser || mockUser.password !== credentials.password) {
            throw new Error('Email ou mot de passe incorrect');
          }

          if (mockUser.user.role !== credentials.role) {
            throw new Error('Rôle non autorisé pour cet utilisateur');
          }

          // Simuler un token JWT
          const token = `mock-jwt-token-${Date.now()}-${mockUser.user.id}`;

          set({
            user: mockUser.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur de connexion',
            isLoading: false
          });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage', // nom dans localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
