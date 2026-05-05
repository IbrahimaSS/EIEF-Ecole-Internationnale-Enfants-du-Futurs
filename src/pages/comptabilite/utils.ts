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

/**
 * Normalise une chaîne pour comparaison (uppercase, sans accents).
 * Utile pour matcher 'Supérette' avec 'SUPERETTE' sans bug.
 */
export const normalizeText = (s: string | null | undefined) =>
  (s || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * Vérifie si une catégorie/module donnée matche le filtre actif.
 * Insensible à la casse et aux accents.
 */
export const matchesModule = (
  candidate: string | null | undefined,
  selected: string,
) => {
  if (!selected || selected === 'Tous' || selected === 'all') return true;
  const haystack = normalizeText(candidate);
  const needle = normalizeText(selected);
  return haystack.includes(needle);
};

/**
 * Filtre une date pour vérifier qu'elle se trouve dans une plage.
 * Les bornes vides sont ignorées (= ouvertes).
 */
export const isWithinDateRange = (
  dateStr: string | null | undefined,
  fromIso?: string,
  toIso?: string,
) => {
  if (!dateStr) return false;
  const d = new Date(dateStr).getTime();
  if (Number.isNaN(d)) return false;
  if (fromIso) {
    const from = new Date(fromIso).getTime();
    if (d < from) return false;
  }
  if (toIso) {
    // Inclure toute la journée du "jusqu'à"
    const to = new Date(toIso);
    to.setHours(23, 59, 59, 999);
    if (d > to.getTime()) return false;
  }
  return true;
};

/**
 * Convertit un nombre entier en mots français.
 * Ex: 1234 -> "mille deux cent trente-quatre"
 * Utilisé pour les reçus officiels (montant en lettres).
 */
const _units = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept',
  'dix-huit', 'dix-neuf',
];
const _tens = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante',
  'quatre-vingt', 'quatre-vingt',
];

const _hundreds = (n: number): string => {
  if (n === 0) return '';
  if (n === 1) return 'cent';
  return `${_units[n]} cent`;
};

const _below1000 = (n: number): string => {
  if (n === 0) return '';
  if (n < 20) return _units[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) {
      // 70-79 : soixante-dix, soixante et onze, soixante-douze...
      // 90-99 : quatre-vingt-dix, quatre-vingt-onze... (jamais "et")
      const base = _tens[t];
      const compound = _units[10 + u];
      // "et" uniquement pour 71 (soixante et onze)
      return t === 7 && u === 1 ? `${base} et ${compound}` : `${base}-${compound}`;
    }
    if (u === 0) return _tens[t] + (t === 8 ? 's' : '');
    // "et un" pour 21, 31, 41, 51, 61 — pas pour 81 (quatre-vingt-un)
    if (u === 1 && t !== 8) return `${_tens[t]} et un`;
    return `${_tens[t]}-${_units[u]}`;
  }
  // 100..999
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let str = _hundreds(h);
  if (h > 1 && rest === 0) str += 's';
  if (rest > 0) str += ` ${_below1000(rest)}`;
  return str;
};

export const numberToFrenchWords = (num: number): string => {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return 'zéro';

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const remainder = n % 1000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(billions === 1 ? 'un milliard' : `${_below1000(billions)} milliards`);
  }
  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${_below1000(millions)} millions`);
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? 'mille' : `${_below1000(thousands)} mille`);
  }
  if (remainder > 0) {
    parts.push(_below1000(remainder));
  }

  return parts.join(' ').trim();
};

/**
 * Formate un montant en lettres avec la devise (ex: "Mille deux cent francs guinéens").
 */
export const formatAmountInWords = (amount: number) => {
  const words = numberToFrenchWords(Math.floor(Number(amount) || 0));
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return `${capitalized} francs guinéens`;
};
