import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  FileBarChart,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button, Card } from '../../../components/ui';
import { ComptableSection } from '../types';

interface Props {
  section: ComptableSection;
  onOpenPaymentModal: () => void;
  onOpenExpenseModal: () => void;
}

const copyBySection: Record<
  ComptableSection,
  { title: string; subtitle: string; icon: React.ReactNode; accent: string }
> = {
  dashboard: {
    title: 'Cockpit Comptable',
    subtitle:
      'Pilotez les encaissements, les dépenses et le suivi de scolarité depuis un espace unifié.',
    icon: <TrendingUp size={22} />,
    accent: 'bleu',
  },
  payments: {
    title: 'Encaissements',
    subtitle:
      'Enregistrez les paiements ponctuels (inscription, cantine, transport…), suivez les retards et générez les reçus.',
    icon: <Wallet size={22} />,
    accent: 'vert',
  },
  expenses: {
    title: 'Dépenses',
    subtitle:
      "Consignez les sorties d'argent par catégorie et module métier, avec un suivi opérationnel clair.",
    icon: <AlertTriangle size={22} />,
    accent: 'or',
  },
  tuition: {
    title: 'Scolarité',
    subtitle:
      "Consultez le statut d'un élève et enregistrez les versements par échéance.",
    icon: <BookOpen size={22} />,
    accent: 'rouge',
  },
  report: {
    title: 'Rapport Mensuel',
    subtitle:
      'Synthèse mensuelle des entrées et sorties d\'argent avec breakdown par service. Imprimable pour archive.',
    icon: <FileBarChart size={22} />,
    accent: 'bleu',
  },
};

const accentClasses: Record<
  string,
  { bg: string; text: string; gradient: string }
> = {
  bleu: {
    bg: 'bg-bleu-50 dark:bg-bleu-900/20',
    text: 'text-bleu-700 dark:text-bleu-300',
    gradient: 'from-bleu-50 to-vert-50/40 dark:from-gray-900 dark:to-gray-900/70',
  },
  vert: {
    bg: 'bg-vert-50 dark:bg-vert-900/20',
    text: 'text-vert-700 dark:text-vert-300',
    gradient: 'from-vert-50 to-bleu-50/40 dark:from-gray-900 dark:to-gray-900/70',
  },
  or: {
    bg: 'bg-or-50 dark:bg-or-900/20',
    text: 'text-or-700 dark:text-or-300',
    gradient: 'from-or-50 to-vert-50/40 dark:from-gray-900 dark:to-gray-900/70',
  },
  rouge: {
    bg: 'bg-rouge-50 dark:bg-rouge-900/20',
    text: 'text-rouge-700 dark:text-rouge-300',
    gradient: 'from-rouge-50 to-or-50/40 dark:from-gray-900 dark:to-gray-900/70',
  },
};

const SectionHero: React.FC<Props> = ({
  section,
  onOpenExpenseModal,
  onOpenPaymentModal,
}) => {
  const copy = copyBySection[section];
  const accent = accentClasses[copy.accent] || accentClasses.bleu;

  return (
    <Card
      className={`relative overflow-hidden border-none shadow-soft bg-gradient-to-br ${accent.gradient}`}
    >
      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-or-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-vert-400/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div
            className={`mb-4 inline-flex items-center gap-3 rounded-2xl px-4 py-2.5 ${accent.bg} ${accent.text}`}
          >
            {copy.icon}
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Espace Comptable
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-gray-500 dark:text-gray-400">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {(section === 'dashboard' || section === 'payments') && (
            <Button
              onClick={onOpenPaymentModal}
              className="flex items-center gap-2 bg-gradient-to-r from-vert-600 to-vert-700 text-white hover:from-vert-500 hover:to-vert-600 shadow-lg"
            >
              <Receipt size={16} /> Nouvel encaissement
            </Button>
          )}
          {(section === 'dashboard' || section === 'expenses') && (
            <Button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-2 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 hover:from-or-400 hover:to-or-500 shadow-gold"
            >
              <AlertTriangle size={16} /> Nouvelle dépense
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SectionHero;
