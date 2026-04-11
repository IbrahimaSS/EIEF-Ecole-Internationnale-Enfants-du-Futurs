export type UserRole = 'admin' | 'enseignant' | 'parent' | 'eleve';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  telephone?: string;
  classe?: string; // Pour les élèves
  matiere?: string; // Pour les enseignants
  enfants?: string[]; // Pour les parents (IDs des enfants)
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}