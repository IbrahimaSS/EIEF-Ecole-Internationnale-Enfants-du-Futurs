import { apiRequest } from "./api";
import {
  StudentCardScanData,
  StudentCardSummary,
} from "../pages/manager/scolarite/types";

const PUBLIC_CARD_ROUTE = "/carte-eleve";

export const buildStudentCardPublicUrl = (qrToken: string): string => {
  const path = `${PUBLIC_CARD_ROUTE}/${encodeURIComponent(qrToken)}`;

  if (typeof window === "undefined") {
    return path;
  }

  return `${window.location.origin}${path}`;
};

export const studentCardService = {
  getByStudentId: (studentId: string) =>
    apiRequest<StudentCardSummary>(`/student-cards/students/${studentId}`),

  generate: (studentId: string) =>
    apiRequest<StudentCardSummary>(
      `/student-cards/students/${studentId}/generate`,
      {
        method: "POST",
      },
    ),

  regenerate: (studentId: string) =>
    apiRequest<StudentCardSummary>(
      `/student-cards/students/${studentId}/regenerate`,
      {
        method: "POST",
      },
    ),

  getPublicCard: (qrToken: string, semester?: number) => {
    const query = semester ? `?semester=${semester}` : "";
    return apiRequest<StudentCardScanData>(
      `/student-cards/scan/${encodeURIComponent(qrToken)}${query}`,
    );
  },
};
