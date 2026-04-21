// types/schedule.ts

export interface ScheduleResponse {
  id: string;
  classSubjectId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number; // 1=Lundi, 2=Mardi, ..., 6=Samedi
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  room: string;
  subjectName: string;
  className: string;
  teacherName: string;
}

export interface ScheduleRequest {
  classId: string;
  subjectId: string;
  teacherId?: string;
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  room?: string;
}
