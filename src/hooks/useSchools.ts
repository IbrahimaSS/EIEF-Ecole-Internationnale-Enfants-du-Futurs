// src/hooks/useSchools.ts
import { useCallback, useEffect, useState } from 'react';
import {
  platformService,
  RegisterSchoolRequest,
  ResentCredentialsResponse,
  SchoolOverviewResponse,
  SchoolResponse,
} from '../services/platformService';

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

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erreur inattendue';

export const useSchools = () => {
  const [schools, setSchools] = useState<SchoolResponse[]>([]);
  const [pendingAdminSchoolIds, setPendingAdminSchoolIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Token manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [allSchools, overview] = await Promise.all([
        platformService.getAllSchools(token),
        platformService.getOverview(token),
      ]);
      setSchools(allSchools);
      setPendingAdminSchoolIds(
        new Set(overview.filter((school) => school.pendingAdminCount > 0).map((school) => school.id)),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const registerSchool = useCallback(
    async (payload: RegisterSchoolRequest): Promise<SchoolResponse> => {
      const token = getToken();
      if (!token) {
        throw new Error('Token manquant. Veuillez vous reconnecter.');
      }
      const created = await platformService.registerSchool(token, payload);
      await fetchAll();
      return created;
    },
    [fetchAll],
  );

  const resendAdminCredentials = useCallback(
    async (schoolId: string): Promise<ResentCredentialsResponse> => {
      const token = getToken();
      if (!token) {
        throw new Error('Token manquant. Veuillez vous reconnecter.');
      }
      return platformService.resendAdminCredentials(token, schoolId);
    },
    [],
  );

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return {
    schools,
    pendingAdminSchoolIds,
    loading,
    error,
    refetch: fetchAll,
    registerSchool,
    resendAdminCredentials,
  };
};

export const useSchoolsOverview = () => {
  const [overview, setOverview] = useState<SchoolOverviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Token manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setOverview(await platformService.getOverview(token));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, refetch: fetchOverview };
};
