import React from 'react';
import { Loader2, Trash2, TrendingDown } from 'lucide-react';
import { Table, Card } from '../../../../components/ui';
import { formatCurrency, formatDate } from '../utils';

interface ExpensesListProps {
  data: any[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({
  data,
  loading,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-rouge-600" size={40} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
        <TrendingDown size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm font-bold">Aucune dépense enregistrée.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
      <Table
        data={data}
        columns={[
          {
            key: 'description',
            label: 'Description',
            render: (val: any, row: any) => (
              <div className="text-left">
                <p className="font-bold text-gray-900">{val}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {row.categoryName} • {row.categoryModule}
                </p>
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
            key: 'expenseDate',
            label: 'Date',
            render: (val: any) => (
              <span className="text-xs font-bold text-gray-500">{formatDate(val)}</span>
            ),
          },
          {
            key: 'createdByName',
            label: 'Enregistré par',
            render: (val: any) => (
              <span className="text-xs font-bold text-gray-700">{val}</span>
            ),
          },
          {
            key: 'actions',
            label: '',
            render: (_: any, row: any) => (
              <div className="flex justify-end pr-2 gap-2">
                <button
                  onClick={() => onDelete(row.id)}
                  className="p-2 hover:bg-rouge-50 text-rouge-500 rounded-xl transition-colors"
                  title="Supprimer cette dépense"
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

export default ExpensesList;
