// src/pages/manager/scolarite/utils/printBulletin.ts
// Genere et imprime un bulletin de notes au format EIEF (Republique de Guinee).

import { BulletinData } from '../hooks/useStudentBulletin';

const HEADER_HTML = `
  <div class="header">
    <div class="header-left">
      <div class="rep">REPUBLIQUE DE GUINEE</div>
      <div class="motto">Travail - Justice - Solidarite</div>
      <div class="ministry">MEPU-A</div>
    </div>
    <div class="header-center">
      <div class="school">ECOLE INTERNATIONALE LES ENFANTS DU FUTUR</div>
      <div class="slogan">FAISONS PLUS</div>
      <div class="tel">+224 625 549 579 / 664 039 841</div>
    </div>
    <div class="header-right"></div>
  </div>
`;

const COMMON_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    color: #000;
    background: #fff;
    padding: 24px;
    font-size: 11px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #000;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .header-left, .header-right { width: 25%; text-align: center; font-size: 10px; }
  .header-center { width: 50%; text-align: center; }
  .rep { font-weight: bold; font-size: 11px; }
  .motto { font-style: italic; font-size: 9px; margin-bottom: 4px; }
  .ministry { font-weight: bold; font-size: 10px; }
  .school { font-weight: bold; font-size: 13px; text-transform: uppercase; }
  .slogan { font-style: italic; font-size: 10px; margin: 2px 0; }
  .tel { font-size: 9px; }

  .title-block {
    text-align: center;
    margin: 12px 0 16px 0;
  }
  .title-block .badge {
    display: inline-block;
    padding: 6px 24px;
    background: #1e3a8a;
    color: #fff;
    font-weight: bold;
    font-size: 13px;
    margin-bottom: 6px;
    border-radius: 4px;
  }
  .title-block .main-title {
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
    text-decoration: underline;
  }

  .meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 16px;
    margin-bottom: 14px;
    font-size: 11px;
  }
  .meta .row { display: flex; gap: 6px; }
  .meta .label { font-weight: bold; min-width: 130px; }

  table.grades {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    font-size: 10px;
  }
  table.grades th, table.grades td {
    border: 1px solid #000;
    padding: 5px 6px;
    text-align: center;
  }
  table.grades th {
    background: #1e3a8a;
    color: #fff;
    font-size: 10px;
    text-transform: uppercase;
  }
  table.grades td.matiere {
    text-align: left;
    font-weight: bold;
  }
  table.grades tr.total td {
    font-weight: bold;
    background: #f3f4f6;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 14px;
  }
  .summary-block {
    border: 1px solid #000;
    padding: 8px;
  }
  .summary-block .title {
    font-weight: bold;
    font-size: 11px;
    margin-bottom: 6px;
    text-align: center;
    background: #1e3a8a;
    color: #fff;
    padding: 4px;
  }
  .summary-block table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }
  .summary-block table td, .summary-block table th {
    border: 1px solid #000;
    padding: 4px;
    text-align: center;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 8px;
    font-size: 10px;
  }
  .stats-row .item { padding: 4px 8px; }
  .stats-row .label { font-weight: bold; }

  .footer-signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin-top: 32px;
    text-align: center;
  }
  .footer-signatures .sig {
    border-top: 1px solid #000;
    padding-top: 6px;
    font-weight: bold;
    font-size: 11px;
  }

  .decision-final {
    margin-top: 16px;
    padding: 10px;
    border: 2px solid #1e3a8a;
    background: #eff6ff;
  }
  .decision-final .title {
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 8px;
    color: #1e3a8a;
  }
  .decision-final .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    text-align: center;
    font-size: 11px;
  }
  .decision-final .grid .label { font-weight: bold; font-size: 10px; }
  .decision-final .grid .value { font-size: 14px; font-weight: bold; }

  @media print {
    body { padding: 12mm; }
    @page { size: A4; margin: 8mm; }
  }
`;

function escape(s: string | undefined | null): string {
  if (s === undefined || s === null) return '';
  return String(s).replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c] || c));
}

function fmtNum(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return '-';
  return n.toFixed(2).replace('.', ',');
}

function fmtRank(n: number | undefined): string {
  if (n === undefined) return '-';
  if (n === 1) return '1er';
  return `${n}e`;
}

function decisionAnnuelle(avg: number | undefined): string {
  if (avg === undefined) return '-';
  if (avg >= 10) return 'Admis(e)';
  if (avg >= 8) return 'Session de rattrapage';
  return 'Redouble';
}

/** Bulletin de periode (un trimestre/semestre donne). */
export function printBulletinPeriode(data: BulletinData, period: number): void {
  const { student, schoolClass, rows, totalCoef, totalPoints, generalAverage,
          generalMention, generalRank, periodSummaries, classSize,
          classAverage, classMaxAverage, classMinAverage } = data;

  const cycle = (schoolClass?.level || '').toUpperCase();
  const academicYear = schoolClass?.academicYearName || '-';

  const html = `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8" />
    <title>Bulletin Periode ${period} - ${escape(student.lastName)} ${escape(student.firstName)}</title>
    <style>${COMMON_CSS}</style>
  </head><body>
    ${HEADER_HTML}

    <div class="title-block">
      <div class="badge">PERIODE ${period}</div>
      <div class="main-title">Bulletin de Notes</div>
    </div>

    <div class="meta">
      <div class="row"><span class="label">Cycle :</span> ${escape(cycle)}</div>
      <div class="row"><span class="label">Annee Academique :</span> ${escape(academicYear)}</div>
      <div class="row"><span class="label">Matricule :</span> ${escape(student.registrationNumber)}</div>
      <div class="row"><span class="label">Classe :</span> ${escape(student.className)}</div>
      <div class="row"><span class="label">Nom :</span> ${escape(student.lastName)}</div>
      <div class="row"><span class="label">Prenoms :</span> ${escape(student.firstName)}</div>
      <div class="row"><span class="label">Date Naissance :</span> ${escape(student.birthDate)}</div>
      <div class="row"><span class="label">Sexe :</span> ${escape(student.gender)}</div>
    </div>

    <table class="grades">
      <thead>
        <tr>
          <th style="width: 32%; text-align:left;">Matieres</th>
          <th>Moyenne</th>
          <th>Coefficient</th>
          <th>Moyenne Coeff</th>
          <th>Rang</th>
          <th>Mention</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td class="matiere">${escape(r.subjectName)}</td>
            <td>${fmtNum(r.average)}</td>
            <td>${r.coefficient}</td>
            <td>${fmtNum(r.weighted)}</td>
            <td>${fmtRank(r.rank)}</td>
            <td>${escape(r.mention)}</td>
          </tr>
        `).join('')}
        <tr class="total">
          <td class="matiere">TOTAL DES POINTS</td>
          <td></td>
          <td>${totalCoef}</td>
          <td>${fmtNum(totalPoints)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="summary-grid">
      <div class="summary-block">
        <div class="title">Recapitulatif des Periodes</div>
        <table>
          <tr><th>Evaluation</th><th>Moy/20</th><th>Rang</th><th>Mention</th></tr>
          ${periodSummaries.map(s => `
            <tr>
              <td>PERIODE ${s.period}</td>
              <td>${fmtNum(s.average)}</td>
              <td>${fmtRank(s.rank)}</td>
              <td>${escape(s.mention)}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="summary-block">
        <div class="title">Resultats de la Classe</div>
        <div class="stats-row">
          <div class="item"><span class="label">Effectif :</span> ${classSize}</div>
          <div class="item"><span class="label">Moy. classe :</span> ${fmtNum(classAverage)}</div>
          <div class="item"><span class="label">Moy. plus elevee :</span> ${fmtNum(classMaxAverage)}</div>
          <div class="item"><span class="label">Moy. plus faible :</span> ${fmtNum(classMinAverage)}</div>
        </div>
        <div style="margin-top: 10px; padding: 6px; background: #1e3a8a; color: #fff; text-align: center; font-weight: bold;">
          Moyenne de l'eleve : ${fmtNum(generalAverage)}/20 &nbsp;-&nbsp; Rang : ${fmtRank(generalRank)} &nbsp;-&nbsp; ${escape(generalMention)}
        </div>
      </div>
    </div>

    <div class="footer-signatures">
      <div class="sig">Visa de la DIRECTION</div>
      <div class="sig">Visa du Parent / Tuteur</div>
    </div>

  </body></html>`;

  const win = window.open('', '_blank', 'width=1100,height=800');
  if (!win) {
    alert('Veuillez autoriser les popups pour imprimer le bulletin.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

/** Bulletin de fin d'annee (recap toutes periodes). */
export function printBulletinAnnuel(data: BulletinData): void {
  const { student, schoolClass, periods, rows, totalCoef, totalPoints,
          generalAverage, generalMention, generalRank, periodSummaries,
          classSize, classAverage, classMaxAverage, classMinAverage } = data;

  const cycle = (schoolClass?.level || '').toUpperCase();
  const academicYear = schoolClass?.academicYearName || '-';

  // Determine periods to show (au moins celles avec des notes, sinon 1..5)
  const periodsToShow = periods.length > 0 ? periods : [1, 2, 3, 4, 5];

  const html = `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8" />
    <title>Bulletin Annuel - ${escape(student.lastName)} ${escape(student.firstName)}</title>
    <style>${COMMON_CSS}</style>
  </head><body>
    ${HEADER_HTML}

    <div class="title-block">
      <div class="main-title">Bulletin de Notes de Fin d'Annee</div>
    </div>

    <div class="meta">
      <div class="row"><span class="label">Cycle :</span> ${escape(cycle)}</div>
      <div class="row"><span class="label">Annee Academique :</span> ${escape(academicYear)}</div>
      <div class="row"><span class="label">Matricule :</span> ${escape(student.registrationNumber)}</div>
      <div class="row"><span class="label">Classe :</span> ${escape(student.className)}</div>
      <div class="row"><span class="label">Nom :</span> ${escape(student.lastName)}</div>
      <div class="row"><span class="label">Prenoms :</span> ${escape(student.firstName)}</div>
      <div class="row"><span class="label">Date Naissance :</span> ${escape(student.birthDate)}</div>
      <div class="row"><span class="label">Bareme :</span> 20</div>
    </div>

    <table class="grades">
      <thead>
        <tr>
          <th style="width: 24%; text-align:left;">Matieres</th>
          ${periodsToShow.map(p => `<th>P${p}</th>`).join('')}
          <th>Moyenne</th>
          <th>Coef</th>
          <th>Moy x Coef</th>
          <th>Rang</th>
          <th>Mention</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td class="matiere">${escape(r.subjectName)}</td>
            ${periodsToShow.map(p => `<td>${fmtNum(r.byPeriod[p])}</td>`).join('')}
            <td>${fmtNum(r.average)}</td>
            <td>${r.coefficient}</td>
            <td>${fmtNum(r.weighted)}</td>
            <td>${fmtRank(r.rank)}</td>
            <td>${escape(r.mention)}</td>
          </tr>
        `).join('')}
        <tr class="total">
          <td class="matiere">TOTAL POINTS DES MOYENNES</td>
          <td colspan="${periodsToShow.length}"></td>
          <td></td>
          <td>${totalCoef}</td>
          <td>${fmtNum(totalPoints)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="summary-block" style="margin-top: 14px;">
      <div class="title">Decision par Periode</div>
      <table>
        <tr><th>Evaluation</th><th>Moyenne</th><th>Rang</th><th>Mention</th></tr>
        ${periodSummaries.map(s => `
          <tr>
            <td>PERIODE ${s.period}</td>
            <td>${fmtNum(s.average)}</td>
            <td>${fmtRank(s.rank)}</td>
            <td>${escape(s.mention)}</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <div class="summary-grid" style="margin-top: 14px;">
      <div class="summary-block">
        <div class="title">Resultats de la Classe</div>
        <div class="stats-row">
          <div class="item"><span class="label">Effectif :</span> ${classSize}</div>
          <div class="item"><span class="label">Moy. classe :</span> ${fmtNum(classAverage)}</div>
          <div class="item"><span class="label">Moy. plus elevee :</span> ${fmtNum(classMaxAverage)}</div>
          <div class="item"><span class="label">Moy. plus faible :</span> ${fmtNum(classMinAverage)}</div>
        </div>
      </div>
      <div class="summary-block">
        <div class="title">Mention Annuelle</div>
        <div style="text-align:center; padding: 12px; font-size: 16px; font-weight: bold;">
          ${escape(generalMention)}
        </div>
      </div>
    </div>

    <div class="decision-final">
      <div class="title">Decision de Fin d'Annee</div>
      <div class="grid">
        <div>
          <div class="label">Moyenne Annuelle</div>
          <div class="value">${fmtNum(generalAverage)}/20</div>
        </div>
        <div>
          <div class="label">Rang</div>
          <div class="value">${fmtRank(generalRank)}</div>
        </div>
        <div>
          <div class="label">Decision</div>
          <div class="value">${decisionAnnuelle(generalAverage)}</div>
        </div>
      </div>
    </div>

    <div class="footer-signatures">
      <div class="sig">LA DIRECTION</div>
      <div class="sig">Visa du Parent / Tuteur</div>
    </div>

  </body></html>`;

  const win = window.open('', '_blank', 'width=1100,height=800');
  if (!win) {
    alert('Veuillez autoriser les popups pour imprimer le bulletin.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}
