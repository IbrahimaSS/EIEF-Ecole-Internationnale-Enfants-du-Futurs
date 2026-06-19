export interface ReceiptData {
  receiptNumber: string;
  amount: number;
  date: string;
  studentName: string;
  className?: string;
  categoryName: string;
  parentName?: string;
  remainingAmount?: number;
}

const CHECKBOXES = [
  'Inscription',
  'Réinscription',
  'Scolarité',
  'Cantine',
  'Transport',
  'Fourniture',
  'Tenue Scolaire',
  'Tenue Sport',
  'Lacoste',
  'Atelier',
  'Tenue Karaté',
  'Sortie Scolaire',
  'Autres',
] as const;

function matchesCheckbox(categoryName: string, checkbox: string): boolean {
  const cat = categoryName.toLowerCase();
  const cb = checkbox.toLowerCase();

  if (cb === 'inscription') return cat.includes('inscription') && !cat.includes('réinscription');
  if (cb === 'réinscription') return cat.includes('réinscription');
  if (cb === 'scolarité') return cat === 'scolarité';
  if (cb === 'cantine') return cat.includes('cantine');
  if (cb === 'transport') return cat.includes('transport');
  if (cb === 'fourniture') return cat.includes('fourniture') || cat.includes('manuel') || cat.includes('ardoise');
  if (cb === 'tenue scolaire') return cat.includes('tenue') && cat.includes('scolaire') && !cat.includes('sport') && !cat.includes('karaté');
  if (cb === 'tenue sport') return cat.includes('tenue') && cat.includes('sport');
  if (cb === 'lacoste') return cat.includes('lacoste');
  if (cb === 'atelier') return cat.includes('atelier') || cat.includes('robotique') || cat.includes('couture') || cat.includes('pâtisserie') || cat.includes('electricité') || cat.includes('agriculture');
  if (cb === 'tenue karaté') return cat.includes('karaté');
  if (cb === 'sortie scolaire') return cat.includes('sortie');
  return false;
}

function numberToWordsFGN(n: number): string {
  if (n === 0) return 'zéro';
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  function chunk(num: number): string {
    if (num === 0) return '';
    if (num < 20) return units[num];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const u = num % 10;
      if (t === 7 || t === 9) {
        return tens[t] + '-' + units[10 + u];
      }
      if (u === 0) return tens[t] + (t === 8 ? 's' : '');
      if (u === 1 && t !== 8) return tens[t] + ' et un';
      return tens[t] + '-' + units[u];
    }
    if (num < 1000) {
      const h = Math.floor(num / 100);
      const rest = num % 100;
      const prefix = h === 1 ? 'cent' : units[h] + ' cent';
      if (rest === 0 && h > 1) return prefix + 's';
      return prefix + (rest > 0 ? ' ' + chunk(rest) : '');
    }
    return '';
  }

  const parts: string[] = [];
  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;

  if (billions > 0) parts.push((billions === 1 ? 'un' : chunk(billions)) + ' milliard' + (billions > 1 ? 's' : ''));
  if (millions > 0) parts.push((millions === 1 ? 'un' : chunk(millions)) + ' million' + (millions > 1 ? 's' : ''));
  if (thousands > 0) parts.push((thousands === 1 ? 'mille' : chunk(thousands) + ' mille'));
  if (remainder > 0) parts.push(chunk(remainder));

  return parts.join(' ').trim();
}

function formatCurrencyPlain(amount: number): string {
  return new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(amount);
}

export function printReceipt(data: ReceiptData): void {
  const {
    receiptNumber,
    amount,
    date,
    studentName,
    className,
    categoryName,
    parentName,
    remainingAmount,
  } = data;

  const amountInWords = numberToWordsFGN(Math.round(amount));
  const formattedAmount = formatCurrencyPlain(amount);
  const formattedRemaining = remainingAmount != null ? formatCurrencyPlain(remainingAmount) : '';

  const hasMatch = CHECKBOXES.some(cb => matchesCheckbox(categoryName, cb));
  const checkboxesHtml = CHECKBOXES.map(cb => {
    const isChecked = hasMatch ? matchesCheckbox(categoryName, cb) : false;
    const isOther = cb === 'Autres' && !hasMatch;
    const checked = isChecked || isOther;
    return `<label class="cb"><span class="box">${checked ? '&#10003;' : ''}</span>${cb}</label>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Reçu ${receiptNumber} - EIEF</title>
<style>
  @page { size: 210mm 148mm; margin: 6mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; background: #fff; color: #1a1a1a; }
  .receipt {
    max-width: 700px; margin: 0 auto; padding: 18px 22px;
    border: 2px solid #003844;
  }

  /* --- HEADER --- */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .school { max-width: 400px; }
  .school-name { font-size: 17px; font-weight: 900; text-transform: uppercase; color: #003844; line-height: 1.2; }
  .school-sub { font-size: 9.5px; color: #444; margin-top: 2px; font-weight: 600; }
  .school-contact { font-size: 9px; color: #555; margin-top: 4px; line-height: 1.4; }

  .info-box { border: 2px solid #003844; min-width: 200px; }
  .info-row { display: flex; border-bottom: 1px solid #003844; }
  .info-row:last-child { border-bottom: none; }
  .info-label { background: #003844; color: #fff; font-size: 10px; font-weight: 900;
    padding: 5px 10px; min-width: 80px; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-value { padding: 5px 10px; font-size: 12px; font-weight: 800; flex: 1; }

  /* --- BODY --- */
  .sep { border-bottom: 1.5px solid #003844; margin: 10px 0; }
  .field { display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px; font-size: 13px; }
  .field-label { font-weight: 700; white-space: nowrap; }
  .field-dots { flex: 1; border-bottom: 1.5px dotted #888; min-height: 18px; padding-bottom: 2px;
    font-weight: 600; color: #111; padding-left: 4px; }

  /* --- CHECKBOXES --- */
  .checkboxes { display: flex; flex-wrap: wrap; gap: 8px 14px; margin: 14px 0; }
  .cb { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; }
  .box { display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border: 1.5px solid #003844; font-size: 12px; font-weight: 900;
    color: #003844; line-height: 1; }

  /* --- FOOTER --- */
  .signatures { display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px; }
  .sig-block { text-align: center; min-width: 200px; }
  .sig-label { font-weight: 700; border-top: 1px dotted #888; padding-top: 4px; margin-top: 40px; }
  .nb { margin-top: 18px; font-size: 10px; font-weight: 800; text-align: center;
    padding: 6px; border-top: 1px solid #ccc; color: #444; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .receipt { border: 2px solid #003844; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<div style="text-align:center; padding: 8px;" class="no-print">
  <button onclick="window.print()" style="padding:10px 30px; font-size:14px; font-weight:bold;
    background:#003844; color:#fff; border:none; border-radius:8px; cursor:pointer;">
    Imprimer le reçu
  </button>
</div>

<div class="receipt">
  <div class="header">
    <div class="school">
      <div class="school-name">ECOLE INTERNATIONALE<br/>LES ENFANTS DU FUTUR</div>
      <div class="school-sub">Garderie &bull; Crèche &bull; Maternelle &bull; Primaire &bull; Collège &bull; Lycée</div>
      <div class="school-contact">
        Sis à Sangoyah Rails, C/Ratoma - République de Guinée<br/>
        Tél: (+224) 625 54 95 71 / 664 63 06 91<br/>
        E-mail: info.enfandufulur@gmail.com
      </div>
    </div>
    <div class="info-box">
      <div class="info-row">
        <div class="info-label">Reçu N°</div>
        <div class="info-value">${receiptNumber}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Montant</div>
        <div class="info-value">${formattedAmount} GNF</div>
      </div>
      <div class="info-row">
        <div class="info-label">Date</div>
        <div class="info-value">${date}</div>
      </div>
    </div>
  </div>

  <div class="sep"></div>

  <div class="field">
    <span class="field-label">Nom et Prénom de l'élève :</span>
    <span class="field-dots">${studentName || ''}</span>
    <span class="field-label" style="margin-left:10px;">Classe :</span>
    <span class="field-dots" style="max-width:100px;">${className || ''}</span>
  </div>

  <div class="field">
    <span class="field-label">Montant (en lettres GNF) :</span>
    <span class="field-dots">${amountInWords} francs guinéens</span>
  </div>

  <div class="checkboxes">
    ${checkboxesHtml}
  </div>

  <div class="field">
    <span class="field-label">Reste à payer pour élève :</span>
    <span class="field-dots">${formattedRemaining ? formattedRemaining + ' GNF' : ''}</span>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="field-label">Parent d'élèves :</div>
      <div class="sig-label">${parentName || ''}</div>
    </div>
    <div class="sig-block">
      <div class="field-label">La Direction</div>
      <div class="sig-label"></div>
    </div>
  </div>

  <div class="nb">
    NB: Une fois versé tous frais sont non remboursables et non transférables.
  </div>
</div>

</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=600');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
  }
}
