import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../services/api";
import {
  AcademicYearOption,
  ClassOption,
  ExpenseCategoryResponse,
  ExpensePayload,
  ExpenseResponse,
  ExpenseStatsSummaryResponse,
  PaymentPayload,
  PaymentResponse,
  Student,
  TuitionFeePayload,
  TuitionFeePaymentPayload,
  TuitionFeePaymentResponse,
  TuitionFeeResponse,
  TuitionFeeStudentStatusResponse,
} from "../types";

interface UseComptableFinanceOptions {
  preloadTuition?: boolean;
}

export function useComptableFinance(options: UseComptableFinanceOptions = {}) {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [overduePayments, setOverduePayments] = useState<PaymentResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<
    ExpenseCategoryResponse[]
  >([]);
  const [expenseSummary, setExpenseSummary] =
    useState<ExpenseStatsSummaryResponse | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<ClassOption[]>([]);
  const [tuitionFees, setTuitionFees] = useState<TuitionFeeResponse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentStatus, setSelectedStudentStatus] =
    useState<TuitionFeeStudentStatusResponse | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [tuitionCatalogLoading, setTuitionCatalogLoading] = useState(false);
  const [tuitionCatalogInitialized, setTuitionCatalogInitialized] =
    useState(false);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      const [paymentData, overdueData] = await Promise.all([
        apiRequest<PaymentResponse[]>("/payments/filter", { method: "GET" }),
        apiRequest<PaymentResponse[]>("/payments/overdue", { method: "GET" }),
      ]);
      setPayments(paymentData);
      setOverduePayments(overdueData);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des encaissements");
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const refreshExpenses = useCallback(async () => {
    try {
      setExpensesLoading(true);
      const [expenseData, summaryData, categoriesData] = await Promise.all([
        apiRequest<ExpenseResponse[]>("/expenses", { method: "GET" }),
        apiRequest<ExpenseStatsSummaryResponse>("/expenses/stats/summary", {
          method: "GET",
        }),
        apiRequest<ExpenseCategoryResponse[]>("/expenses/categories", {
          method: "GET",
        }),
      ]);
      setExpenses(expenseData);
      setExpenseSummary(summaryData);
      setExpenseCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des dépenses");
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  const refreshStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>("/users/students", {
        method: "GET",
      });
      setStudents(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des élèves");
    }
  }, []);

  const refreshAcademicYears = useCallback(async () => {
    const data = await apiRequest<AcademicYearOption[]>(
      "/courses/academic-years",
      { method: "GET" },
    );
    setAcademicYears(data);
  }, []);

  const refreshSchoolClasses = useCallback(async () => {
    const data = await apiRequest<ClassOption[]>("/courses/classes", {
      method: "GET",
    });
    setSchoolClasses(data);
  }, []);

  const refreshTuitionFees = useCallback(async () => {
    const data = await apiRequest<TuitionFeeResponse[]>(
      "/tuition-fees/modalities",
      { method: "GET" },
    );
    setTuitionFees(data);
  }, []);

  const refreshTuitionCatalog = useCallback(async () => {
    try {
      setTuitionCatalogLoading(true);
      setError(null);
      await Promise.all([
        refreshAcademicYears(),
        refreshSchoolClasses(),
        refreshTuitionFees(),
      ]);
      setTuitionCatalogInitialized(true);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement des modalités de scolarité",
      );
      throw err;
    } finally {
      setTuitionCatalogLoading(false);
    }
  }, [refreshAcademicYears, refreshSchoolClasses, refreshTuitionFees]);

  const refreshAll = useCallback(async () => {
    try {
      setBootLoading(true);
      setError(null);
      await Promise.all([
        refreshStudents(),
        refreshPayments(),
        refreshExpenses(),
      ]);
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
        { method: "GET" },
      );
      setSelectedStudentStatus(data);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement du statut de scolarité",
      );
    } finally {
      setTuitionLoading(false);
    }
  }, []);

  const createTuitionFee = useCallback(
    async (payload: TuitionFeePayload) => {
      try {
        setActionLoading(true);
        setError(null);
        const created = await apiRequest<TuitionFeeResponse>(
          "/tuition-fees/modalities",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        await refreshTuitionCatalog();
        if (selectedStudentStatus?.studentId) {
          await fetchStudentTuitionStatus(selectedStudentStatus.studentId);
        }
        return created;
      } catch (err: any) {
        setError(
          err.message ||
            "Erreur lors de la création de la modalité de scolarité",
        );
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchStudentTuitionStatus, refreshTuitionCatalog, selectedStudentStatus],
  );

  const updateTuitionFee = useCallback(
    async (tuitionFeeId: string, payload: TuitionFeePayload) => {
      try {
        setActionLoading(true);
        setError(null);
        const updated = await apiRequest<TuitionFeeResponse>(
          `/tuition-fees/modalities/${tuitionFeeId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
        await refreshTuitionCatalog();
        if (selectedStudentStatus?.studentId) {
          await fetchStudentTuitionStatus(selectedStudentStatus.studentId);
        }
        return updated;
      } catch (err: any) {
        setError(
          err.message ||
            "Erreur lors de la modification de la modalité de scolarité",
        );
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchStudentTuitionStatus, refreshTuitionCatalog, selectedStudentStatus],
  );

  const deleteTuitionFee = useCallback(
    async (tuitionFeeId: string) => {
      try {
        setActionLoading(true);
        setError(null);
        await apiRequest<void>(`/tuition-fees/modalities/${tuitionFeeId}`, {
          method: "DELETE",
        });
        await refreshTuitionCatalog();
        if (selectedStudentStatus?.studentId) {
          await fetchStudentTuitionStatus(selectedStudentStatus.studentId);
        }
      } catch (err: any) {
        setError(
          err.message ||
            "Erreur lors de la suppression de la modalité de scolarité",
        );
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchStudentTuitionStatus, refreshTuitionCatalog, selectedStudentStatus],
  );

  const createPayment = useCallback(
    async (payload: PaymentPayload) => {
      try {
        setActionLoading(true);
        setError(null);
        const created = await apiRequest<PaymentResponse>("/payments", {
          method: "POST",
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
    },
    [refreshPayments],
  );

  const markPaymentAsPaid = useCallback(
    async (paymentId: string) => {
      try {
        setActionLoading(true);
        setError(null);
        await apiRequest<PaymentResponse>(`/payments/${paymentId}/pay`, {
          method: "PATCH",
        });
        await refreshPayments();
      } catch (err: any) {
        setError(err.message || "Erreur lors de la mise à jour du paiement");
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshPayments],
  );

  const createExpense = useCallback(
    async (payload: ExpensePayload) => {
      try {
        setActionLoading(true);
        setError(null);
        await apiRequest<ExpenseResponse>("/expenses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refreshExpenses();
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de l'enregistrement de la dépense",
        );
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshExpenses],
  );

  const deleteExpense = useCallback(
    async (expenseId: string) => {
      try {
        setActionLoading(true);
        setError(null);
        await apiRequest<void>(`/expenses/${expenseId}`, { method: "DELETE" });
        await refreshExpenses();
      } catch (err: any) {
        setError(err.message || "Erreur lors de la suppression de la dépense");
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [refreshExpenses],
  );

  const registerTuitionPayment = useCallback(
    async (payload: TuitionFeePaymentPayload) => {
      try {
        setActionLoading(true);
        setError(null);
        const created = await apiRequest<TuitionFeePaymentResponse>(
          "/tuition-fees/payments",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        await fetchStudentTuitionStatus(payload.studentId);
        return created;
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'enregistrement du versement");
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchStudentTuitionStatus],
  );

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (
      options.preloadTuition &&
      students.length > 0 &&
      !selectedStudentStatus
    ) {
      void fetchStudentTuitionStatus(students[0].id);
    }
  }, [
    fetchStudentTuitionStatus,
    options.preloadTuition,
    selectedStudentStatus,
    students,
  ]);

  useEffect(() => {
    if (
      options.preloadTuition &&
      !tuitionCatalogInitialized &&
      !tuitionCatalogLoading
    ) {
      void refreshTuitionCatalog();
    }
  }, [
    options.preloadTuition,
    refreshTuitionCatalog,
    tuitionCatalogInitialized,
    tuitionCatalogLoading,
  ]);

  const totals = useMemo(() => {
    const totalRevenue = payments
      .filter((payment) => payment.status === "PAID")
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

  /**
   * Statistiques du mois en cours et des 6 derniers mois.
   * Utilisé par le Dashboard pour afficher les KPIs et le mini-graphique.
   */
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isInCurrentMonth = (dateStr: string | null | undefined) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    const monthRevenue = payments
      .filter(
        (p) => p.status === "PAID" && isInCurrentMonth(p.paidAt),
      )
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const monthExpenses = expenses
      .filter((e) => isInCurrentMonth(e.expenseDate))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const totalRevenue = payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Série des 6 derniers mois (pour le mini-graphique)
    const series: Array<{ month: string; revenue: number; expense: number }> =
      [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const monthIdx = d.getMonth();
      const yearIdx = d.getFullYear();
      const label = d.toLocaleDateString("fr-FR", { month: "short" });

      const revenue = payments
        .filter((p) => {
          if (p.status !== "PAID" || !p.paidAt) return false;
          const pd = new Date(p.paidAt);
          return pd.getMonth() === monthIdx && pd.getFullYear() === yearIdx;
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const expense = expenses
        .filter((e) => {
          if (!e.expenseDate) return false;
          const ed = new Date(e.expenseDate);
          return ed.getMonth() === monthIdx && ed.getFullYear() === yearIdx;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);

      series.push({ month: label, revenue, expense });
    }

    return {
      monthRevenue,
      monthExpenses,
      monthBalance: monthRevenue - monthExpenses,
      totalBalance: totalRevenue - totalExpenses,
      totalExpenses,
      series,
    };
  }, [payments, expenses]);

  return {
    payments,
    overduePayments,
    expenses,
    expenseCategories,
    expenseSummary,
    academicYears,
    schoolClasses,
    tuitionFees,
    students,
    selectedStudentStatus,
    bootLoading,
    paymentsLoading,
    expensesLoading,
    tuitionCatalogLoading,
    tuitionLoading,
    actionLoading,
    error,
    setError,
    totals,
    monthlyStats,
    refreshAll,
    refreshPayments,
    refreshExpenses,
    refreshTuitionCatalog,
    fetchStudentTuitionStatus,
    createPayment,
    markPaymentAsPaid,
    createExpense,
    deleteExpense,
    createTuitionFee,
    updateTuitionFee,
    deleteTuitionFee,
    registerTuitionPayment,
  };
}
