import React from 'react';
import { Printer } from 'lucide-react';
import { Button, Modal } from '../../../../components/ui';
import { paymentServiceOptions } from '../../constants';
import { PaymentResponse, Student } from '../../types';
import {
  detectPaymentType,
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '../../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentResponse | null;
  student: Student | null;
  serviceOverride?: string | null;
}

const ReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  payment,
  serviceOverride,
  student,
}) => {
  if (!payment) {
    return null;
  }

  const resolvedService = payment.categoryName || serviceOverride || 'Non renseigné';
  const paymentType = detectPaymentType(resolvedService);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reçu d'encaissement">
      <div className="space-y-4 p-1">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-gray-900">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-bleu-600">
                EIEF
              </p>
              <h3 className="mt-2 text-xl font-black text-gray-900 dark:text-white">
                Reçu de paiement
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                Référence
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-gray-900 dark:text-white">
                {payment.reference}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Élève</p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{payment.studentName}</p>
              {student?.className && (
                <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {student.className}
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Montant</p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
              <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {formatDate(payment.paidAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mode</p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {getPaymentMethodLabel(payment.method)}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Statut</p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {getPaymentStatusLabel(payment.status)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Service</p>
            <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{resolvedService}</p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {paymentServiceOptions.map((option) => {
                const checked = paymentType === option.value;
                return (
                  <div
                    key={option.value}
                    className={`rounded-2xl border px-3 py-2 text-center text-xs font-bold ${
                      checked
                        ? 'border-bleu-500 bg-bleu-50 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300'
                        : 'border-gray-200 text-gray-400 dark:border-white/10 dark:text-gray-500'
                    }`}
                  >
                    {option.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2"
        >
          <Printer size={16} /> Imprimer
        </Button>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
