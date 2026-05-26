import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  Printer,
  Users,
  AlertCircle,
  Banknote,
  Smartphone,
  CreditCard,
  FileText,
  TrendingUp,
  Receipt,
  TrendingDown,
} from 'lucide-react';
import { Table, Badge, StatCard, Card, Button, Modal, Input, Avatar } from '../../components/ui';
import { accountingService, PaymentMethod, PaymentResponse, TuitionFeeFamilyStatusResponse, ExpenseResponse, ExpenseRequestPayload, ExpenseCategoryResponse } from '../../services/accountingService';
import TuitionModalityManager from '../comptabilite/components/TuitionModalityManager';
import { AcademicYearOption, ClassOption, TuitionFeePayload, TuitionFeeResponse } from '../comptabilite/types';
import { apiRequest } from '../../services/api';

const VALID_TABS = ['tuition', 'payments', 'expenses'] as const;
type TabType = typeof VALID_TABS[number];

const AdminAccounting: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'tuition'
  );

  // Sync activeTab when the URL changes (e.g. sidebar click)
  useEffect(() => {
    const t = searchParams.get('tab') as TabType | null;
    if (t && VALID_TABS.includes(t)) setActiveTab(t);
  }, [searchParams]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- Common Data ---
  const [parents, setParents] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<ClassOption[]>([]);

  // --- Tuition Tab State ---
  const [familySearchQuery, setFamilySearchQuery] = useState('');
  const [isFamilySearchOpen, setIsFamilySearchOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<any | null>(null);
  const [familyStatus, setFamilyStatus] = useState<TuitionFeeFamilyStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isFamilyPaymentModalOpen, setIsFamilyPaymentModalOpen] = useState(false);
  const [familyPaymentForm, setFamilyPaymentForm] = useState({
    amount: 0,
    method: 'CASH' as PaymentMethod,
    reference: '',
  });
  const [familySubmitting, setFamilySubmitting] = useState(false);
  const [tuitionFees, setTuitionFees] = useState<TuitionFeeResponse[]>([]);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [tuitionActionLoading, setTuitionActionLoading] = useState(false);
  // Vue d'ensemble : statut de TOUTES les familles (qui a payé, qui est en retard)
  const [allFamiliesStatus, setAllFamiliesStatus] = useState<Array<{ parent: any; status: TuitionFeeFamilyStatusResponse }>>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // --- Misc / Payments Tab State ---
  const [miscPayments, setMiscPayments] = useState<PaymentResponse[]>([]);
  const [isMiscModalOpen, setIsMiscModalOpen] = useState(false);
  const [miscPaymentForm, setMiscPaymentForm] = useState({
    amount: 0,
    reference: '',
    method: 'CASH' as PaymentMethod,
    studentId: '',
    familyId: '',
    categoryId: null as number | null,
  });
  const [miscSubmitting, setMiscSubmitting] = useState(false);
  const [miscSearchQuery, setMiscSearchQuery] = useState('');

  // --- Expenses Tab State ---
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryResponse[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState<ExpenseRequestPayload>({
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: 0,
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');

  // --- Refs ---
  const familySearchRef = useRef<HTMLDivElement>(null);

  // --- Initial Data Fetch ---
  const fetchCommonData = useCallback(async () => {
    try {
      const [parentsData, categoriesData, yearsData, classesData] = await Promise.all([
        apiRequest<any[]>('/users', { method: 'GET' }).then(users =>
          Array.isArray(users) ? users.filter(u => u.roleName === 'PARENT' && u.familyId) : []
        ),
        apiRequest<any[]>('/expenses/categories', { method: 'GET' }).then(cats =>
          Array.isArray(cats) ? cats.filter(c => c.type === 'INCOME') : []
        ),
        apiRequest<AcademicYearOption[]>('/courses/academic-years', { method: 'GET' }),
        apiRequest<ClassOption[]>('/courses/classes', { method: 'GET' }),
      ]);
      setParents(parentsData);
      setIncomeCategories(categoriesData);
      setAcademicYears(Array.isArray(yearsData) ? yearsData : []);
      setSchoolClasses(Array.isArray(classesData) ? classesData : []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching common data:', err);
      // Failed to fetch = backend injoignable. Message clair pour l'utilisateur
      // afin qu'il sache qu'il faut vérifier le serveur, pas le frontend.
      const raw = (err?.message || '').toLowerCase();
      if (raw.includes('failed to fetch') || raw.includes('networkerror')) {
        setError("Impossible de joindre le serveur. Vérifie que le backend est démarré (port 8080 par défaut) et que tu es bien connecté.");
      } else {
        setError(err?.message || 'Erreur lors du chargement des données.');
      }
    }
  }, []);

  const fetchTuitionFees = useCallback(async () => {
    try {
      setTuitionLoading(true);
      const data = await apiRequest<TuitionFeeResponse[]>('/tuition-fees/modalities', { method: 'GET' });
      setTuitionFees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tuition fees:', err);
    } finally {
      setTuitionLoading(false);
    }
  }, []);

  // Charge le statut de toutes les familles en parallèle pour la vue d'ensemble.
  // Les erreurs par famille sont silencieusement ignorées (ex: famille sans
  // modalité affectée) pour ne pas casser l'ensemble du tableau.
  const fetchAllFamiliesStatus = useCallback(async () => {
    if (parents.length === 0) return;
    setOverviewLoading(true);
    try {
      const results = await Promise.all(
        parents.map(async (p) => {
          try {
            const status = await accountingService.getFamilyStatus(p.familyId);
            return { parent: p, status };
          } catch {
            return null;
          }
        })
      );
      setAllFamiliesStatus(
        results.filter(
          (r): r is { parent: any; status: TuitionFeeFamilyStatusResponse } => r !== null
        )
      );
    } finally {
      setOverviewLoading(false);
    }
  }, [parents]);

  const fetchMiscPayments = useCallback(async () => {
    try {
      setLoading(true);
      // Filter out SCOLARITE related payments if possible, or just fetch all misc
      const data = await accountingService.getPayments({ query: miscSearchQuery });
      setMiscPayments(Array.isArray(data) ? data.filter(p => p.categoryName !== 'Scolarité') : []);
    } catch (err) {
      console.error('Error fetching misc payments:', err);
    } finally {
      setLoading(false);
    }
  }, [miscSearchQuery]);

  const fetchExpenses = useCallback(async () => {
    try {
      setExpensesLoading(true);
      const [data, cats] = await Promise.all([
        accountingService.getExpenses({ query: expenseSearchQuery || undefined }),
        expenseCategories.length === 0 ? accountingService.getExpenseCategories() : Promise.resolve(expenseCategories),
      ]);
      setExpenses(Array.isArray(data) ? data : []);
      if (Array.isArray(cats) && cats.length > 0) setExpenseCategories(cats);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setExpensesLoading(false);
    }
  }, [expenseSearchQuery, expenseCategories]);

  useEffect(() => {
    fetchCommonData();
  }, [fetchCommonData]);

  useEffect(() => {
    if (activeTab === 'tuition') {
      fetchTuitionFees();
      fetchAllFamiliesStatus();
    } else if (activeTab === 'payments') {
      fetchMiscPayments();
    } else {
      fetchExpenses();
    }
  }, [activeTab, fetchTuitionFees, fetchMiscPayments, fetchAllFamiliesStatus, fetchExpenses]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (familySearchRef.current && !familySearchRef.current.contains(event.target as Node)) {
        setIsFamilySearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- Success Helper ---
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);
  };

  // --- Handlers ---
  const handleFamilySearch = async (parent: any) => {
    setSelectedFamily(parent);
    setFamilySearchQuery(`Famille ${parent.lastName} (${parent.firstName})`);
    setIsFamilySearchOpen(false);
    setStatusLoading(true);
    try {
      const status = await accountingService.getFamilyStatus(parent.familyId);
      setFamilyStatus(status);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du statut famille');
    } finally {
      setStatusLoading(false);
    }
  };

  // --- Print Logic ---
  const printFamilyReceipt = (status: TuitionFeeFamilyStatusResponse, amountPaid: number, method: string, reference: string) => {
    const parent = parents.find(p => p.familyId === status.familyId);
    const dateFmt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Reçu Famille - EIEF</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#fff;color:#003844;padding:24px}
  .receipt{max-width:720px;margin:0 auto;border:1px solid #006d77;background:#e0f7fa;padding:16px;}
  .header{display:flex;justify-content:space-between;margin-bottom:20px;}
  .school-name{font-size:18px;font-weight:900;color:#003844;}
  .row{display:flex;gap:6px;margin-bottom:12px;font-size:14px;}
  .dotted-line{flex:1;border-bottom:1.5px dotted #003844;min-height:20px;}
  .footer{margin-top:20px;font-size:11px;font-weight:bold;text-align:center;}
</style></head>
<body><div class="receipt">
  <div class="header">
    <div class="school-name">ECOLE LES ENFANTS DU FUTUR</div>
    <div style="text-align:right;font-weight:bold;">REÇU N° ${reference}</div>
  </div>
  <div class="row"><span>Famille de :</span><div class="dotted-line">${parent ? parent.lastName : status.familyId}</div></div>
  <div class="row"><span>Montant Versé :</span><div class="dotted-line">${new Intl.NumberFormat('fr-GN').format(amountPaid)} GNF</div></div>
  <div class="row"><span>Mode de Paiement :</span><div class="dotted-line">${method}</div></div>
  <div class="row"><span>Reste à Payer Global :</span><div class="dotted-line">${new Intl.NumberFormat('fr-GN').format(status.totalRemaining)} GNF</div></div>
  <div class="row"><span>Date :</span><div class="dotted-line">${dateFmt}</div></div>
  <div class="footer">NB: Les frais versés ne sont pas remboursables.</div>
</div></body></html>`;

    const win = window.open('', '_blank', 'width=800,height=600');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
    }
  };

  const handleFamilyPayment = async () => {
    if (!selectedFamily || familySubmitting) return;
    setFamilySubmitting(true);
    try {
      await accountingService.registerFamilyPayment({
        familyId: selectedFamily.familyId,
        amount: familyPaymentForm.amount,
        method: familyPaymentForm.method,
        reference: '',  // Backend will auto-generate
        payerType: 'PARENT',
        payerUserId: selectedFamily.id,
      });
      showSuccess('Paiement enregistré avec succès');
      setIsFamilyPaymentModalOpen(false);
      
      // Refresh status and print
      const status = await accountingService.getFamilyStatus(selectedFamily.familyId);
      setFamilyStatus(status);
      printFamilyReceipt(status, familyPaymentForm.amount, familyPaymentForm.method, status.familyId);
      
      setFamilyPaymentForm({ amount: 0, method: 'CASH', reference: '' });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement du paiement');
    } finally {
      setFamilySubmitting(false);
    }
  };

  const handleMiscPayment = async () => {
    if (miscSubmitting) return;
    miscSubmitting && setMiscSubmitting(true);
    try {
      await accountingService.createPayment({
        ...miscPaymentForm,
        reference: '',  // Backend will auto-generate
      });
      showSuccess('Encaissement divers enregistré');
      setIsMiscModalOpen(false);
      setMiscPaymentForm({ amount: 0, reference: '', method: 'CASH', studentId: '', familyId: '', categoryId: null });
      fetchMiscPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setMiscSubmitting(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm('Supprimer ce paiement ?')) return;
    try {
      await accountingService.deletePayment(id);
      showSuccess('Paiement supprimé');
      fetchMiscPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // --- Tab change helper (updates URL and state) ---
  const handleTabChange = (tab: 'tuition' | 'payments' | 'expenses') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // --- Expense Handlers ---
  const handleCreateExpense = async () => {
    if (expenseSubmitting) return;
    if (!expenseForm.categoryId || expenseForm.amount <= 0 || !expenseForm.description.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setExpenseSubmitting(true);
    try {
      await accountingService.createExpense(expenseForm);
      showSuccess('Dépense enregistrée');
      setIsExpenseModalOpen(false);
      setExpenseForm({ amount: 0, description: '', expenseDate: new Date().toISOString().split('T')[0], categoryId: 0 });
      fetchExpenses();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    try {
      await accountingService.deleteExpense(id);
      showSuccess('Dépense supprimée');
      fetchExpenses();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // --- Tuition Modality Handlers ---
  const createTuitionFee = async (payload: TuitionFeePayload) => {
    setTuitionActionLoading(true);
    try {
      await apiRequest('/tuition-fees/modalities', { method: 'POST', body: JSON.stringify(payload) });
      showSuccess('Modalité créée');
      fetchTuitionFees();
    } catch (err: any) { setError(err.message); }
    finally { setTuitionActionLoading(false); }
  };

  const updateTuitionFee = async (id: string, payload: TuitionFeePayload) => {
    setTuitionActionLoading(true);
    try {
      await apiRequest(`/tuition-fees/modalities/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showSuccess('Modalité mise à jour');
      fetchTuitionFees();
    } catch (err: any) { setError(err.message); }
    finally { setTuitionActionLoading(false); }
  };

  const deleteTuitionFee = async (id: string) => {
    setTuitionActionLoading(true);
    try {
      await apiRequest(`/tuition-fees/modalities/${id}`, { method: 'DELETE' });
      showSuccess('Modalité supprimée');
      fetchTuitionFees();
    } catch (err: any) { setError(err.message); }
    finally { setTuitionActionLoading(false); }
  };

  // --- Helpers ---
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-GN').format(amount) + ' GNF';
  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString('fr-FR') : '-';

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'MOBILE_MONEY': return <Smartphone size={14} className="text-orange-500" />;
      case 'CASH': return <Banknote size={14} className="text-green-500" />;
      case 'BANK_TRANSFER': return <CreditCard size={14} className="text-blue-500" />;
      case 'CHECK': return <FileText size={14} className="text-purple-500" />;
      default: return null;
    }
  };

  // --- Filtered Families ---
  const filteredFamilies = useMemo(() => {
    const q = familySearchQuery.trim().toLowerCase();
    // Pas de query → on montre les 5 premières familles pour aide.
    if (!q) return parents.slice(0, 5);
    // Sinon on filtre TOUJOURS, même si une famille est déjà sélectionnée :
    // l'utilisateur doit pouvoir retaper pour changer de famille.
    return parents.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && String(p.phone).toLowerCase().includes(q)) ||
      (p.address && String(p.address).toLowerCase().includes(q))
    ).slice(0, 10);
  }, [familySearchQuery, parents]);

  const totalFamilies = allFamiliesStatus.length;
  const settledFamilies = allFamiliesStatus.filter((row) => row.status.totalRemaining <= 0).length;
  const familiesInProgress = allFamiliesStatus.filter(
    (row) => row.status.totalRemaining > 0 && !row.status.hasOverdue,
  ).length;
  const overdueFamilies = allFamiliesStatus.filter((row) => row.status.hasOverdue).length;
  const activeModalityCount = tuitionFees.filter((fee) => fee.isActive).length;
  const paidMiscTotal = miscPayments.reduce(
    (sum, payment) => sum + (payment.status === 'PAID' ? payment.amount : 0),
    0,
  );
  const pendingMiscCount = miscPayments.filter((payment) => payment.status !== 'PAID').length;
  const financeAlerts = overdueFamilies + pendingMiscCount;
  const selectedFamilyDisplay = selectedFamily
    ? `${selectedFamily.firstName} ${selectedFamily.lastName}`
    : 'Aucune famille sélectionnée';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">
      {/* Notifications */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-[1.4rem] bg-vert-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_-30px_rgba(5,150,105,0.85)]">
            <CheckCircle2 size={20} /> {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-rouge-200 bg-rouge-50/95 px-4 py-3 text-rouge-700 shadow-[0_18px_40px_-28px_rgba(239,68,68,0.6)]">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-950 via-emerald-700 to-cyan-500 p-6 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.85)] sm:p-8 dark:border-none dark:bg-gradient-to-br dark:from-slate-950 dark:via-emerald-700 dark:to-cyan-500">
        <div className="absolute inset-0">
          <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-emerald-200/20 blur-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="relative space-y-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-50/95 backdrop-blur-sm">
                <Wallet size={14} />
                Pilotage financier
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Gestion financière unifiée
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-100/85 sm:text-base">
                  Supervisez les frais de scolarité, les modalités de paiement et les encaissements divers avec une vue plus lisible, plus stratégique et plus cohérente avec les autres modules.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-50/90 backdrop-blur-sm">
                  <Users size={14} />
                  {totalFamilies} familles suivies
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-50/90 backdrop-blur-sm">
                  <FileText size={14} />
                  {activeModalityCount} modalités actives
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-50/90 backdrop-blur-sm">
                  <Receipt size={14} />
                  {incomeCategories.length} catégories d'encaissement
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[420px] xl:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/20 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">Familles</span>
                  <Users size={16} className="text-slate-50/85" />
                </div>
                <p className="mt-3 text-3xl font-black leading-none text-white">{totalFamilies}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/20 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">Modalités</span>
                  <FileText size={16} className="text-slate-50/85" />
                </div>
                <p className="mt-3 text-3xl font-black leading-none text-white">{tuitionFees.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/20 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">Transactions</span>
                  <Receipt size={16} className="text-slate-50/85" />
                </div>
                <p className="mt-3 text-3xl font-black leading-none text-white">{miscPayments.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/20 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">Alertes</span>
                  <AlertCircle size={16} className="text-slate-50/85" />
                </div>
                <p className="mt-3 text-3xl font-black leading-none text-white">{financeAlerts}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => handleTabChange('tuition')}
                className={`rounded-[1.6rem] border p-4 text-left transition-all duration-300 ${
                  activeTab === 'tuition'
                    ? 'border-white/35 bg-white text-slate-950 shadow-[0_20px_50px_-32px_rgba(255,255,255,0.85)]'
                    : 'border-white/12 bg-slate-950/25 text-white hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${activeTab === 'tuition' ? 'border-slate-200 bg-slate-100 text-emerald-700' : 'border-white/15 bg-white/10 text-white'}`}>
                      <Wallet size={20} />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${activeTab === 'tuition' ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-100/80'}`}>
                      {overdueFamilies} retard{overdueFamilies > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-black tracking-tight">Frais de scolarité</p>
                    <p className={`mt-2 text-sm leading-5 ${activeTab === 'tuition' ? 'text-slate-600' : 'text-slate-100/78'}`}>
                      Recherche famille, solde global, vue d'ensemble et gestion des modalités de paiement.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('payments')}
                className={`rounded-[1.6rem] border p-4 text-left transition-all duration-300 ${
                  activeTab === 'payments'
                    ? 'border-white/35 bg-white text-slate-950 shadow-[0_20px_50px_-32px_rgba(255,255,255,0.85)]'
                    : 'border-white/12 bg-slate-950/25 text-white hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${activeTab === 'payments' ? 'border-slate-200 bg-slate-100 text-cyan-700' : 'border-white/15 bg-white/10 text-white'}`}>
                      <Receipt size={20} />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${activeTab === 'payments' ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-100/80'}`}>
                      {pendingMiscCount} en attente
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-black tracking-tight">Encaissements</p>
                    <p className={`mt-2 text-sm leading-5 ${activeTab === 'payments' ? 'text-slate-600' : 'text-slate-100/78'}`}>
                      Paiements hors scolarité, recherche d'opérations et impression rapide des reçus.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('expenses')}
                className={`rounded-[1.6rem] border p-4 text-left transition-all duration-300 ${
                  activeTab === 'expenses'
                    ? 'border-white/35 bg-white text-slate-950 shadow-[0_20px_50px_-32px_rgba(255,255,255,0.85)]'
                    : 'border-white/12 bg-slate-950/25 text-white hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${activeTab === 'expenses' ? 'border-slate-200 bg-slate-100 text-rose-700' : 'border-white/15 bg-white/10 text-white'}`}>
                      <TrendingDown size={20} />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${activeTab === 'expenses' ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-100/80'}`}>
                      {expenses.length} opération{expenses.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-black tracking-tight">Dépenses</p>
                    <p className={`mt-2 text-sm leading-5 ${activeTab === 'expenses' ? 'text-slate-600' : 'text-slate-100/78'}`}>
                      Suivi des charges de l'école par catégorie et module.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="rounded-[1.75rem] border border-white/12 bg-slate-950/25 p-4 backdrop-blur-sm">
              {activeTab === 'tuition' ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">
                      Famille active
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                      {selectedFamilyDisplay}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-100/78">
                      {statusLoading
                        ? 'Chargement du compte famille en cours.'
                        : familyStatus
                          ? `${formatCurrency(familyStatus.totalRemaining)} restent à régulariser pour cette famille.`
                          : 'Sélectionnez une famille pour consulter son solde global et enregistrer un versement.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">À jour</div>
                      <div className="mt-2 text-sm font-semibold text-white">{settledFamilies} familles</div>
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">En suivi</div>
                      <div className="mt-2 text-sm font-semibold text-white">{familiesInProgress} familles</div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'payments' ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">
                      Vue opérations
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                      Encaissements
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-100/78">
                      Gardez un oeil sur les transactions hors scolarité et les paiements encore en attente de règlement.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">Réglé</div>
                      <div className="mt-2 text-sm font-semibold text-white">{formatCurrency(paidMiscTotal)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">En attente</div>
                      <div className="mt-2 text-sm font-semibold text-white">{pendingMiscCount} opérations</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">
                      Vue dépenses
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                      Dépenses
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-100/78">
                      Charges de l'établissement ventilées par catégorie et module.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">Total</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">Opérations</div>
                      <div className="mt-2 text-sm font-semibold text-white">{expenses.length}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {activeTab === 'tuition' ? (
        <div className="space-y-6">
          {/* Statistiques familles : combien ont payé, combien sont en retard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Familles"
              value={allFamiliesStatus.length.toString()}
              icon={<Users />}
              color="bleu"
              subtitle="Familles inscrites"
            />
            <StatCard
              title="Soldés"
              value={allFamiliesStatus.filter(r => r.status.totalRemaining <= 0).length.toString()}
              icon={<CheckCircle2 />}
              color="vert"
              subtitle="À jour de paiement"
            />
            <StatCard
              title="En cours"
              value={allFamiliesStatus.filter(r => r.status.totalRemaining > 0 && !r.status.hasOverdue).length.toString()}
              icon={<TrendingUp />}
              color="or"
              subtitle="Reste à payer"
            />
            <StatCard
              title="En retard"
              value={allFamiliesStatus.filter(r => r.status.hasOverdue).length.toString()}
              icon={<AlertCircle />}
              color="rouge"
              subtitle="Échéances dépassées"
            />
          </div>

          {/* Recherche + Carte famille minimaliste */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="overflow-visible border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Recherche ciblée</p>
                  <h3 className="mt-2 flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-slate-900 dark:text-white">
                <Search size={18} className="text-bleu-600" />
                Rechercher une Famille
                  </h3>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right dark:bg-white/5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Suggestions</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{filteredFamilies.length}</div>
                </div>
              </div>
              <div className="relative" ref={familySearchRef}>
                <Input
                  placeholder="Nom du parent..."
                  value={familySearchQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFamilySearchQuery(v);
                    setIsFamilySearchOpen(true);
                    // Dès qu'on modifie le texte, on enlève la sélection
                    // courante pour que la recherche s'applique à neuf.
                    if (selectedFamily) {
                      const currentLabel = `${selectedFamily.firstName} ${selectedFamily.lastName}`;
                      if (v !== currentLabel) {
                        setSelectedFamily(null);
                        setFamilyStatus(null);
                      }
                    }
                  }}
                  onFocus={() => setIsFamilySearchOpen(true)}
                  className="bg-slate-50 dark:bg-slate-950/40"
                />
                {isFamilySearchOpen && filteredFamilies.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/95 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
                    {filteredFamilies.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleFamilySearch(p)}
                        className="w-full border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-bleu-50 dark:border-white/5 dark:hover:bg-white/5 last:border-0"
                      >
                        <p className="font-bold text-gray-900">{p.firstName} {p.lastName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{p.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-4 text-[10px] text-gray-400 font-medium">
                Tape le nom d'un parent, ou clique directement sur une famille dans le tableau ci-dessous.
              </p>
            </Card>

            {/* Carte famille sélectionnée — informations essentielles uniquement */}
            {statusLoading ? (
              <Card className="flex min-h-[260px] items-center justify-center border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
                <Loader2 className="animate-spin text-bleu-600" size={32} />
              </Card>
            ) : familyStatus && selectedFamily ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="rounded-[1.8rem] border-none bg-gradient-to-br from-slate-950 via-bleu-700 to-cyan-500 p-6 text-white shadow-[0_25px_60px_-34px_rgba(37,99,235,0.7)]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Famille</p>
                      <h3 className="text-xl font-black">
                        {selectedFamily.firstName} {selectedFamily.lastName}
                      </h3>
                    </div>
                    <button
                      onClick={() => { setSelectedFamily(null); setFamilyStatus(null); setFamilySearchQuery(''); }}
                      className="p-2 hover:bg-white/10 rounded-xl"
                      title="Fermer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/20">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Adresse</p>
                      <p className="text-sm font-bold truncate">{selectedFamily.address || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Téléphone</p>
                      <p className="text-sm font-bold truncate">{selectedFamily.phone || '—'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Payé</p>
                      <p className="text-lg font-black">{formatCurrency(familyStatus.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Reste à payer</p>
                      <p className="text-lg font-black">{formatCurrency(familyStatus.totalRemaining)}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsFamilyPaymentModalOpen(true)}
                    className="w-full bg-white text-bleu-600 hover:bg-gray-50 border-none font-black uppercase text-[10px] py-3"
                    disabled={familyStatus.totalRemaining <= 0}
                  >
                    Payer Scolarité Famille
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <Card className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-slate-300 bg-white/75 p-8 text-slate-400 shadow-none dark:border-white/10 dark:bg-slate-900/35">
                <Users size={36} className="mb-3 opacity-20" />
                <p className="font-bold text-xs text-center">Sélectionne une famille pour voir ses informations</p>
              </Card>
            )}
          </div>

          {/* Vue d'ensemble : toutes les familles avec leur statut paiement */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Users size={18} className="text-bleu-600" />
                Vue d'ensemble des familles
                {allFamiliesStatus.length > 0 && (
                  <span className="text-[10px] text-gray-400 font-bold">({allFamiliesStatus.length})</span>
                )}
              </h3>
            </div>
            {overviewLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-bleu-600" size={32} />
              </div>
            ) : allFamiliesStatus.length === 0 ? (
              <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">Aucune famille à afficher.</p>
              </div>
            ) : (
              <Card className="overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
                <Table
                  data={allFamiliesStatus}
                  columns={[
                    {
                      key: 'family',
                      label: 'Famille',
                      render: (_: any, row: any) => (
                        <div className="text-left">
                          <p className="font-bold text-gray-900">
                            Famille {row.parent.lastName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">
                            {row.parent.firstName} {row.parent.address ? `• ${row.parent.address}` : ''}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'children',
                      label: 'Enfants',
                      render: (_: any, row: any) => (
                        <span className="text-xs font-black text-gray-700">
                          {row.status.students?.length ?? 0}
                        </span>
                      ),
                    },
                    {
                      key: 'paid',
                      label: 'Versé',
                      render: (_: any, row: any) => (
                        <span className="text-xs font-black text-vert-600">
                          {formatCurrency(row.status.totalPaid)}
                        </span>
                      ),
                    },
                    {
                      key: 'remaining',
                      label: 'Restant',
                      render: (_: any, row: any) => (
                        <span
                          className={`text-xs font-black ${
                            row.status.totalRemaining > 0 ? 'text-rouge-600' : 'text-gray-400'
                          }`}
                        >
                          {formatCurrency(row.status.totalRemaining)}
                        </span>
                      ),
                    },
                    {
                      key: 'status',
                      label: 'Statut',
                      render: (_: any, row: any) =>
                        row.status.totalRemaining <= 0 ? (
                          <Badge variant="success">Soldé</Badge>
                        ) : row.status.hasOverdue ? (
                          <Badge variant="error">{row.status.overdueCount} en retard</Badge>
                        ) : (
                          <Badge variant="warning">En cours</Badge>
                        ),
                    },
                    {
                      key: 'actions',
                      label: '',
                      render: (_: any, row: any) => (
                        <div className="flex justify-end pr-2">
                          <button
                            onClick={() => handleFamilySearch(row.parent)}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-bleu-600 hover:bg-bleu-50 rounded-xl transition-colors"
                          >
                            Voir / Payer
                          </button>
                        </div>
                      ),
                    },
                  ] as any}
                />
              </Card>
            )}
          </div>

          <div className="pt-2">
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
          </div>
        </div>
      ) : activeTab === 'payments' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Encaissements" value={formatCurrency(miscPayments.reduce((acc, p) => acc + (p.status === 'PAID' ? p.amount : 0), 0))} icon={<TrendingUp />} color="bleu" subtitle="Total hors scolarité" />
            <StatCard title="Opérations" value={miscPayments.length.toString()} icon={<Receipt />} color="or" subtitle="Nombre de transactions" />
            <Card className="flex flex-col justify-center border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
              <Button onClick={() => setIsMiscModalOpen(true)} className="w-full h-full min-h-[60px] bg-bleu-600 hover:bg-bleu-700 font-black uppercase tracking-widest gap-2">
                <Plus size={20} /> Nouvel Encaissement
              </Button>
            </Card>
          </div>

          <Card className="border border-slate-200/70 bg-white/90 p-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Rechercher une transaction..." 
                className="pl-12" 
                value={miscSearchQuery}
                onChange={(e) => setMiscSearchQuery(e.target.value)}
              />
            </div>
          </Card>

          <Card className="overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
            {loading ? (
              <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-bleu-600" size={40} /></div>
            ) : (
              <Table 
                data={miscPayments}
                columns={[
                  { key: 'studentName', label: 'Client / Élève', render: (val: any, row: any) => (
                    <div className="flex items-center gap-3">
                      <Avatar name={val || row.familyName || 'Client'} size="sm" />
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{val || row.familyName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{row.categoryName}</p>
                      </div>
                    </div>
                  )},
                  { key: 'amount', label: 'Montant', render: (val: any) => <span className="font-black text-gray-900">{formatCurrency(val)}</span> },
                  { key: 'method', label: 'Mode', render: (val: any) => (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                      {getMethodIcon(val)} {val}
                    </div>
                  )},
                  { key: 'paidAt', label: 'Date', render: (val: any) => <span className="text-xs font-bold text-gray-500">{formatDate(val)}</span> },
                  { key: 'status', label: 'Statut', render: (val: any) => <Badge variant={val === 'PAID' ? 'success' : 'warning'}>{val}</Badge> },
                  { key: 'actions', label: '', render: (_: any, row: any) => (
                    <div className="flex justify-end pr-2 gap-2">
                      <button 
                        onClick={() => {
                          const status: any = { familyId: row.familyName || 'Client', totalRemaining: 0 };
                          printFamilyReceipt(status, row.amount, row.method, row.reference);
                        }}
                        className="p-2 hover:bg-bleu-50 text-bleu-600 rounded-xl transition-colors"
                        title="Imprimer le reçu"
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(row.id)}
                        className="p-2 hover:bg-rouge-50 text-rouge-500 rounded-xl transition-colors"
                        title="Supprimer ce paiement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                ] as any}
              />
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Dépenses" value={formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))} icon={<TrendingDown />} color="rouge" subtitle="Charges enregistrées" />
            <StatCard title="Opérations" value={expenses.length.toString()} icon={<FileText />} color="or" subtitle="Nombre de dépenses" />
            <Card className="flex flex-col justify-center border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
              <Button onClick={() => setIsExpenseModalOpen(true)} className="w-full h-full min-h-[60px] bg-rouge-600 hover:bg-rouge-700 font-black uppercase tracking-widest gap-2">
                <Plus size={20} /> Nouvelle Dépense
              </Button>
            </Card>
          </div>

          <Card className="border border-slate-200/70 bg-white/90 p-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Rechercher une dépense..." 
                className="pl-12" 
                value={expenseSearchQuery}
                onChange={(e) => setExpenseSearchQuery(e.target.value)}
              />
            </div>
          </Card>

          <Card className="overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
            {expensesLoading ? (
              <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-rouge-600" size={40} /></div>
            ) : expenses.length === 0 ? (
              <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                <TrendingDown size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">Aucune dépense enregistrée.</p>
              </div>
            ) : (
              <Table 
                data={expenses}
                columns={[
                  { key: 'description', label: 'Description', render: (val: any, row: any) => (
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{val}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{row.categoryName} • {row.categoryModule}</p>
                    </div>
                  )},
                  { key: 'amount', label: 'Montant', render: (val: any) => <span className="font-black text-gray-900">{formatCurrency(val)}</span> },
                  { key: 'expenseDate', label: 'Date', render: (val: any) => <span className="text-xs font-bold text-gray-500">{formatDate(val)}</span> },
                  { key: 'createdByName', label: 'Enregistré par', render: (val: any) => <span className="text-xs font-bold text-gray-700">{val}</span> },
                  { key: 'actions', label: '', render: (_: any, row: any) => (
                    <div className="flex justify-end pr-2 gap-2">
                      <button
                        onClick={() => handleDeleteExpense(row.id)}
                        className="p-2 hover:bg-rouge-50 text-rouge-500 rounded-xl transition-colors"
                        title="Supprimer cette dépense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                ] as any}
              />
            )}
          </Card>
        </div>
      )}

      {/* --- Modals --- */}
      
      {/* Family Payment Modal */}
      <Modal isOpen={isFamilyPaymentModalOpen} onClose={() => setIsFamilyPaymentModalOpen(false)} title="Payer Scolarité Famille" size="md">
        <div className="space-y-6">
          <div className="p-4 bg-bleu-50 rounded-2xl border border-bleu-100">
            <p className="text-[10px] font-bold text-bleu-600 uppercase mb-1">Reste à payer total</p>
            <p className="text-2xl font-black text-gray-900">{familyStatus ? formatCurrency(familyStatus.totalRemaining) : '0 GNF'}</p>
          </div>
          <Input 
            label="Montant du versement (GNF)" 
            type="number" 
            value={familyPaymentForm.amount || ''} 
            onChange={e => setFamilyPaymentForm(f => ({ ...f, amount: Number(e.target.value) }))}
          />
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mode de Paiement</label>
            <div className="grid grid-cols-2 gap-2">
              {(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK'] as PaymentMethod[]).map(m => (
                <button 
                  key={m}
                  onClick={() => setFamilyPaymentForm(f => ({ ...f, method: m }))}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${familyPaymentForm.method === m ? 'border-bleu-500 bg-bleu-50' : 'border-gray-100 hover:border-bleu-200'}`}
                >
                  {getMethodIcon(m)}
                  <span className="text-xs font-bold">{m}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsFamilyPaymentModalOpen(false)} className="flex-1">Annuler</Button>
            <Button onClick={handleFamilyPayment} loading={familySubmitting} className="flex-1 bg-bleu-600 shadow-blue">Confirmer le Paiement</Button>
          </div>
        </div>
      </Modal>

      {/* Payments Modal */}
      <Modal isOpen={isMiscModalOpen} onClose={() => setIsMiscModalOpen(false)} title="Nouvel Encaissement" size="md">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Catégorie</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-bleu-500/10"
              value={miscPaymentForm.categoryId || ''}
              onChange={e => setMiscPaymentForm(f => ({ ...f, categoryId: Number(e.target.value) }))}
            >
              <option value="">Sélectionner une catégorie...</option>
              {incomeCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Assigner à une famille (Optionnel)</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-bleu-500/10"
              value={miscPaymentForm.familyId || ''}
              onChange={e => setMiscPaymentForm(f => ({ ...f, familyId: e.target.value }))}
            >
              <option value="">Client divers</option>
              {parents.map(p => (
                <option key={p.id} value={p.familyId}>Famille {p.lastName} ({p.firstName})</option>
              ))}
            </select>
          </div>
          <Input 
            label="Montant (GNF)" 
            type="number" 
            value={miscPaymentForm.amount || ''} 
            onChange={e => setMiscPaymentForm(f => ({ ...f, amount: Number(e.target.value) }))}
          />
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mode de Paiement</label>
            <div className="grid grid-cols-2 gap-2">
              {(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK'] as PaymentMethod[]).map(m => (
                <button 
                  key={m}
                  onClick={() => setMiscPaymentForm(f => ({ ...f, method: m }))}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${miscPaymentForm.method === m ? 'border-bleu-500 bg-bleu-50' : 'border-gray-100'}`}
                >
                  {getMethodIcon(m)}
                  <span className="text-xs font-bold">{m}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsMiscModalOpen(false)} className="flex-1">Annuler</Button>
            <Button onClick={handleMiscPayment} loading={miscSubmitting} className="flex-1 bg-bleu-600">Enregistrer</Button>
          </div>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Nouvelle Dépense" size="md">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Catégorie</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-rouge-500/10"
              value={expenseForm.categoryId || ''}
              onChange={e => setExpenseForm(f => ({ ...f, categoryId: Number(e.target.value) }))}
            >
              <option value="">Sélectionner une catégorie...</option>
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input 
            label="Description" 
            placeholder="Ex: Achat fournitures scolaires"
            value={expenseForm.description}
            onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
          />
          <Input 
            label="Montant (GNF)" 
            type="number" 
            value={expenseForm.amount || ''} 
            onChange={e => setExpenseForm(f => ({ ...f, amount: Number(e.target.value) }))}
          />
          <Input 
            label="Date" 
            type="date" 
            value={expenseForm.expenseDate}
            onChange={e => setExpenseForm(f => ({ ...f, expenseDate: e.target.value }))}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)} className="flex-1">Annuler</Button>
            <Button onClick={handleCreateExpense} loading={expenseSubmitting} className="flex-1 bg-rouge-600">Enregistrer</Button>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
};

export default AdminAccounting;
