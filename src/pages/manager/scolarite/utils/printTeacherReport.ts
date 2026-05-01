// src/pages/manager/scolarite/utils/printTeacherReport.ts

import { TeacherResponse } from '../types';

export function printTeacherReport(
  teachers: TeacherResponse[],
  teacherAttendances: Record<string, any>,
  pointageDate: string,
): void {
  const reportHtml = `
    <html>
      <head>
        <title>Rapport de Présence Professeurs</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Rapport de Présence Professeurs - ${pointageDate}</h2>
        <table>
          <tr>
            <th>Professeur</th>
            <th>Statut</th>
            <th>Heure Arrivée</th>
            <th>Heure Départ</th>
            <th>Note</th>
          </tr>
          ${teachers
            .map(t => {
              const att = teacherAttendances[t.id];
              if (!att) return '';
              return `<tr>
                <td>${t.firstName} ${t.lastName}</td>
                <td>${att.status}</td>
                <td>${att.checkInTime || '-'}</td>
                <td>${att.checkOutTime || '-'}</td>
                <td>${att.note || '-'}</td>
              </tr>`;
            })
            .join('')}
        </table>
      </body>
    </html>
  `;
  const w = window.open();
  if (w) {
    w.document.write(reportHtml);
    w.document.close();
    w.setTimeout(() => w.print(), 500);
  }
}
