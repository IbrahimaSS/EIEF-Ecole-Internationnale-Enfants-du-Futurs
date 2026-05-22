// src/pages/manager/scolarite/components/ScolariteHeader.tsx
import React from 'react';
import { Building2, BookOpen, Plus } from 'lucide-react';
import { Button } from '../../../../components/ui';

interface Props {
  classCount: number;
  studentCount: number;
  scheduleCount: number;
  onAddSubject?: () => void;
  onAddClass: () => void;
  onAddSchedule: () => void;
}

const ScolariteHeader: React.FC<Props> = ({
  classCount,
  studentCount,
  scheduleCount,
  onAddSubject,
  onAddClass,
  onAddSchedule,
}) => {
  const snapshots = [
    { label: 'Classes', value: classCount },
    { label: 'Élèves', value: studentCount },
    { label: 'Créneaux', value: scheduleCount },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-bleu-600 to-bleu-500 text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.85)]">
            <Building2 size={26} />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-bleu-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
              <Building2 size={14} />
              Organisation pédagogique
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Vue prioritaire des emplois du temps
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Créez des classes, ajoutez les matières et gardez une lecture rapide de l'activité pédagogique avant d'entrer dans le détail d'une classe.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {snapshots.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[1.4rem] border border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-white/5"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {label}
              </div>
              <div className="mt-2 text-2xl font-black leading-none text-slate-900 dark:text-white">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 xl:max-w-lg xl:justify-end">
        {onAddSubject && (
          <Button
            onClick={onAddSubject}
            variant="outline"
            className="h-11 rounded-2xl border-or-300 bg-white px-5 text-[11px] font-semibold text-or-700 shadow-sm hover:bg-or-50 dark:border-or-700/40 dark:bg-or-900/10 dark:text-or-300 dark:hover:bg-or-900/20"
          >
            <BookOpen size={17} /> Nouvelle matière
          </Button>
        )}

        <Button
          onClick={onAddClass}
          variant="outline"
          className="h-11 rounded-2xl border-bleu-300 bg-white px-5 text-[11px] font-semibold text-bleu-700 shadow-sm hover:bg-bleu-50 dark:border-bleu-700/40 dark:bg-bleu-900/10 dark:text-bleu-300 dark:hover:bg-bleu-900/20"
        >
          <Building2 size={17} /> Nouvelle classe
        </Button>

        <Button
          onClick={onAddSchedule}
          className="h-11 rounded-2xl bg-gradient-to-r from-bleu-600 via-bleu-500 to-cyan-500 px-5 text-[11px] font-semibold text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.9)]"
        >
          <Plus size={17} /> Nouveau créneau
        </Button>
      </div>
    </div>
  );
};

export default ScolariteHeader;
