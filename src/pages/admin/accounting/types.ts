// Admin-specific accounting types
// Réexporte les types principaux de comptabilite et ajoute des types admin-spécifiques

export type AdminAccountingTab = 'tuition' | 'payments' | 'expenses';

export interface FamilyOverviewRow {
  parent: any;
  status: any;
}

export interface PaymentForm {
  amount: number;
  reference: string;
  method: 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHECK';
  studentId: string;
  familyId: string;
  categoryId: number | null;
}

export interface ExpenseForm {
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: number | null;
}

export interface FamilyPaymentForm {
  amount: number;
  method: 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHECK';
  reference: string;
}
