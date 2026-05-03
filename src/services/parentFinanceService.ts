import { apiRequest } from "./api";
import { StudentResponse, userService } from "./userService";

export type ParentPaymentMethod =
  | "MOBILE_MONEY"
  | "CASH"
  | "BANK_TRANSFER"
  | "CHECK";

export type ParentPaymentStatus = "PENDING" | "PAID" | "PARTIAL" | "OVERDUE";

export interface ParentPaymentResponse {
  id: string;
  amount: number;
  method: ParentPaymentMethod;
  reference: string;
  studentName: string;
  categoryName: string;
  status: ParentPaymentStatus;
  paidAt: string | null;
}

export interface ParentTuitionInstallmentStatusResponse {
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

export interface ParentTuitionStudentStatusResponse {
  studentId: string;
  studentName: string;
  className: string;
  academicYearName: string;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
  hasOverdue: boolean;
  overdueCount: number;
  installments: ParentTuitionInstallmentStatusResponse[];
}

export interface ParentTuitionStatusResponse {
  parentUserId: string;
  parentName: string;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
  hasOverdue: boolean;
  overdueCount: number;
  students: ParentTuitionStudentStatusResponse[];
}

export interface ParentFinanceOverview {
  students: StudentResponse[];
  payments: ParentPaymentResponse[];
  tuitionStatus: ParentTuitionStatusResponse;
}

export const isOpenParentPaymentStatus = (status: ParentPaymentStatus) =>
  status === "PENDING" || status === "PARTIAL" || status === "OVERDUE";

const sortPaymentsByDate = (payments: ParentPaymentResponse[]) =>
  payments.slice().sort((left, right) => {
    const leftDate = left.paidAt ? new Date(left.paidAt).getTime() : 0;
    const rightDate = right.paidAt ? new Date(right.paidAt).getTime() : 0;
    return rightDate - leftDate;
  });

export const parentFinanceService = {
  getOverview: async (
    token: string,
    parentUserId: string,
  ): Promise<ParentFinanceOverview> => {
    const students = await userService.getStudentsByParent(token, parentUserId);

    const [paymentGroups, tuitionStatus] = await Promise.all([
      Promise.all(
        students.map((student) =>
          apiRequest<ParentPaymentResponse[]>(
            `/payments/student/${student.id}`,
            {
              method: "GET",
              token,
            },
          ),
        ),
      ),
      apiRequest<ParentTuitionStatusResponse>(
        `/tuition-fees/parents/${parentUserId}/status`,
        {
          method: "GET",
          token,
        },
      ),
    ]);

    return {
      students,
      payments: sortPaymentsByDate(paymentGroups.flat()),
      tuitionStatus,
    };
  },
};
