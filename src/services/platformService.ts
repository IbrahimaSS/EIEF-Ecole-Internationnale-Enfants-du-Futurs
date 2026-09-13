import { apiRequest } from './api';

export type SchoolStatus = 'PROVISIONING' | 'ACTIVE' | 'FAILED';

export interface SchoolResponse {
  id: string;
  name: string;
  subdomain: string;
  schemaName: string;
  status: SchoolStatus;
  provisioningError: string | null;
  createdAt: string;
}

export interface SchoolOverviewResponse {
  id: string;
  name: string;
  subdomain: string;
  status: SchoolStatus;
  userCount: number;
  studentCount: number;
  teacherCount: number;
  pendingAdminCount: number;
  createdAt: string;
}

export interface AdminAccountRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface SchoolProfileRequest {
  shortName?: string;
  slogan?: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  address?: string;
  facebookUrl?: string;
}

export interface RegisterSchoolRequest {
  name: string;
  subdomain: string;
  admin: AdminAccountRequest;
  profile?: SchoolProfileRequest;
}

export interface ResentCredentialsResponse {
  recipients: string[];
  temporaryPassword?: string;
}

/** Même motif que TenantIdentifiers.SUBDOMAIN_PATTERN côté backend. */
export const SUBDOMAIN_PATTERN = /^[a-z][a-z0-9-]{2,29}$/;

export const platformService = {
  getAllSchools: (token: string): Promise<SchoolResponse[]> =>
    apiRequest<SchoolResponse[]>('/platform/schools', { token }),

  getOverview: (token: string): Promise<SchoolOverviewResponse[]> =>
    apiRequest<SchoolOverviewResponse[]>('/platform/schools/overview', { token }),

  registerSchool: (token: string, payload: RegisterSchoolRequest): Promise<SchoolResponse> =>
    apiRequest<SchoolResponse>('/platform/schools', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),

  resendAdminCredentials: (token: string, schoolId: string): Promise<ResentCredentialsResponse> =>
    apiRequest<ResentCredentialsResponse>(`/platform/schools/${schoolId}/admin-credentials`, {
      method: 'POST',
      token,
    }),
};
