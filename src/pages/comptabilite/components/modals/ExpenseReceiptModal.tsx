import React from 'react';
import { Printer, X } from 'lucide-react';
import { Button } from '../../../../components/ui';
import { schoolIdentity } from '../../schoolIdentity';
import { ExpenseResponse } from '../../types';
import {
  formatAmountInWords,
  formatCurrency,
  formatDateLong,
} from '../../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseResponse | null;
}

const ExpenseReceiptModal: React.FC<Props> = ({ isOpen, onClose, expense }) => {
  if (!isOpen || !expense) return null;

  const referenceNumber = `DEP-${expense.id.slice(0, 8).toUpperCase()}`;

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
        <button
          onClick={onClose}
          className="no-print absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xl border border-gray-200 hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        <div
          className="print-area print-bg-white relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-or-600"
          style={{ fontFamily: 'Inter, Plus Jakarta Sans, sans-serif' }}
        >
          {/* Liserés or/rouge sur les bords (pour distinguer d'un reçu d'encaissement) */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-or-600 via-rouge-500 to-or-600" />
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-or-600 via-rouge-500 to-or-600" />

          <div className="p-8 print-text-black">
            {/* Bandeau "BON DE SORTIE" en haut à droite (filigrane) */}
            <div className="absolute top-4 right-6 px-3 py-1 rounded-lg bg-rouge-100 border border-rouge-300">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rouge-700">
                Sortie d'argent
              </p>
            </div>

            {/* Entête : logo + nom école */}
            <div className="flex items-start gap-4 pb-5 border-b-2 border-dashed border-or-300">
              <div className="w-20 h-20 shrink-0 rounded-2xl bg-white border-2 border-or-400 p-1 shadow-md">
                <img
                  src={schoolIdentity.logoUrl}
                  alt="EIEF"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 text-center pr-24">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-or-700">
                  {schoolIdentity.shortName}
                </p>
                <h2 className="mt-1 text-lg md:text-xl font-black text-or-900 leading-tight tracking-tight">
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

            {/* Numéro / Date / Montant */}
            <div className="grid grid-cols-3 gap-3 my-5">
              <div className="rounded-2xl border-2 border-or-200 bg-or-50/50 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-or-700">
                  Bon N°
                </p>
                <p className="mt-1 text-base font-black text-or-900 font-mono">
                  {referenceNumber}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-rouge-200 bg-rouge-50/50 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-rouge-700">
                  Montant décaissé
                </p>
                <p className="mt-1 text-base font-black text-rouge-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-bleu-200 bg-bleu-50/50 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-bleu-700">
                  Date dépense
                </p>
                <p className="mt-1 text-xs font-black text-bleu-900">
                  {formatDateLong(expense.expenseDate)}
                </p>
              </div>
            </div>

            {/* Description / Catégorie / Module */}
            <div className="space-y-3 mb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Description
                </span>
                <span className="flex-1 border-b-2 border-dotted border-gray-400 text-sm font-black text-gray-900 pb-0.5">
                  {expense.description || '—'}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Catégorie
                </span>
                <span className="flex-1 border-b-2 border-dotted border-gray-400 text-sm font-bold text-gray-700 pb-0.5">
                  {expense.categoryName || 'Non catégorisé'}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Module
                </span>
                <span className="flex-1 border-b-2 border-dotted border-gray-400 text-sm font-bold text-gray-700 pb-0.5">
                  {expense.categoryModule || '—'}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Montant en lettres (GNF)
                </span>
                <span className="flex-1 border-b-2 border-dotted border-gray-400 text-xs font-bold text-gray-700 italic pb-0.5">
                  {formatAmountInWords(expense.amount)}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-44 shrink-0">
                  Engagé par
                </span>
                <span className="flex-1 text-sm font-bold text-gray-700">
                  {expense.createdByName || 'Non renseigné'}
                </span>
              </div>
            </div>

            {/* Signatures (double signature pour une dépense) */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-dashed border-or-300">
              <div className="text-center">
                <div className="h-12 border-b-2 border-gray-700 mb-1" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                  Le Comptable
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 border-b-2 border-gray-700 mb-1" />
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

        <div className="no-print mt-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fermer
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 hover:from-or-400 hover:to-or-500"
          >
            <Printer size={16} /> Imprimer le bon de sortie
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReceiptModal;
