import QRCode from "qrcode";
import { ClassResponse, StudentResponse } from "../types";

interface PrintStudentCardOptions {
  student: StudentResponse;
  schoolClass: ClassResponse | null;
  qrUrl: string;
}

const SCHOOL_LOGO_PATH = "/logo_eief.jpeg";

function escape(value: string | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value).replace(
    /[&<>"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      })[character] || character,
  );
}

function fmtDate(dateValue: string | undefined): string {
  if (!dateValue) return "-";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return escape(dateValue);
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

function getInitials(student: StudentResponse): string {
  return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
}

export async function printStudentCard({
  student,
  schoolClass,
  qrUrl,
}: PrintStudentCardOptions): Promise<void> {
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  const avatarUrl = (student.avatarUrl || student.photoUrl || "").trim();
  const academicYear = schoolClass?.academicYearName || "-";
  const parentName = student.parentName?.trim() || "-";
  const mainTeacherName = schoolClass?.mainTeacherName || "-";
  const gender = student.gender || "-";

  let level = schoolClass?.level || "-";
  if (student.className) {
    const upper = student.className.toUpperCase();
    if (/(LYCEE|LYCÉE|2NDE|1ERE|1ÈRE|SECONDE|PREMIERE|PREMIÈRE|1[12]\s*[EÈ]ME?\s*ANN[EÉ]E)/.test(upper) || /(TERMINALE|^TLE\b|\bTLE\b|BACCALAUR|^BAC\b|\bBAC\b)/.test(upper)) {
      level = 'Lycée';
    } else if (/(COLLEGE|COLLÈGE|6E|5E|4E|3E|6EME|5EME|4EME|3EME|SIXIEME|CINQUIEME|QUATRIEME|TROISIEME|[7-9]\s*[EÈ]ME?\s*ANN[EÉ]E|[7-9]\s*A)/.test(upper) || /(10\s*[EÈ]ME?\s*ANN[EÉ]E|10\s*A|BEPC|BREVET)/.test(upper)) {
      level = 'Collège';
    } else if (/(PRIMAIRE|CP|CE1|CE2|CM1|CM2|[1-5]\s*AP|[1-5]\s*[EÈ]ME?\s*ANN[EÉ]E\s*PRIMAIRE)/.test(upper) || /(6\s*[EÈ]ME?\s*ANN[EÉ]E|6\s*AP|CEE|CERTIFICAT\s+D[''ÉE]?TUDES)/.test(upper)) {
      level = 'Primaire';
    } else if (/(MATERNELLE|CRECHE|GARDERIE|PS|MS|GS|PETITE\s+SECTION|MOYENNE\s+SECTION|GRANDE\s+SECTION)/.test(upper)) {
      level = 'Maternelle';
    }
  }

  const html = `<!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>Carte scolaire - ${escape(student.firstName)} ${escape(student.lastName)}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          background: linear-gradient(180deg, #e0f2fe 0%, #eef2ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 12mm;
        }
        .page {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .card {
          width: 86mm;
          height: 54mm;
          color: #fff;
          background:
            radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 30%),
            radial-gradient(circle at bottom left, rgba(250, 204, 21, 0.18), transparent 32%),
            linear-gradient(135deg, #082f49 0%, #0b4f8a 45%, #0c6a88 100%);
          border-radius: 5mm;
          padding: 4.2mm;
          position: relative;
          overflow: hidden;
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.28);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .mesh {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 8mm 8mm;
          opacity: 0.45;
          pointer-events: none;
        }
        .orb {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(1px);
        }
        .orb.top {
          width: 22mm;
          height: 22mm;
          right: -8mm;
          top: -8mm;
          background: rgba(255,255,255,0.08);
        }
        .orb.bottom {
          width: 18mm;
          height: 18mm;
          left: -6mm;
          bottom: -6mm;
          background: rgba(250, 204, 21, 0.16);
        }
        .gold-line {
          position: absolute;
          inset: 0;
          border: 1.2px solid rgba(244, 196, 48, 0.62);
          border-radius: 5mm;
          pointer-events: none;
        }
        .vertical-band {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5mm;
          background: linear-gradient(180deg, rgba(250, 204, 21, 0.82), rgba(234, 179, 8, 0.18));
          pointer-events: none;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2.5mm;
          position: relative;
          z-index: 1;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 2.5mm;
          min-width: 0;
        }
        .header-left img {
          width: 10mm;
          height: 10mm;
          object-fit: contain;
          background: rgba(255,255,255,0.95);
          border-radius: 50%;
          padding: 1mm;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.18);
        }
        .school-copy {
          min-width: 0;
        }
        .school-copy .republic {
          font-size: 4.8pt;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #bfdbfe;
          margin-bottom: 0.7mm;
        }
        .school-copy .name {
          font-size: 8.1pt;
          font-weight: 700;
          text-transform: uppercase;
          line-height: 1.1;
        }
        .school-copy .meta {
          font-size: 5.8pt;
          opacity: 0.88;
          margin-top: 0.8mm;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .year-chip {
          border: 1px solid rgba(250, 204, 21, 0.45);
          background: rgba(15, 23, 42, 0.34);
          color: #fde68a;
          border-radius: 999px;
          padding: 1mm 2.2mm;
          font-size: 5.4pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .body {
          display: grid;
          grid-template-columns: 19mm 1fr 21mm;
          gap: 2.8mm;
          align-items: start;
          position: relative;
          z-index: 1;
        }
        .portrait {
          width: 19mm;
          height: 23mm;
          border-radius: 3.2mm;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
        }
        .portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .portrait-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10pt;
          font-weight: 700;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.04));
        }
        .identity {
          min-width: 0;
        }
        .identity .title {
          font-size: 5.8pt;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #fde68a;
          margin-bottom: 1mm;
          font-weight: 700;
        }
        .identity .name {
          font-size: 9.5pt;
          font-weight: 700;
          line-height: 1.08;
          margin-bottom: 1.2mm;
        }
        .identity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1mm 2mm;
        }
        .line {
          font-size: 5.9pt;
          line-height: 1.24;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 5.2mm;
        }
        .line strong {
          color: #dbeafe;
          font-weight: 700;
          display: block;
          font-size: 4.8pt;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.2mm;
        }
        .qr-shell {
          background: rgba(255,255,255,0.98);
          border-radius: 3.2mm;
          padding: 1.1mm 1.1mm 1.5mm 1.1mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.9mm;
          box-shadow: 0 10px 18px rgba(2, 6, 23, 0.18);
        }
        .qr-shell img {
          width: 17.2mm;
          height: 17.2mm;
          object-fit: contain;
        }
        .qr-shell .label {
          font-size: 5.1pt;
          font-weight: 700;
          text-transform: uppercase;
          color: #0f172a;
          text-align: center;
          letter-spacing: 0.08em;
          line-height: 1.15;
        }
        .qr-shell .hint {
          font-size: 4.6pt;
          color: #475569;
          text-align: center;
          line-height: 1.12;
        }
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2mm;
          font-size: 5.2pt;
          opacity: 0.95;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }
        .footer .tag {
          background: rgba(255,255,255,0.13);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          padding: 0.9mm 2mm;
          font-weight: 700;
        }
        .footer .serial {
          color: #e2e8f0;
          letter-spacing: 0.08em;
          text-align: right;
        }
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          body {
            background: #fff;
            min-height: auto;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="card">
          <div class="mesh"></div>
          <div class="orb top"></div>
          <div class="orb bottom"></div>
          <div class="vertical-band"></div>
          <div class="gold-line"></div>
          <div class="header">
            <div class="header-left">
              <img src="${SCHOOL_LOGO_PATH}" alt="EIEF" />
              <div class="school-copy">
                <div class="republic">République de Guinée</div>
                <div class="name">Ecole Internationale Les Enfants du Futur</div>
                <div class="meta">Carte scolaire · Faisons plus</div>
              </div>
            </div>
            <div class="year-chip">${escape(academicYear)}</div>
          </div>

          <div class="body">
            <div class="portrait">
              ${
                avatarUrl
                  ? `<img src="${escape(avatarUrl)}" alt="Photo de ${escape(student.firstName)} ${escape(student.lastName)}" />`
                  : `<div class="portrait-fallback">${escape(getInitials(student))}</div>`
              }
            </div>

            <div class="identity">
              <div class="title">Eleve</div>
              <div class="name">${escape(student.firstName)} ${escape(student.lastName)}</div>
              <div class="identity-grid">
                <div class="line"><strong>Matricule</strong>${escape(student.registrationNumber)}</div>
                <div class="line"><strong>Classe</strong>${escape(student.className)}</div>
                <div class="line"><strong>Niveau</strong>${escape(level)}</div>
                <div class="line"><strong>Sexe</strong>${escape(gender)}</div>
                <div class="line"><strong>Naissance</strong>${fmtDate(student.birthDate)}</div>
                <div class="line"><strong>Prof. principal</strong>${escape(mainTeacherName)}</div>
                <div class="line" style="grid-column: 1 / -1;"><strong>Parent / Tuteur</strong>${escape(parentName)}</div>
              </div>
            </div>

            <div class="qr-shell">
              <img src="${qrCodeDataUrl}" alt="QR carte scolaire" />
              <div class="label">Scanner pour le bulletin</div>
              <div class="hint">Accès lecture seule</div>
            </div>
          </div>

          <div class="footer">
            <span class="tag">EIEF</span>
            <span class="serial">ID ${escape(student.registrationNumber)} · ${escape(academicYear)}</span>
          </div>
        </div>
      </div>
    </body>
  </html>`;

  const printWindow = window.open("", "_blank", "width=1000,height=800");

  if (!printWindow) {
    throw new Error("Veuillez autoriser les popups pour imprimer la carte.");
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
}
