import { apiRequest } from "./api";
import { ScheduleRequest, ScheduleResponse } from "../types/academic";

const BASE_PATH = "/schedules";

export const scheduleService = {
  // Créer un emploi du temps
  create: (request: ScheduleRequest): Promise<ScheduleResponse> =>
    apiRequest<ScheduleResponse>(BASE_PATH, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  // Récupérer tous les emplois du temps
  getAll: (): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(BASE_PATH),

  // Récupérer un emploi du temps par ID
  getById: (id: string): Promise<ScheduleResponse> =>
    apiRequest<ScheduleResponse>(`${BASE_PATH}/${id}`),

  // Récupérer les emplois du temps d'un professeur
  getByTeacher: (teacherId: string): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(`${BASE_PATH}/teacher/${teacherId}`),

  // Récupérer les emplois du temps d'un professeur pour un jour spécifique
  getByTeacherAndDay: (
    teacherId: string,
    day: number
  ): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(`${BASE_PATH}/teacher/${teacherId}/day/${day}`),

  // Récupérer les emplois du temps d'une classe
  getByClass: (classId: string): Promise<ScheduleResponse[]> =>
    apiRequest<ScheduleResponse[]>(`${BASE_PATH}/class/${classId}`),

  // Mettre à jour un emploi du temps
  update: (id: string, request: ScheduleRequest): Promise<ScheduleResponse> =>
    apiRequest<ScheduleResponse>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    }),

  // Supprimer un emploi du temps
  delete: (id: string): Promise<void> =>
    apiRequest<void>(`${BASE_PATH}/${id}`, {
      method: "DELETE",
    }),
};