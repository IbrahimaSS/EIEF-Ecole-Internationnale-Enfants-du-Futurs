import { apiRequest } from './api';
import { ScheduleRequest, ScheduleResponse } from '../types/schedule';

// ── /schedules — CRUD général ─────────────────────────────────────────────────

export const scheduleService = {
  create: (data: ScheduleRequest): Promise<ScheduleResponse> =>
    apiRequest<ScheduleResponse>('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>('/schedules'),

  getById: (id: string): Promise<ScheduleResponse> =>
    apiRequest<ScheduleResponse>(`/schedules/${id}`),

  getByTeacher: (teacherId: string): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(`/schedules/teacher/${teacherId}`),

  getByTeacherAndDay: (teacherId: string, day: number): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(`/schedules/teacher/${teacherId}/day/${day}`),

  getByClass: (classId: string): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(`/schedules/class/${classId}`),

  update: (id: string, data: ScheduleRequest): Promise<ScheduleResponse> =>
    apiRequest<ScheduleResponse>(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/schedules/${id}`, { method: 'DELETE' }),
};

// ── /student — Emploi du temps élève ─────────────────────────────────────────

export const studentScheduleService = {
  getSchedule: (studentId: string): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(`/student/${studentId}/schedule`),

  getTodaySchedule: (studentId: string): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(`/student/${studentId}/schedule/today`),
};
