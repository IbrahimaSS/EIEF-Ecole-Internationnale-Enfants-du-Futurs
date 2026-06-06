import { apiRequest } from "./api";

const POINTAGE_PROF_ROUTE = "/pointage-prof";

export const buildTeacherCardPointageUrl = (qrToken: string): string => {
  const path = `${POINTAGE_PROF_ROUTE}/${encodeURIComponent(qrToken)}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
};

export interface TeacherCardData {
  teacherId: string;
  userId: string;
  fullName: string;
  employeeNumber: string;
  specialty: string | null;
  phone: string | null;
  avatarUrl: string | null;
  hireDate: string | null;
  qrToken: string | null;
  generated: boolean;
}

export interface TeacherQrScanResult {
  teacherId: string;
  teacherName: string;
  employeeNumber: string;
  specialty: string | null;
  avatarUrl: string | null;
  eventType: "ARRIVED" | "DEPARTED" | "ALREADY_OUT";
  eventTime: string;
  date: string;
  message: string;
}

export interface TeacherQrAttendanceEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  employeeNumber: string;
  specialty: string | null;
  avatarUrl: string | null;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "IN_SCHOOL" | "DEPARTED";
}

export interface TeacherMonthlyStats {
  year: number;
  month: number;
  workingDaysInMonth: number;
  daysPresent: number;
  daysAbsent: number;
  attendanceRate: number;
  logs: TeacherQrAttendanceEntry[];
}

export const teacherCardService = {
  getByTeacherId: (teacherId: string) =>
    apiRequest<TeacherCardData>(`/teacher-cards/teachers/${teacherId}`),

  generate: (teacherId: string) =>
    apiRequest<TeacherCardData>(`/teacher-cards/teachers/${teacherId}/generate`, { method: "POST" }),

  regenerate: (teacherId: string) =>
    apiRequest<TeacherCardData>(`/teacher-cards/teachers/${teacherId}/regenerate`, { method: "POST" }),

  scanForAttendance: (qrToken: string) =>
    apiRequest<TeacherQrScanResult>(
      `/teacher-cards/scan/${encodeURIComponent(qrToken)}/checkin`,
      { method: "POST" }
    ),

  getAttendanceHistory: (teacherId: string) =>
    apiRequest<TeacherQrAttendanceEntry[]>(`/teacher-cards/attendance/teacher/${teacherId}`),

  getTodayAttendance: () =>
    apiRequest<TeacherQrAttendanceEntry[]>(`/teacher-cards/attendance/today`),

  getMonthlyStats: (teacherId: string, year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year)  params.set("year",  String(year));
    if (month) params.set("month", String(month));
    const qs = params.toString() ? `?${params}` : "";
    return apiRequest<TeacherMonthlyStats>(
      `/teacher-cards/attendance/teacher/${teacherId}/monthly${qs}`
    );
  },

  /** Récupère la carte du prof connecté via son userId (extrait du store auth). */
  getMyCard: (userId: string) =>
    apiRequest<TeacherCardData>(`/teacher-cards/me?userId=${userId}`),

  /** Stats mensuelles du prof connecté. */
  getMyMonthlyStats: (userId: string, year?: number, month?: number) => {
    const params = new URLSearchParams({ userId });
    if (year)  params.set("year",  String(year));
    if (month) params.set("month", String(month));
    return apiRequest<TeacherMonthlyStats>(`/teacher-cards/me/monthly?${params}`);
  },
};
