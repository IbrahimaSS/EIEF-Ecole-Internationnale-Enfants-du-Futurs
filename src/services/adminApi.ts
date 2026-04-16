// src/services/adminApi.ts
import { apiRequest } from "./api"; // adapte ce chemin à ton projet

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export interface SettingsResponse {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
}

export interface SettingsRequest {
  key: string;
  value: string;
  category?: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  utilisateur?: string;           // si le backend renvoie ce champ
  performedBy?: string;           // alias possible selon l'entité JPA
  date?: string;
  createdAt?: string;             // alias possible selon l'entité JPA
  statut?: string;
  status?: string;
  module?: string;
  userId?: string;
}

export interface DashboardResponse {
  totalStudents: number;
  totalTeachers: number;
  totalUsers: number;
  pendingPayments: number;
  totalRevenue: number;
  tuitionRevenue: number;
  cafeteriaRevenue: number;
  transportRevenue: number;
  storeRevenue: number;
  totalExpenses: number;
  netResult: number;
  activeLoans: number;
  unreadMessages: number;
}

// ─────────────────────────────────────────────────────
// Settings API
// ─────────────────────────────────────────────────────

export const settingsApi = {
  /** Récupère tous les settings, optionnellement filtrés par catégorie */
  getAll: (category?: string): Promise<SettingsResponse[]> => {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return apiRequest<SettingsResponse[]>(`/admin/settings${query}`);
  },

  /** Récupère un setting par clé (ex: "NOM_ETABLISSEMENT") */
  getByKey: (key: string): Promise<SettingsResponse> =>
    apiRequest<SettingsResponse>(`/admin/settings/key/${encodeURIComponent(key)}`),

  /** Met à jour un setting existant */
  update: (id: string, data: SettingsRequest): Promise<SettingsResponse> =>
    apiRequest<SettingsResponse>(`/admin/settings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Crée un nouveau setting */
  create: (data: SettingsRequest): Promise<SettingsResponse> =>
    apiRequest<SettingsResponse>("/admin/settings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Supprime un setting par id */
  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/admin/settings/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────
// Audit Logs API
// ─────────────────────────────────────────────────────

export const logsApi = {
  /** Récupère tous les logs d'audit */
  getAll: (): Promise<AuditLog[]> =>
    apiRequest<AuditLog[]>("/admin/logs"),

  /** Logs filtrés par utilisateur */
  getByUser: (userId: string): Promise<AuditLog[]> =>
    apiRequest<AuditLog[]>(`/admin/logs/user/${userId}`),

  /** Logs filtrés par module */
  getByModule: (module: string): Promise<AuditLog[]> =>
    apiRequest<AuditLog[]>(`/admin/logs/module/${encodeURIComponent(module)}`),
};

// ─────────────────────────────────────────────────────
// Dashboard API
// ─────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: (): Promise<DashboardResponse> =>
    apiRequest<DashboardResponse>("/admin/dashboard"),
};
