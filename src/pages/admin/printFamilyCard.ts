import QRCode from "qrcode";

export interface FamilyCardData {
  familyCode: string;
  familyLabel: string;
  parentPhone?: string;
  children: { firstName: string; lastName: string; className?: string }[];
}

const SCHOOL_LOGO_PATH = "/logo_eief.jpeg";
const SCHOOL_PHONE = "+224 625 549 579";

function escape(value: string | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] || c,
  );
}

export async function printFamilyCard(data: FamilyCardData, qrUrl: string): Promise<void> {
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 300, margin: 1, errorCorrectionLevel: "M",
    color: { dark: "#0c2d48", light: "#ffffff" },
  });

  const familyName = escape(data.familyLabel.replace(/^FAMILLE\s+/i, "").replace(/^Famille\s+/i, ""));
  const initials = familyName.substring(0, 2).toUpperCase();
  const childCount = data.children.length;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Carte Famille — ${escape(data.familyLabel)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      background: #e8ecf1;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 10mm;
    }
    .card {
      width: 86mm; height: 54mm;
      border-radius: 3.5mm; position: relative; overflow: hidden;
      color: #fff; display: flex; flex-direction: column;
      box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.12), 0 16px 40px rgba(0,0,0,.15);
    }
    .card::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg,#0a1628 0%,#0c2d48 35%,#145a7a 65%,#1a7a6d 100%);
      z-index: 0;
    }
    .card::after {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 90% 10%, rgba(255,255,255,.06) 0%, transparent 60%),
        radial-gradient(ellipse 50% 80% at 10% 90%, rgba(26,122,109,.15) 0%, transparent 50%);
      z-index: 1; pointer-events: none;
    }
    .gold-strip {
      position: absolute; top: 0; left: 0; right: 0; height: 0.6mm;
      background: linear-gradient(90deg,#c8a84e,#f0d878,#c8a84e); z-index: 5;
    }
    .card-inner { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }
    .header { display: flex; align-items: center; gap: 2.5mm; padding: 3mm 4mm 2mm 4mm; }
    .logo-circle {
      width: 10mm; height: 10mm; border-radius: 50%;
      background: rgba(255,255,255,.95); padding: 0.8mm; flex-shrink: 0;
    }
    .logo-circle img { width: 100%; height: 100%; border-radius: 50%; object-fit: contain; }
    .header-info { flex: 1; min-width: 0; }
    .school-name { font-size: 6.2pt; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; line-height: 1.15; }
    .school-sub { font-size: 4.8pt; color: rgba(255,255,255,.55); margin-top: .3mm; }
    .badge-carte {
      background: linear-gradient(135deg,#c8a84e,#e8c860); color: #0a1628;
      font-size: 4.5pt; font-weight: 800; padding: .8mm 2.2mm; border-radius: 1mm;
      text-transform: uppercase; letter-spacing: .12em; flex-shrink: 0;
    }
    .separator {
      height: .3mm; margin: 0 4mm;
      background: linear-gradient(90deg, transparent, rgba(200,168,78,.4) 20%, rgba(200,168,78,.4) 80%, transparent);
    }
    .body { display: flex; padding: 2.5mm 4mm 2mm 4mm; gap: 3mm; flex: 1; align-items: center; }
    .photo-frame {
      width: 18mm; height: 22mm; border-radius: 2mm; flex-shrink: 0;
      border: .6mm solid rgba(200,168,78,.5); background: rgba(255,255,255,.08);
      display: flex; align-items: center; justify-content: center;
    }
    .photo-initials { font-size: 11pt; font-weight: 800; color: rgba(255,255,255,.5); }
    .info-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.2mm; }
    .family-name { font-size: 9.5pt; font-weight: 900; line-height: 1.05; text-transform: uppercase; letter-spacing: .02em; }
    .family-code { font-size: 5.5pt; font-weight: 700; color: rgba(200,168,78,.85); letter-spacing: .08em; }
    .field-label { font-size: 4pt; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: rgba(200,168,78,.85); margin-bottom: .15mm; }
    .field-value { font-size: 6.5pt; font-weight: 600; color: #fff; }
    .qr-col { display: flex; flex-direction: column; align-items: center; gap: .8mm; flex-shrink: 0; }
    .qr-box { width: 17mm; height: 17mm; background: #fff; border-radius: 1.8mm; padding: 1mm; }
    .qr-box img { width: 100%; height: 100%; object-fit: contain; }
    .qr-label { font-size: 3.8pt; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: rgba(255,255,255,.45); text-align: center; }
    .footer { padding: 1.2mm 4mm 1.8mm; text-align: center; font-size: 4.2pt; color: rgba(255,255,255,.45); font-weight: 500; line-height: 1.3; }
    .footer strong { color: rgba(255,255,255,.7); font-weight: 700; }
    @page { size: 86mm 54mm; margin: 0; }
    @media print {
      body { background: none; padding: 0; margin: 0; min-height: auto; }
      .card { box-shadow: none; page-break-inside: avoid; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="gold-strip"></div>
    <div class="card-inner">
      <div class="header">
        <div class="logo-circle"><img src="${SCHOOL_LOGO_PATH}" alt="Logo"/></div>
        <div class="header-info">
          <div class="school-name">Ecole Internationale Les Enfants du Futur</div>
          <div class="school-sub">Sanoyah, Conakry — République de Guinée</div>
        </div>
        <div class="badge-carte">Carte Famille</div>
      </div>
      <div class="separator"></div>
      <div class="body">
        <div class="photo-frame"><div class="photo-initials">${initials}</div></div>
        <div class="info-col">
          <div class="family-name">Famille ${familyName}</div>
          <div class="family-code"># ${escape(data.familyCode)}</div>
          ${data.parentPhone ? `<div><div class="field-label">Téléphone</div><div class="field-value">${escape(data.parentPhone)}</div></div>` : ""}
          <div><div class="field-label">Enfant(s)</div><div class="field-value">${childCount} élève${childCount > 1 ? "s" : ""}</div></div>
        </div>
        <div class="qr-col">
          <div class="qr-box"><img src="${qrCodeDataUrl}" alt="QR"/></div>
          <div class="qr-label">Frais scolaires</div>
        </div>
      </div>
      <div class="footer">
        En cas de perte, appelez le <strong>${SCHOOL_PHONE}</strong> — Sanoyah, Conakry - République de Guinée
      </div>
    </div>
  </div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=1000,height=800");
  if (!win) throw new Error("Veuillez autoriser les popups pour imprimer la carte.");
  win.document.write(html);
  win.document.close();
  win.focus();
}
