import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  Download,
  Search,
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  FileText,
  CheckCircle2,
  X,
  Loader2,
  Printer,
  BookOpen,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { Table, Badge, StatCard, Card, Button, Modal, Input, Popover, Avatar } from '../../components/ui';
import { apiRequest } from '../../services/api';
import TuitionModalityManager from '../comptabilite/components/TuitionModalityManager';
import { AcademicYearOption, ClassOption, TuitionFeePayload } from '../comptabilite/types';

// ─── Enums ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'MOBILE_MONEY' | 'CASH' | 'BANK_TRANSFER' | 'CHECK';
type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
type TuitionFeePayerType = 'PARENT' | 'STUDENT' | 'OTHER';
type PaymentServiceOption = 'inscription' | 'reinscription' | 'scolarite' | 'autres';

// ─── Types backend-aligned ────────────────────────────────────────────────────

interface PaymentResponse {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  studentName: string;
  categoryName: string;
  status: PaymentStatus;
  paidAt: string | null;
}

interface ExpenseResponse {
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

interface PaymentPayload {
  amount: number;
  reference: string;
  method: PaymentMethod;
  studentId: string;
  categoryId: number | null;
}

interface ExpensePayload {
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: number | null;
}

interface ExpenseCategoryResponse {
  id: number;
  name: string;
  module: string;
  type: string;
}

interface ExpenseStatsSummaryResponse {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  currentMonthAmount: number;
  currentMonthCount: number;
  maxAmount: number;
  latestExpenseDate: string | null;
}

interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  registrationNumber?: string;
  className?: string;
  email?: string;
  phone?: string;
  gender?: string;
  isActive?: boolean;
  parentName?: string;
  birthDate?: string;
}

// TuitionFee DTOs
interface TuitionFeeInstallmentResponse {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  installmentOrder: number;
}

interface TuitionFeeResponse {
  id: string;
  name: string;
  description: string;
  academicYearId: string;
  academicYearName: string;
  totalAmount: number;
  isActive: boolean;
  classIds: string[];
  classNames: string[];
  installments: TuitionFeeInstallmentResponse[];
}

// ── FIX: champs alignés avec le backend ──────────────────────────────────────
interface TuitionFeeInstallmentStatusResponse {
  tuitionFeeId: string;
  tuitionFeeName: string;
  installmentId: string;
  installmentLabel: string;   // ← était "label" (inexistant)
  dueDate: string;
  installmentAmount: number;  // ← était "expectedAmount" (inexistant)
  paidAmount: number;
  remainingAmount: number;
  overdue: boolean;
}

interface TuitionFeeStudentStatusResponse {
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

interface TuitionFeePaymentPayload {
  studentId: string;
  installmentId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  payerType: TuitionFeePayerType;
  payerUserId?: string;
}

interface TuitionFeePaymentResponse {
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

// ─── Composant principal ──────────────────────────────────────────────────────

const AdminAccounting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses' | 'tuition'>('payments');

  // Payments state
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [overduePayments, setOverduePayments] = useState<PaymentResponse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment modals
  const [isEncaissementModalOpen, setIsEncaissementModalOpen] = useState(false);
  const [isRapportsModalOpen, setIsRapportsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] = useState<Student | null>(null);
  const [selectedPaymentService, setSelectedPaymentService] = useState<PaymentServiceOption>('scolarite');
  const [otherPaymentServiceLabel, setOtherPaymentServiceLabel] = useState('');
  const [receiptServiceOverride, setReceiptServiceOverride] = useState<string | null>(null);

  const [formData, setFormData] = useState<PaymentPayload>({
    amount: 0,
    reference: '',
    method: 'CASH',
    studentId: '',
    categoryId: null,
  });

  // Expenses state
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryResponse[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseStatsSummaryResponse | null>(null);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState<ExpensePayload>({
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: null,
  });

  // Tuition fees state
  const [tuitionFees, setTuitionFees] = useState<TuitionFeeResponse[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<ClassOption[]>([]);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [tuitionActionLoading, setTuitionActionLoading] = useState(false);
  const [selectedStudentStatus, setSelectedStudentStatus] = useState<TuitionFeeStudentStatusResponse | null>(null);
  const [statusStudentId, setStatusStudentId] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [isTuitionPaymentModalOpen, setIsTuitionPaymentModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<TuitionFeeInstallmentStatusResponse | null>(null);
  const [tuitionPaymentForm, setTuitionPaymentForm] = useState<TuitionFeePaymentPayload>({
    studentId: '',
    installmentId: '',
    amount: 0,
    method: 'CASH',
    reference: '',
    payerType: 'PARENT',
    payerUserId: undefined,
  });
  const [tuitionSubmitting, setTuitionSubmitting] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);
  };

  const getApiBaseUrl = () =>
    (process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8080/api/v1');

  const getToken = (): string | null => {
    try {
      const raw = window.localStorage.getItem('auth-storage');
      return raw ? (JSON.parse(raw)?.state?.token ?? null) : null;
    } catch { return null; }
  };

  const downloadReport = async (path: string, fallbackFileName: string, openInNewTab = false) => {
    try {
      const token = getToken();
      const res = await fetch(`${getApiBaseUrl()}${path}`, {
        method: 'GET',
        headers: token ? { 'enfantsfuture-auth-token': `enfantsfuture ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      if (openInNewTab) {
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
      } else {
        const disposition = res.headers.get('content-disposition') || '';
        const matchedFileName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = matchedFileName || fallbackFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      showSuccess('Rapport généré avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération du rapport');
    }
  };

  // ── Fetch payments ────────────────────────────────────────────────────────

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const studentId = selectedStudentFilter !== 'all' ? selectedStudentFilter : undefined;
      const categoryModule = filterCategory !== 'Tous' ? filterCategory : undefined;
      const trimmedSearch = searchQuery.trim();
      const params = new URLSearchParams();
      if (studentId) params.set('studentId', studentId);
      if (categoryModule) params.set('module', categoryModule);
      if (trimmedSearch) params.set('query', trimmedSearch);
      const query = params.toString();
      const endpoint = query ? `/payments/filter?${query}` : '/payments/filter';
      const data = await apiRequest<PaymentResponse[]>(endpoint, { method: 'GET' });
      setPayments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQuery, selectedStudentFilter]);

  const fetchOverduePayments = useCallback(async () => {
    try {
      const data = await apiRequest<PaymentResponse[]>('/payments/overdue', { method: 'GET' });
      setOverduePayments(data);
    } catch (err: any) {
      console.error('Erreur chargement impayés:', err);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>('/users/students', { method: 'GET' });
      setStudents(data);
    } catch (err: any) {
      console.error('Erreur chargement élèves:', err);
    }
  }, []);

  // ── Fetch tuition fees ────────────────────────────────────────────────────

  const fetchExpenseCategories = useCallback(async () => {
    try {
      const module = filterCategory !== 'Tous' ? `?module=${encodeURIComponent(filterCategory)}` : '';
      const data = await apiRequest<ExpenseCategoryResponse[]>(`/expenses/categories${module}`, { method: 'GET' });
      setExpenseCategories(data);
    } catch (err: any) {
      console.error('Erreur chargement catÃ©gories dÃ©penses:', err);
    }
  }, [filterCategory]);

  const fetchExpenseSummary = useCallback(async () => {
    try {
      const data = await apiRequest<ExpenseStatsSummaryResponse>('/expenses/stats/summary', { method: 'GET' });
      setExpenseSummary(data);
    } catch (err: any) {
      console.error('Erreur chargement synthÃ¨se dÃ©penses:', err);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      setExpenseLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'Tous') params.set('module', filterCategory);
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      const query = params.toString();
      const endpoint = query ? `/expenses?${query}` : '/expenses';
      const data = await apiRequest<ExpenseResponse[]>(endpoint, { method: 'GET' });
      setExpenses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des dÃ©penses');
    } finally {
      setExpenseLoading(false);
    }
  }, [filterCategory, searchQuery]);

  const fetchTuitionFees = useCallback(async () => {
    const data = await apiRequest<TuitionFeeResponse[]>('/tuition-fees/modalities', { method: 'GET' });
    setTuitionFees(data);
  }, []);

  const fetchAcademicYears = useCallback(async () => {
    const data = await apiRequest<AcademicYearOption[]>('/courses/academic-years', { method: 'GET' });
    setAcademicYears(data);
  }, []);

  const fetchSchoolClasses = useCallback(async () => {
    const data = await apiRequest<ClassOption[]>('/courses/classes', { method: 'GET' });
    setSchoolClasses(data);
  }, []);

  const refreshTuitionCatalog = useCallback(async () => {
    try {
      setTuitionLoading(true);
      await Promise.all([fetchTuitionFees(), fetchAcademicYears(), fetchSchoolClasses()]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des modalités de scolarité');
      throw err;
    } finally {
      setTuitionLoading(false);
    }
  }, [fetchAcademicYears, fetchSchoolClasses, fetchTuitionFees]);

  const fetchStudentTuitionStatus = async (studentId: string) => {
    if (!studentId) return;
    try {
      setStatusLoading(true);
      const data = await apiRequest<TuitionFeeStudentStatusResponse>(
        `/tuition-fees/students/${studentId}/status`,
        { method: 'GET' }
      );
      setSelectedStudentStatus(data);
    } catch (err: any) {
      setError(err.message || 'Erreur chargement du statut élève');
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchOverduePayments();
  }, [fetchStudents, fetchOverduePayments]);

  useEffect(() => {
    const timer = window.setTimeout(() => { fetchPayments(); }, 300);
    return () => window.clearTimeout(timer);
  }, [fetchPayments]);

  useEffect(() => {
    if (activeTab !== 'expenses') return;
    const timer = window.setTimeout(() => { fetchExpenses(); }, 300);
    return () => window.clearTimeout(timer);
  }, [activeTab, fetchExpenses]);

  useEffect(() => {
    if (activeTab !== 'expenses') return;
    fetchExpenseCategories();
  }, [activeTab, fetchExpenseCategories]);

  useEffect(() => {
    fetchExpenseSummary();
  }, [fetchExpenseSummary]);

  useEffect(() => {
    if (activeTab === 'tuition') {
      void refreshTuitionCatalog();
    }
  }, [activeTab, refreshTuitionCatalog]);

  // ── KPIs ─────────────────────────────────────────────────────────────────

  const totalRecettes = payments
    .filter(p => p.status === 'PAID')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalAttendu = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalImpayes = overduePayments.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const tauxRecouvrement = totalAttendu > 0 ? Math.round((totalRecettes / totalAttendu) * 100) : 0;
  const overdueCount = overduePayments.length;
  const totalDepenses = Number(expenseSummary?.totalAmount || 0);
  const depensesMois = Number(expenseSummary?.currentMonthAmount || 0);
  const depenseMoyenne = Number(expenseSummary?.averageAmount || 0);
  const nombreDepenses = Number(expenseSummary?.expenseCount || 0);

  // ── Formatage ─────────────────────────────────────────────────────────────

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-GN').format(amount) + ' FGN';

  const formatDate = (val: string | null | undefined) =>
    val ? new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const formatDateFull = (val: string | null | undefined) =>
    val
      ? new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'MOBILE_MONEY': return <Smartphone size={14} className="text-orange-500" />;
      case 'CASH': return <Banknote size={14} className="text-green-500" />;
      case 'BANK_TRANSFER': return <CreditCard size={14} className="text-blue-500" />;
      case 'CHECK': return <FileText size={14} className="text-purple-500" />;
      default: return null;
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'MOBILE_MONEY': return 'Mobile Money';
      case 'CASH': return 'Espèces';
      case 'BANK_TRANSFER': return 'Virement';
      case 'CHECK': return 'Chèque';
      default: return method;
    }
  };

  const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'PARTIAL': return 'Partiel';
      case 'PENDING': return 'En attente';
      case 'OVERDUE': return 'En retard';
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const cls = 'text-[9px] px-3 font-bold uppercase tracking-widest';
    switch (status) {
      case 'PAID': return <Badge variant="success" className={cls}>Payé</Badge>;
      case 'PARTIAL': return <Badge variant="warning" className={cls}>Partiel</Badge>;
      case 'PENDING': return <Badge variant="default" className={cls}>En attente</Badge>;
      case 'OVERDUE': return <Badge variant="error" className={cls}>En retard</Badge>;
    }
  };

  const resolveStudentByName = (name: string): Student | null =>
    students.find(s => `${s.firstName} ${s.lastName}` === name) ?? null;

  // ── CRUD Payments ─────────────────────────────────────────────────────────

  const handleCreatePayment = async () => {
    if (isSubmitting) return;
    const resolvedServiceLabel = resolvePaymentServiceLabel(selectedPaymentService, otherPaymentServiceLabel);
    if (selectedPaymentService === 'autres' && !otherPaymentServiceLabel.trim()) {
      setError('Veuillez préciser le service si vous choisissez "Autres".');
      return;
    }
    const baseRef = formData.reference.trim() || `REF-${Date.now().toString().slice(-6)}`;
    const payload: PaymentPayload = {
      amount: Number(formData.amount),
      reference: `${baseRef} - ${resolvedServiceLabel}`,
      method: formData.method,
      studentId: formData.studentId,
      categoryId: formData.categoryId,
    };
    try {
      setIsSubmitting(true);
      const created = await apiRequest<PaymentResponse>('/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const student = students.find(s => s.id === payload.studentId) ?? null;
      setSelectedStudentForReceipt(student);
      setSelectedPayment(created);
      setReceiptServiceOverride(resolvedServiceLabel);
      setIsEncaissementModalOpen(false);
      setIsReceiptModalOpen(true);
      showSuccess('Encaissement créé avec succès');
      setFormData({ amount: 0, reference: '', method: 'CASH', studentId: '', categoryId: null });
      setSelectedPaymentService('scolarite');
      setOtherPaymentServiceLabel('');
      await Promise.all([fetchPayments(), fetchOverduePayments()]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await apiRequest<PaymentResponse>(`/payments/${id}/pay`, { method: 'PATCH' });
      showSuccess('Paiement marqué comme payé');
      await Promise.all([fetchPayments(), fetchOverduePayments()]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;
    try {
      const token = getToken();
      const res = await fetch(`${getApiBaseUrl()}/payments/${id}`, {
        method: 'DELETE',
        headers: token ? { 'enfantsfuture-auth-token': `enfantsfuture ${token}` } : {},
      });
      if (!res.ok && res.status !== 204) throw new Error(`Erreur HTTP ${res.status}`);
      showSuccess('Paiement supprimé');
      await Promise.all([fetchPayments(), fetchOverduePayments()]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // ── Tuition fee payment ───────────────────────────────────────────────────

  const handleCreateExpense = async () => {
    if (expenseSubmitting) return;
    if (!expenseForm.amount || !expenseForm.description.trim() || !expenseForm.expenseDate || !expenseForm.categoryId) {
      setError('Veuillez renseigner la catÃ©gorie, la description, la date et le montant de la dÃ©pense.');
      return;
    }

    try {
      setExpenseSubmitting(true);
      await apiRequest<ExpenseResponse>('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(expenseForm.amount),
          description: expenseForm.description.trim(),
          expenseDate: expenseForm.expenseDate,
          categoryId: expenseForm.categoryId,
        }),
      });
      showSuccess('DÃ©pense enregistrÃ©e avec succÃ¨s');
      setIsExpenseModalOpen(false);
      setExpenseForm({
        amount: 0,
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        categoryId: null,
      });
      await Promise.all([fetchExpenses(), fetchExpenseSummary(), fetchExpenseCategories()]);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement de la dÃ©pense");
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('ÃŠtes-vous sÃ»r de vouloir supprimer cette dÃ©pense ?')) return;
    try {
      await apiRequest<void>(`/expenses/${id}`, { method: 'DELETE' });
      showSuccess('DÃ©pense supprimÃ©e');
      await Promise.all([fetchExpenses(), fetchExpenseSummary()]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la dÃ©pense');
    }
  };

  const openTuitionPaymentModal = (
    installment: TuitionFeeInstallmentStatusResponse,
    studentId: string
  ) => {
    setSelectedInstallment(installment);
    setTuitionPaymentForm({
      studentId,
      installmentId: installment.installmentId,
      amount: Number(installment.remainingAmount),
      method: 'CASH',
      reference: '',
      payerType: 'PARENT',
      payerUserId: undefined,
    });
    setIsTuitionPaymentModalOpen(true);
  };

  const handleRegisterTuitionPayment = async () => {
    if (tuitionSubmitting) return;
    try {
      setTuitionSubmitting(true);
      await apiRequest<TuitionFeePaymentResponse>('/tuition-fees/payments', {
        method: 'POST',
        body: JSON.stringify(tuitionPaymentForm),
      });
      showSuccess('Versement de scolarité enregistré');
      setIsTuitionPaymentModalOpen(false);
      if (statusStudentId) await fetchStudentTuitionStatus(statusStudentId);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement du versement');
    } finally {
      setTuitionSubmitting(false);
    }
  };

  const createTuitionFee = async (payload: TuitionFeePayload) => {
    try {
      setTuitionActionLoading(true);
      setError(null);
      const created = await apiRequest<TuitionFeeResponse>('/tuition-fees/modalities', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showSuccess('Modalité de scolarité créée');
      await refreshTuitionCatalog();
      if (statusStudentId) {
        await fetchStudentTuitionStatus(statusStudentId);
      }
      return created;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la modalité de scolarité');
      throw err;
    } finally {
      setTuitionActionLoading(false);
    }
  };

  const updateTuitionFee = async (tuitionFeeId: string, payload: TuitionFeePayload) => {
    try {
      setTuitionActionLoading(true);
      setError(null);
      const updated = await apiRequest<TuitionFeeResponse>(`/tuition-fees/modalities/${tuitionFeeId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showSuccess('Modalité de scolarité mise à jour');
      await refreshTuitionCatalog();
      if (statusStudentId) {
        await fetchStudentTuitionStatus(statusStudentId);
      }
      return updated;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de la modalité de scolarité');
      throw err;
    } finally {
      setTuitionActionLoading(false);
    }
  };

  const deleteTuitionFee = async (tuitionFeeId: string) => {
    try {
      setTuitionActionLoading(true);
      setError(null);
      await apiRequest<void>(`/tuition-fees/modalities/${tuitionFeeId}`, {
        method: 'DELETE',
      });
      showSuccess('Modalité de scolarité supprimée');
      await refreshTuitionCatalog();
      if (statusStudentId) {
        await fetchStudentTuitionStatus(statusStudentId);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la modalité de scolarité');
      throw err;
    } finally {
      setTuitionActionLoading(false);
    }
  };

  // ── Reçu ─────────────────────────────────────────────────────────────────

  const openReceiptModal = (payment: PaymentResponse) => {
    setSelectedPayment(payment);
    setSelectedStudentForReceipt(resolveStudentByName(payment.studentName));
    setReceiptServiceOverride(payment.categoryName || null);
    setIsReceiptModalOpen(true);
    setOpenMenuRowId(null);
  };

  const numberToFrenchWords = (n: number): string => {
    if (!n || n < 0) return 'zéro';
    n = Math.floor(n);
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
      'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
    const lessThan100 = (x: number): string => {
      if (x < 20) return units[x];
      const t = Math.floor(x / 10);
      const u = x % 10;
      if (t === 7 || t === 9) {
        const base = t === 7 ? 'soixante' : 'quatre-vingt';
        return `${base}${u === 1 && t === 7 ? ' et ' : '-'}${units[10 + u]}`;
      }
      if (u === 0) return tens[t] + (t === 8 ? 's' : '');
      if (u === 1 && t !== 8) return `${tens[t]} et un`;
      return `${tens[t]}-${units[u]}`;
    };
    const lessThan1000 = (x: number): string => {
      if (x < 100) return lessThan100(x);
      const h = Math.floor(x / 100);
      const r = x % 100;
      const hundredPart = h === 1 ? 'cent' : `${units[h]} cent${r === 0 ? 's' : ''}`;
      return r === 0 ? hundredPart : `${hundredPart} ${lessThan100(r)}`;
    };
    if (n < 1000) return lessThan1000(n);
    if (n < 1000000) {
      const k = Math.floor(n / 1000);
      const r = n % 1000;
      const thousandPart = k === 1 ? 'mille' : `${lessThan1000(k)} mille`;
      return r === 0 ? thousandPart : `${thousandPart} ${lessThan1000(r)}`;
    }
    const m = Math.floor(n / 1000000);
    const r = n % 1000000;
    const millionPart = m === 1 ? 'un million' : `${lessThan1000(m)} millions`;
    if (r === 0) return millionPart;
    if (r < 1000) return `${millionPart} ${lessThan1000(r)}`;
    const k = Math.floor(r / 1000);
    const u = r % 1000;
    const thousandPart = k === 1 ? 'mille' : `${lessThan1000(k)} mille`;
    return u === 0 ? `${millionPart} ${thousandPart}` : `${millionPart} ${thousandPart} ${lessThan1000(u)}`;
  };

  const paymentServiceOptions: Array<{ value: PaymentServiceOption; label: string }> = [
    { value: 'inscription', label: 'Inscription' },
    { value: 'reinscription', label: 'Réinscription' },
    { value: 'scolarite', label: 'Scolarité' },
    { value: 'autres', label: 'Autres' },
  ];

  const resolvePaymentServiceLabel = (
    service: PaymentServiceOption,
    otherLabel?: string,
  ) => {
    switch (service) {
      case 'inscription': return 'Inscription';
      case 'reinscription': return 'Réinscription';
      case 'scolarite': return 'Scolarité';
      case 'autres': return otherLabel?.trim() || 'Autres';
    }
  };

  const detectPaymentType = (payment: PaymentResponse, categoryName?: string | null): 'inscription' | 'reinscription' | 'scolarite' | 'autres' => {
    const name = ((categoryName || '') + ' ' + (payment.reference || '')).toLowerCase();
    if (name.includes('réinscription') || name.includes('reinscription')) return 'reinscription';
    if (name.includes('inscription')) return 'inscription';
    if (name.includes('scolarit')) return 'scolarite';
    return 'autres';
  };

  const printReceipt = async (payment: PaymentResponse, student?: Student | null) => {
    const resolvedStudent = student !== undefined ? student : selectedStudentForReceipt;
    const resolvedCategoryName = payment.categoryName || receiptServiceOverride || '';
    const studentFullName = payment.studentName || '';
    const className = resolvedStudent?.className || '';
    const matricule = resolvedStudent?.registrationNumber || '';
    const amountNum = Number(payment.amount) || 0;
    const amountFmt = new Intl.NumberFormat('fr-GN').format(amountNum);
    const amountWords = numberToFrenchWords(amountNum);
    const dateFmt = formatDateFull(payment.paidAt);
    const type = detectPaymentType(payment, resolvedCategoryName);

    let remainingAmountText = '';
    let monthsInfoText = '';

    if (resolvedStudent && resolvedStudent.id) {
      try {
        const status = await apiRequest<TuitionFeeStudentStatusResponse>(`/tuition-fees/students/${resolvedStudent.id}/status`, { method: 'GET' });
        remainingAmountText = new Intl.NumberFormat('fr-GN').format(status.totalRemaining) + ' GNF';
        const monthsPaid = status.installments.filter(i => i.remainingAmount === 0).length;
        const monthsRemaining = status.installments.filter(i => i.remainingAmount > 0).length;
        monthsInfoText = `Mois payés : ${monthsPaid} | Mois restants : ${monthsRemaining}`;
      } catch(e) {
        console.error('Failed to fetch student tuition status for receipt', e);
      }
    }

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Reçu N° ${payment.reference || ''} - EIEF</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#fff;color:#003844;padding:24px}
  .receipt{max-width:720px;margin:0 auto;border:1px solid #006d77;
    background:#e0f7fa;overflow:hidden;padding:16px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
  .school-info{text-align:center;}
  .school-name{font-size:18px;font-weight:900;color:#003844;line-height:1.2}
  .school-details{font-size:11px;margin-top:4px;color:#003844;font-weight:bold;}
  .school-details p{margin:2px 0;}
  .receipt-info{border:2px solid #003844;border-radius:4px;background:#e0f7fa;}
  .receipt-info table{border-collapse:collapse;font-size:12px;font-weight:bold;}
  .receipt-info td{border:1px solid #003844;padding:6px 12px;}
  .receipt-info tr td:first-child{background:#b2ebf2;}
  .body{padding:0;}
  .row{display:flex;align-items:baseline;gap:6px;margin-bottom:16px;font-size:14px;font-weight:bold;}
  .dotted-line{flex:1;border-bottom:1.5px dotted #003844;min-height:20px;font-style:italic;font-weight:normal;padding:0 6px;}
  .checkboxes{display:flex;justify-content:space-between;margin:20px 0;}
  .checkbox-item{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:bold;}
  .cb{display:inline-block;width:18px;height:18px;border:2px solid #003844;background:#fff;
    text-align:center;line-height:14px;font-weight:900;color:#003844;font-size:14px;}
  .signature-row{display:flex;justify-content:space-between;margin-bottom:20px;}
  .footer-note{font-size:11px;font-weight:bold;margin-top:10px;}
  @media print{body{padding:0}.receipt{max-width:100%}@page{size:A5 landscape;margin:10mm}}
</style></head>
<body><div class="receipt">
  <div class="header">
    <div class="school-info">
      <div class="school-name">ECOLE INTERNATIONALE<br/>LES ENFANTS DU FUTUR</div>
      <div class="school-details">
        <p>Garderie - Crèche - Maternelle - Primaire - Collège - Lycée</p>
        <p>Sis à Sangoyah Rails - C/Coyah - République de Guinée</p>
        <p>Tél: (+224) 625 54 95 79 / 664 03 98 41</p>
        <p>E-mail: info.enfantdufutur@gmail.com</p>
      </div>
    </div>
    <div class="receipt-info">
      <table>
        <tr><td>REÇU N°</td><td>${payment.reference || ''}</td></tr>
        <tr><td>MONTANT</td><td>${amountFmt}</td></tr>
        <tr><td>DATE</td><td>${dateFmt}</td></tr>
      </table>
    </div>
  </div>
  <div class="body">
    <div class="row">
      <span>Nom et Prénoms de l'élève:</span>
      <div class="dotted-line">${studentFullName}</div>
      <span>Classe:</span>
      <div class="dotted-line" style="flex:0 0 100px;text-align:center;">${className}</div>
    </div>
    <div class="row">
      <span>Montant (en lettres GNF):</span>
      <div class="dotted-line">${amountWords}</div>
    </div>
    <div class="checkboxes">
      <div class="checkbox-item"><span class="cb">${type === 'inscription' ? 'X' : ''}</span> Inscription</div>
      <div class="checkbox-item"><span class="cb">${type === 'reinscription' ? 'X' : ''}</span> Réinscription</div>
      <div class="checkbox-item"><span class="cb">${type === 'scolarite' ? 'X' : ''}</span> Scolarité</div>
      <div class="checkbox-item"><span class="cb">${type === 'autres' ? 'X' : ''}</span> Autres</div>
    </div>
    <div class="row">
      <span>Reste à payer pour l'élève :</span>
      <div class="dotted-line">${remainingAmountText}</div>
      <span style="font-size:12px;font-style:italic;">${monthsInfoText}</span>
    </div>
    <div class="signature-row">
      <div class="row" style="width:50%;margin-bottom:0;">
        <span>Parent d'élèves:</span>
        <div class="dotted-line"></div>
      </div>
      <div style="font-weight:bold;margin-right:40px;">La Direction</div>
    </div>
    <div class="footer-note">NB: Une fois versé tous frais sont non remboursables</div>
  </div>
</div></body></html>`;

    const win = window.open('', '_blank', 'width=820,height=600');
    if (!win) { setError('Veuillez autoriser les popups pour imprimer.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 800);
  };

  // ── Colonnes table payments ───────────────────────────────────────────────

  const categoriesList = [
    { value: 'Tous', label: 'Tous' },
    { value: 'SCOLARITE', label: 'Scolarité' },
    { value: 'CANTINE', label: 'Cantine' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'SUPÉRETTE', label: 'Supérette' },
  ];

  const columns = [
    {
      key: 'studentName',
      label: 'Élève / Client',
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div className="flex flex-col text-left">
            <span className="font-bold text-gray-900 dark:text-white leading-tight">{val}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Élève EIEF</span>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Service',
      render: (val: string) => (
        <span className="px-3 py-1 bg-bleu-50 dark:bg-bleu-900/30 rounded-xl text-[10px] font-bold text-bleu-600 dark:text-or-400 border border-bleu-100 dark:border-bleu-800/30 uppercase tracking-widest leading-none">
          {val || 'Non catégorisé'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (val: number, row: PaymentResponse) => (
        <div className="text-left">
          <div className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(Number(val))}</div>
          {row.status === 'PAID' ? (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1 h-3 bg-vert-500 rounded-full" />
              <span className="text-[10px] text-vert-500 font-bold uppercase tracking-wider">Soldé</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1 h-3 bg-rouge-500 rounded-full" />
              <span className="text-[10px] text-rouge-500 font-bold uppercase tracking-wider">{getStatusLabel(row.status)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'method',
      label: 'Mode',
      render: (val: PaymentMethod) => (
        <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
          <div className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-lg">{getMethodIcon(val)}</div>
          {getMethodLabel(val)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val: PaymentStatus) => getStatusBadge(val),
    },
    {
      key: 'paidAt',
      label: 'Transaction',
      sortable: true,
      render: (val: string | null, row: PaymentResponse) => (
        <div className="text-left">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatDate(val)}</p>
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">{row.reference}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: PaymentResponse) => (
        <div className="relative group flex justify-end pr-2" onClick={e => e.stopPropagation()}>
          <Popover
            isOpen={openMenuRowId === row.id}
            onClose={() => setOpenMenuRowId(null)}
            trigger={
              <button
                onClick={() => setOpenMenuRowId(openMenuRowId === row.id ? null : row.id)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-bleu-600 dark:hover:text-or-400 hover:bg-bleu-50 dark:hover:bg-or-900/20 transition-all border border-gray-100 dark:border-white/5"
              >
                <MoreVertical size={18} />
              </button>
            }
          >
            <div className="w-56 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 space-y-1">
              <button
                onClick={() => openReceiptModal(row)}
                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 hover:text-bleu-600 rounded-xl transition-all"
              >
                <Eye size={16} /> Voir les détails
              </button>
              <button
                onClick={() => { printReceipt(row, resolveStudentByName(row.studentName)); setOpenMenuRowId(null); }}
                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
              >
                <Printer size={16} /> Imprimer le reçu
              </button>
              {row.status !== 'PAID' && (
                <button
                  onClick={() => { handleMarkAsPaid(row.id); setOpenMenuRowId(null); }}
                  className="w-full flex items-center gap-3 p-3 text-xs font-bold text-vert-600 hover:bg-vert-50 dark:hover:bg-vert-900/20 rounded-xl transition-all"
                >
                  <CheckCircle2 size={16} /> Marquer payé
                </button>
              )}
              <div className="h-px bg-gray-50 dark:bg-white/5 my-1" />
              <button
                onClick={() => { handleDelete(row.id); setOpenMenuRowId(null); }}
                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-rouge-500 hover:bg-rouge-50 dark:hover:bg-rouge-900/20 rounded-xl transition-all"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </Popover>
        </div>
      ),
    },
  ];

  const expenseColumns = [
    {
      key: 'description',
      label: 'Dépense',
      render: (val: string, row: ExpenseResponse) => (
        <div className="flex flex-col text-left">
          <span className="font-bold text-gray-900 dark:text-white leading-tight">{val}</span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            {row.createdByName || 'Utilisateur non renseigné'}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Catégorie',
      render: (val: string | null, row: ExpenseResponse) => (
        <span className="px-3 py-1 bg-rouge-50 dark:bg-rouge-900/20 rounded-xl text-[10px] font-bold text-rouge-600 border border-rouge-100 dark:border-rouge-800/30 uppercase tracking-widest leading-none">
          {val || row.categoryModule || 'Non catégorisé'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (val: number) => (
        <div className="text-left">
          <div className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(Number(val))}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1 h-3 bg-rouge-500 rounded-full" />
            <span className="text-[10px] text-rouge-500 font-bold uppercase tracking-wider">Sortie</span>
          </div>
        </div>
      ),
    },
    {
      key: 'expenseDate',
      label: 'Date',
      sortable: true,
      render: (val: string) => (
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatDate(val)}</p>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: ExpenseResponse) => (
        <div className="flex justify-end pr-2">
          <button
            onClick={() => handleDeleteExpense(row.id)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-rouge-50 dark:bg-rouge-900/20 text-rouge-500 hover:bg-rouge-100 dark:hover:bg-rouge-900/30 transition-all border border-rouge-100 dark:border-rouge-800/20"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Error Alert */}
      {error && (
        <div className="bg-rouge-50 border border-rouge-200 text-rouge-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-vert-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-bold"
          >
            <CheckCircle2 size={18} /> {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Wallet className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-bold gradient-bleu-or-text tracking-tight">Comptabilité & Finances</h1>
            {overdueCount > 0 && (
              <span className="flex items-center justify-center w-6 h-6 bg-rouge-500 text-white rounded-full text-[10px] font-black">
                {overdueCount > 99 ? '99+' : overdueCount}
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            Suivi stratégique des encaissements et du recouvrement de l'EIEF
            {overdueCount > 0 && (
              <span className="ml-2 text-rouge-500 font-bold">
                · {overdueCount} paiement{overdueCount > 1 ? 's' : ''} en retard
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsRapportsModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white h-11 px-5 text-[10px] uppercase tracking-widest font-bold"
          >
            <Download size={18} /> Rapports
          </Button>
          {activeTab === 'payments' && (
            <Button
              onClick={() => setIsEncaissementModalOpen(true)}
              className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-bold text-[10px] uppercase tracking-widest h-11 px-6 shadow-lg shadow-bleu-600/20"
            >
              <Plus size={20} /> Nouvel Encaissement
            </Button>
          )}
          {activeTab === 'expenses' && (
            <Button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex gap-2 bg-gradient-to-r from-rouge-600 to-rouge-500 border-none font-bold text-[10px] uppercase tracking-widest h-11 px-6 shadow-lg shadow-rouge-600/20"
            >
              <Plus size={20} /> Nouvelle Dépense
            </Button>
          )}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <StatCard
          title={activeTab === 'expenses' ? 'Dépenses Totales' : 'Recettes Totales'}
          value={formatCurrency(activeTab === 'expenses' ? totalDepenses : totalRecettes)}
          subtitle={activeTab === 'expenses' ? 'Toutes les sorties enregistrées' : 'Paiements soldés'}
          icon={activeTab === 'expenses' ? <AlertTriangle /> : <Wallet />}
          color={activeTab === 'expenses' ? 'rouge' : 'bleu'}
          trend={{ value: activeTab === 'expenses' ? `${nombreDepenses} opération(s)` : `${tauxRecouvrement}% recouvré`, direction: 'up' }}
        />
        <StatCard
          title={activeTab === 'expenses' ? 'Dépenses du Mois' : 'Impayés en Retard'}
          value={formatCurrency(activeTab === 'expenses' ? depensesMois : totalImpayes)}
          subtitle={activeTab === 'expenses' ? `${expenseSummary?.currentMonthCount || 0} dépense(s) ce mois` : `${overdueCount} paiement${overdueCount > 1 ? 's' : ''} en retard`}
          icon={activeTab === 'expenses' ? <Wallet /> : <AlertCircle />}
          color="rouge"
        />
        <StatCard
          title={activeTab === 'expenses' ? 'Dépense Moyenne' : 'Taux de Recouvrement'}
          value={activeTab === 'expenses' ? formatCurrency(depenseMoyenne) : `${tauxRecouvrement}%`}
          subtitle={activeTab === 'expenses' ? 'Par opération' : 'Objectif: 95%'}
          icon={<TrendingUp />}
          color="or"
          trend={{ value: activeTab === 'expenses' ? (expenseSummary?.maxAmount ? `${formatCurrency(Number(expenseSummary.maxAmount))} max` : 'Aucune donnée') : (totalAttendu > 0 ? `${formatCurrency(totalAttendu)} attendu` : 'Aucune donnée'), direction: 'up' }}
        />
        <Card className="flex flex-col justify-center border-none shadow-soft p-6 dark:bg-gray-900/50 dark:backdrop-blur-md text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            {activeTab === 'expenses' ? 'Suivi Dépenses' : 'Alertes Impayés'}
          </p>
          {activeTab === 'expenses' ? (
            <>
              <h3 className="text-xl font-bold text-rouge-600 dark:text-rouge-400 mb-1">
                {nombreDepenses} sortie{nombreDepenses > 1 ? 's' : ''}
              </h3>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-xl bg-rouge-50 dark:bg-rouge-900/20 flex items-center justify-center text-rouge-500">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-800 dark:text-gray-200 font-bold uppercase tracking-wide">Dernière sortie</p>
                  <p className="text-[9px] text-gray-400 font-medium leading-none">
                    {expenseSummary?.latestExpenseDate ? formatDate(expenseSummary.latestExpenseDate) : 'Aucune dépense enregistrée'}
                  </p>
                </div>
              </div>
            </>
          ) : overdueCount === 0 ? (
            <>
              <h3 className="text-xl font-bold text-vert-600 dark:text-vert-400 mb-1">Aucun retard</h3>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-xl bg-vert-50 dark:bg-vert-900/20 flex items-center justify-center text-vert-500">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-800 dark:text-gray-200 font-bold uppercase tracking-wide">Recouvrement à jour</p>
                  <p className="text-[9px] text-gray-400 font-medium leading-none">Tous les paiements sont en règle</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-rouge-600 dark:text-rouge-400 mb-1">
                {overdueCount} retard{overdueCount > 1 ? 's' : ''}
              </h3>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-xl bg-rouge-50 dark:bg-rouge-900/20 flex items-center justify-center text-rouge-500">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-800 dark:text-gray-200 font-bold uppercase tracking-wide">Action requise</p>
                  <p className="text-[9px] text-gray-400 font-medium leading-none">{formatCurrency(totalImpayes)} à recouvrer</p>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* TABS */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'payments'
              ? 'bg-white dark:bg-gray-800 text-bleu-600 dark:text-or-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Wallet size={14} /> Encaissements
          {overdueCount > 0 && activeTab !== 'payments' && (
            <span className="w-4 h-4 bg-rouge-500 text-white rounded-full text-[9px] flex items-center justify-center font-black">
              {overdueCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('tuition')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'tuition'
              ? 'bg-white dark:bg-gray-800 text-bleu-600 dark:text-or-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <BookOpen size={14} /> Frais de Scolarité
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'expenses'
              ? 'bg-white dark:bg-gray-800 text-rouge-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <AlertTriangle size={14} /> Dépenses
        </button>
      </div>

      {/* ── TAB: ENCAISSEMENTS ──────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {categoriesList.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all ${
                    filterCategory === cat.value
                      ? 'bg-gray-900 dark:bg-or-500 text-white shadow-lg'
                      : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              <select
                value={selectedStudentFilter}
                onChange={e => setSelectedStudentFilter(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm"
              >
                <option value="all">Tous les élèves</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}{s.registrationNumber ? ` (${s.registrationNumber})` : ''}
                  </option>
                ))}
              </select>
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher une transaction..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm"
                />
              </div>
            </div>
          </div>

          <Card className="p-2 overflow-hidden border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-bleu-600" size={32} />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <Wallet size={40} className="opacity-20" />
                <span className="text-sm font-medium">Aucune transaction trouvée</span>
              </div>
            ) : (
              <Table data={payments} columns={columns as any} />
            )}
          </Card>
        </div>
      )}

      {/* ── TAB: FRAIS DE SCOLARITÉ ─────────────────────────────────────────── */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {categoriesList.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all ${
                    filterCategory === cat.value
                      ? 'bg-rouge-600 text-white shadow-lg'
                      : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Rechercher une dépense..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rouge-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm"
              />
            </div>
          </div>

          <Card className="p-2 overflow-hidden border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
            {expenseLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-rouge-600" size={32} />
              </div>
            ) : expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <AlertTriangle size={40} className="opacity-20" />
                <span className="text-sm font-medium">Aucune dépense trouvée</span>
              </div>
            ) : (
              <Table data={expenses} columns={expenseColumns as any} />
            )}
          </Card>
        </div>
      )}

      {activeTab === 'tuition' && (
        <div className="space-y-6">
          <TuitionModalityManager
            tuitionFees={tuitionFees}
            academicYears={academicYears}
            classes={schoolClasses}
            loading={tuitionLoading}
            actionLoading={tuitionActionLoading}
            onCreate={createTuitionFee}
            onUpdate={updateTuitionFee}
            onDelete={deleteTuitionFee}
          />

          {/* Recherche statut élève */}
          <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-bleu-50 dark:bg-bleu-900/20 rounded-xl text-bleu-600">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Statut de scolarité d'un élève</h3>
                <p className="text-[10px] text-gray-400 font-medium">Consultez les versements effectués et les échéances restantes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusStudentId}
                onChange={e => setStatusStudentId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 font-semibold text-gray-700 dark:text-white"
              >
                <option value="">Sélectionner un élève...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}{s.registrationNumber ? ` (${s.registrationNumber})` : ''}
                    {s.className ? ` — ${s.className}` : ''}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => fetchStudentTuitionStatus(statusStudentId)}
                disabled={!statusStudentId || statusLoading}
                className="h-11 px-6 font-bold text-[10px] uppercase tracking-widest"
              >
                {statusLoading ? <Loader2 size={16} className="animate-spin" /> : 'Consulter'}
              </Button>
            </div>

            {/* ── FIX: motion.div fermé correctement + </Card> présent ── */}
            {selectedStudentStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                {/* En-tête élève */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Avatar name={selectedStudentStatus.studentName} size="md" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedStudentStatus.studentName}</p>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        {selectedStudentStatus.className} · {selectedStudentStatus.academicYearName}
                      </p>
                    </div>
                  </div>
                  {selectedStudentStatus.hasOverdue && (
                    <Badge variant="error" className="text-[9px] px-3 font-bold uppercase tracking-widest">
                      {selectedStudentStatus.overdueCount} en retard
                    </Badge>
                  )}
                </div>

                {/* KPIs scolarité élève */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Attendu', value: formatCurrency(Number(selectedStudentStatus.totalExpected)), color: 'text-gray-900 dark:text-white' },
                    { label: 'Payé', value: formatCurrency(Number(selectedStudentStatus.totalPaid)), color: 'text-vert-600' },
                    { label: 'Restant', value: formatCurrency(Number(selectedStudentStatus.totalRemaining)), color: selectedStudentStatus.totalRemaining > 0 ? 'text-rouge-500' : 'text-vert-600' },
                  ].map(kpi => (
                    <div key={kpi.label} className="p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                      <p className={`text-sm font-black ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  ))}
                </div>

                {/* Barre de progression */}
                {Number(selectedStudentStatus.totalExpected) > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Progression du paiement</span>
                      <span>{Math.round((Number(selectedStudentStatus.totalPaid) / Number(selectedStudentStatus.totalExpected)) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-bleu-500 to-vert-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round((Number(selectedStudentStatus.totalPaid) / Number(selectedStudentStatus.totalExpected)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Liste des échéances */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Détail des échéances</p>
                  {selectedStudentStatus.installments.map((inst, i) => (
                    <div
                      key={inst.installmentId}
                      className={`p-4 rounded-2xl border transition-all ${
                        inst.overdue
                          ? 'bg-rouge-50 dark:bg-rouge-900/10 border-rouge-200 dark:border-rouge-800/30'
                          : inst.remainingAmount <= 0
                          ? 'bg-vert-50 dark:bg-vert-900/10 border-vert-200 dark:border-vert-800/30'
                          : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                            inst.remainingAmount <= 0
                              ? 'bg-vert-100 text-vert-700'
                              : inst.overdue
                              ? 'bg-rouge-100 text-rouge-700'
                              : 'bg-bleu-100 text-bleu-700'
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            {/* ── FIX: inst.installmentLabel (était inst.label) ── */}
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {inst.installmentLabel || `Echeance ${i + 1}`}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('fr-FR') : '-'}
                              {inst.overdue && <span className="ml-2 text-rouge-600 font-bold">EN RETARD</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {/* ── FIX: inst.installmentAmount (était inst.expectedAmount) ── */}
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('fr-GN').format(Number(inst.installmentAmount) || 0)} GNF
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Restant : {new Intl.NumberFormat('fr-GN').format(Number(inst.remainingAmount) || 0)} GNF
                          </p>
                        </div>
                      </div>
                      {/* Bouton payer si montant restant > 0 */}
                      {inst.remainingAmount > 0 && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            onClick={() => openTuitionPaymentModal(inst, selectedStudentStatus.studentId)}
                            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest"
                          >
                            Enregistrer un versement
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
              /* ── FIX: motion.div fermé ici ── */
            )}
          </Card>
          {/* ── FIX: </Card> était manquant ── */}
        </div>
      )}

      {/* ── MODAL : Nouvel encaissement ──────────────────────────────────────── */}
      {isEncaissementModalOpen && (
        <Modal
          isOpen={isEncaissementModalOpen}
          onClose={() => setIsEncaissementModalOpen(false)}
          title="Nouvel Encaissement"
        >
          <div className="space-y-4 p-1">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Élève *</label>
              <select
                value={formData.studentId}
                onChange={e => setFormData(f => ({ ...f, studentId: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 font-semibold text-gray-700 dark:text-white"
              >
                <option value="">Sélectionner un élève...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}{s.registrationNumber ? ` (${s.registrationNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Service</label>
              <div className="flex flex-col gap-2 mt-2">
                {paymentServiceOptions.map(option => {
                  const isActive = selectedPaymentService === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-bleu-500 bg-bleu-50 dark:bg-bleu-900/20'
                          : 'border-gray-200 bg-white dark:border-white/10 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => setSelectedPaymentService(option.value)}
                        className="w-5 h-5 rounded border-gray-300 text-bleu-600 focus:ring-bleu-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className={`text-sm font-bold ${isActive ? 'text-bleu-700 dark:text-bleu-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedPaymentService === 'autres' && (
                <div className="mt-3">
                  <Input
                    value={otherPaymentServiceLabel}
                    onChange={e => setOtherPaymentServiceLabel(e.target.value)}
                    placeholder="Préciser le service"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montant (GNF) *</label>
              <Input
                type="number"
                value={formData.amount || ''}
                onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Référence *</label>
              <Input
                value={formData.reference}
                onChange={e => setFormData(f => ({ ...f, reference: e.target.value }))}
                placeholder="REF-2024-001"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mode de paiement</label>
              <select
                value={formData.method}
                onChange={e => setFormData(f => ({ ...f, method: e.target.value as PaymentMethod }))}
                className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 font-semibold text-gray-700 dark:text-white"
              >
                <option value="CASH">Espèces</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK_TRANSFER">Virement bancaire</option>
                <option value="CHECK">Chèque</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEncaissementModalOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={handleCreatePayment}
                disabled={isSubmitting || !formData.studentId || !formData.amount || !formData.reference || (selectedPaymentService === 'autres' && !otherPaymentServiceLabel.trim())}
                className="flex-1"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL : Versement scolarité ───────────────────────────────────────── */}
      {isExpenseModalOpen && (
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          title="Nouvelle Dépense"
        >
          <div className="space-y-4 p-1">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Catégorie *</label>
              <select
                value={expenseForm.categoryId ?? ''}
                onChange={e => setExpenseForm(f => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : null }))}
                className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rouge-500/10 font-semibold text-gray-700 dark:text-white"
              >
                <option value="">Sélectionner une catégorie...</option>
                {expenseCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} {category.module ? `(${category.module})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description *</label>
              <Input
                value={expenseForm.description}
                onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ex: achat cantine, salaire, carburant..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montant (GNF) *</label>
                <Input
                  type="number"
                  value={expenseForm.amount || ''}
                  onChange={e => setExpenseForm(f => ({ ...f, amount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date *</label>
                <Input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={e => setExpenseForm(f => ({ ...f, expenseDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={handleCreateExpense}
                disabled={expenseSubmitting || !expenseForm.amount || !expenseForm.description.trim() || !expenseForm.expenseDate || !expenseForm.categoryId}
                className="flex-1"
              >
                {expenseSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isTuitionPaymentModalOpen && selectedInstallment && (
        <Modal
          isOpen={isTuitionPaymentModalOpen}
          onClose={() => setIsTuitionPaymentModalOpen(false)}
          title="Enregistrer un versement"
        >
          <div className="space-y-4 p-1">
            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300">
              {selectedInstallment.installmentLabel} — Restant : {new Intl.NumberFormat('fr-GN').format(Number(selectedInstallment.remainingAmount))} GNF
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montant (GNF) *</label>
              <Input
                type="number"
                value={tuitionPaymentForm.amount || ''}
                onChange={e => setTuitionPaymentForm(f => ({ ...f, amount: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Référence</label>
              <Input
                value={tuitionPaymentForm.reference}
                onChange={e => setTuitionPaymentForm(f => ({ ...f, reference: e.target.value }))}
                placeholder="REF-2024-001"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mode de paiement</label>
              <select
                value={tuitionPaymentForm.method}
                onChange={e => setTuitionPaymentForm(f => ({ ...f, method: e.target.value as PaymentMethod }))}
                className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 font-semibold text-gray-700 dark:text-white"
              >
                <option value="CASH">Espèces</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK_TRANSFER">Virement bancaire</option>
                <option value="CHECK">Chèque</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsTuitionPaymentModalOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={handleRegisterTuitionPayment}
                disabled={tuitionSubmitting || !tuitionPaymentForm.amount}
                className="flex-1"
              >
                {tuitionSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL : Reçu ─────────────────────────────────────────────────────── */}
      {isReceiptModalOpen && selectedPayment && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => { setIsReceiptModalOpen(false); setReceiptServiceOverride(null); }}
          title="Détails du paiement"
        >
          <div className="space-y-4 p-1">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Référence', value: selectedPayment.reference },
                { label: 'Élève', value: selectedPayment.studentName },
                { label: 'Service', value: selectedPayment.categoryName || receiptServiceOverride || 'Non renseigné' },
                { label: 'Montant', value: formatCurrency(Number(selectedPayment.amount)) },
                { label: 'Statut', value: getStatusLabel(selectedPayment.status) },
                { label: 'Mode', value: getMethodLabel(selectedPayment.method) },
                { label: 'Date', value: formatDate(selectedPayment.paidAt) },
              ].map(item => (
                <div key={item.label} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => { printReceipt(selectedPayment, selectedStudentForReceipt); }}
              className="w-full flex items-center justify-center gap-2"
            >
              <Printer size={16} /> Imprimer le reçu
            </Button>
          </div>
        </Modal>
      )}

      {/* ── MODAL : Rapports ──────────────────────────────────────────────────── */}
      {isRapportsModalOpen && (
        <Modal
          isOpen={isRapportsModalOpen}
          onClose={() => setIsRapportsModalOpen(false)}
          title="Générer un rapport"
        >
          <div className="space-y-3 p-1">
            {[
              { label: 'Rapport des paiements', path: '/payments/report', file: 'rapport-paiements.pdf' },
              { label: 'Rapport des impayés', path: '/payments/overdue/report', file: 'rapport-impayes.pdf' },
              { label: 'Rapport de scolarité', path: '/tuition-fees/report', file: 'rapport-scolarite.pdf' },
            ].map(r => (
              <button
                key={r.path}
                onClick={() => downloadReport(r.path, r.file)}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all"
              >
                <Download size={16} className="text-bleu-600" /> {r.label}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default AdminAccounting;
