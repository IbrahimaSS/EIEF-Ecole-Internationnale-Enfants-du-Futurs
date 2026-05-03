import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, Search, Wallet } from 'lucide-react';
import { Avatar, Badge, Button, Card, Table } from '../../../components/ui';
import { moduleOptions } from '../constants';
import { PaymentResponse, PaymentStatus, Student } from '../types';
import {
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '../utils';

interface Props {
  payments: PaymentResponse[];
  loading: boolean;
  students: Student[];
  onOpenReceipt: (payment: PaymentResponse) => void;
  onMarkAsPaid: (paymentId: string) => void;
}

const PaymentsSection: React.FC<Props> = ({
  loading,
  onMarkAsPaid,
  onOpenReceipt,
  payments,
  students,
}) => {
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState('all');
  const [module, setModule] = useState('Tous');

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchQuery =
        !query.trim() ||
        payment.reference.toLowerCase().includes(query.trim().toLowerCase()) ||
        payment.studentName.toLowerCase().includes(query.trim().toLowerCase());

      const selectedStudent = students.find((student) => student.id === studentId);
      const studentFullName = selectedStudent
        ? `${selectedStudent.firstName} ${selectedStudent.lastName}`.trim()
        : '';

      const matchStudent =
        studentId === 'all' || payment.studentName.toLowerCase() === studentFullName.toLowerCase();

      const matchModule =
        module === 'Tous' ||
        (payment.categoryName || '').toUpperCase().includes(module.toUpperCase().replace('É', 'E'));

      return matchQuery && matchStudent && matchModule;
    });
  }, [module, payments, query, studentId, students]);

  const columns = [
    {
      key: 'studentName',
      label: 'Élève',
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <Avatar name={value} size="sm" />
          <span className="font-bold text-gray-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Service',
      render: (value: string) => (
        <span className="rounded-xl bg-bleu-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
          {value || 'Non renseigné'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Montant',
      sortable: true,
      render: (value: number) => (
        <span className="font-bold text-gray-900 dark:text-white">
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
          <Badge variant={variant as any} className="text-[9px] px-3 font-bold uppercase tracking-widest">
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
          >
            <Eye size={14} />
          </Button>
          {row.status !== 'PAID' && (
            <Button
              onClick={() => onMarkAsPaid(row.id)}
              className="h-9 px-3 text-[10px]"
            >
              <CheckCircle2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Journal des encaissements</h3>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Vue opérationnelle des paiements enregistrés par le comptable.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <select
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="all">Tous les élèves</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
          <select
            value={module}
            onChange={(event) => setModule(event.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            {moduleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm font-semibold text-gray-400">
          Chargement des encaissements...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
          <Wallet size={36} className="opacity-30" />
          <p className="text-sm font-semibold">Aucun encaissement ne correspond à vos filtres.</p>
        </div>
      ) : (
        <Table data={filteredPayments} columns={columns as any} />
      )}
    </Card>
  );
};

export default PaymentsSection;
