import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button, Input, Modal } from '../../../../components/ui';
import { paymentServiceOptions } from '../../constants';
import { PaymentMethod, PaymentPayload, PaymentServiceOption, Student } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  formData: PaymentPayload;
  service: PaymentServiceOption;
  customServiceLabel: string;
  loading: boolean;
  onChange: (next: PaymentPayload) => void;
  onChangeService: (service: PaymentServiceOption) => void;
  onChangeCustomServiceLabel: (value: string) => void;
  onSubmit: () => void;
}

const PaymentModal: React.FC<Props> = ({
  customServiceLabel,
  formData,
  isOpen,
  loading,
  onChange,
  onChangeCustomServiceLabel,
  onChangeService,
  onClose,
  onSubmit,
  service,
  students,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvel encaissement">
      <div className="space-y-4 p-1">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Élève *
          </label>
          <select
            value={formData.studentId}
            onChange={(event) => onChange({ ...formData, studentId: event.target.value })}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="">Sélectionner un élève...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
                {student.registrationNumber ? ` (${student.registrationNumber})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Service
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {paymentServiceOptions.map((option) => {
              const active = service === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChangeService(option.value)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                    active
                      ? 'border-bleu-500 bg-bleu-50 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300'
                      : 'border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300'
                  }`}
                >
                  <span className="text-sm font-bold">{option.label}</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      active
                        ? 'border-bleu-500 bg-bleu-500 text-white'
                        : 'border-gray-300 text-transparent dark:border-white/20'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                  </span>
                </button>
              );
            })}
          </div>

          {service === 'autres' && (
            <div className="mt-3">
              <Input
                value={customServiceLabel}
                onChange={(event) => onChangeCustomServiceLabel(event.target.value)}
                placeholder="Préciser le service"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Montant (GNF) *
            </label>
            <Input
              type="number"
              value={formData.amount || ''}
              onChange={(event) =>
                onChange({ ...formData, amount: Number(event.target.value) })
              }
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Référence *
            </label>
            <Input
              value={formData.reference}
              onChange={(event) =>
                onChange({ ...formData, reference: event.target.value })
              }
              placeholder="ENC-2026-001"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Mode de paiement
          </label>
          <select
            value={formData.method}
            onChange={(event) =>
              onChange({
                ...formData,
                method: event.target.value as PaymentMethod,
              })
            }
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="CASH">Espèces</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="BANK_TRANSFER">Virement bancaire</option>
            <option value="CHECK">Chèque</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              loading ||
              !formData.studentId ||
              !formData.amount ||
              !formData.reference.trim() ||
              (service === 'autres' && !customServiceLabel.trim())
            }
            className="flex-1"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
