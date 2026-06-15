// src/hooks/useAdminSettings.ts
import { useState, useCallback } from 'react';

// ─── Constantes des clés de settings ─────────────────────────────────────────
export const SETTING_KEYS = {
  NOM_ETABLISSEMENT: 'NOM_ETABLISSEMENT',
  SLOGAN:            'SLOGAN',
  EMAIL:             'EMAIL',
  TELEPHONE:         'TELEPHONE',
  TWO_FA_ENABLED:    'TWO_FA_ENABLED',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingsResponse {
  id: string;       // UUID
  key: string;
  value: string;
  category: string;
  description: string;
}

interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  module?: string;
  action: string;
  description?: string;
  status?: 'success' | 'failed' | string;
  level?: 'info' | 'warning' | 'danger' | string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  oldValue?: string;
  newValue?: string;
  
  // legacy fields for compatibility
  performedBy?: string;
  utilisateur?: string;
  date?: string;
  timestamp?: string;
  moduleName?: string;
  statut?: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
const API_BASE =
  (process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');

const AUTH_HEADER = 'enfantsfuture-auth-token';
const AUTH_PREFIX = 'enfantsfuture';

const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch { return null; }
};

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers[AUTH_HEADER] = `${AUTH_PREFIX} ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.message ?? 'Erreur API');
  return payload.data as T;
}

// ─── Hook useAdminSettings ────────────────────────────────────────────────────
export function useAdminSettings() {
  // On stocke tous les settings indexés par clé pour un accès O(1)
  const [settingsMap, setSettingsMap]   = useState<Record<string, SettingsResponse>>({});
  const [loading,     setLoading]       = useState(true);
  const [saving,      setSaving]        = useState(false);
  const [error,       setError]         = useState<string | null>(null);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await apiFetch<SettingsResponse[]>('/admin/settings');
      const map: Record<string, SettingsResponse> = {};
      list.forEach(s => { map[s.key] = s; });
      setSettingsMap(map);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur chargement des paramètres.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-chargement au montage
  const [mounted, setMounted] = useState(false);
  if (!mounted) {
    setMounted(true);
    load();
  }

  // ── Lecture d'une valeur ────────────────────────────────────────────────────
  const getValue = useCallback(
    (key: string, fallback = ''): string => settingsMap[key]?.value ?? fallback,
    [settingsMap]
  );

  // ── Sauvegarde ──────────────────────────────────────────────────────────────
  // Pour chaque clé modifiée :
  //   - Si elle existe déjà (on a son id) → PUT /admin/settings/{id}
  //   - Si elle n'existe pas encore       → POST /admin/settings
  const saveChanges = useCallback(
    async (changes: Record<string, string>) => {
      setSaving(true);
      setError(null);
      try {
        await Promise.all(
          Object.entries(changes).map(([key, value]) => {
            const existing = settingsMap[key];
            if (existing) {
              // Mise à jour — on conserve category et description existants
              return apiFetch(`/admin/settings/${existing.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  key,
                  value,
                  category:    existing.category    ?? 'GENERAL',
                  description: existing.description ?? '',
                }),
              });
            } else {
              // Création d'un nouveau setting
              return apiFetch('/admin/settings', {
                method: 'POST',
                body: JSON.stringify({
                  key,
                  value,
                  category:    'GENERAL',
                  description: '',
                }),
              });
            }
          })
        );
        // Recharger pour avoir les IDs à jour (important pour les POST)
        await load();
      } catch (e: any) {
        setError(e?.message ?? 'Erreur sauvegarde.');
        throw e; // Remonter pour que le composant gère le feedback
      } finally {
        setSaving(false);
      }
    },
    [settingsMap, load]
  );

  return { getValue, loading, saving, error, saveChanges, load };
}

// ─── Hook useAuditLogs ────────────────────────────────────────────────────────
export function useAuditLogs(filters?: { module?: string; userId?: string }) {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let path = '/admin/logs';
      if (filters?.module) {
        path = `/admin/logs/module/${encodeURIComponent(filters.module)}`;
      } else if (filters?.userId) {
        path = `/admin/logs/user/${filters.userId}`;
      }
      const data = await apiFetch<AuditLog[]>(path);
      setLogs(data);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur chargement des logs.');
    } finally {
      setLoading(false);
    }
  }, [filters?.module, filters?.userId]);

  // Auto-chargement au montage et quand les filtres changent
  const [prevFilter, setPrevFilter] = useState('');
  const filterKey = `${filters?.module ?? ''}-${filters?.userId ?? ''}`;
  if (filterKey !== prevFilter) {
    setPrevFilter(filterKey);
    reload();
  }

  return { logs, loading, error, reload };
}

// ─── Hook useBackup ────────────────────────────────────────────────────────
export interface BackupStatusResponse {
  lastBackupDate: string | null;
  status: string;
  message: string;
}

export function useBackup() {
  const [status, setStatus] = useState<BackupStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BackupStatusResponse>('/admin/backup/status');
      setStatus(data);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la récupération du statut de sauvegarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerBackup = useCallback(async () => {
    setBackingUp(true);
    setError(null);
    try {
      await apiFetch<string>('/admin/backup', { method: 'POST' });
      await loadStatus(); // Recharger le statut après sauvegarde
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la sauvegarde.');
      throw e;
    } finally {
      setBackingUp(false);
    }
  }, [loadStatus]);

  // Chargement initial
  const [mounted, setMounted] = useState(false);
  if (!mounted) {
    setMounted(true);
    loadStatus();
  }

  return { status, loading, backingUp, error, triggerBackup, loadStatus };
}