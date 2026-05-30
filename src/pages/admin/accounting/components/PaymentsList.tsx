import React from 'react';
import { Loader2, Trash2, Printer } from 'lucide-react';
import { Table, Avatar, Badge, Card } from '../../../../components/ui';
import { formatCurrency, formatDate } from '../utils';

interface PaymentsListProps {
  data: any[];
  loading: boolean;
  onDelete: (id: string) => void;
  onPrint: (row: any) => void;
  getMethodIcon: (method: string) => React.ReactNode;
}

const PaymentsList: React.FC<PaymentsListProps> = ({
  data,
  loading,
  onDelete,
  onPrint,
  getMethodIcon,
}) => {
  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-bleu-600" size={40} />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
      <Table
        data={data}
        columns={[
          {
            key: 'studentName',
            label: 'Client / Élève',
            render: (val: any, row: any) => (
              <div className="flex items-center gap-3">
                <Avatar name={val || row.familyName || 'Client'} size="sm" />
                <div className="text-left">
                  <p className="font-bold text-gray-900">{val || row.familyName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    {row.categoryName}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: 'amount',
            label: 'Montant',
            render: (val: any) => (
              <span className="font-black text-gray-900">{formatCurrency(val)}</span>
            ),
          },
          {
            key: 'method',
            label: 'Mode',
            render: (val: any) => (
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                {getMethodIcon(val)} {val}
              </div>
            ),
          },
          {
            key: 'paidAt',
            label: 'Date',
            render: (val: any) => (
              <span className="text-xs font-bold text-gray-500">{formatDate(val)}</span>
            ),
          },
          {
            key: 'status',
            label: 'Statut',
            render: (val: any) => (
              <Badge variant={val === 'PAID' ? 'success' : 'warning'}>{val}</Badge>
            ),
          },
          {
            key: 'actions',
            label: '',
            render: (_: any, row: any) => (
              <div className="flex justify-end pr-2 gap-2">
                <button
                  onClick={() => onPrint(row)}
                  className="p-2 hover:bg-bleu-50 text-bleu-600 rounded-xl transition-colors"
                  title="Imprimer le reçu"
                >
                  <Printer size={16} />
                </button>
                <button
                  onClick={() => onDelete(row.id)}
                  className="p-2 hover:bg-rouge-50 text-rouge-500 rounded-xl transition-colors"
                  title="Supprimer ce paiement"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ] as any}
      />
    </Card>
  );
};

export default PaymentsList;
