// src/pages/manager/scolarite/components/StatsCards.tsx
import React from 'react';
import { Building2, GraduationCap, BookOpen, CalendarDays } from 'lucide-react';
import { Card } from '../../../../components/ui';
import { cn } from '../../../../utils/cn';

interface Props {
  classCount: number;
  studentCount: number;
  subjectCount: number;
  scheduleCount: number;
}

const StatsCards: React.FC<Props> = ({
  classCount,
  studentCount,
  subjectCount,
  scheduleCount,
}) => {
  const cards = [
    {
      label: 'Classes',
      value: classCount,
      detail: 'sections actives',
      icon: Building2,
      iconClassName: 'bg-bleu-600 text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.9)]',
      badgeClassName: 'bg-bleu-50 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300',
      glowClassName: 'from-bleu-500/15 to-transparent',
    },
    {
      label: 'Élèves',
      value: studentCount,
      detail: 'inscriptions suivies',
      icon: GraduationCap,
      iconClassName: 'bg-or-500 text-white shadow-[0_18px_35px_-20px_rgba(245,158,11,0.85)]',
      badgeClassName: 'bg-or-50 text-or-700 dark:bg-or-900/20 dark:text-or-300',
      glowClassName: 'from-or-500/15 to-transparent',
    },
    {
      label: 'Matières',
      value: subjectCount,
      detail: 'disciplines disponibles',
      icon: BookOpen,
      iconClassName: 'bg-emerald-500 text-white shadow-[0_18px_35px_-20px_rgba(16,185,129,0.85)]',
      badgeClassName: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      glowClassName: 'from-emerald-500/15 to-transparent',
    },
    {
      label: 'Créneaux',
      value: scheduleCount,
      detail: 'plages publiées',
      icon: CalendarDays,
      iconClassName: 'bg-sky-500 text-white shadow-[0_18px_35px_-20px_rgba(14,165,233,0.85)]',
      badgeClassName: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300',
      glowClassName: 'from-sky-500/15 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, detail, icon: Icon, iconClassName, badgeClassName, glowClassName }) => (
        <Card
          key={label}
          className="relative overflow-hidden border border-slate-200/70 bg-white/90 p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50"
        >
          <div className={cn('absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-90', glowClassName)} />

          <div className="relative space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-300">
                  {detail}
                </p>
              </div>

              <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', iconClassName)}>
                <Icon size={18} />
              </div>
            </div>

            <div className="flex items-end justify-between gap-4">
              <p className="text-3xl font-black leading-none text-slate-900 dark:text-white">
                {value}
              </p>
              <span className={cn('rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]', badgeClassName)}>
                En direct
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
