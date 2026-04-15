import { apiRequest } from "./api";
import {
  TeacherClassDetailResponse,
  TeacherDashboardResponse,
  TeacherStudentResponse,
} from "../types/academic";

const BASE_PATH = "/teacher";

export const teacherService = {
  // Récupérer le tableau de bord du professeur
  getDashboard: (userId: string): Promise<TeacherDashboardResponse> =>
    apiRequest<TeacherDashboardResponse>(
      `${BASE_PATH}/dashboard?userId=${userId}`
    ),

  // Récupérer les classes du professeur
  getClasses: (userId: string): Promise<TeacherClassDetailResponse[]> =>
    apiRequest<TeacherClassDetailResponse[]>(
      `${BASE_PATH}/classes?userId=${userId}`
    ),

  // Récupérer les étudiants d'une classe
  getClassStudents: (
    classId: string,
    subjectId: string
  ): Promise<TeacherStudentResponse[]> =>
    apiRequest<TeacherStudentResponse[]>(
      `${BASE_PATH}/classes/${classId}/students?subjectId=${subjectId}`
    ),
};