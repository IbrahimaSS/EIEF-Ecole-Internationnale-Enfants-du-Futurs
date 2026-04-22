import { apiRequest } from "./api";
import { StudentResponse } from "./userService";
import { ScheduleResponse } from "../types/schedule";
import { Resource } from "../types/library";

// ── Types alignés sur les DTOs backend ──────────────────────────────────────

export interface StudentDashboardResponse {
  averageGrade: number;
  classRank: number;
  classSize: number;
  attendanceRate: number;
  pendingAssignments: number;
  recentGrades: StudentRecentGradeResponse[];
  todaySchedule: ScheduleResponse[];
  upcomingAssignments: StudentAssignmentResponse[];
}

export interface StudentRecentGradeResponse {
  gradeId: string;
  subjectName: string;
  value: number;
  semester: number;
  comment: string;
  gradedAt: string;
}

// ⚠️  ScheduleResponse est importé depuis ../types/schedule — NE PAS redéclarer ici

export interface StudentAssignmentResponse {
  id: string;
  title: string;
  subjectName: string;
  deadline: string;
}

export interface StudentNotesResponse {
  semester: number;
  overallAverage: number;
  rank: number;
  classSize: number;
  progression: number;
  absences: number;
  appreciation: string;
  subjects: StudentSubjectGradeResponse[];
}

export interface StudentSubjectGradeResponse {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  value: number;
  evolution: number;
  comment: string;
}

// ── Appels API ───────────────────────────────────────────────────────────────

export const studentService = {
  getDashboard: (studentId: string) =>
    apiRequest<StudentDashboardResponse>(`/student/${studentId}/dashboard`),

  getNotes: (studentId: string, semester?: number) => {
    const query = semester ? `?semester=${semester}` : "";
    return apiRequest<StudentNotesResponse>(
      `/student/${studentId}/notes${query}`,
    );
  },

  getResources: (
    studentId: string,
    params?: { type?: string; search?: string },
  ) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return apiRequest<Resource[]>(`/student/${studentId}/resources${query}`);
  },

  getAll: (params?: { classId?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.classId) qs.set("classId", params.classId);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return apiRequest<StudentResponse[]>(`/users/students${query}`);
  },

  getById: (studentId: string) => {
    return apiRequest<StudentResponse>(`/users/students/${studentId}`);
  },

  update: (studentId: string, data: Partial<StudentResponse>) => {
    return apiRequest<StudentResponse>(`/users/students/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (studentId: string) => {
    return apiRequest<void>(`/users/students/${studentId}`, {
      method: "DELETE",
    });
  },
};
