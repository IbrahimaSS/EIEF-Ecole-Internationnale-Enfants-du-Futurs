import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Printer,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Badge, Button, Card } from '../../../components/ui';
import { schoolIdentity } from '../schoolIdentity';
import {
  ExpenseResponse,
  PaymentMethod,
  PaymentResponse,
  PaymentStatus,
} from '../types';
import {
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '../utils';

interface Props {
  payments: PaymentResponse[];
  expenses: ExpenseResponse[];
  loading: boolean;
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const MonthlyReport: React.FC<Props> = ({ payments, expenses, loading }) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Génère les options d'années (de l'année courante - 3 à courante + 1)
  const yearOptions = useMemo(() => {
    const current = today.getFullYear();
    return [current - 3, current - 2, current - 1, current, current + 1];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInMonth = (dateStr: string | null | undefined) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === month && d.getFullYear() === year;
  };

  // Filtrage des opérations sur le mois sélectionné
  const monthPayments = useMemo(
    () => payments.filter((p) => isInMonth(p.paidAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payments, month, year],
  );
  const monthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.expenseDate)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expenses, month, year],
  );

  // KPIs du mois
  const stats = useMemo(() => {
    const paid = monthPayments.filter((p) => p.status === 'PAID');
    const totalRevenue = paid.reduce((s, p) => s + Number(p.amount), 0);
    const totalExpenses = monthExpenses.reduce(
      (s, e) => s + Number(e.amount),
      0,
    );
    const balance = totalRevenue - totalExpenses;

    // Breakdown par service (categoryName)
    const revenueByService = new Map<string, number>();
    paid.forEach((p) => {
      const key = p.categoryName || 'Non renseigné';
      revenueByService.set(key, (revenueByService.get(key) || 0) + Number(p.amount));
    });

    // Breakdown par catégorie (categoryName) ET par module pour les dépenses
    const expensesByCategory = new Map<string, number>();
    const expensesByModule = new Map<string, number>();
    monthExpenses.forEach((e) => {
      const cat = e.categoryName || 'Non catégorisé';
      const mod = e.categoryModule || 'Autres';
      expensesByCategory.set(cat, (expensesByCategory.get(cat) || 0) + Number(e.amount));
      expensesByModule.set(mod, (expensesByModule.get(mod) || 0) + Number(e.amount));
    });

    // Breakdown par mode de paiement
    const revenueByMethod = new Map<PaymentMethod, number>();
    paid.forEach((p) => {
      revenueByMethod.set(
        p.method,
        (revenueByMethod.get(p.method) || 0) + Number(p.amount),
      );
    });

    return {
      totalRevenue,
      totalExpenses,
      balance,
      paidCount: paid.length,
      pendingCount: monthPayments.length - paid.length,
      expenseCount: monthExpenses.length,
      revenueByService: Array.from(revenueByService.entries()).sort(
        (a, b) => b[1] - a[1],
      ),
      expensesByCategory: Array.from(expensesByCategory.entries()).sort(
        (a, b) => b[1] - a[1],
      ),
      expensesByModule: Array.from(expensesByModule.entries()).sort(
        (a, b) => b[1] - a[1],
      ),
      revenueByMethod: Array.from(revenueByMethod.entries()),
    };
  }, [monthPayments, monthExpenses]);

  const balancePositive = stats.balance >= 0;

  return (
    <div className="space-y-4">
      {/* Sélecteur mois/année (caché à l'impression) */}
      <Card className="no-print border-none shadow-soft p-5 dark:bg-gray-900/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-bleu-50 p-3 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Période d'analyse
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Sélectionnez le mois et l'année à inclure dans le rapport.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gradient-to-r from-bleu-600 to-bleu-700 text-white hover:from-bleu-500 hover:to-bleu-600 shadow-lg"
            >
              <Printer size={16} /> Imprimer le rapport
            </Button>
          </div>
        </div>
      </Card>

      {/* Zone imprimable */}
      <div
        className="print-area print-area-a4 print-bg-white bg-white rounded-3xl shadow-soft border border-gray-100 dark:border-white/10 dark:bg-gray-900/60"
        style={{ fontFamily: 'Inter, Plus Jakarta Sans, sans-serif' }}
      >
        <div className="p-6 md:p-10">
          {/* Entête imprimable */}
          <div className="flex items-start gap-4 pb-5 border-b-2 border-dashed border-vert-300">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-white border-2 border-or-400 p-1 shadow-sm">
              <img
                src={schoolIdentity.logoUrl}
                alt="EIEF"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-vert-700 dark:text-vert-400">
                {schoolIdentity.shortName} · Espace comptable
              </p>
              <h2 className="mt-1 text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {schoolIdentity.fullName.toUpperCase()}
              </h2>
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 italic">
                {schoolIdentity.cycles}
              </p>
              <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mt-1">
                {schoolIdentity.address} · Tél : {schoolIdentity.phones}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-bleu-600">
                Rapport
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                {monthNames[month]}
              </p>
              <p className="text-sm font-black text-bleu-700 dark:text-bleu-300">{year}</p>
            </div>
          </div>

          {/* KPIs grand format */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-6">
            <div className="rounded-3xl border-2 border-vert-200 bg-vert-50/50 p-5 dark:border-vert-900/30 dark:bg-vert-900/10">
              <div className="flex items-center gap-2 text-vert-700 dark:text-vert-300">
                <ArrowUpRight size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Recettes encaissées
                </span>
              </div>
              <p className="mt-3 text-2xl md:text-3xl font-black text-vert-900 dark:text-vert-200">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="mt-1 text-xs font-bold text-vert-700/70 dark:text-vert-400/70">
                {stats.paidCount} encaissement{stats.paidCount > 1 ? 's' : ''} ·{' '}
                {stats.pendingCount} en attente
              </p>
            </div>
            <div className="rounded-3xl border-2 border-or-200 bg-or-50/50 p-5 dark:border-or-900/30 dark:bg-or-900/10">
              <div className="flex items-center gap-2 text-or-700 dark:text-or-300">
                <ArrowDownRight size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Dépenses engagées
                </span>
              </div>
              <p className="mt-3 text-2xl md:text-3xl font-black text-or-900 dark:text-or-200">
                {formatCurrency(stats.totalExpenses)}
              </p>
              <p className="mt-1 text-xs font-bold text-or-700/70 dark:text-or-400/70">
                {stats.expenseCount} opération{stats.expenseCount > 1 ? 's' : ''}
              </p>
            </div>
            <div
              className={`rounded-3xl border-2 p-5 ${
                balancePositive
                  ? 'border-bleu-200 bg-bleu-50/50 dark:border-bleu-900/30 dark:bg-bleu-900/10'
                  : 'border-rouge-200 bg-rouge-50/50 dark:border-rouge-900/30 dark:bg-rouge-900/10'
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  balancePositive
                    ? 'text-bleu-700 dark:text-bleu-300'
                    : 'text-rouge-700 dark:text-rouge-300'
                }`}
              >
                {balancePositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Solde net
                </span>
              </div>
              <p
                className={`mt-3 text-2xl md:text-3xl font-black ${
                  balancePositive
                    ? 'text-bleu-900 dark:text-bleu-200'
                    : 'text-rouge-900 dark:text-rouge-200'
                }`}
              >
                {formatCurrency(stats.balance)}
              </p>
              <p
                className={`mt-1 text-xs font-bold ${
                  balancePositive
                    ? 'text-bleu-700/70 dark:text-bleu-400/70'
                    : 'text-rouge-700/70 dark:text-rouge-400/70'
                }`}
              >
                {balancePositive ? 'Excédent du mois' : 'Déficit du mois'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm font-bold text-gray-400">
              Chargement des données...
            </div>
          ) : monthPayments.length === 0 && monthExpenses.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Wallet size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">
                Aucune opération enregistrée pour {monthNames[month]} {year}.
              </p>
            </div>
          ) : (
            <>
              {/* Breakdown encaissements par service */}
              {stats.revenueByService.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ArrowUpRight size={18} className="text-vert-600" />
                    Encaissements par service
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-vert-200 dark:border-vert-900/30">
                    <table className="w-full">
                      <thead className="bg-vert-50 dark:bg-vert-900/20">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-vert-700 dark:text-vert-300">
                            Service
                          </th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-widest text-vert-700 dark:text-vert-300">
                            Montant
                          </th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-widest text-vert-700 dark:text-vert-300">
                            Part
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.revenueByService.map(([service, amount]) => (
                          <tr
                            key={service}
                            className="border-t border-vert-100 dark:border-vert-900/20"
                          >
                            <td className="px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200">
                              {service}
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm font-black text-vert-700 dark:text-vert-300">
                              {formatCurrency(amount)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">
                              {stats.totalRevenue > 0
                                ? `${Math.round((amount / stats.totalRevenue) * 100)}%`
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Breakdown dépenses par module + catégorie */}
              {stats.expensesByModule.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ArrowDownRight size={18} className="text-or-600" />
                    Dépenses par module
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-or-200 dark:border-or-900/30">
                    <table className="w-full">
                      <thead className="bg-or-50 dark:bg-or-900/20">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-or-700 dark:text-or-300">
                            Module
                          </th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-widest text-or-700 dark:text-or-300">
                            Montant
                          </th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-widest text-or-700 dark:text-or-300">
                            Part
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.expensesByModule.map(([mod, amount]) => (
                          <tr
                            key={mod}
                            className="border-t border-or-100 dark:border-or-900/20"
                          >
                            <td className="px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200">
                              {mod}
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm font-black text-or-700 dark:text-or-300">
                              {formatCurrency(amount)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">
                              {stats.totalExpenses > 0
                                ? `${Math.round((amount / stats.totalExpenses) * 100)}%`
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Liste détaillée encaissements */}
              {monthPayments.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-3">
                    Détail des encaissements
                  </h3>
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-white/5">
                        <tr>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Date
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Élève
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Service
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Référence
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Mode
                          </th>
                          <th className="px-3 py-2 text-right font-black uppercase tracking-widest text-gray-500">
                            Montant
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthPayments.map((p) => (
                          <tr
                            key={p.id}
                            className="border-t border-gray-100 dark:border-white/5"
                          >
                            <td className="px-3 py-2 font-bold text-gray-700 dark:text-gray-300">
                              {formatDate(p.paidAt)}
                            </td>
                            <td className="px-3 py-2 font-bold text-gray-900 dark:text-white">
                              {p.studentName}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {p.categoryName || '—'}
                            </td>
                            <td className="px-3 py-2 font-mono text-gray-500">
                              {p.reference}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {getPaymentMethodLabel(p.method)}
                            </td>
                            <td className="px-3 py-2 text-right font-black text-gray-900 dark:text-white">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="px-3 py-2">
                              <Badge
                                variant={
                                  (p.status === 'PAID'
                                    ? 'success'
                                    : p.status === 'OVERDUE'
                                    ? 'error'
                                    : p.status === 'PARTIAL'
                                    ? 'warning'
                                    : 'default') as any
                                }
                                className="text-[9px] px-2 font-black uppercase"
                              >
                                {getPaymentStatusLabel(p.status as PaymentStatus)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Liste détaillée dépenses */}
              {monthExpenses.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-3">
                    Détail des dépenses
                  </h3>
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-white/5">
                        <tr>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Date
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Description
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Catégorie
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Module
                          </th>
                          <th className="px-3 py-2 text-left font-black uppercase tracking-widest text-gray-500">
                            Engagé par
                          </th>
                          <th className="px-3 py-2 text-right font-black uppercase tracking-widest text-gray-500">
                            Montant
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthExpenses.map((e) => (
                          <tr
                            key={e.id}
                            className="border-t border-gray-100 dark:border-white/5"
                          >
                            <td className="px-3 py-2 font-bold text-gray-700 dark:text-gray-300">
                              {formatDate(e.expenseDate)}
                            </td>
                            <td className="px-3 py-2 font-bold text-gray-900 dark:text-white">
                              {e.description}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {e.categoryName || '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {e.categoryModule || '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {e.createdByName || '—'}
                            </td>
                            <td className="px-3 py-2 text-right font-black text-rouge-700 dark:text-rouge-300">
                              {formatCurrency(e.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Note bas de page + signatures */}
          <div className="mt-10 grid grid-cols-2 gap-8 pt-6 border-t-2 border-dashed border-vert-300">
            <div className="text-center">
              <div className="h-12 border-b-2 border-gray-700 mb-1" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                Le Comptable
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 border-b-2 border-gray-700 mb-1" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                {schoolIdentity.signatureLabel}
              </p>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-or-600 italic">
              {schoolIdentity.motto}
            </p>
            <p className="mt-1 text-[10px] text-gray-400">
              <AlertTriangle size={10} className="inline mr-1" />
              Document généré automatiquement le {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
