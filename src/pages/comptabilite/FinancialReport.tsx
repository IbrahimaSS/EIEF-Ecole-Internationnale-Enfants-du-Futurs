import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  BarChart3,
  List,
  Scale,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { StatCard, Card } from '../../components/ui';
import {
  accountingService,
  MonthlyReportResponse,
  MonthlyReportModuleResponse,
  MonthlyReportTransactionResponse,
} from '../../services/accountingService';
import { getApiBaseUrl, AUTH_HEADER_NAME, AUTH_HEADER_PREFIX } from '../../services/api';

const COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#6366f1', '#d946ef', '#0ea5e9', '#eab308', '#22c55e', '#e11d48',
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(v) + ' FGN';

const formatPercent = (v: number | null | undefined) => {
  if (v == null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
};

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-');
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
};

const FinancialReport: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<MonthlyReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'transactions'>('dashboard');
  const [txFilter, setTxFilter] = useState<'ALL' | 'REVENUE' | 'EXPENSE'>('ALL');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    setError(null);
    accountingService
      .getMonthlyReport(monthKey)
      .then(setReport)
      .catch(() => setError('Impossible de charger le rapport'))
      .finally(() => setLoading(false));
  }, [monthKey]);

  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleExportExcel = () => {
    const token = (() => {
      try {
        const raw = window.localStorage.getItem('auth-storage');
        if (!raw) return null;
        return JSON.parse(raw)?.state?.token ?? null;
      } catch { return null; }
    })();

    const url = `${getApiBaseUrl()}${accountingService.exportMonthlyReportExcel(monthKey)}`;
    fetch(url, {
      headers: token ? { [AUTH_HEADER_NAME]: `${AUTH_HEADER_PREFIX} ${token}` } : {},
    })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `rapport-mensuel-${monthKey}.xlsx`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  const activeModules = useMemo(
    () => (report?.modules ?? []).filter(m => m.totalRevenue > 0 || m.totalExpense > 0),
    [report],
  );

  const filteredTx = useMemo(() => {
    const all = report?.allTransactions ?? [];
    if (txFilter === 'ALL') return all;
    return all.filter(t => t.type === txFilter);
  }, [report, txFilter]);

  const pieData = useMemo(
    () => activeModules.map(m => ({ name: m.moduleLabel, value: m.totalRevenue })),
    [activeModules],
  );

  const barData = useMemo(
    () =>
      activeModules.map(m => ({
        name: m.moduleLabel.length > 14 ? m.moduleLabel.slice(0, 12) + '…' : m.moduleLabel,
        Revenus: m.totalRevenue,
        Dépenses: m.totalExpense,
      })),
    [activeModules],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-bleu-500" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Rapport Financier
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bilan des entrées et sorties d'argent
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-2 py-1.5 shadow-sm">
            <button onClick={goPrev} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-gray-800 dark:text-white min-w-[140px] text-center">
              {monthLabel(monthKey)}
            </span>
            <button onClick={goNext} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
            <button
              onClick={() => setView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === 'dashboard' ? 'bg-bleu-500 text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
            >
              <BarChart3 size={14} className="inline mr-1" />Dashboard
            </button>
            <button
              onClick={() => setView('transactions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === 'transactions' ? 'bg-bleu-500 text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
            >
              <List size={14} className="inline mr-1" />Transactions
            </button>
          </div>

          {/* Export */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL REVENUS"
          value={formatCurrency(report.totalRevenue)}
          subtitle={`${report.totalRevenueCount} encaissements`}
          icon={<ArrowDownCircle />}
          color="vert"
          trend={report.revenueVariationPercent != null ? {
            value: formatPercent(report.revenueVariationPercent),
            direction: report.revenueVariationPercent >= 0 ? 'up' : 'down',
          } : undefined}
        />
        <StatCard
          title="TOTAL DÉPENSES"
          value={formatCurrency(report.totalExpense)}
          subtitle={`${report.totalExpenseCount} sorties`}
          icon={<ArrowUpCircle />}
          color="rouge"
          trend={report.expenseVariationPercent != null ? {
            value: formatPercent(report.expenseVariationPercent),
            direction: report.expenseVariationPercent >= 0 ? 'up' : 'down',
          } : undefined}
        />
        <StatCard
          title="SOLDE DU MOIS"
          value={formatCurrency(report.globalBalance)}
          subtitle={report.globalBalance >= 0 ? 'Excédent' : 'Déficit'}
          icon={<Scale />}
          color={report.globalBalance >= 0 ? 'bleu' : 'rouge'}
        />
        <StatCard
          title="MOIS PRÉCÉDENT"
          value={formatCurrency(report.previousMonthBalance)}
          subtitle={`Rev: ${formatCurrency(report.previousMonthTotalRevenue)}`}
          icon={<Wallet />}
          color="or"
        />
      </div>

      {view === 'dashboard' ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Revenus vs Dépenses par module */}
            <Card variant="glass">
              <h3 className="text-sm font-black text-gray-800 dark:text-white mb-4">
                Revenus vs Dépenses par catégorie
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="Revenus" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Pie Chart: Répartition des revenus */}
            <Card variant="glass">
              <h3 className="text-sm font-black text-gray-800 dark:text-white mb-4">
                Répartition des revenus
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.filter(d => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine
                    >
                      {pieData.filter(d => d.value > 0).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Module Breakdown Table */}
          <Card variant="glass">
            <h3 className="text-sm font-black text-gray-800 dark:text-white mb-4">
              Bilan par catégorie
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">N°</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Catégorie</th>
                    <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-green-600">Revenus</th>
                    <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-red-600">Dépenses</th>
                    <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Solde</th>
                    <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Var. Rev.</th>
                    <th className="text-right py-3 px-4 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Var. Dép.</th>
                  </tr>
                </thead>
                <tbody>
                  {activeModules.map((mod, idx) => (
                    <React.Fragment key={mod.module}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => setExpandedModule(expandedModule === mod.module ? null : mod.module)}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-bold text-gray-600 dark:text-gray-300">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-gray-800 dark:text-white">{mod.moduleLabel}</td>
                        <td className="py-3 px-4 text-right font-bold text-green-600">{formatCurrency(mod.totalRevenue)}</td>
                        <td className="py-3 px-4 text-right font-bold text-red-500">{formatCurrency(mod.totalExpense)}</td>
                        <td className={`py-3 px-4 text-right font-black ${mod.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(mod.balance)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <VariationBadge value={mod.revenueVariation} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <VariationBadge value={mod.expenseVariation} inverted />
                        </td>
                      </motion.tr>

                      {/* Expanded: show transactions for this module */}
                      {expandedModule === mod.module && mod.transactions.length > 0 && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <div className="bg-gray-50 dark:bg-gray-800/60 px-8 py-3">
                              <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-2">
                                Détail — {mod.moduleLabel}
                              </p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-[10px] text-gray-400 dark:text-gray-500">
                                    <th className="text-left py-1.5 px-2">Date</th>
                                    <th className="text-left py-1.5 px-2">Type</th>
                                    <th className="text-left py-1.5 px-2">Catégorie</th>
                                    <th className="text-left py-1.5 px-2">Description</th>
                                    <th className="text-right py-1.5 px-2">Montant</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {mod.transactions.map(tx => (
                                    <tr key={tx.id} className="border-t border-gray-200/50 dark:border-gray-700/50">
                                      <td className="py-1.5 px-2 text-gray-600 dark:text-gray-300">{tx.date}</td>
                                      <td className="py-1.5 px-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.type === 'REVENUE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                          {tx.type === 'REVENUE' ? <ArrowDownCircle size={10} /> : <ArrowUpCircle size={10} />}
                                          {tx.type === 'REVENUE' ? 'Entrée' : 'Sortie'}
                                        </span>
                                      </td>
                                      <td className="py-1.5 px-2 text-gray-700 dark:text-gray-200">{tx.categoryName}</td>
                                      <td className="py-1.5 px-2 text-gray-500 dark:text-gray-400">{tx.description || '—'}</td>
                                      <td className={`py-1.5 px-2 text-right font-bold ${tx.type === 'REVENUE' ? 'text-green-600' : 'text-red-500'}`}>
                                        {formatCurrency(tx.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/60">
                    <td colSpan={2} className="py-3 px-4 font-black text-gray-900 dark:text-white">TOTAL</td>
                    <td className="py-3 px-4 text-right font-black text-green-600">{formatCurrency(report.totalRevenue)}</td>
                    <td className="py-3 px-4 text-right font-black text-red-500">{formatCurrency(report.totalExpense)}</td>
                    <td className={`py-3 px-4 text-right font-black ${report.globalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(report.globalBalance)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <VariationBadge value={report.revenueVariationPercent} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <VariationBadge value={report.expenseVariationPercent} inverted />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* Transactions View */
        <Card variant="glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-gray-800 dark:text-white">
              Toutes les transactions — {monthLabel(monthKey)}
            </h3>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {(['ALL', 'REVENUE', 'EXPENSE'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${txFilter === f ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
                >
                  {f === 'ALL' ? 'Tout' : f === 'REVENUE' ? 'Entrées' : 'Sorties'}
                </button>
              ))}
            </div>
          </div>

          {filteredTx.length === 0 ? (
            <p className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
              Aucune transaction pour cette période.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-3 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-3 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-3 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Catégorie</th>
                    <th className="text-left py-3 px-3 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Description</th>
                    <th className="text-left py-3 px-3 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Référence</th>
                    <th className="text-right py-3 px-3 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">{tx.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.type === 'REVENUE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {tx.type === 'REVENUE' ? <ArrowDownCircle size={10} /> : <ArrowUpCircle size={10} />}
                          {tx.type === 'REVENUE' ? 'Entrée' : 'Sortie'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-white">{tx.categoryName}</td>
                      <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{tx.description || '—'}</td>
                      <td className="py-2.5 px-3 text-gray-400 dark:text-gray-500 font-mono text-xs">{tx.reference || '—'}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${tx.type === 'REVENUE' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'REVENUE' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

const VariationBadge: React.FC<{ value: number | null | undefined; inverted?: boolean }> = ({ value, inverted }) => {
  if (value == null) return <span className="text-gray-400 text-xs">—</span>;
  const isPositive = value >= 0;
  const isGood = inverted ? !isPositive : isPositive;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isGood ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {formatPercent(value)}
    </span>
  );
};

export default FinancialReport;
