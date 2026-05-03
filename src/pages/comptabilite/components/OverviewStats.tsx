import React from 'react';
import { AlertCircle, AlertTriangle, BookOpen, Receipt, TrendingUp } from 'lucide-react';
import { Card, StatCard } from '../../../components/ui';
import { ExpenseStatsSummaryResponse } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface Props {
  totalRevenue: number;
  expectedRevenue: number;
  overdueRevenue: number;
  collectionRate: number;
  overdueCount: number;
  expenseSummary: ExpenseStatsSummaryResponse | null;
}

const OverviewStats: React.FC<Props> = ({
  collectionRate,
  expectedRevenue,
  expenseSummary,
  overdueCount,
  overdueRevenue,
  totalRevenue,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Recettes encaissées"
        value={formatCurrency(totalRevenue)}
        subtitle="Paiements soldés"
        icon={<Receipt />}
        color="bleu"
        trend={{ value: `${collectionRate}% recouvré`, direction: 'up' }}
      />
      <StatCard
        title="Impayés en retard"
        value={formatCurrency(overdueRevenue)}
        subtitle={`${overdueCount} dossier${overdueCount > 1 ? 's' : ''}`}
        icon={<AlertCircle />}
        color="rouge"
      />
      <StatCard
        title="Dépenses totales"
        value={formatCurrency(Number(expenseSummary?.totalAmount || 0))}
        subtitle={`${expenseSummary?.expenseCount || 0} opération(s)`}
        icon={<AlertTriangle />}
        color="or"
        trend={{
          value: `${formatCurrency(Number(expenseSummary?.currentMonthAmount || 0))} ce mois`,
          direction: 'up',
        }}
      />
      <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              Synthèse
            </p>
            <h3 className="mt-3 text-2xl font-black text-gray-900 dark:text-white">
              {collectionRate}%
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Taux de recouvrement global
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Attendu</span>
            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(expectedRevenue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Dernière dépense</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatDate(expenseSummary?.latestExpenseDate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Dépense moyenne</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(Number(expenseSummary?.averageAmount || 0))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Scolarité</span>
            <span className="inline-flex items-center gap-2 font-bold text-bleu-600 dark:text-bleu-300">
              <BookOpen size={14} /> Suivi actif
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewStats;
