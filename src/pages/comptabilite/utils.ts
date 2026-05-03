import { PaymentMethod, PaymentServiceOption, PaymentStatus } from './types';

export const formatCurrency = (amount: number) =>
  `${new Intl.NumberFormat('fr-GN').format(Number(amount || 0))} FGN`;

export const formatDate = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

export const formatDateLong = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';

export const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case 'CASH':
      return 'Espèces';
    case 'MOBILE_MONEY':
      return 'Mobile Money';
    case 'BANK_TRANSFER':
      return 'Virement bancaire';
    case 'CHECK':
      return 'Chèque';
    default:
      return method;
  }
};

export const getPaymentStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case 'PAID':
      return 'Payé';
    case 'PARTIAL':
      return 'Partiel';
    case 'PENDING':
      return 'En attente';
    case 'OVERDUE':
      return 'En retard';
    default:
      return status;
  }
};

export const detectPaymentType = (
  categoryName?: string | null,
): PaymentServiceOption => {
  const label = (categoryName || '').toLowerCase();

  if (label.includes('réinscription') || label.includes('reinscription')) {
    return 'reinscription';
  }
  if (label.includes('inscription')) {
    return 'inscription';
  }
  if (label.includes('scolarit')) {
    return 'scolarite';
  }
  return 'autres';
};

export const resolvePaymentServiceLabel = (
  service: PaymentServiceOption,
  customLabel?: string,
) => {
  switch (service) {
    case 'inscription':
      return 'Inscription';
    case 'reinscription':
      return 'Réinscription';
    case 'scolarite':
      return 'Scolarité';
    case 'autres':
      return customLabel?.trim() || 'Autres';
    default:
      return 'Autres';
  }
};
