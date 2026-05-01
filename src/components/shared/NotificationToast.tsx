// src/components/shared/NotificationToast.tsx
// Toast de notification generique reutilisable dans tout le projet.
// Rendu via React Portal dans document.body pour eviter les conflits de
// reconciliation DOM avec framer-motion (erreurs insertBefore / removeChild).

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type NotifKind = 'success' | 'error';

export interface Notif {
  kind: NotifKind;
  message: string;
}

interface Props {
  notif: Notif | null;
  onClose: () => void;
}

const NotificationToast: React.FC<Props> = ({ notif, onClose }) => {
  return createPortal(
    <AnimatePresence>
      {notif && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            'fixed bottom-10 right-10 z-[100] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[300px]',
            notif.kind === 'success'
              ? 'border border-green-100 dark:border-green-900/30'
              : 'border border-red-100 dark:border-red-900/30',
          )}
          onClick={e => e.stopPropagation()}
        >
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              notif.kind === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                : 'bg-red-100 dark:bg-red-900/30 text-red-500',
            )}
          >
            {notif.kind === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {notif.kind === 'success' ? 'Operation reussie' : 'Erreur'}
            </p>
            <p className="text-xs text-gray-500">{notif.message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default NotificationToast;
