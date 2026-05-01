// src/pages/manager/scolarite/tabs/EmploisTab.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  CalendarDays,
  Clock,
  Edit,
  Eye,
  GraduationCap,
  Loader2,
  MoreVertical,
  Plus,
  Printer,
  Trash2,
  Users,
} from 'lucide-react';
import { Badge, Card, Table } from '../../../../components/ui';
import { cn } from '../../../../utils/cn';
import { DAYS } from '../constants';
import { ClassResponse, ScheduleResponse } from '../types';

interface Props {
  loading: boolean;
  filteredClasses: ClassResponse[];
  schedules: ScheduleResponse[];
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onOpenClassDetail: (cls: ClassResponse) => void;
  onAddSchedule: (cls: ClassResponse) => void;
  onPrintClass: (cls: ClassResponse) => void;
  onEditSchedule: (s: ScheduleResponse) => void;
  onRequestDelete: (id: string, label: string) => void;
}

const EmploisTab: React.FC<Props> = ({
  loading,
  filteredClasses,
  schedules,
  openMenuId,
  setOpenMenuId,
  onOpenClassDetail,
  onAddSchedule,
  onPrintClass,
  onEditSchedule,
  onRequestDelete,
}) => {
  const scheduleColumns = [
    {
      key: 'dayOfWeek',
      label: 'Jour',
      sortable: true,
      render: (v: number) => (
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
          {DAYS[v - 1]}
        </span>
      ),
    },
    {
      key: 'startTime',
      label: 'Horaire',
      render: (_: any, row: ScheduleResponse) => (
        <span className="text-sm font-medium text-bleu-600 dark:text-bleu-300">
          {row.startTime} – {row.endTime}
        </span>
      ),
    },
    { key: 'className',   label: 'Classe',     render: (v: string) => <span className="text-sm">{v}</span> },
    { key: 'subjectName', label: 'Matière',    render: (v: string) => <span className="text-sm font-medium">{v}</span> },
    { key: 'teacherName', label: 'Enseignant', render: (v: string) => <span className="text-sm text-gray-500">{v || '—'}</span> },
    { key: 'room',        label: 'Salle',      render: (v: string) => <span className="text-sm text-gray-500">{v || '—'}</span> },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: ScheduleResponse) => {
        const isOpen = openMenuId === row.id;
        return (
          <div className="relative flex justify-end px-2">
            <button
              onClick={e => {
                e.stopPropagation();
                setOpenMenuId(isOpen ? null : row.id);
              }}
              className={cn(
                'p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all text-gray-400 focus:outline-none',
                isOpen && 'bg-gray-100 dark:bg-white/5 text-bleu-600 dark:text-or-400',
              )}
            >
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 10 }}
                  className="absolute right-full mr-2 top-0 w-44 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[1.25rem] shadow-2xl border border-gray-100 dark:border-white/5 p-2 z-[60]"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEditSchedule(row);
                        setOpenMenuId(null);
                      }}
                      className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-or-50 dark:hover:bg-or-900/40 hover:text-or-600 rounded-xl transition-all w-full"
                    >
                      <div className="w-7 h-7 rounded-lg bg-or-50 dark:bg-or-900/20 flex items-center justify-center">
                        <Edit size={13} />
                      </div>
                      Modifier
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        onRequestDelete(row.id, `${DAYS[row.dayOfWeek - 1]} ${row.startTime}`);
                      }}
                      className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all w-full"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <Trash2 size={13} />
                      </div>
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      },
    },
  ];

  return (
    <motion.div
      key="emplois"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Grille des classes */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm font-medium">Chargement...</span>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Building2 size={40} className="opacity-20" />
          <span className="text-sm font-medium">Aucune classe trouvée</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredClasses.map(cls => {
            const count = schedules.filter(s => s.className === cls.name).length;
            return (
              <Card
                key={cls.id}
                className="p-0 border-none shadow-soft overflow-hidden group cursor-pointer hover:scale-[1.03] transition-all duration-300 dark:bg-gray-900/50 dark:backdrop-blur-md"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 p-5 border-b border-gray-100 dark:border-white/5 group-hover:from-bleu-50 dark:group-hover:from-bleu-900/20 group-hover:to-bleu-100 dark:group-hover:to-bleu-900/10 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-bleu-600 dark:text-bleu-400 shadow-sm">
                      <GraduationCap size={20} />
                    </div>
                    <Badge variant="info" className="text-[9px] font-semibold px-2">
                      {cls.level || 'N/A'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {cls.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {cls.mainTeacherName || 'Prof non défini'}
                  </p>
                </div>
                <div className="p-5 bg-white dark:bg-transparent flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <Users size={13} /> {cls.studentCount} élèves
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <Clock size={13} /> {count} créneau{count !== 1 ? 'x' : ''}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onOpenClassDetail(cls)}
                      className="px-3 py-1.5 text-[9px] font-bold bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600 dark:text-bleu-300 rounded-lg hover:bg-bleu-100 transition-all flex items-center gap-1"
                    >
                      <Eye size={11} /> Voir
                    </button>
                    <button
                      onClick={() => onAddSchedule(cls)}
                      className="px-3 py-1.5 text-[9px] font-bold bg-or-50 dark:bg-or-900/20 text-or-600 dark:text-or-300 rounded-lg hover:bg-or-100 transition-all flex items-center gap-1"
                    >
                      <Plus size={11} /> Ajouter
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onPrintClass(cls);
                      }}
                      className="px-3 py-1.5 text-[9px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-100 transition-all flex items-center gap-1"
                    >
                      <Printer size={11} /> Imprimer
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tableau global des créneaux */}
      {schedules.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CalendarDays size={14} className="text-bleu-500" />
            Tous les créneaux ({schedules.length})
          </p>
          <Card className="p-2 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <Table data={schedules as any} columns={scheduleColumns as any} />
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default EmploisTab;
