import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Printer,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  Banknote,
  Smartphone,
  CreditCard,
  FileText,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Input, StatCard } from '../ui';
import {
  accountingService,
  PaymentResponse,
  PaymentMethod,
  ExpenseResponse,
  ExpenseRequestPayload,
  ExpenseCategoryResponse,
} from '../../services/accountingService';
import { apiRequest } from '../../services/api';
import { printReceipt } from '../../utils/printReceipt';

interface ServicePaymentsProps {
  module: string;
  moduleLabel: string;
  color: 'bleu' | 'or' | 'vert' | 'rouge';
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(amount) + ' FGN';

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const getMethodIcon = (method: string) => {
  switch (method) {
    case 'MOBILE_MONEY': return <Smartphone size={14} className="text-orange-500" />;
    case 'CASH': return <Banknote size={14} className="text-green-500" />;
    case 'BANK_TRANSFER': return <CreditCard size={14} className="text-blue-500" />;
    case 'CHECK': return <FileText size={14} className="text-purple-500" />;
    default: return null;
  }
};

const ServicePayments: React.FC<ServicePaymentsProps> = ({ module, moduleLabel, color }) => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<ExpenseCategoryResponse[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryResponse[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<'payments' | 'expenses'>('payments');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: 0,
    method: 'CASH' as PaymentMethod,
    studentId: '',
    familyId: '',
    categoryId: null as number | null,
  });
  const [paySubmitting, setPaySubmitting] = useState(false);

  // Expense modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: null as number | null,
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const modules = useMemo(() => module.split(',').map(m => m.trim().toUpperCase()), [module]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const paymentPromises = modules.map(m => accountingService.getPayments({ module: m }));
      const expensePromises = modules.map(m => accountingService.getExpenses({ module: m }));

      const [payResults, expResults, allCategories, parentsData] = await Promise.all([
        Promise.all(paymentPromises),
        Promise.all(expensePromises),
        apiRequest<ExpenseCategoryResponse[]>('/expenses/categories'),
        apiRequest<any[]>('/users').then(users =>
          Array.isArray(users) ? users.filter(u => u.roleName === 'PARENT' && u.familyId) : []
        ),
      ]);
      setPayments(payResults.flat().filter(Array.isArray(payResults[0]) ? Boolean : () => true));
      setExpenses(expResults.flat().filter(Array.isArray(expResults[0]) ? Boolean : () => true));
      setParents(parentsData);

      const cats = Array.isArray(allCategories) ? allCategories : [];
      setIncomeCategories(cats.filter(c =>
        c.type === 'INCOME' && modules.includes(c.module?.toUpperCase() || '')
      ));
      setExpenseCategories(cats.filter(c =>
        c.type === 'EXPENSE' && modules.includes(c.module?.toUpperCase() || '')
      ));
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [module, modules]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter(p =>
      (p.studentName && p.studentName.toLowerCase().includes(q)) ||
      (p.familyName && p.familyName.toLowerCase().includes(q)) ||
      (p.reference && p.reference.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
  }, [payments, searchQuery]);

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(e =>
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.categoryName && e.categoryName.toLowerCase().includes(q)) ||
      (e.createdByName && e.createdByName.toLowerCase().includes(q))
    );
  }, [expenses, searchQuery]);

  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const familyCount = new Set(payments.filter(p => p.familyName).map(p => p.familyName)).size;

  const handleCreatePayment = async () => {
    if (paySubmitting || !payForm.categoryId) return;
    setPaySubmitting(true);
    try {
      const created = await accountingService.createPayment({
        amount: payForm.amount,
        method: payForm.method,
        reference: '',
        studentId: payForm.studentId || undefined,
        familyId: payForm.familyId || undefined,
        categoryId: payForm.categoryId,
      });
      showSuccess('Paiement enregistré');
      setIsPayModalOpen(false);
      if (created) {
        printReceipt({
          receiptNumber: created.reference,
          amount: created.amount,
          date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          studentName: created.studentName || '',
          className: '',
          categoryName: created.categoryName || moduleLabel,
          parentName: created.familyName || '',
        });
      }
      setPayForm({ amount: 0, method: 'CASH', studentId: '', familyId: '', categoryId: null });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleCreateExpense = async () => {
    if (expenseSubmitting || !expenseForm.categoryId) return;
    setExpenseSubmitting(true);
    try {
      await accountingService.createExpense({
        amount: expenseForm.amount,
        description: expenseForm.description,
        expenseDate: expenseForm.expenseDate,
        categoryId: expenseForm.categoryId,
      });
      showSuccess('Dépense enregistrée');
      setIsExpenseModalOpen(false);
      setExpenseForm({ amount: 0, description: '', expenseDate: new Date().toISOString().split('T')[0], categoryId: null });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm('Supprimer ce paiement ?')) return;
    try {
      await accountingService.deletePayment(id);
      showSuccess('Paiement supprimé');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erreur');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    try {
      await accountingService.deleteExpense(id);
      showSuccess('Dépense supprimée');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erreur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-bleu-500" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Notifications */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg">
            <CheckCircle2 size={18} /> {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          <AlertCircle size={18} />
          <span className="font-medium flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`REVENUS ${moduleLabel.toUpperCase()}`}
          value={formatCurrency(totalRevenue)}
          subtitle={`${payments.length} paiements`}
          icon={<ArrowDownCircle />}
          color="vert"
        />
        <StatCard
          title={`DÉPENSES ${moduleLabel.toUpperCase()}`}
          value={formatCurrency(totalExpenses)}
          subtitle={`${expenses.length} sorties`}
          icon={<ArrowUpCircle />}
          color="rouge"
        />
        <StatCard
          title="SOLDE"
          value={formatCurrency(totalRevenue - totalExpenses)}
          subtitle={totalRevenue - totalExpenses >= 0 ? 'Excédent' : 'Déficit'}
          icon={<ArrowDownCircle />}
          color={totalRevenue - totalExpenses >= 0 ? 'bleu' : 'rouge'}
        />
        <StatCard
          title="FAMILLES"
          value={String(familyCount)}
          subtitle="ont payé ce service"
          icon={<Users />}
          color={color}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
          <button
            onClick={() => setView('payments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${view === 'payments' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <ArrowDownCircle size={14} className="inline mr-1.5" />Entrées ({payments.length})
          </button>
          <button
            onClick={() => setView('expenses')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${view === 'expenses' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <ArrowUpCircle size={14} className="inline mr-1.5" />Sorties ({expenses.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bleu-500/20"
            />
          </div>
          <Button
            onClick={() => view === 'payments' ? setIsPayModalOpen(true) : setIsExpenseModalOpen(true)}
            className={view === 'payments' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}
          >
            <Plus size={16} className="mr-1" />
            {view === 'payments' ? 'Encaisser' : 'Dépense'}
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      {view === 'payments' && (
        <Card variant="glass" className="overflow-hidden">
          {filteredPayments.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">Aucun paiement enregistré pour {moduleLabel}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Client / Élève</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Famille</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Catégorie</th>
                    <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-gray-500">Montant</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Mode</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Statut</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="py-2.5 px-4 font-bold text-gray-800 dark:text-white">{p.studentName || '—'}</td>
                      <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300">{p.familyName || '—'}</td>
                      <td className="py-2.5 px-4 text-gray-500">{p.categoryName}</td>
                      <td className="py-2.5 px-4 text-right font-black text-green-600">{formatCurrency(p.amount)}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                          {getMethodIcon(p.method)} {p.method}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{formatDate(p.paidAt)}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={p.status === 'PAID' ? 'success' : 'warning'}>{p.status}</Badge>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => printReceipt({
                              receiptNumber: p.reference,
                              amount: p.amount,
                              date: formatDate(p.paidAt),
                              studentName: p.studentName || '',
                              categoryName: p.categoryName || moduleLabel,
                              parentName: p.familyName || '',
                            })}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                            title="Imprimer le reçu"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Expenses Table */}
      {view === 'expenses' && (
        <Card variant="glass" className="overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">Aucune dépense enregistrée pour {moduleLabel}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Catégorie</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Description</th>
                    <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-gray-500">Montant</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500">Enregistré par</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e, i) => (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="py-2.5 px-4 text-xs text-gray-600 dark:text-gray-300">{formatDate(e.expenseDate)}</td>
                      <td className="py-2.5 px-4 font-bold text-gray-800 dark:text-white">{e.categoryName}</td>
                      <td className="py-2.5 px-4 text-gray-500 max-w-[200px] truncate">{e.description || '—'}</td>
                      <td className="py-2.5 px-4 text-right font-black text-red-500">{formatCurrency(e.amount)}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{e.createdByName || '—'}</td>
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => handleDeleteExpense(e.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Payment Modal */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title={`Nouvel encaissement — ${moduleLabel}`} size="md">
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Catégorie</label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-bleu-500/10"
              value={payForm.categoryId || ''}
              onChange={e => setPayForm(f => ({ ...f, categoryId: Number(e.target.value) }))}
            >
              <option value="">Sélectionner...</option>
              {incomeCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Famille (optionnel)</label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-bleu-500/10"
              value={payForm.familyId}
              onChange={e => setPayForm(f => ({ ...f, familyId: e.target.value }))}
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
            value={payForm.amount || ''}
            onChange={e => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))}
          />
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mode de paiement</label>
            <div className="grid grid-cols-2 gap-2">
              {(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK'] as PaymentMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setPayForm(f => ({ ...f, method: m }))}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${payForm.method === m ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}
                >
                  {getMethodIcon(m)}
                  <span className="text-xs font-bold">{m}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsPayModalOpen(false)} className="flex-1">Annuler</Button>
            <Button onClick={handleCreatePayment} loading={paySubmitting} className="flex-1 bg-green-600">Enregistrer</Button>
          </div>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={`Nouvelle dépense — ${moduleLabel}`} size="md">
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Catégorie</label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-4 focus:ring-bleu-500/10"
              value={expenseForm.categoryId || ''}
              onChange={e => setExpenseForm(f => ({ ...f, categoryId: Number(e.target.value) }))}
            >
              <option value="">Sélectionner...</option>
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Montant (GNF)"
            type="number"
            value={expenseForm.amount || ''}
            onChange={e => setExpenseForm(f => ({ ...f, amount: Number(e.target.value) }))}
          />
          <Input
            label="Description"
            value={expenseForm.description}
            onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Date"
            type="date"
            value={expenseForm.expenseDate}
            onChange={e => setExpenseForm(f => ({ ...f, expenseDate: e.target.value }))}
          />
          <div className="flex gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)} className="flex-1">Annuler</Button>
            <Button onClick={handleCreateExpense} loading={expenseSubmitting} className="flex-1 bg-red-500">Enregistrer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServicePayments;
