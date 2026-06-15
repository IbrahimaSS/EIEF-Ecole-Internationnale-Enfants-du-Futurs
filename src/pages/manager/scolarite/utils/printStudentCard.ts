import QRCode from "qrcode";
import { ClassResponse, StudentResponse } from "../types";

export interface SchoolInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface PrintStudentCardOptions {
  student: StudentResponse;
  schoolClass: ClassResponse | null;
  qrUrl: string;
  schoolInfo?: SchoolInfo;
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
  schoolInfo,
}: PrintStudentCardOptions): Promise<void> {
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: "#0c2d48",
      light: "#ffffff",
    },
  });

  const avatarUrl = (student.avatarUrl || student.photoUrl || "").trim();
  const academicYear = schoolClass?.academicYearName || "-";
  const gender = student.gender === "M" ? "Masculin" : student.gender === "F" ? "Féminin" : (student.gender || "-");

  const sName = schoolInfo?.name || "Ecole Internationale Les Enfants du Futur";
  const sPhone = schoolInfo?.phone || "+224 620 00 00 00";
  const sAddress = schoolInfo?.address || "Conakry, République de Guinée";

  const html = `<!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>Carte scolaire - ${escape(student.firstName)} ${escape(student.lastName)}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #e8ecf1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 10mm;
        }

        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8mm;
        }

        /* ═══════════════════════════════════════════
           RECTO — Face avant
           ═══════════════════════════════════════════ */
        .card {
          width: 86mm;
          height: 54mm;
          border-radius: 3.5mm;
          position: relative;
          overflow: hidden;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.08),
            0 4px 12px rgba(0,0,0,0.12),
            0 16px 40px rgba(0,0,0,0.15);
        }

        /* Fond dégradé principal */
        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, #0a1628 0%, #0c2d48 35%, #145a7a 65%, #1a7a6d 100%);
          z-index: 0;
        }

        /* Motif géométrique subtil */
        .card::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 90% 10%, rgba(255,255,255,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 80% at 10% 90%, rgba(26,122,109,0.15) 0%, transparent 50%);
          z-index: 1;
          pointer-events: none;
        }

        /* Bande dorée en haut */
        .gold-strip {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 0.6mm;
          background: linear-gradient(90deg, #c8a84e, #f0d878, #c8a84e);
          z-index: 5;
        }

        .card-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* ── EN-TÊTE ── */
        .header {
          display: flex;
          align-items: center;
          gap: 2.5mm;
          padding: 3mm 4mm 2mm 4mm;
        }

        .logo-circle {
          width: 10mm;
          height: 10mm;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          padding: 0.8mm;
          flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }

        .logo-circle img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: contain;
        }

        .header-info {
          flex: 1;
          min-width: 0;
        }

        .school-name {
          font-size: 6.2pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          line-height: 1.15;
          color: #ffffff;
        }

        .school-sub {
          font-size: 4.8pt;
          color: rgba(255,255,255,0.55);
          margin-top: 0.3mm;
          letter-spacing: 0.04em;
        }

        .badge-carte {
          background: linear-gradient(135deg, #c8a84e, #e8c860);
          color: #0a1628;
          font-size: 4.5pt;
          font-weight: 800;
          padding: 0.8mm 2.2mm;
          border-radius: 1mm;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        /* ── Séparateur doré ── */
        .separator {
          height: 0.3mm;
          margin: 0 4mm;
          background: linear-gradient(90deg, transparent, rgba(200,168,78,0.4) 20%, rgba(200,168,78,0.4) 80%, transparent);
        }

        /* ── CORPS ── */
        .body {
          display: flex;
          padding: 2.5mm 4mm 2mm 4mm;
          gap: 3mm;
          flex: 1;
        }

        /* Photo */
        .photo-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5mm;
          width: 18mm;
          flex-shrink: 0;
        }

        .photo-frame {
          width: 18mm;
          height: 22mm;
          border-radius: 2mm;
          overflow: hidden;
          border: 0.6mm solid rgba(200,168,78,0.5);
          background: rgba(255,255,255,0.08);
        }

        .photo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11pt;
          font-weight: 800;
          color: rgba(255,255,255,0.5);
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        }

        /* Info centrale */
        .info-col {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .student-name {
          font-size: 9pt;
          font-weight: 900;
          line-height: 1.05;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 1.8mm;
          color: #ffffff;
        }

        .fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2mm 2.5mm;
        }

        .field {
          min-width: 0;
        }

        .field-label {
          font-size: 4pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(200,168,78,0.85);
          line-height: 1;
          margin-bottom: 0.2mm;
        }

        .field-value {
          font-size: 6pt;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* QR */
        .qr-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8mm;
          flex-shrink: 0;
        }

        .qr-box {
          width: 17mm;
          height: 17mm;
          background: #ffffff;
          border-radius: 1.8mm;
          padding: 1mm;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .qr-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .qr-label {
          font-size: 3.8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.5);
          text-align: center;
        }

        /* ── PIED ── */
        .footer {
          padding: 1.2mm 4mm 1.8mm 4mm;
          text-align: center;
          font-size: 4.2pt;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
          line-height: 1.3;
        }

        .footer strong {
          color: rgba(255,255,255,0.7);
          font-weight: 700;
        }

        /* ═══════════════════════════════════════════
           IMPRESSION
           ═══════════════════════════════════════════ */
        @page {
          size: 86mm 54mm;
          margin: 0;
        }

        @media print {
          body {
            background: none;
            padding: 0;
            margin: 0;
            min-height: auto;
          }
          .card {
            box-shadow: none;
            page-break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="card">
          <div class="gold-strip"></div>
          <div class="card-inner">

            <div class="header">
              <div class="logo-circle">
                <img src="${SCHOOL_LOGO_PATH}" alt="Logo" />
              </div>
              <div class="header-info">
                <div class="school-name">${escape(sName)}</div>
                <div class="school-sub">${escape(academicYear)}</div>
              </div>
              <div class="badge-carte">Carte Élève</div>
            </div>

            <div class="separator"></div>

            <div class="body">
              <div class="photo-col">
                <div class="photo-frame">
                  ${avatarUrl
                    ? `<img src="${escape(avatarUrl)}" alt="Photo" />`
                    : `<div class="photo-fallback">${escape(getInitials(student))}</div>`
                  }
                </div>
              </div>

              <div class="info-col">
                <div class="student-name">${escape(student.firstName)} ${escape(student.lastName)}</div>
                <div class="fields">
                  <div class="field">
                    <div class="field-label">Matricule</div>
                    <div class="field-value">${escape(student.registrationNumber)}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Classe</div>
                    <div class="field-value">${escape(student.className)}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Date de naissance</div>
                    <div class="field-value">${fmtDate(student.birthDate)}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Sexe</div>
                    <div class="field-value">${escape(gender)}</div>
                  </div>
                </div>
              </div>

              <div class="qr-col">
                <div class="qr-box">
                  <img src="${qrCodeDataUrl}" alt="QR" />
                </div>
                <div class="qr-label">Scanner pour pointer</div>
              </div>
            </div>

            <div class="footer">
              En cas de perte, appelez le <strong>${escape(sPhone)}</strong> — ${escape(sAddress)}
            </div>

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
  }, 500);
}
