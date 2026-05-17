// src/pages/manager/scolarite/components/modals/AcademicYearModal.tsx
import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Button, Input, Modal } from '../../../../../components/ui';
import { AcademicYearForm } from '../../types';

interface Props {
  isOpen: boolean;
  form: AcademicYearForm;
  submitting: boolean;
  onChange: (form: AcademicYearForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const AcademicYearModal: React.FC<Props> = ({
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
        <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600">
          <CalendarDays size={22} />
        </div>
        <span className="font-bold gradient-bleu-or-text">Nouvelle Année</span>
      </div>
    }
    size="md"
  >
    <div className="space-y-6 text-left py-2" onClick={e => e.stopPropagation()}>
      <Input
        label="Nom de l'année"
        placeholder="ex: 2025-2026"
        value={form.name}
        onChange={e => onChange({ ...form, name: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          label="Date de début"
          value={form.startDate}
          onChange={e => onChange({ ...form, startDate: e.target.value })}
        />
        <Input
          type="date"
          label="Date de fin"
          value={form.endDate}
          onChange={e => onChange({ ...form, endDate: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
        <input
          type="checkbox"
          checked={form.isCurrent}
          onChange={e => onChange({ ...form, isCurrent: e.target.checked })}
          className="w-5 h-5 rounded border-gray-300 text-bleu-600 focus:ring-bleu-500"
        />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
            Définir comme année courante
          </p>
          <p className="text-[10px] text-gray-500 leading-tight">
            Ceci remplacera l'année actuellement active dans le système.
          </p>
        </div>
      </label>

      <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <Button variant="outline" onClick={onClose} className="flex-1 h-12">
          Annuler
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 h-12 shadow-lg shadow-bleu-600/20"
        >
          {submitting ? 'Création...' : "Créer l'année"}
        </Button>
      </div>
    </div>
  </Modal>
);

export default AcademicYearModal;
