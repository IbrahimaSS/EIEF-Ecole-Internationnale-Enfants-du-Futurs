import { apiRequest } from "./api";
import { GradeRequest, GradeResponse, BulkGradeRequest } from "../types/academic";

const BASE_PATH = "/grades";

export const gradeService = {
  // Créer une note individuelle
  create: (request: GradeRequest): Promise<GradeResponse> =>
    apiRequest<GradeResponse>(BASE_PATH, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  // Créer des notes en masse (Bulk)
  bulkCreate: (request: BulkGradeRequest): Promise<GradeResponse[]> =>
    apiRequest<GradeResponse[]>(`${BASE_PATH}/bulk`, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  // Récupérer les notes par élève
  getByStudent: (studentId: string, semester?: number): Promise<GradeResponse[]> => {
    let url = `${BASE_PATH}/student/${studentId}`;
    if (semester) url += `?semester=${semester}`;
    return apiRequest<GradeResponse[]>(url);
  },

  // Récupérer les notes par classe et matière
  getByClassAndSubject: (
    classId: string,
    subjectId: string,
    semester?: number
  ): Promise<GradeResponse[]> => {
    let url = `${BASE_PATH}/class/${classId}/subject/${subjectId}`;
    if (semester) url += `?semester=${semester}`;
    return apiRequest<GradeResponse[]>(url);
  },

  // Mettre à jour une note
  update: (id: string, request: GradeRequest): Promise<GradeResponse> =>
    apiRequest<GradeResponse>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    }),

  // Supprimer une note
  delete: (id: string): Promise<void> =>
    apiRequest<void>(`${BASE_PATH}/${id}`, {
      method: "DELETE",
    }),
};
