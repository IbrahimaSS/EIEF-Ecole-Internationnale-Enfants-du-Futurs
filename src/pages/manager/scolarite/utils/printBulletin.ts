// src/pages/manager/scolarite/utils/printBulletin.ts
// Genere et imprime un bulletin de notes au format EIEF.

import { BulletinData } from "../hooks/useStudentBulletin";

const SCHOOL_LOGO_PATH = "/logo_eief.jpeg";

const COMMON_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    color: #111;
    background: #fff;
    padding: 9mm;
    font-size: 11px;
  }
  .sheet {
    width: 100%;
    max-width: 1020px;
    margin: 0 auto;
  }
  .institution-box {
    display: grid;
    grid-template-columns: 96px 1fr 96px;
    align-items: center;
    gap: 12px;
    border: 1.4px solid #2f2f2f;
    padding: 8px 10px;
  }
  .logo-box {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 92px;
  }
  .logo-box img {
    max-width: 76px;
    max-height: 76px;
    object-fit: contain;
  }
  .logo-fallback {
    width: 76px;
    height: 76px;
    border: 1px solid #2f2f2f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
  }
  .institution-copy {
    text-align: center;
    line-height: 1.2;
  }
  .institution-copy .rep {
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .institution-copy .motto {
    font-size: 11px;
    margin-top: 2px;
  }
  .institution-copy .ministry {
    font-size: 12px;
    margin-top: 4px;
    text-transform: uppercase;
  }
  .institution-copy .school {
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 3px;
  }
  .institution-copy .slogan {
    font-size: 12px;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .institution-copy .phone {
    font-size: 11px;
    margin-top: 3px;
  }

  .title-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 14px;
    align-items: end;
    margin-top: 8px;
  }
  .title-row.single {
    grid-template-columns: 1fr;
  }
  .document-title {
    border: 1.4px solid #2f2f2f;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    text-transform: uppercase;
    padding: 4px 10px;
  }
  .period-box {
    min-width: 250px;
    text-align: center;
  }
  .period-box .period {
    font-size: 17px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .period-box .year {
    font-size: 13px;
    font-weight: bold;
    margin-top: 2px;
  }
  .context-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 8px;
    font-size: 12px;
    font-weight: bold;
  }

  .section-band {
    background: #d7d7d7;
    border: 1px solid #2f2f2f;
    border-bottom: none;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 6px;
  }
  .identity-card {
    border: 1px solid #2f2f2f;
    padding: 8px;
  }
  .identity-layout {
    display: grid;
    grid-template-columns: 84px 1fr 120px;
    gap: 12px;
    align-items: stretch;
  }
  .portrait-box {
    border: 1px solid #6b6b6b;
    min-height: 104px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #f2f2f2 0%, #e3e3e3 100%);
    text-align: center;
    padding: 6px;
  }
  .portrait-image {
    width: 100%;
    height: 72px;
    object-fit: cover;
    border: 1px solid #8a8a8a;
    background: #fff;
  }
  .portrait-initials {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #c7c7c7;
    border: 1px solid #8a8a8a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
  }
  .portrait-caption {
    margin-top: 6px;
    font-size: 9px;
    text-transform: uppercase;
  }
  .identity-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 20px;
    align-content: start;
  }
  .identity-field {
    display: flex;
    gap: 6px;
    min-height: 18px;
  }
  .identity-field.full {
    grid-column: 1 / -1;
  }
  .identity-label {
    min-width: 104px;
    font-weight: bold;
  }
  .identity-value {
    font-weight: bold;
  }
  .code-box {
    border: 1px solid #6b6b6b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
  }
  .code-grid {
    display: grid;
    grid-template-columns: repeat(17, 5px);
    grid-template-rows: repeat(17, 5px);
    gap: 1px;
    background: #fff;
    padding: 4px;
    border: 1px solid #2f2f2f;
  }
  .code-cell {
    width: 5px;
    height: 5px;
    background: #fff;
  }
  .code-cell.on {
    background: #111;
  }
  .code-caption {
    font-size: 9px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
  }
  .grading-note {
    margin: 4px 0 6px 0;
    font-size: 11px;
    font-style: italic;
    font-weight: bold;
  }

  table.bulletin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }
  table.bulletin-table th,
  table.bulletin-table td {
    border: 1px solid #2f2f2f;
    padding: 3px 4px;
    text-align: center;
    vertical-align: middle;
  }
  table.bulletin-table th {
    background: #d7d7d7;
    color: #111;
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
  }
  table.bulletin-table td.subject {
    text-align: left;
    font-weight: bold;
  }
  table.bulletin-table tr.total td {
    background: #efefef;
    font-weight: bold;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 8px;
    align-items: start;
  }
  .panel {
    border: 1px solid #2f2f2f;
  }
  .panel-title {
    background: #d7d7d7;
    border-bottom: 1px solid #2f2f2f;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
  }
  .panel-body {
    padding: 6px;
  }
  .stats-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 12px;
    font-size: 11px;
  }
  .stats-item.full {
    grid-column: 1 / -1;
  }
  .stats-item strong {
    font-weight: bold;
  }
  .observation-note {
    border-top: 1px solid #d0d0d0;
    margin-top: 2px;
    padding-top: 6px;
    line-height: 1.35;
  }
  .decision-strip {
    border: 1px solid #2f2f2f;
    margin-top: 8px;
  }
  .decision-strip .decision-title {
    background: #d7d7d7;
    border-bottom: 1px solid #2f2f2f;
    text-align: center;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .decision-strip .decision-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }
  .decision-cell {
    padding: 6px 8px;
    text-align: center;
    border-right: 1px solid #2f2f2f;
  }
  .decision-cell:last-child {
    border-right: none;
  }
  .decision-label {
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .decision-value {
    font-size: 15px;
    font-weight: bold;
    margin-top: 4px;
  }

  .graph-shell {
    padding: 4px 6px 8px 6px;
  }
  .graph-title {
    text-align: center;
    font-size: 11px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .signature-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 16px;
  }
  .signature-row.triplet {
    grid-template-columns: repeat(3, 1fr);
  }
  .signature-box {
    border: 1px solid #7a7a7a;
    background: #d7d7d7;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    padding: 5px 8px;
    min-height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .signature-name {
    border-top: 1px dotted #666;
    margin-top: 16px;
    padding-top: 4px;
    font-size: 10px;
    font-weight: normal;
    text-transform: none;
    min-height: 18px;
  }

  @page {
    size: A4;
    margin: 7mm;
  }
  @media print {
    body {
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      max-width: none;
    }
  }
`;

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

function fmtNum(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "-";
  return value.toFixed(2).replace(".", ",");
}

function fmtNumCompact(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "-";
  const rounded = Number(value.toFixed(2));
  return String(rounded).replace(".", ",");
}

function fmtRank(rank: number | undefined): string {
  if (rank === undefined) return "-";
  if (rank === 1) return "1er";
  return `${rank}e`;
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

function decisionAnnuelle(average: number | undefined): string {
  if (average === undefined) return "-";
  if (average >= 10) return "Admis(e)";
  if (average >= 8) return "Session";
  return "Redouble";
}

function observationForAverage(average: number | undefined): string {
  if (average === undefined) return "Observations indisponibles.";
  if (average >= 16)
    return "Excellent travail. Maintenir ce niveau d'exigence et de regularite.";
  if (average >= 14)
    return "Tres bon ensemble. Les acquis sont solides et la progression est reguliere.";
  if (average >= 12)
    return "Bon trimestre. Des efforts supplementaires permettront de mieux se distinguer.";
  if (average >= 10)
    return "Resultats encourageants. L'eleve doit consolider ses bases pour gagner en assurance.";
  return "Resultats insuffisants. Un accompagnement renforce et un travail personnel plus soutenu sont attendus.";
}

function getStudentInitials(lastName: string, firstName: string): string {
  return `${(firstName || "?").charAt(0)}${(lastName || "?").charAt(0)}`.toUpperCase();
}

function buildStudentCode(source: string): string {
  const size = 17;
  let seed = 0;

  for (let index = 0; index < source.length; index += 1) {
    seed = (seed * 31 + source.charCodeAt(index)) % 2147483647;
  }

  const next = () => {
    seed = (seed * 48271) % 2147483647;
    return seed;
  };

  const isFinderCell = (x: number, y: number) => {
    const finderZones = [
      { startX: 0, startY: 0 },
      { startX: size - 7, startY: 0 },
      { startX: 0, startY: size - 7 },
    ];

    return finderZones.some((zone) => {
      const inZone =
        x >= zone.startX &&
        x < zone.startX + 7 &&
        y >= zone.startY &&
        y < zone.startY + 7;

      if (!inZone) {
        return false;
      }

      const offsetX = x - zone.startX;
      const offsetY = y - zone.startY;
      const outer =
        offsetX === 0 || offsetX === 6 || offsetY === 0 || offsetY === 6;
      const inner =
        offsetX >= 2 && offsetX <= 4 && offsetY >= 2 && offsetY <= 4;

      return outer || inner;
    });
  };

  let cells = "";

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const active = isFinderCell(x, y) || next() % 3 === 0;
      cells += `<span class="code-cell${active ? " on" : ""}"></span>`;
    }
  }

  return `
    <div class="code-box">
      <div class="code-grid">${cells}</div>
      <div class="code-caption">Code eleve</div>
    </div>
  `;
}

function buildGraph(
  periodSummaries: BulletinData["periodSummaries"],
  title: string,
): string {
  const points = periodSummaries.filter((item) => item.average !== undefined);

  if (points.length === 0) {
    return `
      <div class="graph-shell">
        <div class="graph-title">${escape(title)}</div>
        <div style="border:1px solid #2f2f2f; padding:18px; text-align:center; font-size:11px;">
          Aucune evaluation disponible.
        </div>
      </div>
    `;
  }

  const width = 360;
  const height = 185;
  const paddingLeft = 38;
  const paddingRight = 12;
  const paddingTop = 14;
  const paddingBottom = 34;
  const values = points.map((item) => item.average as number);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  let minY = Math.max(0, Math.floor((rawMin - 0.6) * 2) / 2);
  let maxY = Math.min(20, Math.ceil((rawMax + 0.6) * 2) / 2);

  if (maxY - minY < 2) {
    const center = (maxY + minY) / 2;
    minY = Math.max(0, center - 1);
    maxY = Math.min(20, center + 1);
  }

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;
  const stepX = points.length > 1 ? graphWidth / (points.length - 1) : 0;
  const valueToY = (value: number) =>
    paddingTop + ((maxY - value) / (maxY - minY || 1)) * graphHeight;

  const polyline = points
    .map(
      (item, index) =>
        `${paddingLeft + stepX * index},${valueToY(item.average as number)}`,
    )
    .join(" ");

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const value = minY + ((maxY - minY) / 4) * index;
    const y = paddingTop + graphHeight - (graphHeight / 4) * index;
    return { value, y };
  });

  return `
    <div class="graph-shell">
      <div class="graph-title">${escape(title)}</div>
      <svg width="100%" viewBox="0 0 ${width} ${height}" aria-label="${escape(title)}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="#fff"></rect>
        ${yTicks
          .map(
            (tick) => `
          <line x1="${paddingLeft}" y1="${tick.y}" x2="${width - paddingRight}" y2="${tick.y}" stroke="#d0d0d0" stroke-width="1"></line>
          <text x="${paddingLeft - 8}" y="${tick.y + 3}" text-anchor="end" font-size="9">${fmtNumCompact(tick.value)}</text>
        `,
          )
          .join("")}
        <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="#444" stroke-width="1.2"></line>
        <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="#444" stroke-width="1.2"></line>
        <polyline fill="none" stroke="#5aa6dd" stroke-width="2" points="${polyline}"></polyline>
        ${points
          .map((item, index) => {
            const x = paddingLeft + stepX * index;
            const y = valueToY(item.average as number);
            return `
            <circle cx="${x}" cy="${y}" r="4.5" fill="#5aa6dd" stroke="#2b5c86" stroke-width="1"></circle>
            <text x="${x}" y="${height - 12}" text-anchor="middle" font-size="9">PERIODE ${item.period}</text>
          `;
          })
          .join("")}
      </svg>
    </div>
  `;
}

function buildInstitutionHeader(): string {
  return `
    <div class="institution-box">
      <div class="logo-box">
        <img src="${SCHOOL_LOGO_PATH}" alt="EIEF" onerror="this.outerHTML='&lt;div class=&quot;logo-fallback&quot;&gt;EIEF&lt;/div&gt;'" />
      </div>
      <div class="institution-copy">
        <div class="rep">REPUBLIQUE DE GUINEE</div>
        <div class="motto">Travail - Justice - Solidarite</div>
        <div class="ministry">MEPU-A</div>
        <div class="school">Ecole Internationale Les Enfants du Futur</div>
        <div class="slogan">Faisons Plus</div>
        <div class="phone">+224625549579 / 664039841</div>
      </div>
      <div class="logo-box"></div>
    </div>
  `;
}

function buildIdentitySection(
  data: BulletinData,
  academicYear: string,
  cycle: string,
): string {
  const { student } = data;
  const photoUrl = (student.photoUrl || student.avatarUrl)?.trim();
  const parentName = student.parentName?.trim() || "-";
  const mainTeacherName = data.schoolClass?.mainTeacherName?.trim() || "-";

  return `
    <div class="context-row">
      <div>Cycle : ${escape(cycle)}</div>
      <div>Annee Academique : ${escape(academicYear)}</div>
    </div>
    <div class="section-band">Identite eleve</div>
    <div class="identity-card">
      <div class="identity-layout">
        <div class="portrait-box">
          ${
            photoUrl
              ? `<img class="portrait-image" src="${escape(photoUrl)}" alt="Photo de ${escape(`${student.firstName} ${student.lastName}`)}" />`
              : `<div class="portrait-initials">${escape(getStudentInitials(student.lastName, student.firstName))}</div>`
          }
          <div class="portrait-caption">${photoUrl ? "Photo eleve" : "Photo non disponible"}</div>
        </div>
        <div class="identity-grid">
          <div class="identity-field">
            <span class="identity-label">Matricule :</span>
            <span class="identity-value">${escape(student.registrationNumber)}</span>
          </div>
          <div class="identity-field">
            <span class="identity-label">Classe :</span>
            <span class="identity-value">${escape(student.className)}</span>
          </div>
          <div class="identity-field">
            <span class="identity-label">Nom :</span>
            <span class="identity-value">${escape(student.lastName)}</span>
          </div>
          <div class="identity-field">
            <span class="identity-label">Prenoms :</span>
            <span class="identity-value">${escape(student.firstName)}</span>
          </div>
          <div class="identity-field">
            <span class="identity-label">Date naissance :</span>
            <span class="identity-value">${fmtDate(student.birthDate)}</span>
          </div>
          <div class="identity-field">
            <span class="identity-label">Sexe :</span>
            <span class="identity-value">${escape(student.gender || "-")}</span>
          </div>
          <div class="identity-field">
            <span class="identity-label">Parent / Tuteur :</span>
            <span class="identity-value">${escape(parentName)}</span>
          </div>
          <div class="identity-field">
            <span class="identity-label">Prof principal :</span>
            <span class="identity-value">${escape(mainTeacherName)}</span>
          </div>
          <div class="identity-field full">
            <span class="identity-label">Reference :</span>
            <span class="identity-value">EIEF_${escape(student.registrationNumber)}</span>
          </div>
          <div class="identity-field full">
            <span class="identity-label">Edite le :</span>
            <span class="identity-value">${fmtDate(new Date().toISOString())}</span>
          </div>
        </div>
        ${buildStudentCode(`${student.registrationNumber}-${student.className}-${academicYear}`)}
      </div>
    </div>
    <div class="grading-note">Bareme applique pour les moyennes : 20</div>
  `;
}

function buildPeriodTable(data: BulletinData): string {
  return `
    <table class="bulletin-table">
      <thead>
        <tr>
          <th style="width: 36%; text-align:left;">Matieres</th>
          <th>Moyenne</th>
          <th>Coefficient</th>
          <th>Moyenne Coeff</th>
          <th>Rang</th>
          <th>Mention</th>
        </tr>
      </thead>
      <tbody>
        ${data.rows
          .map(
            (row) => `
          <tr>
            <td class="subject">${escape(row.subjectName)}</td>
            <td>${fmtNum(row.average)}</td>
            <td>${row.coefficient}</td>
            <td>${fmtNum(row.weighted)}</td>
            <td>${fmtRank(row.rank)}</td>
            <td>${escape(row.mention)}</td>
          </tr>
        `,
          )
          .join("")}
        <tr class="total">
          <td class="subject">TOTAL DES POINTS</td>
          <td></td>
          <td>${data.totalCoef}</td>
          <td>${fmtNum(data.totalPoints)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  `;
}

function buildAnnualTable(data: BulletinData, periodsToShow: number[]): string {
  return `
    <table class="bulletin-table">
      <thead>
        <tr>
          <th style="width: 22%; text-align:left;">Matiere</th>
          ${periodsToShow.map((period) => `<th>P${period}</th>`).join("")}
          <th>Moyenne</th>
          <th>Coef</th>
          <th>Moyenne Coef</th>
          <th>Rang</th>
          <th>Appreciation</th>
        </tr>
      </thead>
      <tbody>
        ${data.rows
          .map(
            (row) => `
          <tr>
            <td class="subject">${escape(row.subjectName)}</td>
            ${periodsToShow.map((period) => `<td>${fmtNum(row.byPeriod[period])}</td>`).join("")}
            <td>${fmtNum(row.average)}</td>
            <td>${row.coefficient}</td>
            <td>${fmtNum(row.weighted)}</td>
            <td>${fmtRank(row.rank)}</td>
            <td>${escape(row.mention)}</td>
          </tr>
        `,
          )
          .join("")}
        <tr class="total">
          <td class="subject">TOTAL POINTS DES MOYENNES</td>
          <td colspan="${periodsToShow.length}"></td>
          <td></td>
          <td>${data.totalCoef}</td>
          <td>${fmtNum(data.totalPoints)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  `;
}

function buildSummaryTable(
  periodSummaries: BulletinData["periodSummaries"],
): string {
  return `
    <table class="bulletin-table">
      <thead>
        <tr>
          <th>Evaluation</th>
          <th>Moyenne</th>
          <th>Rang</th>
          <th>Mention</th>
        </tr>
      </thead>
      <tbody>
        ${periodSummaries
          .map(
            (item) => `
          <tr>
            <td>PERIODE ${item.period}</td>
            <td>${fmtNum(item.average)}</td>
            <td>${fmtRank(item.rank)}</td>
            <td>${escape(item.mention)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function buildClassStatsPanel(data: BulletinData): string {
  return `
    <div class="panel">
      <div class="panel-title">Resultats de la classe</div>
      <div class="panel-body">
        <div class="stats-list">
          <div class="stats-item"><strong>Effectif :</strong> ${data.classSize}</div>
          <div class="stats-item"><strong>Moy de la classe :</strong> ${fmtNum(data.classAverage)}</div>
          <div class="stats-item"><strong>Moy plus elevee :</strong> ${fmtNum(data.classMaxAverage)}</div>
          <div class="stats-item"><strong>Moy plus faible :</strong> ${fmtNum(data.classMinAverage)}</div>
        </div>
      </div>
    </div>
  `;
}

function buildPeriodDecisionPanel(data: BulletinData, period: number): string {
  const summary = data.periodSummaries.find((item) => item.period === period);

  return `
    <div class="panel">
      <div class="panel-title">Synthese de la periode</div>
      <div class="panel-body">
        <div class="stats-list">
          <div class="stats-item"><strong>Moyenne eleve :</strong> ${fmtNum(data.generalAverage)}</div>
          <div class="stats-item"><strong>Rang :</strong> ${fmtRank(data.generalRank)}</div>
          <div class="stats-item"><strong>Mention :</strong> ${escape(summary?.mention || data.generalMention)}</div>
          <div class="stats-item"><strong>Evaluation :</strong> PERIODE ${period}</div>
          <div class="stats-item full observation-note"><strong>Observation :</strong> ${escape(observationForAverage(data.generalAverage))}</div>
        </div>
      </div>
    </div>
  `;
}

function buildSignatureRow(data: BulletinData): string {
  const mainTeacherName = data.schoolClass?.mainTeacherName?.trim() || "";

  return `
    <div class="signature-row triplet">
      <div class="signature-box">
        <div>Professeur principal</div>
        <div class="signature-name">${escape(mainTeacherName || " ")}</div>
      </div>
      <div class="signature-box">
        <div>La Direction</div>
        <div class="signature-name">Cachet et signature</div>
      </div>
      <div class="signature-box">
        <div>Parent / Tuteur</div>
        <div class="signature-name">Visa</div>
      </div>
    </div>
  `;
}

function buildAnnualDecisionPanel(data: BulletinData): string {
  return `
    <div class="decision-strip">
      <div class="decision-title">Decision de fin d'annee</div>
      <div class="decision-grid">
        <div class="decision-cell">
          <div class="decision-label">Moyenne annuelle</div>
          <div class="decision-value">${fmtNum(data.generalAverage)}</div>
        </div>
        <div class="decision-cell">
          <div class="decision-label">Rang</div>
          <div class="decision-value">${fmtRank(data.generalRank)}</div>
        </div>
        <div class="decision-cell">
          <div class="decision-label">Decision</div>
          <div class="decision-value">${escape(decisionAnnuelle(data.generalAverage))}</div>
        </div>
        <div class="decision-cell">
          <div class="decision-label">Mention</div>
          <div class="decision-value">${escape(data.generalMention)}</div>
        </div>
      </div>
    </div>
  `;
}

function buildPage(title: string, body: string): string {
  return `<!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>${escape(title)}</title>
      <style>${COMMON_CSS}</style>
    </head>
    <body>
      <div class="sheet">${body}</div>
    </body>
  </html>`;
}

function openPrintWindow(title: string, html: string): void {
  const printWindow = window.open("", "_blank", "width=1200,height=900");

  if (!printWindow) {
    window.alert("Veuillez autoriser les popups pour imprimer le bulletin.");
    return;
  }

  printWindow.document.write(buildPage(title, html));
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 450);
}

export function printBulletinPeriode(data: BulletinData, period: number): void {
  const cycle = (data.schoolClass?.level || "").toUpperCase() || "-";
  const academicYear = data.schoolClass?.academicYearName || "-";

  const html = `
    ${buildInstitutionHeader()}
    <div class="title-row">
      <div class="document-title">Bulletin de Notes</div>
      <div class="period-box">
        <div class="period">Periode ${period}</div>
        <div class="year">Annee Academique : ${escape(academicYear)}</div>
      </div>
    </div>

    ${buildIdentitySection(data, academicYear, cycle)}
    ${buildPeriodTable(data)}

    <div class="summary-grid">
      <div class="panel">
        <div class="panel-title">Evaluations</div>
        <div class="panel-body">${buildSummaryTable(data.periodSummaries)}</div>
      </div>
      <div class="panel">
        <div class="panel-title">Graphe des evaluations</div>
        ${buildGraph(data.periodSummaries, "Graphe des evaluations")}
      </div>
    </div>

    <div class="summary-grid">
      ${buildClassStatsPanel(data)}
      ${buildPeriodDecisionPanel(data, period)}
    </div>

    ${buildSignatureRow(data)}
  `;

  openPrintWindow(
    `Bulletin Periode ${period} - ${data.student.lastName} ${data.student.firstName}`,
    html,
  );
}

export function printBulletinAnnuel(data: BulletinData): void {
  const cycle = (data.schoolClass?.level || "").toUpperCase() || "-";
  const academicYear = data.schoolClass?.academicYearName || "-";
  const periodsToShow =
    data.periods.length > 0 ? data.periods : [1, 2, 3, 4, 5];

  const html = `
    ${buildInstitutionHeader()}
    <div class="title-row single">
      <div class="document-title">Bulletin de Notes de Fin d'Annee</div>
    </div>

    ${buildIdentitySection(data, academicYear, cycle)}
    ${buildAnnualTable(data, periodsToShow)}

    <div class="summary-grid">
      <div class="panel">
        <div class="panel-title">Decision de fin d'annee</div>
        <div class="panel-body">${buildSummaryTable(data.periodSummaries)}</div>
      </div>
      <div class="panel">
        <div class="panel-title">Graphe des moyennes</div>
        ${buildGraph(data.periodSummaries, "Graphe des moyennes")}
      </div>
    </div>

    <div class="summary-grid">
      ${buildClassStatsPanel(data)}
      <div class="panel">
        <div class="panel-title">Decision annuelle</div>
        <div class="panel-body">
          <div class="stats-list">
            <div class="stats-item"><strong>Moyenne annuelle :</strong> ${fmtNum(data.generalAverage)}</div>
            <div class="stats-item"><strong>Rang :</strong> ${fmtRank(data.generalRank)}</div>
            <div class="stats-item"><strong>Decision :</strong> ${escape(decisionAnnuelle(data.generalAverage))}</div>
            <div class="stats-item"><strong>Mention :</strong> ${escape(data.generalMention)}</div>
            <div class="stats-item full observation-note"><strong>Observation :</strong> ${escape(observationForAverage(data.generalAverage))}</div>
          </div>
        </div>
      </div>
    </div>

    ${buildAnnualDecisionPanel(data)}

    ${buildSignatureRow(data)}
  `;

  openPrintWindow(
    `Bulletin Annuel - ${data.student.lastName} ${data.student.firstName}`,
    html,
  );
}
