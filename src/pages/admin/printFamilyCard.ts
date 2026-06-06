import QRCode from "qrcode";

export interface FamilyCardData {
  familyCode: string;
  familyLabel: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  children: { firstName: string; lastName: string; className?: string }[];
  totalPaid?: number;
  totalRemaining?: number;
  paymentStatus?: "A_JOUR" | "EN_RETARD" | "INCONNU";
}

const SCHOOL_LOGO_PATH = "/logo_eief.jpeg";
const SCHOOL_PHONE = "+224 623 00 00 00";

function escape(value: string | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] || c,
  );
}

function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export async function printFamilyCard(
  data: FamilyCardData,
  qrUrl: string,
): Promise<void> {
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 2);

  const createdAt = fmtDate(now);
  const expiresAt = fmtDate(expiry);

  const initials = (data.familyLabel ?? "FA")
    .replace("FAMILLE ", "")
    .substring(0, 2)
    .toUpperCase();

  const childCount = data.children.length;

  const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Carte Famille - ${escape(data.familyLabel)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Georgia, 'Times New Roman', serif;
        background: linear-gradient(180deg, #d1fae5 0%, #ecfdf5 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 12mm;
      }
      .page { width: 100%; display: flex; justify-content: center; }

      .card {
        width: 86mm;
        height: 54mm;
        color: #fff;
        background:
          radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 28%),
          radial-gradient(circle at bottom left, rgba(16,185,129,0.18), transparent 30%),
          linear-gradient(135deg, #064e3b 0%, #065f46 45%, #047857 100%);
        border-radius: 5mm;
        padding: 4mm;
        position: relative;
        overflow: hidden;
        box-shadow: 0 18px 44px rgba(6, 78, 59, 0.3);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .mesh {
        position: absolute; inset: 0;
        background:
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 8mm 8mm;
        opacity: 0.45;
        pointer-events: none;
      }
      .orb { position: absolute; border-radius: 999px; pointer-events: none; filter: blur(1px); }
      .orb.top { width: 22mm; height: 22mm; right: -8mm; top: -8mm;    background: rgba(255,255,255,0.08); }
      .orb.bot { width: 18mm; height: 18mm; left: -6mm;  bottom: -6mm; background: rgba(16,185,129,0.18); }
      .gold-line {
        position: absolute; inset: 0;
        border: 1.2px solid rgba(52,211,153,0.5);
        border-radius: 5mm;
        pointer-events: none;
      }
      .vband {
        position: absolute; left: 0; top: 0; bottom: 0; width: 5mm;
        background: linear-gradient(180deg, rgba(52,211,153,0.85), rgba(16,185,129,0.2));
        pointer-events: none;
      }

      /* Header */
      .header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 2mm; position: relative; z-index: 1;
      }
      .header-left { display: flex; align-items: center; gap: 2.5mm; min-width: 0; }
      .header-left img {
        width: 9.5mm; height: 9.5mm; object-fit: contain;
        background: rgba(255,255,255,0.95);
        border-radius: 50%; padding: 0.8mm;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.2);
      }
      .school-copy { min-width: 0; }
      .school-copy .republic { font-size: 4.6pt; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #a7f3d0; margin-bottom: 0.5mm; }
      .school-copy .name     { font-size: 7.8pt; font-weight: 700; text-transform: uppercase; line-height: 1.1; }
      .school-copy .meta     { font-size: 5.6pt; opacity: 0.85; margin-top: 0.7mm; text-transform: uppercase; letter-spacing: 0.08em; }
      .type-chip {
        border: 1px solid rgba(52,211,153,0.45);
        background: rgba(6,78,59,0.4);
        color: #6ee7b7;
        border-radius: 999px;
        padding: 0.9mm 2mm;
        font-size: 5.2pt; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.08em;
        white-space: nowrap;
      }

      /* Body */
      .body {
        display: grid;
        grid-template-columns: 18mm 1fr 21mm;
        gap: 2.5mm;
        align-items: start;
        position: relative; z-index: 1;
      }
      .avatar {
        width: 18mm; height: 23mm;
        border-radius: 3mm;
        border: 1px solid rgba(255,255,255,0.35);
        background: rgba(255,255,255,0.12);
        display: flex; align-items: center; justify-content: center;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
        font-size: 11pt; font-weight: 700;
        letter-spacing: 0.06em;
      }
      .identity { min-width: 0; }
      .identity .title {
        font-size: 5.6pt; text-transform: uppercase;
        letter-spacing: 0.18em; color: #6ee7b7;
        margin-bottom: 0.8mm; font-weight: 700;
      }
      .identity .fname {
        font-size: 9pt; font-weight: 700;
        line-height: 1.08; margin-bottom: 1mm;
      }
      .id-row {
        display: inline-flex; align-items: center;
        background: rgba(0,0,0,0.22);
        border: 1px solid rgba(52,211,153,0.35);
        border-radius: 999px;
        padding: 0.6mm 1.8mm;
        font-size: 5.8pt; font-weight: 700;
        letter-spacing: 0.08em; color: #a7f3d0;
        margin-bottom: 1.4mm;
      }
      .igrid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9mm 1.8mm; }
      .iline { font-size: 5.7pt; line-height: 1.22; overflow: hidden; text-overflow: ellipsis; min-height: 4.8mm; }
      .iline strong { color: #d1fae5; font-weight: 700; display: block; font-size: 4.6pt; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.15mm; }

      /* QR shell */
      .qr-shell {
        background: rgba(255,255,255,0.98);
        border-radius: 3mm; padding: 1.2mm 1mm 1.5mm 1mm;
        display: flex; flex-direction: column; align-items: center; gap: 0.7mm;
        box-shadow: 0 8px 16px rgba(2,6,23,0.2);
      }
      .qr-shell img  { width: 16.5mm; height: 16.5mm; object-fit: contain; }
      .qr-shell .ql  { font-size: 4.9pt; font-weight: 700; text-transform: uppercase; color: #0f172a; text-align: center; letter-spacing: 0.08em; line-height: 1.15; }
      .qr-shell .qh  { font-size: 4.2pt; color: #475569; text-align: center; line-height: 1.2; }

      /* Footer */
      .footer {
        display: flex; align-items: flex-end; justify-content: space-between;
        gap: 2mm; position: relative; z-index: 1;
      }
      .footer .tag {
        background: rgba(255,255,255,0.13);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 999px; padding: 0.8mm 1.8mm;
        font-size: 5pt; font-weight: 700; text-transform: uppercase;
        white-space: nowrap;
      }
      .footer .dates {
        font-size: 4.2pt; color: #a7f3d0; line-height: 1.45; text-align: center;
        text-transform: uppercase; letter-spacing: 0.04em;
      }
      .footer .loss {
        font-size: 4.2pt; color: #a7f3d0; text-align: right; line-height: 1.35;
        text-transform: none;
      }

      @page { size: A4 portrait; margin: 10mm; }
      @media print { body { background: #fff; min-height: auto; padding: 0; } }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="card">
        <div class="mesh"></div>
        <div class="orb top"></div>
        <div class="orb bot"></div>
        <div class="vband"></div>
        <div class="gold-line"></div>

        <!-- HEADER -->
        <div class="header">
          <div class="header-left">
            <img src="${SCHOOL_LOGO_PATH}" alt="EIEF" />
            <div class="school-copy">
              <div class="republic">République de Guinée</div>
              <div class="name">Ecole Internationale Les Enfants du Futur</div>
              <div class="meta">Carte Famille · Faisons plus</div>
            </div>
          </div>
          <div class="type-chip">Famille</div>
        </div>

        <!-- BODY -->
        <div class="body">
          <div class="avatar">${escape(initials)}</div>

          <div class="identity">
            <div class="title">Famille</div>
            <div class="fname">${escape(data.familyLabel.replace("FAMILLE ", ""))}</div>
            <div class="id-row"># ${escape(data.familyCode)}</div>
            <div class="igrid">
              ${data.fatherName ? `<div class="iline"><strong>Père / Tuteur</strong>${escape(data.fatherName)}</div>` : ""}
              ${data.motherName ? `<div class="iline"><strong>Mère</strong>${escape(data.motherName)}</div>` : ""}
              ${data.parentPhone ? `<div class="iline" style="grid-column:1/-1"><strong>Tél. parent</strong>${escape(data.parentPhone)}</div>` : ""}
              <div class="iline"><strong>Enfant(s)</strong>${childCount} élève${childCount > 1 ? "s" : ""}</div>
            </div>
          </div>

          <!-- QR -->
          <div class="qr-shell">
            <img src="${qrCodeDataUrl}" alt="QR famille" />
            <div class="ql">Infos famille</div>
            <div class="qh">Scanner pour voir<br>les informations</div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <span class="tag">EIEF</span>
          <div class="dates">
            Émise le ${escape(createdAt)}<br>
            Expire le <strong>${escape(expiresAt)}</strong>
          </div>
          <div class="loss">
            En cas de perte, contacter l'école<br>
            <strong>${escape(SCHOOL_PHONE)}</strong>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

  const win = window.open("", "_blank", "width=1000,height=800");
  if (!win) throw new Error("Veuillez autoriser les popups pour imprimer la carte.");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}
