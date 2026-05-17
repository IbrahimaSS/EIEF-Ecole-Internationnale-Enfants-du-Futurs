// src/pages/manager/scolarite/hooks/useScolariteData.ts
// Charge l'ensemble des données de référence du module scolarité.
// Robuste aux erreurs : si un endpoint plante (500, 404, timeout...), les
// autres données continuent de se charger et la page reste utilisable.

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';
import {
  AcademicYearResponse,
  ClassResponse,
  ScheduleResponse,
  StudentResponse,
  SubjectResponse,
  TeacherResponse,
} from '../types';

export interface ScolariteData {
  classes: ClassResponse[];
  subjects: SubjectResponse[];
  schedules: ScheduleResponse[];
  students: StudentResponse[];
  teachers: TeacherResponse[];
  years: AcademicYearResponse[];
  loading: boolean;
  /** Message d'erreur global si TOUTES les requêtes ont échoué. */
  error: string | null;
  /** Liste détaillée des endpoints qui ont échoué (pour diagnostic). */
  failedEndpoints: string[];
  refetch: () => Promise<void>;
}

/**
 * Récupère un endpoint en récupérant un fallback (ex: tableau vide) en cas
 * d'erreur. Logue le détail dans la console pour pouvoir diagnostiquer.
 */
async function safeFetch<T>(
  label: string,
  path: string,
  fallback: T,
  failures: string[],
): Promise<T> {
  try {
    return await apiFetch<T>(path);
  } catch (e: any) {
    failures.push(`${label} (${path}) — ${e?.message ?? 'erreur'}`);
    // eslint-disable-next-line no-console
    console.warn(`[Scolarité] ${label} indisponible :`, e?.message ?? e);
    return fallback;
  }
}

export function useScolariteData(): ScolariteData {
  const [classes,   setClasses]   = useState<ClassResponse[]>([]);
  const [subjects,  setSubjects]  = useState<SubjectResponse[]>([]);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [students,  setStudents]  = useState<StudentResponse[]>([]);
  const [teachers,  setTeachers]  = useState<TeacherResponse[]>([]);
  const [years,     setYears]     = useState<AcademicYearResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [failedEndpoints, setFailedEndpoints] = useState<string[]>([]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFailedEndpoints([]);
    const failures: string[] = [];

    try {
      const [cls, subj, sch, stu, tea, yr] = await Promise.all([
        safeFetch<ClassResponse[]>('Classes', '/courses/classes', [], failures),
        safeFetch<SubjectResponse[]>('Matières', '/courses/subjects', [], failures),
        safeFetch<ScheduleResponse[]>('Emplois du temps', '/schedules', [], failures),
        safeFetch<StudentResponse[]>('Élèves', '/users/students', [], failures),
        safeFetch<TeacherResponse[]>('Enseignants', '/users/teachers', [], failures),
        safeFetch<AcademicYearResponse[]>('Années académiques', '/courses/academic-years', [], failures),
      ]);

      setClasses(cls);
      setSubjects(subj);
      setSchedules(sch);
      setStudents(stu);
      setTeachers(tea);
      setYears(yr);
      setFailedEndpoints(failures);

      // Erreur globale uniquement si TOUS les endpoints ont échoué.
      if (failures.length === 6) {
        setError('Impossible de charger les données. Vérifiez que le serveur est démarré.');
      } else if (failures.length > 0) {
        // Erreur partielle : on n'écrase pas l'UI mais on signale dans la console.
        // eslint-disable-next-line no-console
        console.warn('[Scolarité] Endpoints en échec :', failures);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    classes,
    subjects,
    schedules,
    students,
    teachers,
    years,
    loading,
    error,
    failedEndpoints,
    refetch,
  };
}
