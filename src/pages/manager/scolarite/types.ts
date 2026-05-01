// src/pages/manager/scolarite/types.ts
// Types & DTOs pour le module Scolarité (calqués sur le backend)

export interface ClassResponse {
  id: string;
  name: string;
  level: string;
  academicYearName: string;
  mainTeacherName: string;
  maxStudents: number;
  studentCount: number;
}

export interface SubjectResponse {
  id: string;
  name: string;
  code: string;
  coefficient: number;
}

export interface ScheduleResponse {
  id: string;
  classSubjectId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  subjectName: string;
  className: string;
  teacherName: string;
}

export interface GradeResponse {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  value: number;
  semester: number;
  evaluationType: string;
  comment: string;
  gradedAt: string;
}

export interface StudentResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  registrationNumber: string;
  birthDate: string;
  gender: string;
  className: string;
  parentName: string;
  isActive: boolean;
}

export interface TeacherResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AcademicYearResponse {
  id: string;
  name: string;
  isActive: boolean;
}

export interface TeacherAttendanceResponse {
  id: string;
  teacherId: string;
  date: string;
  status: string;
  checkInTime: string;
  checkOutTime: string;
  note: string;
}

export interface StudentAttendanceResponse {
  id: string;
  studentId: string;
  studentName?: string;
  scheduleId: string;
  date: string;
  status: string;
  note: string;
}

// ─── Types UI ────────────────────────────────────────────────────────────────

export type TabId = 'emplois' | 'notes' | 'pointage';
export type PointageTab = 'eleves' | 'professeurs';
export type NotifKind = 'success' | 'error';

export interface Notif {
  kind: NotifKind;
  message: string;
}

export interface EditableGradeRow {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  note: string;
  appreciation: string;
  gradeId?: string;
}

// ─── Forms ───────────────────────────────────────────────────────────────────

export interface ScheduleForm {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface ClassForm {
  name: string;
  level: string;
  academicYearId: string;
  mainTeacherId: string;
  maxStudents: number;
}

export interface SubjectForm {
  name: string;
  code: string;
  coefficient: number;
}

export interface AcademicYearForm {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface DeleteTarget {
  id: string;
  label: string;
}
