import { apiRequest } from "./api";

// ── Types alignés sur les DTO backend ────────────────────────────────────────

export type ReassignmentChange = "PROMOTED" | "DEMOTED" | "UNCHANGED" | "UNRANKED";

export interface ReassignmentClassSummary {
  classId: string;
  name: string;
  rankOrder: number;
  capacity: number;
  currentCount: number;
  targetCount: number;
}

export interface ReassignmentItem {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  average: number | null;
  gradeCount: number;
  currentClassId: string | null;
  currentClassName: string | null;
  targetClassId: string;
  targetClassName: string;
  change: ReassignmentChange;
}

export interface ReassignmentPlanResponse {
  level: string;
  semester: number;
  computedAt: string;
  classes: ReassignmentClassSummary[];
  items: ReassignmentItem[];
}

export interface ApplyReassignmentItem {
  studentId: string;
  targetClassId: string;
}

export interface ApplyReassignmentRequest {
  level: string;
  semester: number;
  enrollmentDate?: string; // ISO YYYY-MM-DD
  items: ApplyReassignmentItem[];
}

// ── Appels API ───────────────────────────────────────────────────────────────

export const reassignmentService = {
  /**
   * Prévisualise le plan de permutation pour un niveau et un semestre donnés.
   * Aucune modification de la base — le résultat peut être ajusté côté UI
   * avant d'être confirmé via apply().
   */
  preview: (level: string, semester: number) => {
    const qs = new URLSearchParams({ level, semester: String(semester) });
    return apiRequest<ReassignmentPlanResponse>(
      `/class-reassignment/preview?${qs.toString()}`,
    );
  },

  /**
   * Applique un plan ajusté : les rattachements de classe sont mis à jour
   * pour chaque élève listé, et une nouvelle StudentClassEnrollment ACTIVE
   * est créée.
   */
  apply: (request: ApplyReassignmentRequest) =>
    apiRequest<ReassignmentPlanResponse>("/class-reassignment/apply", {
      method: "POST",
      body: JSON.stringify(request),
    }),
};
