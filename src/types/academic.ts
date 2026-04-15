import { UUID } from "./auth"; // Adapte selon ton type UUID existant

// ==================== ATTENDANCE ====================

export interface AttendanceRequest {
  studentId: UUID;
  scheduleId: UUID;
  date: string; // ISO date string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note?: string;
}

export interface AttendanceResponse {
  id: UUID;
  studentId: UUID;
  studentName: string;
  scheduleId: UUID;
  date: string;
  status: string;
  note?: string;
}

export interface AttendanceEntry {
  studentId: UUID;
  status: string;
  note?: string;
}

export interface BulkAttendanceRequest {
  scheduleId: UUID;
  date: string;
  entries: AttendanceEntry[];
}

// ==================== SCHEDULE ====================

export interface ScheduleRequest {
  classSubjectId: UUID;
  dayOfWeek: number; // 1-7 (Lundi-Dimanche)
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
  room?: string;
}

export interface ScheduleResponse {
  id: UUID;
  classSubjectId: UUID;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subjectName: string;
  className: string;
  teacherName: string;
}

// ==================== TEACHER DASHBOARD ====================

export interface TeacherClassDetailResponse {
  classId: UUID;
  className: string;
  subjectName: string;
  studentCount: number;
  classAverage: number;
  room?: string;
  level?: string;
}

export interface TeacherStudentResponse {
  studentId: UUID;
  name: string;
  average: number;
  absenceCount: number;
}

export interface TeacherDashboardResponse {
  classCount: number;
  totalStudents: number;
  averageGrade: number;
  hoursThisWeek: number;
  todaySchedule: ScheduleResponse[];
}

// ==================== GRADES ====================

export interface GradeRequest {
  studentId: UUID;
  subjectId: UUID;
  value: number; // 0-20
  semester: number;
  evaluationType?: string;
  comment?: string;
}

export interface GradeResponse {
  id: UUID;
  studentId: UUID;
  studentName: string;
  subjectId: UUID;
  subjectName: string;
  value: number;
  semester: number;
  evaluationType?: string;
  comment?: string;
  gradedAt: string;
}

export interface BulkGradeRequest {
  grades: GradeRequest[];
}

// ==================== CLASSES ====================

export interface ClassRequest {
  name: string;
  level?: string;
  academicYearId: UUID;
  mainTeacherId?: UUID;
  maxStudents: number;
}

export interface ClassResponse {
  id: UUID;
  name: string;
  level?: string;
  academicYearName: string;
  mainTeacherName?: string;
  maxStudents: number;
  studentCount: number;
}

// ==================== SUBJECTS ====================

export interface SubjectRequest {
  name: string;
  code: string;
  coefficient: number;
}

export interface SubjectResponse {
  id: UUID;
  name: string;
  code: string;
  coefficient: number;
}

// ==================== COURSES ====================

export interface CourseRequest {
  classSubjectId: UUID;
  title: string;
  fileUrl?: string;
}

export interface CourseResponse {
  id: UUID;
  title: string;
  fileUrl?: string;
  publishedAt: string;
  subjectName: string;
  className: string;
}