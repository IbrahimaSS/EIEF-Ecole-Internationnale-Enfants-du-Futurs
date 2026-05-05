import { PaymentServiceOption } from './types';

/**
 * Modules comptables — chaque option a un `value` brut (envoyé en filtre)
 * et un `label` affiché. Le matching se fait via la fonction `matchesModule`
 * dans utils.ts qui normalise les accents.
 */
export const moduleOptions = [
  { value: 'Tous', label: 'Tous les modules' },
  { value: 'SCOLARITE', label: 'Scolarité' },
  { value: 'CANTINE', label: 'Cantine' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'SUPERETTE', label: 'Supérette' },
  { value: 'BIBLIOTHEQUE', label: 'Bibliothèque' },
  { value: 'AUTRES', label: 'Autres' },
];

export const paymentServiceOptions: Array<{
  value: PaymentServiceOption;
  label: string;
}> = [
  { value: 'inscription', label: 'Inscription' },
  { value: 'reinscription', label: 'Réinscription' },
  { value: 'scolarite', label: 'Scolarité' },
  { value: 'autres', label: 'Autres' },
];

/**
 * Modes de paiement (utilisé pour les filtres dans les listes).
 */
export const paymentMethodOptions = [
  { value: 'all', label: 'Tous les modes' },
  { value: 'CASH', label: 'Espèces' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'BANK_TRANSFER', label: 'Virement' },
  { value: 'CHECK', label: 'Chèque' },
];

/**
 * Statuts de paiement (utilisé pour les filtres).
 */
export const paymentStatusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'PAID', label: 'Payé' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'PARTIAL', label: 'Partiel' },
  { value: 'OVERDUE', label: 'En retard' },
];
