// src/pages/manager/scolarite/constants.ts

import {
  ScheduleForm,
  ClassForm,
  SubjectForm,
  AcademicYearForm,
} from './types';

export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const DAY_OPTIONS = DAYS.map((d, i) => ({
  value: String(i + 1),
  label: d,
}));

export const SEMESTER_OPTIONS = [
  { value: '1', label: 'Semestre 1' },
  { value: '2', label: 'Semestre 2' },
  { value: '3', label: 'Semestre 3' },
  { value: '4', label: 'Semestre 4' },
  { value: '5', label: 'Semestre 5' },
];

export const ATTENDANCE_STATUSES = [
  { value: 'PRESENT',  label: 'Présent' },
  { value: 'ABSENT',   label: 'Absent' },
  { value: 'LATE',     label: 'En retard' },
  { value: 'EXCUSED',  label: 'Excusé' },
];

// ─── Forms vides ─────────────────────────────────────────────────────────────

export const empty = {
  schedule: (): ScheduleForm => ({
    classId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: '1',
    startTime: '',
    endTime: '',
    room: '',
  }),
  class: (): ClassForm => ({
    name: '',
    level: '',
    academicYearId: '',
    mainTeacherId: '',
    maxStudents: 40,
  }),
  subject: (): SubjectForm => ({
    name: '',
    code: '',
    coefficient: 1,
  }),
  academicYear: (): AcademicYearForm => ({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  }),
};
