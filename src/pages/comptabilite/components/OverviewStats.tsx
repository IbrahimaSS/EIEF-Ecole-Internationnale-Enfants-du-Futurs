import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, StatCard } from '../../../components/ui';
import { ExpenseStatsSummaryResponse } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface MonthSeriesItem {
  month: string;
  revenue: number;
  expense: number;
}

interface Props {
  totalRevenue: number;
  expectedRevenue: number;
  overdueRevenue: number;
  collectionRate: number;
  overdueCount: number;
  expenseSummary: ExpenseStatsSummaryResponse | null;
  /** Statistiques mensuelles & solde net (depuis useComptableFinance) */
  monthRevenue: number;
  monthExpenses: number;
  monthBalance: number;
  totalBalance: number;
  series: MonthSeriesItem[];
}

const OverviewStats: React.FC<Props> = ({
  collectionRate,
  expectedRevenue,
  expenseSummary,
  overdueCount,
  overdueRevenue,
  totalRevenue,
  monthRevenue,
  monthExpenses,
  monthBalance,
  totalBalance,
  series,
}) => {
  const balancePositive = totalBalance >= 0;
  const monthBalancePositive = monthBalance >= 0;

  // Format compact pour le tooltip du graphique
  const formatTooltipCurrency = (value: number) =>
    new Intl.NumberFormat('fr-GN', {
      maximumFractionDigits: 0,
    }).format(value) + ' FGN';

  return (
    <div className="space-y-6">
      {/* Bandeau de KPIs principaux */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Recettes encaissées"
          value={formatCurrency(totalRevenue)}
          subtitle="Paiements soldés (hors scolarité)"
          icon={<Receipt />}
          color="vert"
          trend={{ value: `${collectionRate}% recouvré`, direction: 'up' }}
        />
        <StatCard
          title="Dépenses totales"
          value={formatCurrency(Number(expenseSummary?.totalAmount || 0))}
          subtitle={`${expenseSummary?.expenseCount || 0} opération(s)`}
          icon={<AlertTriangle />}
          color="or"
        />
        <StatCard
          title="Impayés en retard"
          value={formatCurrency(overdueRevenue)}
          subtitle={`${overdueCount} dossier${overdueCount > 1 ? 's' : ''} en retard`}
          icon={<AlertCircle />}
          color="rouge"
        />
        <StatCard
          title="Solde net global"
          value={formatCurrency(totalBalance)}
          subtitle={
            balancePositive ? 'Excédent — recettes > dépenses' : 'Déficit — dépenses > recettes'
          }
          icon={balancePositive ? <TrendingUp /> : <TrendingDown />}
          color={balancePositive ? 'bleu' : 'rouge'}
        />
      </div>

      {/* Bandeau "Mois en cours" + mini graphique */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* KPIs du mois en cours (col 1) */}
        <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-vert-700 dark:text-or-400">
                Mois en cours
              </p>
              <h3 className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                Bilan{' '}
                {new Date().toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
            </div>
            <div
              className={`rounded-2xl p-3 ${
                monthBalancePositive
                  ? 'bg-vert-50 text-vert-700 dark:bg-vert-900/20 dark:text-vert-300'
                  : 'bg-rouge-50 text-rouge-700 dark:bg-rouge-900/20 dark:text-rouge-300'
              }`}
            >
              {monthBalancePositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-vert-50 px-4 py-3 dark:bg-vert-900/10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-vert-500/10 p-2 text-vert-600">
                  <Receipt size={16} />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Recettes
                </span>
              </div>
              <span className="text-sm font-black text-vert-700 dark:text-vert-300">
                {formatCurrency(monthRevenue)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-or-50 px-4 py-3 dark:bg-or-900/10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-or-500/10 p-2 text-or-600">
                  <AlertTriangle size={16} />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Dépenses
                </span>
              </div>
              <span className="text-sm font-black text-or-700 dark:text-or-300">
                {formatCurrency(monthExpenses)}
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                monthBalancePositive
                  ? 'bg-bleu-50 dark:bg-bleu-900/10'
                  : 'bg-rouge-50 dark:bg-rouge-900/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl p-2 ${
                    monthBalancePositive
                      ? 'bg-bleu-500/10 text-bleu-600'
                      : 'bg-rouge-500/10 text-rouge-600'
                  }`}
                >
                  <Wallet size={16} />
                </div>
                <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                  Solde net
                </span>
              </div>
              <span
                className={`text-sm font-black ${
                  monthBalancePositive
                    ? 'text-bleu-700 dark:text-bleu-300'
                    : 'text-rouge-700 dark:text-rouge-300'
                }`}
              >
                {formatCurrency(monthBalance)}
              </span>
            </div>
          </div>

          {/* Récap secondaire */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-white/5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Attendu total
              </p>
              <p className="mt-1 text-xs font-black text-gray-900 dark:text-white">
                {formatCurrency(expectedRevenue)}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Dern. dépense
              </p>
              <p className="mt-1 text-xs font-black text-gray-900 dark:text-white">
                {formatDate(expenseSummary?.latestExpenseDate)}
              </p>
            </div>
          </div>
        </Card>

        {/* Mini graphique 6 derniers mois (col 2 + 3) */}
        <Card className="border-none shadow-soft p-6 xl:col-span-2 dark:bg-gray-900/60">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-vert-700 dark:text-or-400">
                6 derniers mois
              </p>
              <h3 className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                Recettes vs dépenses
              </h3>
              <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Suivi mensuel des flux financiers.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-vert-700 dark:text-vert-400">
                <span className="h-2 w-2 rounded-full bg-vert-500" /> Recettes
              </span>
              <span className="flex items-center gap-1.5 text-or-700 dark:text-or-400">
                <span className="h-2 w-2 rounded-full bg-or-500" /> Dépenses
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1_000
                      ? `${(v / 1_000).toFixed(0)}K`
                      : `${v}`
                  }
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  formatter={(value, name) => {
                    const num = typeof value === 'number' ? value : Number(value) || 0;
                    const label = name === 'revenue' ? 'Recettes' : 'Dépenses';
                    return [formatTooltipCurrency(num), label];
                  }}
                  labelStyle={{ fontWeight: 900, color: '#111827' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#2E7D32"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="expense"
                  fill="#E8960C"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewStats;
