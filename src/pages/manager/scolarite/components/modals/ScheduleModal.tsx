// src/pages/manager/scolarite/components/modals/ScheduleModal.tsx
import React from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { Button, Input, Modal, Select } from '../../../../../components/ui';
import { DAY_OPTIONS } from '../../constants';
import {
  ClassResponse,
  ScheduleForm,
  SubjectResponse,
  TeacherResponse,
} from '../../types';

interface Props {
  isOpen: boolean;
  form: ScheduleForm;
  classes: ClassResponse[];
  subjects: SubjectResponse[];
  teachers: TeacherResponse[];
  submitting: boolean;
  isEditing: boolean;
  onChange: (form: ScheduleForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const ScheduleModal: React.FC<Props> = ({
  isOpen,
  form,
  classes,
  subjects,
  teachers,
  submitting,
  isEditing,
  onChange,
  onClose,
  onSubmit,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      <div className="flex items-center gap-3">
        <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600">
          <CalendarDays size={22} />
        </div>
        <span className="font-bold gradient-bleu-or-text">
          {isEditing ? 'Modifier le créneau' : 'Nouveau créneau'}
        </span>
      </div>
    }
    size="lg"
  >
    <div className="space-y-6 text-left py-2" onClick={e => e.stopPropagation()}>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-1 h-3 bg-bleu-500 rounded-full" /> Configuration
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Classe"
            options={[
              { value: '', label: 'Sélectionner une classe...' },
              ...classes.map(c => ({ value: c.id, label: c.name })),
            ]}
            value={form.classId}
            onChange={e => onChange({ ...form, classId: e.target.value })}
          />
          <Select
            label="Matière"
            options={[
              { value: '', label: 'Sélectionner une matière...' },
              ...subjects.map(s => ({ value: s.id, label: s.name })),
            ]}
            value={form.subjectId}
            onChange={e => onChange({ ...form, subjectId: e.target.value })}
          />
          <Select
            label="Enseignant (Optionnel)"
            options={[
              { value: '', label: 'Aucun (Sélection automatique / Non défini)' },
              ...teachers.map(t => ({
                value: t.userId,
                label: `${t.firstName} ${t.lastName}`,
              })),
            ]}
            value={form.teacherId}
            onChange={e => onChange({ ...form, teacherId: e.target.value })}
          />
          <Select
            label="Jour de la semaine"
            options={DAY_OPTIONS}
            value={form.dayOfWeek}
            onChange={e => onChange({ ...form, dayOfWeek: e.target.value })}
          />
          <Input
            label="Salle"
            placeholder="ex: Salle A101"
            value={form.room}
            onChange={e => onChange({ ...form, room: e.target.value })}
          />
          <Input
            type="time"
            label="Heure de début"
            value={form.startTime}
            onChange={e => onChange({ ...form, startTime: e.target.value })}
          />
          <Input
            type="time"
            label="Heure de fin"
            value={form.endTime}
            onChange={e => onChange({ ...form, endTime: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <Button variant="outline" onClick={onClose} className="flex-1 h-12">
          Annuler
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 h-12 shadow-lg shadow-bleu-600/20 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {isEditing ? 'Enregistrer les modifications' : 'Créer le créneau'}
        </Button>
      </div>
    </div>
  </Modal>
);

export default ScheduleModal;
