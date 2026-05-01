// src/pages/manager/scolarite/components/ScolariteHeader.tsx
import React from 'react';
import { Building2, BookOpen, Plus } from 'lucide-react';
import { Button } from '../../../../components/ui';

interface Props {
  classCount: number;
  studentCount: number;
  scheduleCount: number;
  onAddSubject: () => void;
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
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Building2 className="text-bleu-600 dark:text-bleu-400" size={28} />
        <h1 className="text-xl font-semibold gradient-bleu-or-text">Gestion de la Scolarité</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
        {classCount} classes • {studentCount} élèves • {scheduleCount} créneaux
      </p>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onAddSubject}
        variant="outline"
        className="flex gap-2 border-or-500 text-or-600 hover:bg-or-50 font-semibold text-[10px] h-11 px-6 rounded-2xl"
      >
        <BookOpen size={18} /> Nouvelle Matière
      </Button>
      <Button
        onClick={onAddClass}
        variant="outline"
        className="flex gap-2 border-bleu-500 text-bleu-600 hover:bg-bleu-50 font-semibold text-[10px] h-11 px-6 rounded-2xl"
      >
        <Building2 size={18} /> Nouvelle Classe
      </Button>
      <Button
        onClick={onAddSchedule}
        className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 border-none font-semibold text-[10px] h-11 px-6 shadow-lg shadow-bleu-600/20 rounded-2xl"
      >
        <Plus size={18} /> Nouveau Créneau
      </Button>
    </div>
  </div>
);

export default ScolariteHeader;
