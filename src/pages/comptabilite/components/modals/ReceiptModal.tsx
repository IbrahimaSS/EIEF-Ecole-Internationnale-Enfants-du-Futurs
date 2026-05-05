import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { Button } from '../../../../components/ui';
import { paymentServiceOptions } from '../../constants';
import { schoolIdentity } from '../../schoolIdentity';
import { PaymentResponse, Student } from '../../types';
import {
  detectPaymentType,
  formatAmountInWords,
  formatCurrency,
  formatDateLong,
  getPaymentMethodLabel,
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
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  const resolvedService = payment.categoryName || serviceOverride || 'Non renseigné';
  const paymentType = detectPaymentType(resolvedService);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer (caché à l'impression) */}
        <button
          onClick={onClose}
          className="no-print absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xl border border-gray-200 hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        {/* Contenu imprimable */}
        <div
          ref={receiptRef}
          className="print-area print-bg-white relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-vert-700"
          style={{ fontFamily: 'Inter, Plus Jakarta Sans, sans-serif' }}
        >
          {/* Liserés décoratifs vert/or sur les bords */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-vert-600 via-or-500 to-vert-600" />
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-vert-600 via-or-500 to-vert-600" />

          <div className="p-8 print-text-black">
            {/* Entête : logo + nom école + cycles + adresse */}
            <div className="flex items-start gap-4 pb-5 border-b-2 border-dashed border-vert-300">
              <div className="w-20 h-20 shrink-0 rounded-2xl bg-white border-2 border-or-400 p-1 shadow-md">
                <img
                  src={schoolIdentity.logoUrl}
                  alt="EIEF"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-vert-700">
                  {schoolIdentity.shortName}
                </p>
                <h2 className="mt-1 text-lg md:text-xl font-black text-vert-900 leading-tight tracking-tight">
                  {schoolIdentity.fullName.toUpperCase()}
                </h2>
                <p className="mt-1 text-[10px] font-bold text-gray-700 italic">
                  {schoolIdentity.cycles}
                </p>
                <p className="mt-2 text-[10px] font-medium text-gray-600">
                  {schoolIdentity.address}
                </p>
                <p className="text-[10px] font-medium text-gray-600">
                  Tél : {schoolIdentity.phones} · {schoolIdentity.email}
                </p>
              </div>
            </div>

            {/* Numéro reçu / Date / Montant en gros */}
            <div className="grid grid-cols-3 gap-3 my-5">
              <div className="rounded-2xl border-2 border-vert-200 bg-vert-50/50 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-vert-700">
                  Reçu N°
                </p>
                <p className="mt-1 text-base font-black text-vert-900 font-mono">
                  {payment.reference}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-or-200 bg-or-50/50 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-or-700">
                  Montant
                </p>
                <p className="mt-1 text-base font-black text-or-900">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-bleu-200 bg-bleu-50/50 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-bleu-700">
                  Date
                </p>
                <p className="mt-1 text-xs font-black text-bleu-900">
                  {formatDateLong(payment.paidAt)}
                </p>
              </div>
            </div>

            {/* Informations élève */}
            <div className="space-y-3 mb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Nom et prénoms
                </span>
                <span className="flex-1 border-b-2 border-dotted border-gray-400 text-sm font-black text-gray-900 pb-0.5">
                  {payment.studentName}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Classe
                </span>
                <span className="flex-1 border-b-2 border-dotted border-gray-400 text-sm font-bold text-gray-700 pb-0.5">
                  {student?.className || '—'}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Montant en lettres (GNF)
                </span>
                <span className="flex-1 border-b-2 border-dotted border-gray-400 text-xs font-bold text-gray-700 italic pb-0.5">
                  {formatAmountInWords(payment.amount)}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Mode de paiement
                </span>
                <span className="flex-1 text-sm font-bold text-gray-700">
                  {getPaymentMethodLabel(payment.method)}
                </span>
              </div>
            </div>

            {/* Cases service à cocher */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Service
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {paymentServiceOptions.map((option) => {
                  const checked = paymentType === option.value;
                  return (
                    <div
                      key={option.value}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 ${
                        checked
                          ? 'border-vert-600 bg-vert-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                          checked
                            ? 'border-vert-600 bg-vert-600 text-white'
                            : 'border-gray-400 bg-white'
                        }`}
                      >
                        {checked && (
                          <span className="text-[14px] font-black leading-none">✓</span>
                        )}
                      </span>
                      <span
                        className={`text-xs font-black ${
                          checked ? 'text-vert-900' : 'text-gray-500'
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description / Service détaillé */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                Description (à payer pour élève)
              </p>
              <div className="border-b-2 border-dotted border-gray-400 pb-1">
                <p className="text-sm font-bold text-gray-800">{resolvedService}</p>
              </div>
            </div>

            {/* Note + signature */}
            <div className="flex items-end justify-between gap-4 pt-4 border-t-2 border-dashed border-vert-300">
              <p className="text-[10px] font-bold italic text-rouge-600 max-w-xs">
                {schoolIdentity.refundNotice}
              </p>
              <div className="text-center">
                <div className="h-12 w-40 border-b-2 border-gray-700 mb-1" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                  {schoolIdentity.signatureLabel}
                </p>
              </div>
            </div>

            {/* Pied de page motto */}
            <div className="mt-5 pt-3 border-t border-gray-200 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-or-600 italic">
                {schoolIdentity.motto}
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action (cachés à l'impression) */}
        <div className="no-print mt-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fermer
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-vert-600 to-vert-700 text-white hover:from-vert-500 hover:to-vert-600"
          >
            <Printer size={16} /> Imprimer le reçu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
