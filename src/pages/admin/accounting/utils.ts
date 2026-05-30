// Admin accounting utilities
// Réexporte les utilitaires principaux de comptabilite et ajoute des utilitaires admin-spécifiques

export const formatCurrency = (amount: number) =>
  `${new Intl.NumberFormat('fr-GN').format(Number(amount || 0))} GNF`;

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

export const getPaymentMethodLabel = (method: string) => {
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

export const getPaymentStatusLabel = (status: string) => {
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

/**
 * Génère le HTML d'un reçu de paiement famille pour impression
 */
export const generateFamilyReceiptHTML = (
  familyName: string,
  amountPaid: number,
  method: string,
  reference: string,
  remaining: number
): string => {
  const dateFmt = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Reçu Famille - EIEF</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#fff;color:#003844;padding:24px}
  .receipt{max-width:720px;margin:0 auto;border:1px solid #006d77;background:#e0f7fa;padding:16px;}
  .header{display:flex;justify-content:space-between;margin-bottom:20px;}
  .school-name{font-size:18px;font-weight:900;color:#003844;}
  .row{display:flex;gap:6px;margin-bottom:12px;font-size:14px;}
  .dotted-line{flex:1;border-bottom:1.5px dotted #003844;min-height:20px;}
  .footer{margin-top:20px;font-size:11px;font-weight:bold;text-align:center;}
</style></head>
<body><div class="receipt">
  <div class="header">
    <div class="school-name">ECOLE LES ENFANTS DU FUTUR</div>
    <div style="text-align:right;font-weight:bold;">REÇU N° ${reference}</div>
  </div>
  <div class="row"><span>Famille de :</span><div class="dotted-line">${familyName}</div></div>
  <div class="row"><span>Montant Versé :</span><div class="dotted-line">${formatCurrency(amountPaid)}</div></div>
  <div class="row"><span>Mode de Paiement :</span><div class="dotted-line">${getPaymentMethodLabel(method)}</div></div>
  <div class="row"><span>Reste à Payer Global :</span><div class="dotted-line">${formatCurrency(remaining)}</div></div>
  <div class="row"><span>Date :</span><div class="dotted-line">${dateFmt}</div></div>
  <div class="footer">NB: Les frais versés ne sont pas remboursables.</div>
</div></body></html>`;
};
