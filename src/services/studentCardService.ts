import { apiRequest } from "./api";
import {
  StudentCardScanData,
  StudentCardSummary,
} from "../pages/coordinator/scolarite_module/types";

const PUBLIC_CARD_ROUTE = "/carte-eleve";
const POINTAGE_ROUTE = "/pointage";

/** URL de la page bulletin (notes) — conservée pour rétrocompatibilité */
export const buildStudentCardPublicUrl = (qrToken: string): string => {
  const path = `${PUBLIC_CARD_ROUTE}/${encodeURIComponent(qrToken)}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
};

/** URL de la page de pointage automatique — utilisée par le QR code sur la carte */
export const buildStudentCardPointageUrl = (qrToken: string): string => {
  const path = `${POINTAGE_ROUTE}/${encodeURIComponent(qrToken)}`;
  if (typeof window === "undefined") return path;
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

  /** Enregistre l'arrivée ou le départ de l'élève via son QR code. */
  scanForAttendance: (qrToken: string) =>
    apiRequest<{
      studentId: string;
      studentName: string;
      registrationNumber: string;
      className: string | null;
      avatarUrl: string | null;
      eventType: "ARRIVED" | "DEPARTED" | "ALREADY_OUT";
      eventTime: string;
      date: string;
      message: string;
    }>(`/student-cards/scan/${encodeURIComponent(qrToken)}/checkin`, {
      method: "POST",
    }),

  /** Historique des pointages QR d'un élève (pour espace parent). */
  getAttendanceHistory: (studentId: string) =>
    apiRequest<QrAttendanceLogEntry[]>(
      `/student-cards/attendance/student/${studentId}`
    ),

  /** Pointages QR du jour courant (dashboard live coordinateur). */
  getTodayAttendance: () =>
    apiRequest<QrAttendanceLogEntry[]>(`/student-cards/attendance/today`),
};

export interface QrAttendanceLogEntry {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  className: string | null;
  avatarUrl: string | null;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  /** IN_SCHOOL | DEPARTED */
  status: "IN_SCHOOL" | "DEPARTED";
}
