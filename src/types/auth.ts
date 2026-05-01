export type UUID = string;

export type UserRole = "admin" | "enseignant" | "parent" | "eleve" | "manager";

export type BackendRole = "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "STAFF";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: ApiFieldError[];
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  roleName: string;
  active: boolean;
  avatarUrl?: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  backendRole?: string;
  isActive?: boolean;
  avatar?: string;
  avatarUrl?: string;
  telephone?: string;
  classe?: string; // Pour les élèves
  matiere?: string; // Pour les enseignants
  enfants?: string[]; // Pour les parents (IDs des enfants)
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<UserRole>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

const backendRoleMap: Record<string, UserRole> = {
  ADMIN: "admin",
  TEACHER: "enseignant",
  PARENT: "parent",
  STUDENT: "eleve",
  STAFF: "manager",
};

export const mapBackendRoleToUserRole = (role: string): UserRole => {
  const normalizedRole = role.trim().toUpperCase();
  const mappedRole = backendRoleMap[normalizedRole];

  if (!mappedRole) {
    throw new Error(`Role backend non supporte: ${role}`);
  }

  return mappedRole;
};

export const mapUserResponseToUser = (response: UserResponse): User => ({
  id: response.id,
  email: response.email,
  firstName: response.firstName,
  lastName: response.lastName,
  role: mapBackendRoleToUserRole(response.roleName),
  backendRole: response.roleName,
  isActive: response.active,
  telephone: response.phone ?? undefined,
  avatarUrl: response.avatarUrl ?? undefined,
  avatar: response.avatarUrl ?? undefined,
});
