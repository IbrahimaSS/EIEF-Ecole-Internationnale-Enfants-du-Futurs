import React, { useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Button, Card, Table } from '../../../components/ui';
import { moduleOptions } from '../constants';
import { ExpenseResponse } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface Props {
  expenses: ExpenseResponse[];
  loading: boolean;
  onDelete: (expenseId: string) => void;
}

const ExpensesSection: React.FC<Props> = ({ expenses, loading, onDelete }) => {
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('Tous');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const normalizedQuery = query.trim().toLowerCase();
      const matchQuery =
        !normalizedQuery ||
        expense.description.toLowerCase().includes(normalizedQuery) ||
        (expense.categoryName || '').toLowerCase().includes(normalizedQuery) ||
        (expense.createdByName || '').toLowerCase().includes(normalizedQuery);

      const matchModule =
        module === 'Tous' ||
        (expense.categoryModule || '').toUpperCase() === module.toUpperCase();

      return matchQuery && matchModule;
    });
  }, [expenses, module, query]);

  const columns = [
    {
      key: 'description',
      label: 'Description',
      render: (value: string, row: ExpenseResponse) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            {row.createdByName || 'Utilisateur non renseigné'}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Catégorie',
      render: (value: string | null, row: ExpenseResponse) => (
        <span className="rounded-xl bg-rouge-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rouge-700 dark:bg-rouge-900/20 dark:text-rouge-300">
          {value || row.categoryModule || 'Non catégorisé'}
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
      key: 'expenseDate',
      label: 'Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: 'id',
      label: '',
      render: (_: string, row: ExpenseResponse) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => onDelete(row.id)}
            className="h-9 px-3 text-[10px]"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Journal des dépenses</h3>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Classement des sorties par description, catégorie et module métier.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une dépense..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-rouge-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <select
            value={module}
            onChange={(event) => setModule(event.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-rouge-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
          Chargement des dépenses...
        </div>
      ) : (
        <Table data={filteredExpenses} columns={columns as any} />
      )}
    </Card>
  );
};

export default ExpensesSection;
