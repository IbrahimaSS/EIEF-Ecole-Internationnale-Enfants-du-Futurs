// src/pages/manager/scolarite/utils/printSchedule.ts
// Génère et imprime un emploi du temps PDF/HTML pour une classe.

import { ClassResponse, ScheduleResponse } from '../types';
import { DAYS } from '../constants';

export function printSchedule(
  cls: ClassResponse,
  slots: ScheduleResponse[],
  onError?: (message: string) => void,
): void {
  const slotsByDay = DAYS.map((_day, i) =>
    slots.filter(s => s.dayOfWeek === i + 1),
  );

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>Emploi du temps — ${cls.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1a1a2e;
          background: #fff;
          padding: 32px;
        }
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 3px solid #1e40af;
          margin-bottom: 24px;
        }
        .school-name {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .doc-title {
          font-size: 24px;
          font-weight: 800;
          color: #1e40af;
          line-height: 1.1;
        }
        .class-name {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-top: 2px;
        }
        .meta-block {
          text-align: right;
          font-size: 10px;
          color: #9ca3af;
          line-height: 1.8;
        }
        .meta-block strong { color: #374151; }
        .info-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .info-chip {
          flex: 1;
          padding: 10px 16px;
          background: #f0f4ff;
          border-radius: 10px;
          border-left: 4px solid #1e40af;
        }
        .info-chip label {
          display: block;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 2px;
        }
        .info-chip span {
          font-size: 13px;
          font-weight: 700;
          color: #1e40af;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-bottom: 32px;
        }
        .day-col { display: flex; flex-direction: column; gap: 6px; }
        .day-header {
          background: #1e40af;
          color: #fff;
          text-align: center;
          padding: 8px 4px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .slot {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-left: 4px solid #1e40af;
          border-radius: 8px;
          padding: 8px 8px 8px 10px;
          min-height: 64px;
        }
        .slot-time {
          font-size: 9px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 3px;
        }
        .slot-subject {
          font-size: 11px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2px;
          line-height: 1.2;
        }
        .slot-teacher { font-size: 9px; color: #6b7280; }
        .slot-room {
          font-size: 8px;
          color: #9ca3af;
          margin-top: 2px;
          font-style: italic;
        }
        .empty-day {
          background: #f9fafb;
          border: 1px dashed #e5e7eb;
          border-radius: 8px;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: #d1d5db;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          font-size: 9px;
          color: #9ca3af;
        }
        .footer strong { color: #374151; }
        @media print {
          body { padding: 16px; }
          @page { margin: 12mm; size: A4 landscape; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="school-name">Institut Enfants Future</div>
          <div class="doc-title">Emploi du temps</div>
          <div class="class-name">${cls.name}${cls.level ? ` — ${cls.level}` : ''}</div>
        </div>
        <div class="meta-block">
          <div><strong>Année académique :</strong> ${cls.academicYearName || '—'}</div>
          <div><strong>Prof. principal :</strong> ${cls.mainTeacherName || 'Non défini'}</div>
          <div><strong>Effectif :</strong> ${cls.studentCount} / ${cls.maxStudents} élèves</div>
          <div><strong>Imprimé le :</strong> ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div><strong>Créneaux :</strong> ${slots.length} au total</div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-chip"><label>Classe</label><span>${cls.name}</span></div>
        <div class="info-chip"><label>Niveau</label><span>${cls.level || '—'}</span></div>
        <div class="info-chip"><label>Créneaux / semaine</label><span>${slots.length}</span></div>
        <div class="info-chip"><label>Matières</label><span>${new Set(slots.map(s => s.subjectName)).size}</span></div>
      </div>

      <div class="grid">
        ${DAYS.map((day, i) => {
          const daySlots = slotsByDay[i];
          return `
            <div class="day-col">
              <div class="day-header">${day}</div>
              ${
                daySlots.length === 0
                  ? `<div class="empty-day">—</div>`
                  : daySlots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(
                        s => `
                        <div class="slot">
                          <div class="slot-time">${s.startTime} – ${s.endTime}</div>
                          <div class="slot-subject">${s.subjectName}</div>
                          ${s.teacherName ? `<div class="slot-teacher">${s.teacherName}</div>` : ''}
                          ${s.room ? `<div class="slot-room">📍 ${s.room}</div>` : ''}
                        </div>
                      `,
                      )
                      .join('')
              }
            </div>
          `;
        }).join('')}
      </div>

      <div class="footer">
        <span>Document généré automatiquement — Institut Enfants Future</span>
        <span><strong>${cls.name}</strong> • Année ${cls.academicYearName || '—'}</span>
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=1100,height=700');
  if (!win) {
    onError?.('Veuillez autoriser les popups pour imprimer.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}
