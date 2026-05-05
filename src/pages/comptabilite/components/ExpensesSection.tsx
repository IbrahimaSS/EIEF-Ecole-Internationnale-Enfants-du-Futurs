import React, { useMemo, useState } from 'react';
import { AlertTriangle, Eye, Filter, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Table } from '../../../components/ui';
import { moduleOptions } from '../constants';
import { ExpenseResponse } from '../types';
import {
  formatCurrency,
  formatDate,
  isWithinDateRange,
  matchesModule,
} from '../utils';

interface Props {
  expenses: ExpenseResponse[];
  loading: boolean;
  onDelete: (expenseId: string) => Promise<void> | void;
  onOpenReceipt?: (expense: ExpenseResponse) => void;
}

const ExpensesSection: React.FC<Props> = ({ expenses, loading, onDelete, onOpenReceipt }) => {
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('Tous');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        expense.description.toLowerCase().includes(q) ||
        (expense.categoryName || '').toLowerCase().includes(q) ||
        (expense.createdByName || '').toLowerCase().includes(q);

      // Match module : on essaie d'abord categoryModule, puis categoryName
      const matchModuleFilter =
        matchesModule(expense.categoryModule, module) ||
        matchesModule(expense.categoryName, module);

      const matchDate =
        !dateFrom && !dateTo
          ? true
          : isWithinDateRange(expense.expenseDate, dateFrom, dateTo);

      return matchQuery && matchModuleFilter && matchDate;
    });
  }, [expenses, query, module, dateFrom, dateTo]);

  const recap = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const max = filteredExpenses.reduce(
      (m, e) => Math.max(m, Number(e.amount)),
      0,
    );
    const avg =
      filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;
    return {
      total,
      count: filteredExpenses.length,
      max,
      avg,
    };
  }, [filteredExpenses]);

  const hasActiveFilters =
    !!query || module !== 'Tous' || !!dateFrom || !!dateTo;

  const resetFilters = () => {
    setQuery('');
    setModule('Tous');
    setDateFrom('');
    setDateTo('');
  };

  const askDeleteConfirmation = (id: string, description: string) => {
    setPendingDeleteId(id);
    toast.warning('Supprimer cette dépense ?', {
      description: description.slice(0, 60) + (description.length > 60 ? '…' : ''),
      duration: 8000,
      action: {
        label: 'Confirmer',
        onClick: async () => {
          try {
            await onDelete(id);
            toast.success('Dépense supprimée');
          } catch (err: any) {
            toast.error('Échec de la suppression', {
              description: err?.message || 'Impossible de supprimer cette dépense.',
            });
          } finally {
            setPendingDeleteId(null);
          }
        },
      },
      cancel: {
        label: 'Annuler',
        onClick: () => setPendingDeleteId(null),
      },
      onDismiss: () => setPendingDeleteId(null),
      onAutoClose: () => setPendingDeleteId(null),
    });
  };

  const columns = [
    {
      key: 'description',
      label: 'Description',
      render: (value: string, row: ExpenseResponse) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {row.createdByName || 'Utilisateur non renseigné'}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Catégorie',
      render: (value: string | null, row: ExpenseResponse) => (
        <div className="flex flex-col gap-1">
          <span className="rounded-xl bg-or-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-or-700 dark:bg-or-900/20 dark:text-or-300 inline-block w-fit">
            {value || 'Non catégorisé'}
          </span>
          {row.categoryModule && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              {row.categoryModule}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Montant',
      sortable: true,
      render: (value: number) => (
        <span className="font-black text-rouge-600">{formatCurrency(value)}</span>
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
        <div className="flex items-center justify-end gap-2">
          {onOpenReceipt && (
            <Button
              variant="outline"
              onClick={() => onOpenReceipt(row)}
              className="h-9 px-3 text-[10px]"
              title="Voir / imprimer le bon de sortie"
            >
              <Eye size={14} />
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => askDeleteConfirmation(row.id, row.description)}
            disabled={pendingDeleteId === row.id}
            className="h-9 px-3 text-[10px] hover:bg-rouge-50 hover:border-rouge-300 hover:text-rouge-600"
            title="Supprimer cette dépense"
          >
            <Trash2 size={14} />
          </Button>
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
          <p className="mt-1 text-base font-black text-rouge-600">
            {formatCurrency(recap.total)}
          </p>
          <p className="text-[10px] font-bold text-gray-400">
            {recap.count} dépense{recap.count > 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-2xl border border-or-100 bg-or-50/40 p-4 dark:border-or-900/30 dark:bg-or-900/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-or-700 dark:text-or-400">
            Dépense moyenne
          </p>
          <p className="mt-1 text-base font-black text-or-700 dark:text-or-300">
            {formatCurrency(recap.avg)}
          </p>
          <p className="text-[10px] font-bold text-or-600/70">Sur la sélection</p>
        </div>
        <div className="rounded-2xl border border-rouge-100 bg-rouge-50/40 p-4 dark:border-rouge-900/30 dark:bg-rouge-900/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-rouge-700 dark:text-rouge-400">
            Plus grande
          </p>
          <p className="mt-1 text-base font-black text-rouge-700 dark:text-rouge-300">
            {formatCurrency(recap.max)}
          </p>
          <p className="text-[10px] font-bold text-rouge-600/70">Pic de dépense</p>
        </div>
        <div className="rounded-2xl border border-vert-100 bg-vert-50/40 p-4 dark:border-vert-900/30 dark:bg-vert-900/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-vert-700 dark:text-vert-400">
            Période
          </p>
          <p className="mt-1 text-xs font-black text-vert-700 dark:text-vert-300">
            {dateFrom || dateTo
              ? `${formatDate(dateFrom)} → ${formatDate(dateTo)}`
              : 'Toute la période'}
          </p>
          <p className="text-[10px] font-bold text-vert-600/70">Filtre actif</p>
        </div>
      </div>

      <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
        <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Journal des dépenses
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Sorties d'argent classées par description, catégorie et module métier.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-rouge-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rouge-700 transition-colors hover:bg-rouge-100 dark:bg-rouge-900/20 dark:text-rouge-300 dark:hover:bg-rouge-900/30"
            >
              <X size={12} /> Réinitialiser
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
              <Search size={10} className="mr-1 inline" /> Recherche
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Description, catégorie, utilisateur..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none transition-all focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-or-400"
              />
            </div>
          </div>
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
                Du
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-2 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                className="w-full rounded-2xl border border-gray-200 bg-white px-2 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-400">
            Chargement des dépenses...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
            <AlertTriangle size={36} className="opacity-30" />
            <p className="text-sm font-semibold">
              {hasActiveFilters
                ? 'Aucune dépense ne correspond à vos filtres.'
                : 'Aucune dépense enregistrée pour le moment.'}
            </p>
          </div>
        ) : (
          <Table data={filteredExpenses} columns={columns as any} />
        )}
      </Card>
    </div>
  );
};

export default ExpensesSection;
