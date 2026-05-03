import { PaymentServiceOption } from './types';

export const moduleOptions = [
  { value: 'Tous', label: 'Tous' },
  { value: 'SCOLARITE', label: 'Scolarité' },
  { value: 'CANTINE', label: 'Cantine' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'SUPÉRETTE', label: 'Supérette' },
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
