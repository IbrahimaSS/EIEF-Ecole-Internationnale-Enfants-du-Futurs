import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../services/api';
import {
  ExpenseCategoryResponse,
  ExpensePayload,
  ExpenseResponse,
  ExpenseStatsSummaryResponse,
  PaymentPayload,
  PaymentResponse,
  Student,
  TuitionFeePaymentPayload,
  TuitionFeePaymentResponse,
  TuitionFeeStudentStatusResponse,
} from '../types';

interface UseComptableFinanceOptions {
  preloadTuition?: boolean;
}

export function useComptableFinance(
  options: UseComptableFinanceOptions = {},
) {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [overduePayments, setOverduePayments] = useState<PaymentResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryResponse[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseStatsSummaryResponse | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentStatus, setSelectedStudentStatus] = useState<TuitionFeeStudentStatusResponse | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      const [paymentData, overdueData] = await Promise.all([
        apiRequest<PaymentResponse[]>('/payments/filter', { method: 'GET' }),
        apiRequest<PaymentResponse[]>('/payments/overdue', { method: 'GET' }),
      ]);
      setPayments(paymentData);
      setOverduePayments(overdueData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des encaissements');
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const refreshExpenses = useCallback(async () => {
    try {
      setExpensesLoading(true);
      const [expenseData, summaryData, categoriesData] = await Promise.all([
        apiRequest<ExpenseResponse[]>('/expenses', { method: 'GET' }),
        apiRequest<ExpenseStatsSummaryResponse>('/expenses/stats/summary', { method: 'GET' }),
        apiRequest<ExpenseCategoryResponse[]>('/expenses/categories', { method: 'GET' }),
      ]);
      setExpenses(expenseData);
      setExpenseSummary(summaryData);
      setExpenseCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des dépenses');
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  const refreshStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>('/users/students', { method: 'GET' });
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des élèves');
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setBootLoading(true);
      setError(null);
      await Promise.all([refreshStudents(), refreshPayments(), refreshExpenses()]);
    } finally {
      setBootLoading(false);
    }
  }, [refreshExpenses, refreshPayments, refreshStudents]);

  const fetchStudentTuitionStatus = useCallback(async (studentId: string) => {
    if (!studentId) return;
    try {
      setTuitionLoading(true);
      setError(null);
      const data = await apiRequest<TuitionFeeStudentStatusResponse>(
        `/tuition-fees/students/${studentId}/status`,
        { method: 'GET' },
      );
      setSelectedStudentStatus(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du statut de scolarité");
    } finally {
      setTuitionLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (payload: PaymentPayload) => {
    try {
      setActionLoading(true);
      setError(null);
      const created = await apiRequest<PaymentResponse>('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await refreshPayments();
      return created;
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement du paiement");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [refreshPayments]);

  const markPaymentAsPaid = useCallback(async (paymentId: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await apiRequest<PaymentResponse>(`/payments/${paymentId}/pay`, {
        method: 'PATCH',
      });
      await refreshPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du paiement');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [refreshPayments]);

  const createExpense = useCallback(async (payload: ExpensePayload) => {
    try {
      setActionLoading(true);
      setError(null);
      await apiRequest<ExpenseResponse>('/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await refreshExpenses();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement de la dépense");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [refreshExpenses]);

  const deleteExpense = useCallback(async (expenseId: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await apiRequest<void>(`/expenses/${expenseId}`, { method: 'DELETE' });
      await refreshExpenses();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la dépense');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [refreshExpenses]);

  const registerTuitionPayment = useCallback(async (payload: TuitionFeePaymentPayload) => {
    try {
      setActionLoading(true);
      setError(null);
      const created = await apiRequest<TuitionFeePaymentResponse>('/tuition-fees/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchStudentTuitionStatus(payload.studentId);
      return created;
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement du versement");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStudentTuitionStatus]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (options.preloadTuition && students.length > 0 && !selectedStudentStatus) {
      void fetchStudentTuitionStatus(students[0].id);
    }
  }, [fetchStudentTuitionStatus, options.preloadTuition, selectedStudentStatus, students]);

  const totals = useMemo(() => {
    const totalRevenue = payments
      .filter((payment) => payment.status === 'PAID')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const expectedRevenue = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );
    const overdueRevenue = overduePayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    return {
      totalRevenue,
      expectedRevenue,
      overdueRevenue,
      collectionRate:
        expectedRevenue > 0
          ? Math.round((totalRevenue / expectedRevenue) * 100)
          : 0,
    };
  }, [overduePayments, payments]);

  return {
    payments,
    overduePayments,
    expenses,
    expenseCategories,
    expenseSummary,
    students,
    selectedStudentStatus,
    bootLoading,
    paymentsLoading,
    expensesLoading,
    tuitionLoading,
    actionLoading,
    error,
    setError,
    totals,
    refreshAll,
    refreshPayments,
    refreshExpenses,
    fetchStudentTuitionStatus,
    createPayment,
    markPaymentAsPaid,
    createExpense,
    deleteExpense,
    registerTuitionPayment,
  };
}
