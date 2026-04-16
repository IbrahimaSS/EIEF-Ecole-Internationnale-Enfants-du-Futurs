// src/services/adminService.ts
import { apiRequest } from './api';

export interface DashboardResponse {
  totalStudents: number;
  totalTeachers: number;
  totalUsers: number;
  pendingPayments: number;
  totalRevenue: number;
  tuitionRevenue: number;
  cafeteriaRevenue: number;
  transportRevenue: number;
  storeRevenue: number;
  totalExpenses: number;
  netResult: number;
  activeLoans: number;
  unreadMessages: number;
}

export const adminService = {
  getDashboard: (token: string) =>
    apiRequest<DashboardResponse>('/admin/dashboard', { token }),
};