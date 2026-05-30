import { apiRequest } from './api';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8080/api/v1';

// ── Types ──────────────────────────────────────────────────────────────────────

export type HomeworkStatus = 'PENDING' | 'SUBMITTED' | 'GRADED';

export interface HomeworkSubmissionResponse {
  id: string;
  studentId: string;
  studentName: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  submittedAt: string | null;
  status: HomeworkStatus;
  grade: number | null;
  feedback: string | null;
}

export interface HomeworkResponse {
  id: string;
  classSubjectId: string;
  subjectName: string;
  className: string;
  teacherName: string;
  teacherId: string;
  title: string;
  description: string | null;
  dueDate: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
  totalStudents: number;
  submittedCount: number;
  mySubmission: HomeworkSubmissionResponse | null;
  submissions: HomeworkSubmissionResponse[];
}

export interface HomeworkRequest {
  classSubjectId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO LocalDateTime
}

export interface HomeworkSubmissionRequest {
  content?: string;
  grade?: number;
  feedback?: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

export const homeworkService = {

  // Professeur

  create: (request: HomeworkRequest, teacherId: string, token: string) =>
    apiRequest<HomeworkResponse>(`/homework?teacherId=${teacherId}`, {
      method: 'POST',
      token,
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
    }),

  attachFile: async (homeworkId: string, file: File, teacherId: string, token: string): Promise<HomeworkResponse> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(
      `${API_BASE_URL}/homework/${homeworkId}/file?teacherId=${teacherId}`,
      {
        method: 'POST',
        headers: { 'enfantsfuture-auth-token': `enfantsfuture ${token}` },
        body: form,
      },
    );
    if (!res.ok) throw new Error('Erreur lors de l\'upload du fichier');
    const json = await res.json();
    return json.data;
  },

  getByTeacher: (teacherId: string, token: string) =>
    apiRequest<HomeworkResponse[]>(`/homework/teacher/${teacherId}`, { token }),

  getSubmissions: (homeworkId: string, requesterId: string, token: string) =>
    apiRequest<HomeworkSubmissionResponse[]>(
      `/homework/${homeworkId}/submissions?requesterId=${requesterId}`,
      { token },
    ),

  gradeSubmission: (submissionId: string, request: HomeworkSubmissionRequest, teacherId: string, token: string) =>
    apiRequest<HomeworkSubmissionResponse>(
      `/homework/submissions/${submissionId}/grade?teacherId=${teacherId}`,
      {
        method: 'PUT',
        token,
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' },
      },
    ),

  // Élève

  getForStudent: (studentId: string, token: string) =>
    apiRequest<HomeworkResponse[]>(`/homework/student/${studentId}`, { token }),

  submit: (homeworkId: string, request: HomeworkSubmissionRequest, studentId: string, token: string) =>
    apiRequest<HomeworkSubmissionResponse>(
      `/homework/${homeworkId}/submit?studentId=${studentId}`,
      {
        method: 'POST',
        token,
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' },
      },
    ),

  submitFile: async (homeworkId: string, file: File, studentId: string, token: string): Promise<HomeworkSubmissionResponse> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(
      `${API_BASE_URL}/homework/${homeworkId}/submit/file?studentId=${studentId}`,
      {
        method: 'POST',
        headers: { 'enfantsfuture-auth-token': `enfantsfuture ${token}` },
        body: form,
      },
    );
    if (!res.ok) throw new Error('Erreur lors de l\'upload du fichier');
    const json = await res.json();
    return json.data;
  },

  // Parent

  getForFamily: (familyId: string, parentId: string, token: string) =>
    apiRequest<HomeworkResponse[]>(`/homework/family/${familyId}?parentId=${parentId}`, { token }),

  // Coordinateur / Admin

  getAll: (token: string) =>
    apiRequest<HomeworkResponse[]>('/homework', { token }),

  getById: (homeworkId: string, requesterId: string, token: string) =>
    apiRequest<HomeworkResponse>(`/homework/${homeworkId}?requesterId=${requesterId}`, { token }),
};

// ── Utilitaires UI ────────────────────────────────────────────────────────────

export const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

export const statusLabel: Record<HomeworkStatus, string> = {
  PENDING: 'À rendre',
  SUBMITTED: 'Rendu',
  GRADED: 'Noté',
};

export const statusColor: Record<HomeworkStatus, string> = {
  PENDING: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  SUBMITTED: 'text-bleu-600 bg-bleu-50 dark:bg-bleu-900/20',
  GRADED: 'text-vert-600 bg-vert-50 dark:bg-vert-900/20',
};
