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
  createdAt: string;
}

export interface AdminAccountRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterSchoolRequest {
  name: string;
  subdomain: string;
  admin: AdminAccountRequest;
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
};
