// src/pages/manager/scolarite/components/modals/StudentHistoryModal.tsx
// Modale qui affiche l'historique de présence d'un élève.

import React from 'react';
import { Clock, Loader2, History } from 'lucide-react';
import { Button, Modal } from '../../../../../components/ui';
import { StudentAttendanceResponse, StudentResponse } from '../../types';

interface Props {
  isOpen: boolean;
  student: StudentResponse | null;
  history: StudentAttendanceResponse[];
  loading: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PRESENT: { label: 'Présent',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  ABSENT:  { label: 'Absent',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  LATE:    { label: 'En retard', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  EXCUSED: { label: 'Excusé',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
};

const StudentHistoryModal: React.FC<Props> = ({
  isOpen,
  student,
  history,
  loading,
  onClose,
}) => {
  // Petites stats récap
  const total = history.length;
  const counts = history.reduce<Record<string, number>>((acc, h) => {
    acc[h.status] = (acc[h.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600">
            <History size={22} />
          </div>
          <div>
            <span className="font-bold gradient-bleu-or-text">Historique de présence</span>
            <p className="text-[10px] text-gray-500 font-normal">
              {student ? `${student.firstName} ${student.lastName} • ${student.className}` : ''}
            </p>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4 text-left py-2">
        {/* Stats récap */}
        {!loading && total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <div
                key={key}
                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
              >
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {val.label}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {counts[key] ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" /> Chargement...
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <Clock size={36} className="opacity-20" />
            <span className="text-sm">Aucune présence enregistrée pour cet élève.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Statut</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {history.map(item => {
                  const status = STATUS_LABELS[item.status] ?? {
                    label: item.status,
                    color: 'bg-gray-100 text-gray-700',
                  };
                  return (
                    <tr key={item.id} className="bg-white dark:bg-transparent">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {new Date(item.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 italic">
                        {item.note || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex pt-4 border-t border-gray-100 dark:border-white/5">
          <Button variant="outline" onClick={onClose} className="ml-auto h-11">
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentHistoryModal;
