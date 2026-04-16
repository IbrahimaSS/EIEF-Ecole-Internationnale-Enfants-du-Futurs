// src/hooks/useAdminDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { adminService, DashboardResponse } from '../services/adminService';

const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
};

export const useAdminDashboard = () => {
  const [data, setData]       = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError('Token manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.getDashboard(token);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // refetch exposé → appelé après chaque mutation utilisateur pour sync auto
  return { data, loading, error, refetch: fetchDashboard };
};
