// src/services/userService.ts
import { apiRequest } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

// ── Élèves ────────────────────────────────────────────────────────────────────

export interface StudentResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  registrationNumber: string;
  birthDate: string;
  arrivalDate?: string;
  gender: string;
  className: string;
  /** UUID de la famille — backend renvoie familyId */
  familyId?: string;
  /** @deprecated conservé pour rétrocompat, alimenté manuellement côté UI */
  parentName?: string;
  isActive: boolean;
}

export interface StudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  registrationNumber: string;
  birthDate?: string;
  arrivalDate?: string;
  gender?: string;
  classId?: string;
  /** Backend : Student rattaché à une Family (et non plus à un parent unique) */
  familyId?: string;
  /** @deprecated kept for legacy callers — préférer familyId */
  parentId?: string;
}

// ── Réinscription ─────────────────────────────────────────────────────────────

export interface StudentReenrollmentRequest {
  classId: string;
  enrollmentDate?: string;
}

// ── Pré-inscription publique (PreEnrollmentApplication) ───────────────────────

export type PreEnrollmentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PreEnrollmentRequest {
  studentFirstName: string;
  studentLastName: string;
  studentBirthDate: string; // ISO YYYY-MM-DD
  studentGender: string;
  targetClassId: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianRelationship: string;
  guardianAddress: string;
  fatherFirstName?: string;
  fatherLastName?: string;
  fatherEmail?: string;
  fatherPhone?: string;
  fatherProfession?: string;
  motherFirstName?: string;
  motherLastName?: string;
  motherEmail?: string;
  motherPhone?: string;
  motherProfession?: string;
  familyEmail?: string;
  hasCantine: boolean;
  transportMode: string;
  hasTenueScolaire: boolean;
  hasTenueSport: boolean;
  hasTenueScout: boolean;
  hasTenueKarate: boolean;
}

export interface PreEnrollmentResponse {
  id: string;
  referenceNumber: string;
  status: PreEnrollmentStatus;
  studentFirstName: string;
  studentLastName: string;
  studentBirthDate: string;
  studentGender: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianRelationship: string;
  guardianAddress: string;
  targetClassId: string;
  targetClassName: string;
  targetLevel: string;
  hasCantine: boolean;
  transportMode: string;
  hasTenueScolaire: boolean;
  hasTenueSport: boolean;
  hasTenueScout: boolean;
  hasTenueKarate: boolean;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  approvedFamilyId: string | null;
  approvedParentUserId: string | null;
  approvedStudentUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreEnrollmentApprovalRequest {
  studentEmail: string;
  studentPassword: string;
  parentTemporaryPassword?: string;
  arrivalYear?: number;
  registrationNumber?: string;
  arrivalDate?: string;
}

export interface PreEnrollmentDecisionRequest {
  reason: string;
}

// ── Familles ──────────────────────────────────────────────────────────────────

export interface FamilySummaryResponse {
  familyId: string;
}

// ── Enseignants ───────────────────────────────────────────────────────────────

export interface TeacherResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  employeeNumber: string;
  specialty: string;
  hireDate: string;
  isActive: boolean;
}

export interface TeacherRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeNumber: string;
  specialty?: string;
  hireDate?: string;
}

// ── Parents ───────────────────────────────────────────────────────────────────
// Backend : UserRequest / UserResponse avec roleName = "PARENT"

export interface ParentResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleName: string;
  isActive: boolean;
  familyId?: string;
}

export interface ParentRequest {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleName: "PARENT";
  address?: string;
  relationship?: string;
}

// ── Inscription famille (élève + père + mère) ────────────────────────────────
//
// Le backend n'expose pas (encore) un endpoint atomique père+mère+élève. On
// s'appuie sur le flux pré-inscription qui crée déjà Family + Parent + Student
// en une transaction (lors de l'approbation).
export interface FamilyEnrollmentRequest {
  // ─── Élève ───
  studentFirstName: string;
  studentLastName: string;
  studentBirthDate: string;
  studentArrivalDate?: string;
  studentGender: "M" | "F" | "";
  targetClassId: string;
  studentEmail: string;
  studentPassword: string;
  registrationNumber?: string;
  // ─── Père (= guardian principal) ───
  fatherFirstName: string;
  fatherLastName: string;
  fatherEmail: string;
  fatherPhone: string;
  fatherProfession?: string;
  fatherAddress: string;
  fatherTemporaryPassword?: string;
  // ─── Mère (optionnelle) ───
  motherFirstName?: string;
  motherLastName?: string;
  motherEmail?: string;
  motherPhone?: string;
  motherProfession?: string;
  familyEmail?: string;
  hasCantine?: boolean;
  transportMode?: string;
  hasTenueScolaire?: boolean;
  hasTenueSport?: boolean;
  hasTenueScout?: boolean;
  hasTenueKarate?: boolean;
}

// ── Employés ──────────────────────────────────────────────────────────────────
// Backend : UserRequest / UserResponse — roleName choisi par l'admin

export interface EmployeeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleName: string;
  isActive: boolean;
}

export interface EmployeeRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleName: string;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  roleName: string;
  active?: boolean;
  isActive?: boolean;
  avatarUrl?: string | null;
}

export interface ContactResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleName: string;
  isActive: boolean;
  avatarUrl?: string | null;
}

export interface UserProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UserPreferencesRequest {
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  noteNotifications?: boolean;
  absenceNotifications?: boolean;
  hideEmail?: boolean;
  hidePhone?: boolean;
  twoFactorEnabled?: boolean;
}

export interface UserPreferencesResponse {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  pushNotifications: boolean;
  noteNotifications: boolean;
  absenceNotifications: boolean;
  hideEmail: boolean;
  hidePhone: boolean;
  twoFactorEnabled: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const userService = {
  getAllUsers: (token: string) =>
    apiRequest<AdminUserResponse[]>("/users", { token }),

  // ── Élèves ──────────────────────────────────────────────────────────────────

  getAllStudents: (
    token: string,
    params?: { classId?: string; search?: string },
  ) => {
    const qs = new URLSearchParams();
    if (params?.classId) qs.set("classId", params.classId);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return apiRequest<StudentResponse[]>(`/users/students${query}`, { token });
  },

  getStudentsByParent: (token: string, parentUserId: string) =>
    apiRequest<StudentResponse[]>(`/users/parents/${parentUserId}/students`, {
      token,
    }),

  getStudentById: (token: string, id: string) =>
    apiRequest<StudentResponse>(`/users/students/${id}`, { token }),

  createStudent: (token: string, payload: StudentRequest) =>
    apiRequest<StudentResponse>("/users/students", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  updateStudent: (token: string, id: string, payload: StudentRequest) =>
    apiRequest<StudentResponse>(`/users/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    }),

  deleteStudent: (token: string, id: string) =>
    apiRequest<void>(`/users/students/${id}`, { method: "DELETE", token }),

  /** Réinscription — réaffectation d'un élève existant à une nouvelle classe (nouvelle année). */
  reenrollStudent: (
    token: string,
    studentId: string,
    payload: StudentReenrollmentRequest,
  ) =>
    apiRequest<StudentResponse>(`/users/students/${studentId}/reenroll`, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  /** Liste des élèves rattachés à une famille (admin/staff/parent). */
  getStudentsByFamily: (token: string, familyId: string) =>
    apiRequest<StudentResponse[]>(`/users/families/${familyId}/students`, {
      token,
    }),

  // ── Pré-inscription (PreEnrollmentApplication) ──────────────────────────────

  /** Création publique d'une demande de pré-inscription (formulaire en ligne). */
  submitPreEnrollment: (payload: PreEnrollmentRequest) =>
    apiRequest<PreEnrollmentResponse>("/pre-enrollments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Liste des demandes de pré-inscription côté admin (filtre optionnel par statut). */
  getAllPreEnrollments: (token: string, status?: PreEnrollmentStatus) => {
    const query = status ? `?status=${status}` : "";
    return apiRequest<PreEnrollmentResponse[]>(`/pre-enrollments${query}`, {
      token,
    });
  },

  getPreEnrollmentById: (token: string, id: string) =>
    apiRequest<PreEnrollmentResponse>(`/pre-enrollments/${id}`, { token }),

  approvePreEnrollment: (
    token: string,
    id: string,
    payload: PreEnrollmentApprovalRequest,
  ) =>
    apiRequest<PreEnrollmentResponse>(`/pre-enrollments/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  rejectPreEnrollment: (
    token: string,
    id: string,
    payload: PreEnrollmentDecisionRequest,
  ) =>
    apiRequest<PreEnrollmentResponse>(`/pre-enrollments/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  /**
   * Inscription "tout-en-un" depuis l'admin :
   *   1. submit pre-enrollment (père = guardian)
   *   2. approve (crée Family + Père + Élève en une transaction)
   *   3. (optionnel) inscrit la mère comme parent additionnel
   */
  registerFamilyAndStudent: async (
    token: string,
    payload: FamilyEnrollmentRequest,
  ): Promise<PreEnrollmentResponse> => {
    const submitted = await apiRequest<PreEnrollmentResponse>(
      "/pre-enrollments",
      {
        method: "POST",
        body: JSON.stringify({
          studentFirstName: payload.studentFirstName,
          studentLastName: payload.studentLastName,
          studentBirthDate: payload.studentBirthDate,
          studentGender: payload.studentGender,
          targetClassId: payload.targetClassId,
          guardianFirstName: payload.fatherFirstName,
          guardianLastName: payload.fatherLastName,
          guardianEmail: payload.fatherEmail,
          guardianPhone: payload.fatherPhone,
          guardianRelationship: "Pere",
          guardianAddress: payload.fatherAddress,
          fatherFirstName: payload.fatherFirstName,
          fatherLastName: payload.fatherLastName,
          fatherEmail: payload.fatherEmail,
          fatherPhone: payload.fatherPhone,
          fatherProfession: payload.fatherProfession,
          motherFirstName: payload.motherFirstName,
          motherLastName: payload.motherLastName,
          motherEmail: payload.motherEmail,
          motherPhone: payload.motherPhone,
          motherProfession: payload.motherProfession,
          familyEmail: payload.familyEmail,
          hasCantine: !!payload.hasCantine,
          transportMode: payload.transportMode || "NONE",
          hasTenueScolaire: !!payload.hasTenueScolaire,
          hasTenueSport: !!payload.hasTenueSport,
          hasTenueScout: !!payload.hasTenueScout,
          hasTenueKarate: !!payload.hasTenueKarate,
        }),
        token,
      },
    );

    const approvalPayload: any = {
      studentEmail: payload.studentEmail,
      studentPassword: payload.studentPassword,
      parentTemporaryPassword: payload.fatherTemporaryPassword || undefined,
      registrationNumber: payload.registrationNumber,
    };

    if (payload.studentArrivalDate) {
      if (payload.studentArrivalDate.length === 4 && /^\d+$/.test(payload.studentArrivalDate)) {
        approvalPayload.arrivalYear = parseInt(payload.studentArrivalDate, 10);
      } else {
        approvalPayload.arrivalDate = payload.studentArrivalDate.slice(0, 10);
      }
    }

    const approved = await apiRequest<PreEnrollmentResponse>(
      `/pre-enrollments/${submitted.id}/approve`,
      {
        method: "POST",
        body: JSON.stringify(approvalPayload),
        token,
      },
    );

    if (
      payload.motherFirstName?.trim() &&
      payload.motherLastName?.trim() &&
      payload.motherEmail?.trim()
    ) {
      try {
        await apiRequest<unknown>("/users/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email: payload.motherEmail.trim(),
            password:
              payload.fatherTemporaryPassword ||
              `Maman${Math.floor(Math.random() * 10000)}!`,
            firstName: payload.motherFirstName.trim(),
            lastName: payload.motherLastName.trim(),
            phone: payload.motherPhone?.trim() || "",
            roleName: "PARENT",
          }),
          token,
        });
      } catch {
        // Silencieux: l'inscription élève + père est validée même si la mère échoue.
      }
    }

    return approved;
  },

  // ── Enseignants ─────────────────────────────────────────────────────────────

  getAllTeachers: (token: string, search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest<TeacherResponse[]>(`/users/teachers${query}`, { token });
  },

  getTeachersByParent: (token: string, parentUserId: string) =>
    apiRequest<TeacherResponse[]>(`/users/parents/${parentUserId}/teachers`, {
      token,
    }),

  getTeachersByStudent: (token: string, studentUserId: string) =>
    apiRequest<TeacherResponse[]>(`/users/students/${studentUserId}/teachers`, {
      token,
    }),

  getContactsByTeacher: (token: string, teacherUserId: string) =>
    apiRequest<ContactResponse[]>(`/users/teachers/${teacherUserId}/contacts`, {
      token,
    }),

  getTeacherById: (token: string, id: string) =>
    apiRequest<TeacherResponse>(`/users/teachers/${id}`, { token }),

  createTeacher: (token: string, payload: TeacherRequest) =>
    apiRequest<TeacherResponse>("/users/teachers", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  updateTeacher: (token: string, id: string, payload: TeacherRequest) =>
    apiRequest<TeacherResponse>(`/users/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    }),

  deleteTeacher: (token: string, id: string) =>
    apiRequest<void>(`/users/teachers/${id}`, { method: "DELETE", token }),

  // ── Parents ─────────────────────────────────────────────────────────────────

  getAllParents: (token: string) =>
    apiRequest<ParentResponse[]>("/users", { token }).then((users) =>
      users.filter((u) => u.roleName === "PARENT"),
    ),

  createParent: (token: string, payload: ParentRequest) =>
    apiRequest<ParentResponse>("/users/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...payload, roleName: "PARENT" }),
      token,
    }),

  updateParent: (token: string, id: string, payload: ParentRequest) =>
    apiRequest<ParentResponse>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...payload, roleName: "PARENT" }),
      token,
    }),

  deleteParent: (token: string, id: string) =>
    apiRequest<void>(`/users/${id}`, { method: "DELETE", token }),

  deleteFamily: (token: string, id: string) =>
    apiRequest<void>(`/users/families/${id}`, { method: "DELETE", token }),

  // ── Employés ────────────────────────────────────────────────────────────────

  getAllEmployees: (token: string) =>
    apiRequest<EmployeeResponse[]>("/users", { token }).then((users) =>
      users.filter((u) => !["PARENT", "STUDENT"].includes(u.roleName)),
    ),

  createEmployee: (token: string, payload: EmployeeRequest) =>
    apiRequest<EmployeeResponse>("/users/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  updateEmployee: (token: string, id: string, payload: EmployeeRequest) =>
    apiRequest<EmployeeResponse>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    }),

  deleteEmployee: (token: string, id: string) =>
    apiRequest<void>(`/users/${id}`, { method: "DELETE", token }),

  // ── Profil ──────────────────────────────────────────────────────────────────
  updateProfile: (
    token: string,
    userIdOrPayload:
      | string
      | UserProfileUpdateRequest
      | Record<string, unknown>,
    payloadMaybe?: UserProfileUpdateRequest | Record<string, unknown>,
  ) =>
    apiRequest<any>(`/users/me`, {
      method: "PUT",
      body: JSON.stringify(
        typeof userIdOrPayload === "string" ? payloadMaybe : userIdOrPayload,
      ),
      token,
    }),

  getMyPreferences: (token: string) =>
    apiRequest<UserPreferencesResponse>("/users/me/preferences", { token }),

  updateMyPreferences: (token: string, payload: UserPreferencesRequest) =>
    apiRequest<UserPreferencesResponse>("/users/me/preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    }),
};
