// src/hooks/useAdminDashboard.ts
import { useState, useEffect } from 'react';
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
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
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
      } catch (err: any) {
        setError(err?.message || 'Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
};