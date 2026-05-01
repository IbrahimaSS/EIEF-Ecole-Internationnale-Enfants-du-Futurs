// src/pages/manager/scolarite/hooks/useAttendance.ts
// Hook pour le pointage (eleves + professeurs)

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';
import {
  PointageTab,
  StudentAttendanceResponse,
  TeacherAttendanceResponse,
} from '../types';

interface Params {
  isActive: boolean;
  activePointageTab: PointageTab;
  pointageDate: string;
  pointageScheduleId: string;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

export function useAttendance({
  isActive,
  activePointageTab,
  pointageDate,
  pointageScheduleId,
  onError,
  onSuccess,
}: Params) {
  const [teacherAttendances, setTeacherAttendances] = useState<Record<string, any>>({});
  const [studentAttendances, setStudentAttendances] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTeacherAttendances = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<TeacherAttendanceResponse[]>(`/teacher-attendance/date/${date}`);
      const map: Record<string, any> = {};
      data.forEach(item => { map[item.teacherId] = item; });
      setTeacherAttendances(map);
    } catch {
      setTeacherAttendances({});
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentAttendances = useCallback(async (scheduleId: string, date: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<StudentAttendanceResponse[]>(`/attendance/schedule/${scheduleId}/date/${date}`);
      const map: Record<string, any> = {};
      data.forEach(item => { map[item.studentId] = item; });
      setStudentAttendances(map);
    } catch {
      setStudentAttendances({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;
    if (activePointageTab === 'professeurs') {
      fetchTeacherAttendances(pointageDate);
    } else if (activePointageTab === 'eleves' && pointageScheduleId) {
      fetchStudentAttendances(pointageScheduleId, pointageDate);
    }
  }, [
    isActive,
    activePointageTab,
    pointageDate,
    pointageScheduleId,
    fetchTeacherAttendances,
    fetchStudentAttendances,
  ]);

  const saveTeacherAttendance = async () => {
    setSubmitting(true);
    try {
      const entries = Object.values(teacherAttendances)
        .filter(a => a.teacherId && a.status)
        .map(a => ({
          teacherId: a.teacherId,
          status: a.status,
          checkInTime: a.checkInTime || null,
          checkOutTime: a.checkOutTime || null,
          note: a.note || '',
        }));
      if (entries.length === 0) {
        onError?.('Aucun pointage a enregistrer.');
        return;
      }
      await apiFetch('/teacher-attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({ date: pointageDate, entries }),
      });
      onSuccess?.('Pointage des professeurs enregistre avec succes.');
      await fetchTeacherAttendances(pointageDate);
    } catch (e: any) {
      onError?.(e?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const saveSingleTeacherAttendance = async (teacherId: string) => {
    const att = teacherAttendances[teacherId];
    if (!att || !att.status) {
      onError?.('Veuillez selectionner un statut avant de pointer.');
      return;
    }
    setSubmitting(true);
    try {
      const entry = {
        teacherId,
        status: att.status,
        checkInTime: att.checkInTime || null,
        checkOutTime: att.checkOutTime || null,
        note: att.note || '',
      };
      await apiFetch('/teacher-attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({ date: pointageDate, entries: [entry] }),
      });
      onSuccess?.('Pointage enregistre.');
      await fetchTeacherAttendances(pointageDate);
    } catch (e: any) {
      onError?.(e?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const saveStudentAttendance = async () => {
    if (!pointageScheduleId) {
      onError?.("Veuillez d'abord selectionner un creneau.");
      return;
    }
    setSubmitting(true);
    try {
      const entries = Object.values(studentAttendances)
        .filter(a => a.studentId && a.status)
        .map(a => ({
          studentId: a.studentId,
          status: a.status,
          note: a.note || '',
        }));
      if (entries.length === 0) {
        onError?.('Aucun pointage a enregistrer.');
        return;
      }
      await apiFetch('/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({
          scheduleId: pointageScheduleId,
          date: pointageDate,
          entries,
        }),
      });
      onSuccess?.('Pointage des eleves enregistre avec succes.');
      await fetchStudentAttendances(pointageScheduleId, pointageDate);
    } catch (e: any) {
      onError?.(e?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const saveSingleStudentAttendance = async (studentId: string) => {
    if (!pointageScheduleId) {
      onError?.("Veuillez d'abord selectionner un creneau (emploi du temps).");
      return;
    }
    const att = studentAttendances[studentId];
    if (!att || !att.status) {
      onError?.('Veuillez selectionner un statut avant de pointer.');
      return;
    }
    setSubmitting(true);
    try {
      const entry = {
        studentId,
        status: att.status,
        note: att.note || '',
      };
      await apiFetch('/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({
          scheduleId: pointageScheduleId,
          date: pointageDate,
          entries: [entry],
        }),
      });
      onSuccess?.('Pointage enregistre.');
      await fetchStudentAttendances(pointageScheduleId, pointageDate);
    } catch (e: any) {
      onError?.(e?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    teacherAttendances,
    setTeacherAttendances,
    studentAttendances,
    setStudentAttendances,
    loading,
    submitting,
    saveTeacherAttendance,
    saveSingleTeacherAttendance,
    saveStudentAttendance,
    saveSingleStudentAttendance,
    fetchTeacherAttendances,
    fetchStudentAttendances,
  };
}
