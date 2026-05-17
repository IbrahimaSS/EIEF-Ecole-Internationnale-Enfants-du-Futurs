// src/pages/manager/scolarite/hooks/useStudentGrades.ts
// Charge les notes individuelles d'un élève (relevé)

import { useCallback, useState } from 'react';
import { apiFetch } from '../api';
import { GradeResponse } from '../types';

export function useStudentGrades() {
  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGrades = useCallback(async (studentId: string, semester?: string) => {
    setLoading(true);
    try {
      const qs = semester ? `?semester=${semester}` : '';
      const data = await apiFetch<GradeResponse[]>(`/grades/student/${studentId}${qs}`);
      setGrades(data);
    } catch {
      setGrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setGrades([]), []);

  return { grades, loading, fetchGrades, reset };
}
