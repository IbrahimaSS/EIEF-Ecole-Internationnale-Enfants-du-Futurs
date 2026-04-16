// src/hooks/useUsers.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  userService,
  StudentResponse, StudentRequest,
  TeacherResponse, TeacherRequest,
} from '../services/userService';

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

export const useUsers = (onMutation?: () => void) => {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const onMutationRef = useRef(onMutation);
  useEffect(() => { onMutationRef.current = onMutation; }, [onMutation]);

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
      const [s, t] = await Promise.all([
        userService.getAllStudents(token),
        userService.getAllTeachers(token),
      ]);
      setStudents(s);
      setTeachers(t);
    } catch (err: any) {
      setError(err?.message || 'Erreur de chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const afterMutation = useCallback(() => {
    fetchAll();
    onMutationRef.current?.();
  }, [fetchAll]);

  const searchStudents = useCallback(async (q: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const result = await userService.getAllStudents(token, { search: q });
      setStudents(result);
    } catch (err: any) { setError(err?.message || 'Erreur de recherche.'); }
  }, []);

  const searchTeachers = useCallback(async (q: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const result = await userService.getAllTeachers(token, q);
      setTeachers(result);
    } catch (err: any) { setError(err?.message || 'Erreur de recherche.'); }
  }, []);

  const addStudent = useCallback(async (payload: StudentRequest) => {
    const token = getToken();
    if (!token) throw new Error('Token manquant.');
    await userService.createStudent(token, payload);
    afterMutation();
  }, [afterMutation]);

  const editStudent = useCallback(async (id: string, payload: StudentRequest) => {
    const token = getToken();
    if (!token) throw new Error('Token manquant.');
    await userService.updateStudent(token, id, payload);
    afterMutation();
  }, [afterMutation]);

  const removeStudent = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('Token manquant.');
    await userService.deleteStudent(token, id);
    afterMutation();
  }, [afterMutation]);

  const addTeacher = useCallback(async (payload: TeacherRequest) => {
    const token = getToken();
    if (!token) throw new Error('Token manquant.');
    await userService.createTeacher(token, payload);
    afterMutation();
  }, [afterMutation]);

  const editTeacher = useCallback(async (id: string, payload: TeacherRequest) => {
    const token = getToken();
    if (!token) throw new Error('Token manquant.');
    await userService.updateTeacher(token, id, payload);
    afterMutation();
  }, [afterMutation]);

  const removeTeacher = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('Token manquant.');
    await userService.deleteTeacher(token, id);
    afterMutation();
  }, [afterMutation]);

  return {
    students, teachers, loading, error,
    addStudent, editStudent, removeStudent,
    addTeacher, editTeacher, removeTeacher,
    searchStudents, searchTeachers,
    refetch: fetchAll,
  };
};
