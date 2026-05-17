// src/pages/coordinator/scolarite/types.ts
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
  className: string | null;
  parentName: string;
  avatarUrl?: string;
  photoUrl?: string;
  isActive: boolean;
}

export interface StudentCardSummary {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  className: string | null;
  avatarUrl: string | null;
  qrToken: string | null;
  generated: boolean;
}

export interface StudentSubjectGradeSummary {
  subjectId: string | null;
  subjectName: string | null;
  coefficient: number;
  average: number;
  progression: number;
  comment: string | null;
}

export interface StudentNotesSummary {
  semester: number;
  overallAverage: number;
  rank: number;
  classSize: number;
  progression: number;
  absences: number;
  appreciation: string;
  subjects: StudentSubjectGradeSummary[];
}

export interface StudentCardScanData {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  className: string | null;
  avatarUrl: string | null;
  notes: StudentNotesSummary;
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

export type TabId = "emplois" | "notes" | "pointage" | "cartes";
export type PointageTab = "eleves" | "professeurs";
