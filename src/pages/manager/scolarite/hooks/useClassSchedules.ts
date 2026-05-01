// src/pages/manager/scolarite/hooks/useClassSchedules.ts
// Charge les emplois du temps d'une classe donnée.

import { useCallback, useState } from 'react';
import { apiFetch } from '../api';
import { ScheduleResponse } from '../types';

export function useClassSchedules() {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClassSchedules = useCallback(async (classId: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<ScheduleResponse[]>(`/schedules/class/${classId}`);
      setSchedules(data);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setSchedules([]), []);

  return { classSchedules: schedules, classSchLoading: loading, fetchClassSchedules, reset };
}
