import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, Filter, Search, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, Badge, Button, Card, Table } from '../../../components/ui';
import StudentSearchInput from '../../../components/shared/StudentSearchInput';
import {
  moduleOptions,
  paymentMethodOptions,
  paymentStatusOptions,
} from '../constants';
import { PaymentResponse, PaymentStatus, Student } from '../types';
import {
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  isWithinDateRange,
  matchesModule,
} from '../utils';

interface Props {
  payments: PaymentResponse[];
  loading: boolean;
  students: Student[];
  onOpenReceipt: (payment: PaymentResponse) => void;
  onMarkAsPaid: (paymentId: string) => Promise<void> | void;
}

const PaymentsSection: React.FC<Props> = ({
  loading,
  onMarkAsPaid,
  onOpenReceipt,
  payments,
  students,
}) => {
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState('');
  const [module, setModule] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Élève sélectionné (pour matcher par nom)
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === studentId) || null,
    [students, studentId],
  );
  const selectedStudentFullName = selectedStudent
    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`.trim().toLowerCase()
    : '';

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Recherche libre (référence ou nom élève)
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        payment.reference.toLowerCase().includes(q) ||
        payment.studentName.toLowerCase().includes(q);

      // Filtre élève
      const matchStudent =
        !studentId || payment.studentName.toLowerCase() === selectedStudentFullName;

      // Filtre module (corrigé : insensible accents)
      const matchModuleFilter = matchesModule(payment.categoryName, module);

      // Filtre statut
      const matchStatus = statusFilter === 'all' || payment.status === statusFilter;

      // Filtre mode de paiement
      const matchMethod = methodFilter === 'all' || payment.method === methodFilter;

      // Filtre période
      const matchDate =
        !dateFrom && !dateTo
          ? true
          : isWithinDateRange(payment.paidAt, dateFrom, dateTo);

      return (
        matchQuery &&
        matchStudent &&
        matchModuleFilter &&
        matchStatus &&
        matchMethod &&
        matchDate
      );
    });
  }, [
    payments,
    query,
    studentId,
    selectedStudentFullName,
    module,
    statusFilter,
    methodFilter,
    dateFrom,
    dateTo,
  ]);

  // Récap calculé sur les paiements filtrés
  const recap = useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paid = filteredPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pending = total - paid;
    return {
      total,
      paid,
      pending,
      count: filteredPayments.length,
      paidCount: filteredPayments.filter((p) => p.status === 'PAID').length,
    };
  }, [filteredPayments]);

  const hasActiveFilters =
    !!query ||
    !!studentId ||
    module !== 'Tous' ||
    statusFilter !== 'all' ||
    methodFilter !== 'all' ||
    !!dateFrom ||
    !!dateTo;

  const resetFilters = () => {
    setQuery('');
    setStudentId('');
    setModule('Tous');
    setStatusFilter('all');
    setMethodFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleMarkAsPaid = async (id: string, ref: string) => {
    try {
      await onMarkAsPaid(id);
      toast.success('Paiement validé', {
        description: `Référence ${ref} marquée comme payée.`,
      });
    } catch (err: any) {
      toast.error('Échec de la validation', {
        description: err?.message || 'Impossible de mettre à jour le paiement.',
      });
    }
  };

  const columns = [
    {
      key: 'studentName',
      label: 'Élève',
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <Avatar name={value} size="sm" className="ring-2 ring-or-400/20" />
          <span className="font-bold text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Service',
      render: (value: string) => (
        <span className="rounded-xl bg-vert-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-vert-700 dark:bg-vert-900/20 dark:text-vert-300">
          {value || 'Non renseigné'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Montant',
      sortable: true,
      render: (value: number) => (
        <span className="font-black text-gray-900 dark:text-white">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Mode',
      render: (value: PaymentResponse['method']) => (
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {getPaymentMethodLabel(value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value: PaymentStatus) => {
        const variant =
          value === 'PAID'
            ? 'success'
            : value === 'OVERDUE'
            ? 'error'
            : value === 'PARTIAL'
            ? 'warning'
            : 'default';

        return (
          <Badge
            variant={variant as any}
            className="text-[9px] px-3 font-bold uppercase tracking-widest"
          >
            {getPaymentStatusLabel(value)}
          </Badge>
        );
      },
    },
    {
      key: 'paidAt',
      label: 'Date',
      sortable: true,
      render: (value: string | null) => (
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: 'id',
      label: '',
      render: (_: string, row: PaymentResponse) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenReceipt(row)}
            className="h-9 px-3 text-[10px]"
            title="Voir le reçu"
          >
            <Eye size={14} />
          </Button>
          {row.status !== 'PAID' && (
            <Button
              onClick={() => handleMarkAsPaid(row.id, row.reference)}
              className="h-9 px-3 text-[10px]"
              title="Marquer comme payé"
            >
              <CheckCircle2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Récap */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/5 dark:bg-gray-900/40">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            Total filtré
          </p>
          <p className="mt-1 text-base font-black text-gray-900 dark:text-white">
            {formatCurrency(recap.total)}
          </p>
          <p className="text-[10px] font-bold text-gray-400">
            {recap.count} opération{recap.count > 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-2xl border border-vert-100 bg-vert-50/40 p-4 dark:border-vert-900/30 dark:bg-vert-900/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-vert-700 dark:text-vert-400">
            Encaissé
          </p>
          <p className="mt-1 text-base font-black text-vert-700 dark:text-vert-300">
            {formatCurrency(recap.paid)}
          </p>
          <p className="text-[10px] font-bold text-vert-600/70">
            {recap.paidCount} payé{recap.paidCount > 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-2xl border border-rouge-100 bg-rouge-50/40 p-4 dark:border-rouge-900/30 dark:bg-rouge-900/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-rouge-700 dark:text-rouge-400">
            En attente
          </p>
          <p className="mt-1 text-base font-black text-rouge-700 dark:text-rouge-300">
            {formatCurrency(recap.pending)}
          </p>
          <p className="text-[10px] font-bold text-rouge-600/70">
            {recap.count - recap.paidCount} dossier(s)
          </p>
        </div>
        <div className="rounded-2xl border border-or-100 bg-or-50/40 p-4 dark:border-or-900/30 dark:bg-or-900/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-or-700 dark:text-or-400">
            Taux encaissement
          </p>
          <p className="mt-1 text-base font-black text-or-700 dark:text-or-300">
            {recap.total > 0
              ? Math.round((recap.paid / recap.total) * 100)
              : 0}
            %
          </p>
          <p className="text-[10px] font-bold text-or-600/70">Sur la sélection</p>
        </div>
      </div>

      <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
        <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Journal des encaissements
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Vue opérationnelle des paiements enregistrés.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-rouge-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rouge-700 transition-colors hover:bg-rouge-100 dark:bg-rouge-900/20 dark:text-rouge-300 dark:hover:bg-rouge-900/30"
            >
              <X size={12} /> Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Filtres ligne 1 : recherche + élève */}
        <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher par référence ou nom..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none transition-all focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-or-400"
            />
          </div>

          <StudentSearchInput
            students={students}
            value={studentId}
            onChange={(id) => setStudentId(id)}
            label=""
            placeholder="Filtrer par élève (nom, matricule, classe)..."
          />
        </div>

        {/* Filtres ligne 2 : module + statut + mode + dates */}
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
              <Filter size={10} className="mr-1 inline" /> Module
            </label>
            <select
              value={module}
              onChange={(event) => setModule(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {moduleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
              Mode
            </label>
            <select
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {paymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
              Du
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
              Au
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-400">
            Chargement des encaissements...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
            <Wallet size={36} className="opacity-30" />
            <p className="text-sm font-semibold">
              {hasActiveFilters
                ? 'Aucun encaissement ne correspond à vos filtres.'
                : 'Aucun encaissement enregistré pour le moment.'}
            </p>
          </div>
        ) : (
          <Table data={filteredPayments} columns={columns as any} />
        )}
      </Card>
    </div>
  );
};

export default PaymentsSection;
