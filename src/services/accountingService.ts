import { apiRequest } from "./api";

export type PaymentMethod = "MOBILE_MONEY" | "CASH" | "BANK_TRANSFER" | "CHECK";
export type PaymentStatus = "PENDING" | "PAID" | "PARTIAL" | "OVERDUE";
export type TuitionFeePayerType = "PARENT" | "STUDENT" | "OTHER";

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

// ---- Monthly Report types ----
export interface MonthlyReportTransactionResponse {
  id: string;
  date: string;
  type: "REVENUE" | "EXPENSE";
  categoryName: string;
  module: string;
  description: string;
  amount: number;
  reference: string;
}

export interface MonthlyReportModuleResponse {
  module: string;
  moduleLabel: string;
  totalRevenue: number;
  totalExpense: number;
  balance: number;
  revenueCount: number;
  expenseCount: number;
  previousMonthRevenue: number;
  previousMonthExpense: number;
  revenueVariation: number;
  expenseVariation: number;
  transactions: MonthlyReportTransactionResponse[];
}

export interface MonthlyReportResponse {
  month: string;
  totalRevenue: number;
  totalExpense: number;
  globalBalance: number;
  totalRevenueCount: number;
  totalExpenseCount: number;
  previousMonthTotalRevenue: number;
  previousMonthTotalExpense: number;
  previousMonthBalance: number;
  revenueVariationPercent: number;
  expenseVariationPercent: number;
  modules: MonthlyReportModuleResponse[];
  allTransactions: MonthlyReportTransactionResponse[];
}

export const accountingService = {
  // Generic Payments (Encaissements)
  getPayments: (params?: {
    studentId?: string;
    module?: string;
    query?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set("studentId", params.studentId);
    if (params?.module) searchParams.set("module", params.module);
    if (params?.query) searchParams.set("query", params.query);
    const query = searchParams.toString();
    return apiRequest<PaymentResponse[]>(
      query ? `/payments/filter?${query}` : "/payments",
    );
  },

  createPayment: (payload: PaymentRequest) =>
    apiRequest<PaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  markAsPaid: (id: string) =>
    apiRequest<PaymentResponse>(`/payments/${id}/pay`, { method: "PATCH" }),

  deletePayment: (id: string) =>
    apiRequest<void>(`/payments/${id}`, { method: "DELETE" }),

  // Tuition Fees
  getFamilyStatus: (familyId: string) =>
    apiRequest<TuitionFeeFamilyStatusResponse>(
      `/tuition-fees/families/${familyId}/status`,
    ),

  getStudentStatus: (studentId: string) =>
    apiRequest<TuitionFeeStudentStatusResponse>(
      `/tuition-fees/students/${studentId}/status`,
    ),

  registerFamilyPayment: (payload: FamilyTuitionPaymentRequest) =>
    apiRequest<TuitionFeePaymentResponse[]>("/tuition-fees/families/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerStudentPayment: (payload: any) =>
    apiRequest<TuitionFeePaymentResponse>("/tuition-fees/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Expenses (Dépenses)
  getExpenses: (params?: {
    categoryId?: number;
    module?: string;
    query?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.categoryId) sp.set("categoryId", String(params.categoryId));
    if (params?.module) sp.set("module", params.module);
    if (params?.query) sp.set("query", params.query);
    const qs = sp.toString();
    return apiRequest<ExpenseResponse[]>(qs ? `/expenses?${qs}` : "/expenses");
  },

  createExpense: (payload: ExpenseRequestPayload) =>
    apiRequest<ExpenseResponse>("/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteExpense: (id: string) =>
    apiRequest<void>(`/expenses/${id}`, { method: "DELETE" }),

  getExpenseCategories: () =>
    apiRequest<ExpenseCategoryResponse[]>("/expenses/categories?type=EXPENSE"),

  // Monthly Financial Reports
  getMonthlyReport: (month?: string) => {
    const qs = month ? `?month=${month}` : "";
    return apiRequest<MonthlyReportResponse>(`/reports/monthly${qs}`);
  },

  exportMonthlyReportExcel: (month?: string) => {
    const qs = month ? `?month=${month}` : "";
    return `/reports/monthly/export/excel${qs}`;
  },
};

// ---- Expense types ----
export interface ExpenseResponse {
  id: string;
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: number;
  categoryName: string;
  categoryModule: string;
  createdByName: string;
  createdAt: string;
}

export interface ExpenseRequestPayload {
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: number;
}

export interface ExpenseCategoryResponse {
  id: number;
  name: string;
  module: string;
  type: string;
}
