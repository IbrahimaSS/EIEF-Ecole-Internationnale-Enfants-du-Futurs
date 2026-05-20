import { apiRequest } from './api';

export type PaymentMethod = 'MOBILE_MONEY' | 'CASH' | 'BANK_TRANSFER' | 'CHECK';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
export type TuitionFeePayerType = 'PARENT' | 'STUDENT' | 'OTHER';

export interface PaymentResponse {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  studentId?: string;
  studentName?: string;
  familyId?: string;
  familyName?: string;
  categoryName: string;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface PaymentRequest {
  amount: number;
  reference: string;
  method: PaymentMethod;
  studentId?: string;
  familyId?: string;
  categoryId?: number | null;
}

export interface TuitionFeePaymentResponse {
  id: string;
  tuitionFeeId: string;
  tuitionFeeName: string;
  installmentId: string;
  installmentLabel: string;
  studentId: string;
  studentName: string;
  payerUserId: string;
  payerName: string;
  payerType: TuitionFeePayerType;
  amount: number;
  method: PaymentMethod;
  reference: string;
  paidAt: string;
}

export interface FamilyTuitionPaymentRequest {
  familyId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  payerType: TuitionFeePayerType;
  payerUserId?: string;
}

export interface TuitionFeeInstallmentStatusResponse {
  tuitionFeeId: string;
  tuitionFeeName: string;
  installmentId: string;
  installmentLabel: string;
  dueDate: string;
  installmentAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdue: boolean;
}

export interface TuitionFeeStudentStatusResponse {
  studentId: string;
  studentName: string;
  className: string;
  academicYearName: string;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
  hasOverdue: boolean;
  overdueCount: number;
  installments: TuitionFeeInstallmentStatusResponse[];
}

export interface TuitionFeeFamilyStatusResponse {
  familyId: string;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
  hasOverdue: boolean;
  overdueCount: number;
  students: TuitionFeeStudentStatusResponse[];
}

export const accountingService = {
  // Generic Payments (Encaissements)
  getPayments: (params?: { studentId?: string; module?: string; query?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.module) searchParams.set('module', params.module);
    if (params?.query) searchParams.set('query', params.query);
    const query = searchParams.toString();
    return apiRequest<PaymentResponse[]>(query ? `/payments/filter?${query}` : '/payments');
  },

  createPayment: (payload: PaymentRequest) =>
    apiRequest<PaymentResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  markAsPaid: (id: string) =>
    apiRequest<PaymentResponse>(`/payments/${id}/pay`, { method: 'PATCH' }),

  deletePayment: (id: string) =>
    apiRequest<void>(`/payments/${id}`, { method: 'DELETE' }),

  // Tuition Fees
  getFamilyStatus: (familyId: string) =>
    apiRequest<TuitionFeeFamilyStatusResponse>(`/tuition-fees/families/${familyId}/status`),

  getStudentStatus: (studentId: string) =>
    apiRequest<TuitionFeeStudentStatusResponse>(`/tuition-fees/students/${studentId}/status`),

  registerFamilyPayment: (payload: FamilyTuitionPaymentRequest) =>
    apiRequest<TuitionFeePaymentResponse[]>('/tuition-fees/families/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  registerStudentPayment: (payload: any) =>
    apiRequest<TuitionFeePaymentResponse>('/tuition-fees/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
