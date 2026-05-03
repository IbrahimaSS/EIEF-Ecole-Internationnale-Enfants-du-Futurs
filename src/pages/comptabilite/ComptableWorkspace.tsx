import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Receipt, Wallet } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import SectionHero from './components/SectionHero';
import OverviewStats from './components/OverviewStats';
import ExpensesSection from './components/ExpensesSection';
import PaymentsSection from './components/PaymentsSection';
import TuitionSection from './components/TuitionSection';
import ExpenseModal from './components/modals/ExpenseModal';
import PaymentModal from './components/modals/PaymentModal';
import ReceiptModal from './components/modals/ReceiptModal';
import { useComptableFinance } from './hooks/useComptableFinance';
import {
  ComptableSection,
  ExpensePayload,
  PaymentPayload,
  PaymentResponse,
  PaymentServiceOption,
} from './types';
import { formatCurrency, formatDate, resolvePaymentServiceLabel } from './utils';

interface Props {
  section: ComptableSection;
}

const ComptableWorkspace: React.FC<Props> = ({ section }) => {
  const finance = useComptableFinance({ preloadTuition: section === 'tuition' });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<PaymentResponse | null>(null);
  const [receiptServiceOverride, setReceiptServiceOverride] = useState<string | null>(null);
  const [paymentService, setPaymentService] = useState<PaymentServiceOption>('scolarite');
  const [customPaymentServiceLabel, setCustomPaymentServiceLabel] = useState('');
  const [paymentForm, setPaymentForm] = useState<PaymentPayload>({
    amount: 0,
    reference: '',
    method: 'CASH',
    studentId: '',
    categoryId: null,
  });
  const [expenseForm, setExpenseForm] = useState<ExpensePayload>({
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: null,
  });

  const selectedReceiptStudent = useMemo(() => {
    if (!receiptPayment) return null;
    return (
      finance.students.find(
        (student) =>
          `${student.firstName} ${student.lastName}`.trim().toLowerCase() ===
          receiptPayment.studentName.toLowerCase(),
      ) || null
    );
  }, [finance.students, receiptPayment]);

  const recentPayments = useMemo(() => finance.payments.slice(0, 5), [finance.payments]);
  const recentExpenses = useMemo(() => finance.expenses.slice(0, 5), [finance.expenses]);

  const handleCreatePayment = async () => {
    const receiptService = resolvePaymentServiceLabel(
      paymentService,
      customPaymentServiceLabel,
    );
    const created = await finance.createPayment(paymentForm);
    setReceiptPayment(created);
    setReceiptServiceOverride(receiptService);
    setIsPaymentModalOpen(false);
    setPaymentService('scolarite');
    setCustomPaymentServiceLabel('');
    setPaymentForm({
      amount: 0,
      reference: '',
      method: 'CASH',
      studentId: '',
      categoryId: null,
    });
  };

  const handleCreateExpense = async () => {
    await finance.createExpense(expenseForm);
    setIsExpenseModalOpen(false);
    setExpenseForm({
      amount: 0,
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
      categoryId: null,
    });
  };

  const dashboard = (
    <div className="space-y-6">
      <OverviewStats
        totalRevenue={finance.totals.totalRevenue}
        expectedRevenue={finance.totals.expectedRevenue}
        overdueRevenue={finance.totals.overdueRevenue}
        collectionRate={finance.totals.collectionRate}
        overdueCount={finance.overduePayments.length}
        expenseSummary={finance.expenseSummary}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Encaissements récents
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Dernières opérations enregistrées.
              </p>
            </div>
            <div className="rounded-2xl bg-bleu-50 p-3 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
              <Wallet size={18} />
            </div>
          </div>

          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 dark:border-white/10"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{payment.studentName}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {payment.reference} · {payment.categoryName || 'Service non renseigné'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {formatDate(payment.paidAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Dépenses récentes
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sorties d’argent les plus récentes.
              </p>
            </div>
            <div className="rounded-2xl bg-rouge-50 p-3 text-rouge-700 dark:bg-rouge-900/20 dark:text-rouge-300">
              <AlertCircle size={18} />
            </div>
          </div>

          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 dark:border-white/10"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{expense.description}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {expense.categoryName || expense.categoryModule || 'Non catégorisé'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {formatDate(expense.expenseDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {finance.error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rouge-200 bg-rouge-50 px-4 py-3 text-rouge-700">
          <AlertCircle size={18} />
          <span className="text-sm font-semibold">{finance.error}</span>
          <button
            onClick={() => finance.setError(null)}
            className="ml-auto text-xs font-bold uppercase tracking-widest"
          >
            Fermer
          </button>
        </div>
      )}

      <SectionHero
        section={section}
        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
      />

      {finance.bootLoading ? (
        <Card className="border-none shadow-soft p-10 text-center dark:bg-gray-900/60">
          <p className="text-sm font-semibold text-gray-400">
            Chargement de l’espace comptable...
          </p>
        </Card>
      ) : (
        <>
          {section === 'dashboard' && dashboard}
          {section === 'payments' && (
            <PaymentsSection
              payments={finance.payments}
              loading={finance.paymentsLoading}
              students={finance.students}
              onOpenReceipt={(payment) => {
                setReceiptPayment(payment);
                setReceiptServiceOverride(payment.categoryName || null);
              }}
              onMarkAsPaid={finance.markPaymentAsPaid}
            />
          )}
          {section === 'expenses' && (
            <ExpensesSection
              expenses={finance.expenses}
              loading={finance.expensesLoading}
              onDelete={finance.deleteExpense}
            />
          )}
          {section === 'tuition' && (
            <TuitionSection
              tuitionFees={finance.tuitionFees}
              academicYears={finance.academicYears}
              classes={finance.schoolClasses}
              students={finance.students}
              status={finance.selectedStudentStatus}
              catalogLoading={finance.tuitionCatalogLoading}
              loading={finance.tuitionLoading}
              actionLoading={finance.actionLoading}
              onCreateTuitionFee={finance.createTuitionFee}
              onUpdateTuitionFee={finance.updateTuitionFee}
              onDeleteTuitionFee={finance.deleteTuitionFee}
              onSearchStatus={finance.fetchStudentTuitionStatus}
              onSubmitPayment={finance.registerTuitionPayment}
            />
          )}
        </>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        students={finance.students}
        formData={paymentForm}
        service={paymentService}
        customServiceLabel={customPaymentServiceLabel}
        loading={finance.actionLoading}
        onChange={setPaymentForm}
        onChangeService={setPaymentService}
        onChangeCustomServiceLabel={setCustomPaymentServiceLabel}
        onSubmit={handleCreatePayment}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        categories={finance.expenseCategories}
        formData={expenseForm}
        loading={finance.actionLoading}
        onChange={setExpenseForm}
        onSubmit={handleCreateExpense}
      />

      <ReceiptModal
        isOpen={!!receiptPayment}
        onClose={() => {
          setReceiptPayment(null);
          setReceiptServiceOverride(null);
        }}
        payment={receiptPayment}
        student={selectedReceiptStudent}
        serviceOverride={receiptServiceOverride}
      />

      {section === 'dashboard' && (
        <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Points d’attention
              </h3>
              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Indicateurs rapides pour démarrer la journée comptable.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="error" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                {finance.overduePayments.length} impayé(s)
              </Badge>
              <Badge variant="success" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                {recentPayments.length} encaissement(s) récents
              </Badge>
              <Badge variant="warning" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                {recentExpenses.length} dépense(s) récentes
              </Badge>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center gap-2">
              <Receipt size={16} /> Enregistrer un paiement
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> Enregistrer une dépense
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ComptableWorkspace;
