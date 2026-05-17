// src/pages/manager/scolarite/components/modals/ClassDetailModal.tsx
import React from 'react';
import { CalendarDays, Loader2, Plus, Printer, X } from 'lucide-react';
import { Button, Modal } from '../../../../../components/ui';
import { DAYS } from '../../constants';
import { ClassResponse, ScheduleResponse } from '../../types';

interface Props {
  isOpen: boolean;
  selectedClass: ClassResponse | null;
  classSchedules: ScheduleResponse[];
  loading: boolean;
  onClose: () => void;
  onAddSchedule: () => void;
  onDeleteSlot: (id: string, label: string) => void;
  onPrint: () => void;
}

const ClassDetailModal: React.FC<Props> = ({
  isOpen,
  selectedClass,
  classSchedules,
  loading,
  onClose,
  onAddSchedule,
  onDeleteSlot,
  onPrint,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      <div className="flex items-center gap-3">
        <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600">
          <CalendarDays size={22} />
        </div>
        <div>
          <span className="font-bold gradient-bleu-or-text">Emploi du temps</span>
          <p className="text-[10px] text-gray-500 font-normal">{selectedClass?.name}</p>
        </div>
      </div>
    }
    size="xl"
  >
    <div className="space-y-6 text-left py-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1 h-3 bg-bleu-500 rounded-full" />
          {classSchedules.length} créneau{classSchedules.length !== 1 ? 'x' : ''} programmé{classSchedules.length !== 1 ? 's' : ''}
        </p>
        <Button
          size="sm"
          onClick={onAddSchedule}
          className="flex items-center gap-2 text-[10px] h-8 px-3 bg-bleu-600 border-none text-white"
        >
          <Plus size={13} /> Ajouter un créneau
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" /> Chargement...
        </div>
      ) : classSchedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
          <CalendarDays size={36} className="opacity-20" />
          <span className="text-sm">Aucun créneau pour cette classe.</span>
          <Button onClick={onAddSchedule} className="mt-2 text-[10px]">
            <Plus size={14} className="mr-1" /> Créer le premier créneau
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {DAYS.map((day, dIdx) => {
            const daySlots = classSchedules.filter(s => s.dayOfWeek === dIdx + 1);
            return (
              <div key={day} className="space-y-2">
                <div className="text-center py-1.5 bg-bleu-600 dark:bg-bleu-900/40 rounded-lg">
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                    {day}
                  </span>
                </div>
                <div className="space-y-2 min-h-[80px]">
                  {daySlots.length === 0 ? (
                    <div className="p-2 text-center text-[9px] text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg">
                      —
                    </div>
                  ) : (
                    daySlots.map(s => (
                      <div
                        key={s.id}
                        className="p-2 bg-white dark:bg-gray-800/50 rounded-lg border-l-2 border-bleu-500 shadow-sm text-left relative group"
                      >
                        <p className="text-[9px] font-bold text-bleu-600 mb-0.5">
                          {s.startTime}–{s.endTime}
                        </p>
                        <p className="text-[10px] font-bold text-gray-900 dark:text-white">
                          {s.subjectName}
                        </p>
                        {s.room && <p className="text-[9px] text-gray-400">{s.room}</p>}
                        <button
                          onClick={() => onDeleteSlot(s.id, `${day} ${s.startTime}`)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-red-400 hover:text-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <Button
          variant="outline"
          onClick={onPrint}
          disabled={classSchedules.length === 0}
          className="flex-1 h-11 flex items-center justify-center gap-2"
        >
          <Printer size={15} /> Imprimer l'emploi du temps
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1 h-11">
          Fermer
        </Button>
      </div>
    </div>
  </Modal>
);

export default ClassDetailModal;
