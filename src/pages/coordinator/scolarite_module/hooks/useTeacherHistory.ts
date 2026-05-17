// src/pages/manager/scolarite/hooks/useTeacherHistory.ts
// Charge l'historique de pointage d'un professeur donné.

import { useCallback, useState } from 'react';
import { apiFetch } from '../api';
import { TeacherAttendanceResponse } from '../types';

export function useTeacherHistory() {
  const [history, setHistory] = useState<TeacherAttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (teacherId: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<TeacherAttendanceResponse[]>(
        `/teacher-attendance/teacher/${teacherId}`,
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
