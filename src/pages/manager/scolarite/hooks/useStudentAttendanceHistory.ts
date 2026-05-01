// src/pages/manager/scolarite/hooks/useStudentAttendanceHistory.ts
// Charge l'historique de présence d'un élève.

import { useCallback, useState } from 'react';
import { apiFetch } from '../api';
import { StudentAttendanceResponse } from '../types';

export function useStudentAttendanceHistory() {
  const [history, setHistory] = useState<StudentAttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (studentId: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<StudentAttendanceResponse[]>(
        `/attendance/student/${studentId}`,
      );
      // Tri du plus récent au plus ancien
      data.sort((a, b) => b.date.localeCompare(a.date));
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setHistory([]), []);

  return { history, loading, fetchHistory, reset };
}
