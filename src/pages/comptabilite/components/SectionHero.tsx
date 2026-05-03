import React from 'react';
import { AlertTriangle, BookOpen, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { Button, Card } from '../../../components/ui';
import { ComptableSection } from '../types';

interface Props {
  section: ComptableSection;
  onOpenPaymentModal: () => void;
  onOpenExpenseModal: () => void;
}

const copyBySection: Record<
  ComptableSection,
  { title: string; subtitle: string; icon: React.ReactNode }
> = {
  dashboard: {
    title: 'Cockpit Comptable',
    subtitle: 'Pilotez les encaissements, les dépenses et le suivi de scolarité depuis un espace dédié.',
    icon: <TrendingUp size={24} />,
  },
  payments: {
    title: 'Encaissements',
    subtitle: 'Enregistrez les paiements, suivez les retards et générez les reçus.',
    icon: <Wallet size={24} />,
  },
  expenses: {
    title: 'Dépenses',
    subtitle: 'Consignez les sorties d’argent avec des catégories claires et un suivi opérationnel.',
    icon: <AlertTriangle size={24} />,
  },
  tuition: {
    title: 'Scolarité',
    subtitle: 'Consultez le statut d’un élève et enregistrez les versements par échéance.',
    icon: <BookOpen size={24} />,
  },
};

const SectionHero: React.FC<Props> = ({
  section,
  onOpenExpenseModal,
  onOpenPaymentModal,
}) => {
  const copy = copyBySection[section];

  return (
    <Card className="border-none shadow-soft overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-900/70">
      <div className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-3 rounded-2xl bg-bleu-50 px-4 py-3 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
            {copy.icon}
            <span className="text-xs font-bold uppercase tracking-[0.25em]">
              Espace Comptable
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
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
              className="flex items-center gap-2"
            >
              <Receipt size={16} /> Nouvel encaissement
            </Button>
          )}
          {(section === 'dashboard' || section === 'expenses') && (
            <Button
              variant="outline"
              onClick={onOpenExpenseModal}
              className="flex items-center gap-2"
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
