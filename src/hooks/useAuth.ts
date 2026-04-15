// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  // ajoute d'autres champs selon ton API
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// Récupère le token et l'utilisateur depuis localStorage
const getStoredAuth = (): { token: string | null; user: User | null } => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    // Structure typique: { state: { token, user } }
    const token = parsed?.state?.token ?? null;
    const user = parsed?.state?.user ?? null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const useAuth = (): AuthState & {
  login: (token: string, user: User) => void;
  logout: () => void;
} => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Chargement initial depuis le storage
  useEffect(() => {
    const { token, user } = getStoredAuth();
    setState({
      user,
      token,
      isLoading: false,
    });
  }, []);

  // Écouter les changements du storage (si une autre fenêtre modifie l'auth)
  useEffect(() => {
    const handleStorageChange = () => {
      const { token, user } = getStoredAuth();
      setState(prev => ({ ...prev, token, user }));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, user: User) => {
    // Ici, tu dois aussi mettre à jour ton store global (Zustand, Redux, etc.)
    // Exemple avec localStorage seulement :
    const authStorage = { state: { token, user } };
    localStorage.setItem('auth-storage', JSON.stringify(authStorage));
    setState({ user, token, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('auth-storage');
    setState({ user: null, token: null, isLoading: false });
  };

  return { ...state, login, logout };
};