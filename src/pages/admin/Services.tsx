import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Scissors,
  CakeSlice,
  Zap,
  Sprout,
  GraduationCap,
  Bus as BusIcon,
  Ticket,
  Briefcase,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import ServicePayments from '../../components/shared/ServicePayments';

const SERVICE_TABS = [
  { id: 'ATELIER_ROBOTIQUE', label: 'Robotique', icon: Bot, color: 'bleu' as const },
  { id: 'ATELIER_COUTURE', label: 'Couture', icon: Scissors, color: 'or' as const },
  { id: 'ATELIER_PATISSERIE', label: 'Pâtisserie', icon: CakeSlice, color: 'vert' as const },
  { id: 'ATELIER_ELECTRICITE', label: 'Electricité', icon: Zap, color: 'rouge' as const },
  { id: 'ATELIER_AGRICULTURE', label: 'Agriculture', icon: Sprout, color: 'vert' as const },
  { id: 'SORTIE_SCOLAIRE', label: 'Sortie Scolaire', icon: BusIcon, color: 'bleu' as const },
  { id: 'INSCRIPTION', label: 'Inscription', icon: GraduationCap, color: 'or' as const },
  { id: 'AUTRE', label: 'Autres', icon: Briefcase, color: 'bleu' as const },
];

const AdminServices: React.FC = () => {
  const [activeService, setActiveService] = useState(SERVICE_TABS[0].id);
  const current = SERVICE_TABS.find(t => t.id === activeService) || SERVICE_TABS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Ateliers & Services</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestion financière des ateliers, sorties scolaires et autres services
        </p>
      </div>

      {/* Service Selector */}
      <div className="flex flex-wrap gap-2">
        {SERVICE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveService(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
              activeService === tab.id
                ? 'bg-bleu-600 text-white shadow-lg shadow-bleu-600/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-bleu-300 hover:text-bleu-600'
            )}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Service Content */}
      <ServicePayments
        key={current.id}
        module={current.id}
        moduleLabel={current.label}
        color={current.color}
      />
    </motion.div>
  );
};

export default AdminServices;
