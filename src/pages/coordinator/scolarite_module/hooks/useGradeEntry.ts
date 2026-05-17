// src/pages/manager/scolarite/hooks/useGradeEntry.ts
// Hook qui encapsule toute la logique de saisie de notes pour une classe/matière/semestre.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';
import {
  ClassResponse,
  EditableGradeRow,
  GradeResponse,
  ScheduleResponse,
  StudentResponse,
  SubjectResponse,
} from '../types';

interface Params {
  classes: ClassResponse[];
  students: StudentResponse[];
  subjects: SubjectResponse[];
  schedules: ScheduleResponse[];
  isActive: boolean; // n'évite les fetchs que sur l'onglet actif
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

export function useGradeEntry({
  classes,
  students,
  subjects,
  schedules,
  isActive,
  onError,
  onSuccess,
}: Params) {
  const [gradeClassId,    setGradeClassId]    = useState('');
  const [gradeSubjectId,  setGradeSubjectId]  = useState('');
  const [gradeSemester,   setGradeSemester]   = useState('1');
  const [gradeRows,       setGradeRows]       = useState<EditableGradeRow[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [saving,          setSaving]          = useState(false);

  // Classe courante
  const gradeClass = useMemo(
    () => classes.find(cls => cls.id === gradeClassId) ?? null,
    [classes, gradeClassId],
  );

  // Élèves de la classe courante
  const gradeClassStudents = useMemo(
    () =>
      gradeClass
        ? students.filter(student => student.className === gradeClass.name)
        : [],
    [gradeClass, students],
  );

  // Matières disponibles : déduites des emplois du temps de la classe,
  // sinon fallback sur la liste globale.
  const gradeSubjectOptions = useMemo(() => {
    const fromSchedules = Array.from(
      new Map(
        schedules
          .filter(schedule => schedule.classId === gradeClassId)
          .map(schedule => [
            schedule.subjectId,
            { id: schedule.subjectId, name: schedule.subjectName },
          ]),
      ).values(),
    );
    if (fromSchedules.length > 0) return fromSchedules;
    return subjects.map(s => ({ id: s.id, name: s.name }));
  }, [schedules, subjects, gradeClassId]);

  // Charge ou hydrate les lignes de notes
  const fetchGradeRows = useCallback(
    async (classId: string, subjectId: string, semester: string) => {
      const currentClass = classes.find(cls => cls.id === classId);
      if (!currentClass || !subjectId) {
        setGradeRows([]);
        return;
      }
      const classStudents = students.filter(s => s.className === currentClass.name);
      setLoading(true);
      try {
        const grades = await apiFetch<GradeResponse[]>(
          `/grades/class/${classId}/subject/${subjectId}?semester=${semester}`,
        );
        const gradeMap = new Map(grades.map(g => [g.studentId, g] as const));
        setGradeRows(
          classStudents.map(student => {
            const existing = gradeMap.get(student.id);
            return {
              studentId: student.id,
              studentName: `${student.firstName} ${student.lastName}`,
              registrationNumber: student.registrationNumber,
              note: existing ? String(existing.value) : '',
              appreciation: existing?.comment || '',
              gradeId: existing?.id,
            };
          }),
        );
      } catch {
        setGradeRows(
          classStudents.map(student => ({
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            registrationNumber: student.registrationNumber,
            note: '',
            appreciation: '',
          })),
        );
      } finally {
        setLoading(false);
      }
    },
    [classes, students],
  );

  // Sélection automatique de la classe par défaut
  useEffect(() => {
    if (!gradeClassId && classes.length > 0) {
      setGradeClassId(classes[0].id);
    }
  }, [classes, gradeClassId]);

  // Sélection automatique de la matière par défaut
  useEffect(() => {
    if (!gradeClassId) {
      if (gradeSubjectId) setGradeSubjectId('');
      return;
    }
    if (gradeSubjectOptions.length === 0) {
      if (gradeSubjectId) setGradeSubjectId('');
      return;
    }
    const exists = gradeSubjectOptions.some(s => s.id === gradeSubjectId);
    if (!exists) setGradeSubjectId(gradeSubjectOptions[0].id);
  }, [gradeClassId, gradeSubjectId, gradeSubjectOptions]);

  // Recharge automatique
  useEffect(() => {
    if (!isActive || !gradeClassId || !gradeSubjectId) return;
    fetchGradeRows(gradeClassId, gradeSubjectId, gradeSemester);
  }, [isActive, fetchGradeRows, gradeClassId, gradeSubjectId, gradeSemester]);

  const updateRow = (
    studentId: string,
    field: 'note' | 'appreciation',
    value: string,
  ) => {
    setGradeRows(prev =>
      prev.map(row => (row.studentId === studentId ? { ...row, [field]: value } : row)),
    );
  };

  const save = async () => {
    if (!gradeClassId || !gradeSubjectId) {
      onError?.('Veuillez sélectionner une classe et une matière.');
      return;
    }
    const hasInvalidNote = gradeRows.some(row => {
      if (row.note === '') return false;
      const v = Number(row.note);
      return Number.isNaN(v) || v < 0 || v > 20;
    });
    if (hasInvalidNote) {
      onError?.('Chaque note doit être comprise entre 0 et 20.');
      return;
    }

    setSaving(true);
    try {
      const operations = gradeRows.map(async row => {
        const payload = {
          studentId: row.studentId,
          subjectId: gradeSubjectId,
          value: Number(row.note),
          semester: Number(gradeSemester),
          evaluationType: 'Note du semestre',
          comment: row.appreciation || undefined,
        };

        if (row.note === '') {
          if (row.gradeId) {
            await apiFetch(`/grades/${row.gradeId}`, { method: 'DELETE' });
          }
          return;
        }

        if (row.gradeId) {
          await apiFetch(`/grades/${row.gradeId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          return;
        }

        await apiFetch('/grades', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      });

      await Promise.all(operations);
      await fetchGradeRows(gradeClassId, gradeSubjectId, gradeSemester);
      onSuccess?.('Les notes ont été enregistrées par la scolarité.');
    } catch (e: any) {
      onError?.(e?.message ?? "Erreur lors de l'enregistrement des notes.");
    } finally {
      setSaving(false);
    }
  };

  // Statistiques dérivées
  const gradeValues = gradeRows
    .map(row => Number(row.note))
    .filter(v => !Number.isNaN(v));
  const gradeAverage = gradeValues.length
    ? gradeValues.reduce((sum, v) => sum + v, 0) / gradeValues.length
    : null;
  const filledCount = gradeRows.filter(row => row.note !== '').length;

  return {
    gradeClassId,
    setGradeClassId,
    gradeSubjectId,
    setGradeSubjectId,
    gradeSemester,
    setGradeSemester,
    gradeRows,
    loading,
    saving,
    gradeClass,
    gradeClassStudents,
    gradeSubjectOptions,
    fetchGradeRows,
    updateRow,
    save,
    gradeAverage,
    filledCount,
  };
}
