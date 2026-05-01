// src/pages/manager/scolarite/components/modals/SubjectModal.tsx
import React from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { Button, Input, Modal } from '../../../../../components/ui';
import { SubjectForm } from '../../types';

interface Props {
  isOpen: boolean;
  form: SubjectForm;
  submitting: boolean;
  onChange: (form: SubjectForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const SubjectModal: React.FC<Props> = ({
  isOpen,
  form,
  submitting,
  onChange,
  onClose,
  onSubmit,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      <div className="flex items-center gap-3">
        <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600">
          <BookOpen size={22} />
        </div>
        <span className="font-bold gradient-bleu-or-text">Nouvelle Matière</span>
      </div>
    }
    size="md"
  >
    <div className="space-y-6 text-left py-2" onClick={e => e.stopPropagation()}>
      <Input
        label="Nom de la matière"
        placeholder="ex: Mathématiques"
        value={form.name}
        onChange={e => onChange({ ...form, name: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Code"
          placeholder="ex: MATH"
          value={form.code}
          onChange={e => onChange({ ...form, code: e.target.value })}
        />
        <Input
          type="number"
          label="Coefficient"
          value={form.coefficient}
          onChange={e => onChange({ ...form, coefficient: Number(e.target.value) })}
        />
      </div>
      <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <Button variant="outline" onClick={onClose} className="flex-1 h-12">
          Annuler
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 h-12 bg-or-500 border-none text-white shadow-lg"
        >
          {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
          Créer la Matière
        </Button>
      </div>
    </div>
  </Modal>
);

export default SubjectModal;
