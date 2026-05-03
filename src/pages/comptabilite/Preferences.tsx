import React from 'react';
import { Bell, Lock, Shield } from 'lucide-react';
import { Card } from '../../components/ui';

const blocks = [
  {
    title: 'Notifications',
    description: 'Préparez ici les alertes liées aux impayés, aux dépenses sensibles et aux validations de versements.',
    icon: <Bell size={18} />,
  },
  {
    title: 'Sécurité',
    description: 'Vérifiez les règles de traçabilité comptable, les actions critiques et les accès aux documents financiers.',
    icon: <Shield size={18} />,
  },
  {
    title: 'Confidentialité',
    description: 'Cadrez la consultation des reçus, états de dépenses et historiques d’opérations de manière professionnelle.',
    icon: <Lock size={18} />,
  },
];

const ComptablePreferences: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-soft p-8 dark:bg-gray-900/60">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Préférences comptables
        </h2>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-gray-500 dark:text-gray-400">
          Cet espace est prêt pour accueillir vos futurs réglages métier. La structure est posée
          pour brancher ensuite les préférences utilisateur, les notifications et les paramètres
          d’exploitation financière.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {blocks.map((block) => (
          <Card key={block.title} className="border-none shadow-soft p-6 dark:bg-gray-900/60">
            <div className="inline-flex rounded-2xl bg-bleu-50 p-3 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
              {block.icon}
            </div>
            <h3 className="mt-4 text-lg font-black text-gray-900 dark:text-white">
              {block.title}
            </h3>
            <p className="mt-2 text-sm font-medium leading-7 text-gray-500 dark:text-gray-400">
              {block.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComptablePreferences;
