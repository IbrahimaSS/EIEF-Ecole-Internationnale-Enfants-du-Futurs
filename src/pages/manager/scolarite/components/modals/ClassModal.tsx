// src/pages/manager/scolarite/components/modals/ClassModal.tsx
import React from 'react';
import { Building2, Plus, Loader2 } from 'lucide-react';
import { Button, Input, Modal, Select } from '../../../../../components/ui';
import {
  AcademicYearResponse,
  ClassForm,
  TeacherResponse,
} from '../../types';

interface Props {
  isOpen: boolean;
  form: ClassForm;
  years: AcademicYearResponse[];
  teachers: TeacherResponse[];
  submitting: boolean;
  onChange: (form: ClassForm) => void;
  onClose: () => void;
  onSubmit: () => void;
  onOpenYearModal: () => void;
}

const ClassModal: React.FC<Props> = ({
  isOpen,
  form,
  years,
  teachers,
  submitting,
  onChange,
  onClose,
  onSubmit,
  onOpenYearModal,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      <div className="flex items-center gap-3">
        <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600">
          <Building2 size={22} />
        </div>
        <span className="font-bold gradient-bleu-or-text">Nouvelle Classe</span>
      </div>
    }
    size="lg"
  >
    <div className="space-y-6 text-left py-2" onClick={e => e.stopPropagation()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Nom de la classe"
          placeholder="ex: 10ème Année A"
          value={form.name}
          onChange={e => onChange({ ...form, name: e.target.value })}
        />
        <Input
          label="Niveau"
          placeholder="ex: Collège / Lycée"
          value={form.level}
          onChange={e => onChange({ ...form, level: e.target.value })}
        />
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Select
              label="Année Académique"
              options={years.map(y => ({ value: y.id, label: y.name }))}
              value={form.academicYearId}
              onChange={e => onChange({ ...form, academicYearId: e.target.value })}
            />
          </div>
          <Button
            variant="outline"
            className="h-[46px] px-3 border-gray-200 dark:border-white/10"
            onClick={onOpenYearModal}
            title="Ajouter une année académique"
          >
            <Plus size={18} />
          </Button>
        </div>
        <Select
          label="Professeur Principal"
          options={[
            { value: '', label: 'Aucun (Optionnel)' },
            ...teachers.map(t => ({
              value: t.userId,
              label: `${t.firstName} ${t.lastName}`,
            })),
          ]}
          value={form.mainTeacherId}
          onChange={e => onChange({ ...form, mainTeacherId: e.target.value })}
        />
        <Input
          type="number"
          label="Nombre max d'élèves"
          value={form.maxStudents}
          onChange={e => onChange({ ...form, maxStudents: Number(e.target.value) })}
        />
      </div>
      <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <Button variant="outline" onClick={onClose} className="flex-1 h-12">
          Annuler
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 h-12 bg-bleu-600 border-none text-white shadow-lg"
        >
          {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
          Créer la Classe
        </Button>
      </div>
    </div>
  </Modal>
);

export default ClassModal;
