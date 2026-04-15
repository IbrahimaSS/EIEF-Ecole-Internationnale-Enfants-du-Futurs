import { apiRequest } from "./api";
import {
  AttendanceRequest,
  AttendanceResponse,
  BulkAttendanceRequest,
} from "../types/academic";

const BASE_PATH = "/attendance";

export const attendanceService = {
  // Créer une présence individuelle
  create: (request: AttendanceRequest): Promise<AttendanceResponse> =>
    apiRequest<AttendanceResponse>(BASE_PATH, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  // Créer des présences en masse
  bulkCreate: (request: BulkAttendanceRequest): Promise<AttendanceResponse[]> =>
    apiRequest<AttendanceResponse[]>(`${BASE_PATH}/bulk`, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  // Récupérer les présences par emploi du temps et date
  getByScheduleAndDate: (
    scheduleId: string,
    date: string
  ): Promise<AttendanceResponse[]> =>
    apiRequest<AttendanceResponse[]>(
      `${BASE_PATH}/schedule/${scheduleId}/date/${date}`
    ),

  // Récupérer les présences d'un étudiant
  getByStudent: (studentId: string): Promise<AttendanceResponse[]> =>
    apiRequest<AttendanceResponse[]>(`${BASE_PATH}/student/${studentId}`),

  // Mettre à jour une présence
  update: (
    id: string,
    request: AttendanceRequest
  ): Promise<AttendanceResponse> =>
    apiRequest<AttendanceResponse>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    }),

  // Supprimer une présence
  delete: (id: string): Promise<void> =>
    apiRequest<void>(`${BASE_PATH}/${id}`, {
      method: "DELETE",
    }),
};