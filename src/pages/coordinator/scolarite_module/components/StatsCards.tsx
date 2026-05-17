// src/pages/manager/scolarite/components/StatsCards.tsx
import React from 'react';
import { Building2, GraduationCap, BookOpen, CalendarDays } from 'lucide-react';
import { Card } from '../../../../components/ui';

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
    { label: 'Classes',  value: classCount,    icon: Building2,     color: 'text-bleu-600' },
    { label: 'Élèves',   value: studentCount,  icon: GraduationCap, color: 'text-or-500' },
    { label: 'Matières', value: subjectCount,  icon: BookOpen,      color: 'text-vert-600' },
    { label: 'Créneaux', value: scheduleCount, icon: CalendarDays,  color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <Card
          key={label}
          className="p-5 border-none bg-gradient-to-br from-bleu-500/5 to-or-500/5 dark:from-bleu-900/10 dark:to-or-900/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">
              {label}
            </p>
            <Icon size={16} className={color} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
