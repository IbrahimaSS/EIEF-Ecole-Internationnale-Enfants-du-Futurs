// src/pages/comptabilite/components/FamilyBillingPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche famille — VUE LECTURE SEULE.
//
// Les services souscrits (cantine, transport, tenues, activités...) sont
// choisis une seule fois lors de l'inscription, à travers la "Fiche de
// renseignements". Le comptable se contente ici de constater le total dû,
// le total déjà versé et le RESTE À PAYER, puis enregistre les versements
// via la modale "Nouveau Paiement" du header.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import {
  Bus,
  CheckCircle2,
  Coins,
  GraduationCap,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { Badge, Card } from '../../../components/ui';
import { formatCurrency } from '../utils';
import { estClasseExamen } from '../tarifs';
import {
  FamilyBillingInput,
  FamilyBillingResult,
  computeFamilyBalance,
} from '../computeFamilyBalance';

export interface FamilyBillingPanelProps {
  /** Données initiales issues de la fiche de renseignements (inscription). */
  initialInput: FamilyBillingInput;
  /** Toujours présent : non utilisé en lecture seule mais conservé pour
   *  rétro-compat des appelants — le panneau ignore ce prop. */
  submitting?: boolean;
}

const FamilyBillingPanel: React.FC<FamilyBillingPanelProps> = ({ initialInput }) => {
  const balance: FamilyBillingResult = useMemo(
    () => computeFamilyBalance(initialInput),
    [initialInput],
  );

  const remaining = balance.totalRemaining;
  const isFullyPaid = remaining <= 0;
  const remainingClass = isFullyPaid
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-rouge-600 dark:text-rouge-400';

  return (
    <div className="space-y-6">
      {/* ── En-tête famille + 3 KPI ──────────────────────────────────────── */}
      <Card className="border-none bg-gradient-to-br from-bleu-50 to-vert-50 p-6 shadow-soft dark:from-bleu-900/20 dark:to-vert-900/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-3 text-bleu-600 shadow-sm dark:bg-white/10 dark:text-bleu-300">
              <UserCheck size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-bleu-700/70 dark:text-bleu-200/70">
                Famille
              </p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {balance.familyName || `Famille ${balance.familyId.slice(0, 8)}`}
              </h3>
              <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                {balance.childrenCount} enfant{balance.childrenCount > 1 ? 's' : ''} inscrit
                {balance.childrenCount > 1 ? 's' : ''}
                {balance.inscriptionWaived && (
                  <Badge variant="success" className="ml-2 text-[10px] font-bold uppercase tracking-widest">
                    Inscription gratuite (≥ 3 enfants)
                  </Badge>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryStat
              icon={<Coins size={16} />}
              label="Total annuel dû"
              value={formatCurrency(balance.totalExpectedAnnual)}
              tone="neutral"
            />
            <SummaryStat
              icon={<CheckCircle2 size={16} />}
              label="Déjà payé"
              value={formatCurrency(balance.totalPaid)}
              tone="success"
            />
            <SummaryStat
              icon={<Wallet size={16} />}
              label="Reste à payer"
              value={formatCurrency(Math.max(0, remaining))}
              tone={isFullyPaid ? 'success' : 'danger'}
              highlight
            />
          </div>
        </div>

        {balance.totalMonthlyRecurring > 0 && (
          <p className="mt-4 text-xs font-semibold text-bleu-800/80 dark:text-bleu-100/80">
            <Sparkles size={14} className="mr-1 inline-block" />
            En plus du total annuel, frais mensuels souscrits :{' '}
            <strong>{formatCurrency(balance.totalMonthlyRecurring)} / mois</strong>
            {' '}(cantine, transport, activités…) — facturés au mois selon la consommation.
          </p>
        )}
      </Card>

      {/* ── Rappel : options non éditables ───────────────────────────────── */}
      <div className="rounded-2xl border border-dashed border-bleu-200 bg-bleu-50/40 px-4 py-3 dark:border-bleu-800/40 dark:bg-bleu-900/10">
        <p className="flex items-start gap-2 text-xs font-semibold text-bleu-900 dark:text-bleu-200">
          <ScrollText size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            Les options ci-dessous (cantine, transport, tenues, activités) ont
            été choisies par la famille lors de l'inscription via la fiche de
            renseignements. Le comptable se contente de constater et d'enregistrer
            les paiements via le bouton « Nouveau Paiement ».
          </span>
        </p>
      </div>

      {/* ── Détail par élève ─────────────────────────────────────────────── */}
      {balance.students.map((student) => (
        <Card
          key={student.studentId}
          className="border-none shadow-soft p-6 dark:bg-gray-900/60"
        >
          {/* En-tête élève */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-or-50 p-3 text-or-700 dark:bg-or-900/20 dark:text-or-200">
                <GraduationCap size={18} />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900 dark:text-white">
                  {student.studentName}
                </h4>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {student.cycleLabel}
                  {estClasseExamen(student.cycle) && (
                    <Badge variant="warning" className="ml-2 text-[9px] font-bold uppercase tracking-widest">
                      Classe d'examen
                    </Badge>
                  )}
                  {' · '}
                  {student.typeInscription === 'INSCRIPTION'
                    ? 'Nouvelle inscription'
                    : 'Réinscription'}
                  {student.inscriptionWaived && ' · inscription exemptée'}
                </p>
              </div>
            </div>
          </div>

          {/* Frais annuels obligatoires */}
          <section className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Frais annuels
            </p>
            <ul className="mt-2 space-y-1.5">
              {student.annualLines.length === 0 && (
                <li className="text-xs italic text-gray-400">
                  Aucun frais annuel calculable — vérifiez le cycle de la classe.
                </li>
              )}
              {student.annualLines.map((line) => (
                <li
                  key={line.key}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={13} className="text-bleu-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {line.label}
                    </span>
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {formatCurrency(line.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-right text-sm font-black text-gray-900 dark:text-white">
              Sous-total annuel : {formatCurrency(student.annualSubtotal)}
            </p>
          </section>

          {/* Services mensuels souscrits */}
          <section className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Services mensuels souscrits
            </p>
            {student.monthlyLines.length === 0 ? (
              <p className="mt-2 text-xs italic text-gray-400">
                Aucun service mensuel souscrit pour cet élève (selon la fiche
                d'inscription).
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {student.monthlyLines.map((line) => (
                  <li
                    key={line.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-bleu-100 bg-bleu-50/40 px-3 py-2 dark:border-bleu-900/40 dark:bg-bleu-900/10"
                  >
                    <div className="flex items-center gap-2">
                      <Bus size={13} className="text-bleu-600" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {line.label}
                      </span>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {formatCurrency(line.amount)} / mois
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Card>
      ))}

      {/* ── Bandeau "Reste à payer" en bas pour rappel ───────────────────── */}
      <Card className="border-none shadow-soft p-5 dark:bg-gray-900/60">
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Solde restant pour la famille
            </p>
            <p className={`mt-1 text-lg font-black ${remainingClass}`}>
              {formatCurrency(Math.max(0, remaining))}
            </p>
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Pour encaisser un versement, cliquez sur « Nouveau Paiement » en haut
            à droite.
          </p>
        </div>
      </Card>
    </div>
  );
};

// ── Sous-composant : KPI ─────────────────────────────────────────────────────

interface SummaryStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'neutral' | 'success' | 'danger';
  highlight?: boolean;
}
const SummaryStat: React.FC<SummaryStatProps> = ({ icon, label, value, tone, highlight }) => {
  const toneClass = tone === 'success'
    ? 'text-emerald-700 dark:text-emerald-300'
    : tone === 'danger'
    ? 'text-rouge-700 dark:text-rouge-300'
    : 'text-gray-700 dark:text-gray-200';
  const bgClass = highlight
    ? 'bg-white shadow-soft dark:bg-white/10 ring-2 ring-bleu-200 dark:ring-bleu-800/50'
    : 'bg-white/70 dark:bg-white/5';

  return (
    <div className={`rounded-2xl px-4 py-3 ${bgClass}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-1 text-base font-black ${toneClass}`}>{value}</p>
    </div>
  );
};

export default FamilyBillingPanel;
