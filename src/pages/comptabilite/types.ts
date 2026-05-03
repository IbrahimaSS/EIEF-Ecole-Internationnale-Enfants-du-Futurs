export type ComptableSection = 'dashboard' | 'payments' | 'expenses' | 'tuition';

export type PaymentMethod = 'MOBILE_MONEY' | 'CASH' | 'BANK_TRANSFER' | 'CHECK';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
export type TuitionFeePayerType = 'PARENT' | 'STUDENT' | 'OTHER';
export type PaymentServiceOption = 'inscription' | 'reinscription' | 'scolarite' | 'autres';

export interface PaymentResponse {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  studentName: string;
  categoryName: string;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  registrationNumber?: string;
  className?: string;
}

export interface PaymentPayload {
  amount: number;
  reference: string;
  method: PaymentMethod;
  studentId: string;
  categoryId: number | null;
}

export interface ExpenseResponse {
  id: string;
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: number | null;
  categoryName: string | null;
  categoryModule: string | null;
  createdByName: string | null;
  createdAt: string;
}

export interface ExpensePayload {
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: number | null;
}

export interface ExpenseCategoryResponse {
  id: number;
  name: string;
  module: string;
  type: string;
}

export interface ExpenseStatsSummaryResponse {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  currentMonthAmount: number;
  currentMonthCount: number;
  maxAmount: number;
  latestExpenseDate: string | null;
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

export interface TuitionFeePaymentPayload {
  studentId: string;
  installmentId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  payerType: TuitionFeePayerType;
  payerUserId?: string;
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
