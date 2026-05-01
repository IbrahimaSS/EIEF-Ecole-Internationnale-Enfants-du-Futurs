// src/pages/manager/scolarite/hooks/useStudentBulletin.ts
// Calcule les donnees d'un bulletin (par periode ou annuel) pour un eleve.

import { useCallback, useState } from 'react';
import { apiFetch } from '../api';
import {
  ClassResponse,
  GradeResponse,
  ScheduleResponse,
  StudentResponse,
  SubjectResponse,
} from '../types';

export interface BulletinSubjectRow {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  /** Moyenne par periode (cle = numero periode 1..5). undefined si pas de note. */
  byPeriod: Record<number, number | undefined>;
  /** Moyenne generale de la matiere (toutes periodes confondues). */
  average: number | undefined;
  /** Moyenne x coefficient. */
  weighted: number;
  /** Mention pour la moyenne. */
  mention: string;
  /** Rang dans la matiere (par rapport aux autres eleves de la classe). */
  rank?: number;
}

export interface BulletinPeriodSummary {
  period: number;
  average: number | undefined;
  rank?: number;
  mention: string;
}

export interface BulletinData {
  student: StudentResponse;
  schoolClass: ClassResponse | null;
  /** Periodes detectees dans les notes (ex: [1,2,3,4]). */
  periods: number[];
  /** Lignes du tableau des matieres. */
  rows: BulletinSubjectRow[];
  /** Total coefficient. */
  totalCoef: number;
  /** Total des points (somme des moyennes ponderees). */
  totalPoints: number;
  /** Moyenne generale de l'eleve (totalPoints / totalCoef). */
  generalAverage: number | undefined;
  /** Mention de l'eleve. */
  generalMention: string;
  /** Rang de l'eleve dans la classe. */
  generalRank?: number;
  /** Recap par periode. */
  periodSummaries: BulletinPeriodSummary[];
  /** Effectif de la classe. */
  classSize: number;
  /** Moyennes plus elevee/plus faible/moyenne de la classe (pour la periode demandee). */
  classMaxAverage?: number;
  classMinAverage?: number;
  classAverage?: number;
}

export function mentionForAverage(avg: number | undefined): string {
  if (avg === undefined || Number.isNaN(avg)) return '-';
  if (avg >= 18) return 'EXCELLENT';
  if (avg >= 16) return 'TRES BIEN';
  if (avg >= 14) return 'BIEN';
  if (avg >= 12) return 'ASSEZ BIEN';
  if (avg >= 10) return 'PASSABLE';
  return 'INSUFFISANT';
}

function mean(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function useStudentBulletin() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BulletinData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBulletin = useCallback(
    async (params: {
      student: StudentResponse;
      classes: ClassResponse[];
      students: StudentResponse[];
      subjects: SubjectResponse[];
      schedules: ScheduleResponse[];
      /** Periode (1..5) ou null pour annuel. */
      period: number | null;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { student, classes, students, subjects, schedules, period } = params;

        // 1. Trouver la classe de l'eleve
        const schoolClass = classes.find(c => c.name === student.className) ?? null;

        // 2. Liste des eleves de la classe
        const classmates = students.filter(s => s.className === student.className);
        const classSize = classmates.length;

        // 3. Liste des matieres enseignees a cette classe (deduit des emplois du temps)
        const classSubjectIds = new Set(
          schedules
            .filter(s => schoolClass && s.classId === schoolClass.id)
            .map(s => s.subjectId),
        );
        const classSubjects = subjects.filter(sub => classSubjectIds.has(sub.id));
        // Si aucun schedule, on prend tous les subjects (fallback)
        const subjectsToUse = classSubjects.length > 0 ? classSubjects : subjects;

        // 4. Recuperer les notes de TOUS les eleves de la classe (en parallele)
        // pour calculer les rangs.
        const allGrades = await Promise.all(
          classmates.map(async (s) => {
            try {
              const grades = await apiFetch<GradeResponse[]>(`/grades/student/${s.id}`);
              return { studentId: s.id, grades: grades ?? [] };
            } catch {
              return { studentId: s.id, grades: [] };
            }
          }),
        );

        const myGrades = allGrades.find(g => g.studentId === student.id)?.grades ?? [];

        // Detecter les periodes presentes
        const periodsSet = new Set<number>();
        myGrades.forEach(g => g.semester && periodsSet.add(Number(g.semester)));
        allGrades.forEach(({ grades }) =>
          grades.forEach(g => g.semester && periodsSet.add(Number(g.semester))),
        );
        const periods = Array.from(periodsSet).sort((a, b) => a - b);

        // 5. Calculer pour chaque matiere les moyennes par periode et globale
        const rows: BulletinSubjectRow[] = subjectsToUse.map(sub => {
          const subjectGrades = myGrades.filter(g => g.subjectId === sub.id);

          const byPeriod: Record<number, number | undefined> = {};
          periods.forEach(p => {
            const periodGrades = subjectGrades.filter(g => Number(g.semester) === p);
            const avg = mean(periodGrades.map(g => Number(g.value)));
            byPeriod[p] = avg !== undefined ? round2(avg) : undefined;
          });

          // Si periode demandee : moyenne = moyenne de cette periode
          // Si annuel : moyenne = moyenne des moyennes par periode
          let average: number | undefined;
          if (period !== null) {
            average = byPeriod[period];
          } else {
            const periodAverages = Object.values(byPeriod).filter(
              (v): v is number => v !== undefined,
            );
            average = periodAverages.length > 0
              ? round2(mean(periodAverages) as number)
              : undefined;
          }

          const weighted = average !== undefined ? round2(average * sub.coefficient) : 0;
          return {
            subjectId: sub.id,
            subjectName: sub.name,
            coefficient: sub.coefficient,
            byPeriod,
            average,
            weighted,
            mention: mentionForAverage(average),
          };
        });

        // 6. Calculer le rang par matiere
        rows.forEach(row => {
          const subjectAveragesByStudent = classmates.map(s => {
            const grades = allGrades.find(g => g.studentId === s.id)?.grades ?? [];
            const subjGrades = grades.filter(g => g.subjectId === row.subjectId);
            if (period !== null) {
              const periodG = subjGrades.filter(g => Number(g.semester) === period);
              return { studentId: s.id, avg: mean(periodG.map(g => Number(g.value))) };
            }
            // Annuel
            const allP = new Set(subjGrades.map(g => Number(g.semester)));
            const periodAvgs = Array.from(allP).map(p => {
              const pg = subjGrades.filter(g => Number(g.semester) === p);
              return mean(pg.map(g => Number(g.value)));
            }).filter((v): v is number => v !== undefined);
            return { studentId: s.id, avg: periodAvgs.length > 0 ? mean(periodAvgs) : undefined };
          });
          const sorted = subjectAveragesByStudent
            .filter(s => s.avg !== undefined)
            .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
          const idx = sorted.findIndex(s => s.studentId === student.id);
          row.rank = idx >= 0 ? idx + 1 : undefined;
        });

        // 7. Total coefficient + total points + moyenne generale
        const totalCoef = rows
          .filter(r => r.average !== undefined)
          .reduce((s, r) => s + r.coefficient, 0);
        const totalPoints = rows.reduce((s, r) => s + r.weighted, 0);
        const generalAverage = totalCoef > 0 ? round2(totalPoints / totalCoef) : undefined;
        const generalMention = mentionForAverage(generalAverage);

        // 8. Recap par periode (toutes periodes affichees, meme en mode periode unique)
        const computeStudentGeneralAvg = (
          grades: GradeResponse[],
          targetPeriod: number | null,
        ): number | undefined => {
          const subjAvgs: { weighted: number; coef: number }[] = [];
          subjectsToUse.forEach(sub => {
            const sg = grades.filter(g => g.subjectId === sub.id);
            let avg: number | undefined;
            if (targetPeriod !== null) {
              const pg = sg.filter(g => Number(g.semester) === targetPeriod);
              avg = mean(pg.map(g => Number(g.value)));
            } else {
              const ps = new Set(sg.map(g => Number(g.semester)));
              const pAvgs = Array.from(ps)
                .map(p => mean(sg.filter(g => Number(g.semester) === p).map(g => Number(g.value))))
                .filter((v): v is number => v !== undefined);
              avg = pAvgs.length > 0 ? mean(pAvgs) : undefined;
            }
            if (avg !== undefined) {
              subjAvgs.push({ weighted: avg * sub.coefficient, coef: sub.coefficient });
            }
          });
          const tCoef = subjAvgs.reduce((s, x) => s + x.coef, 0);
          const tPts = subjAvgs.reduce((s, x) => s + x.weighted, 0);
          return tCoef > 0 ? round2(tPts / tCoef) : undefined;
        };

        // Pour chaque periode, calcul moyenne et rang
        const periodSummaries: BulletinPeriodSummary[] = periods.map(p => {
          const studentAvg = computeStudentGeneralAvg(myGrades, p);
          // Rang dans la classe pour cette periode
          const allAvgs = classmates.map(s => {
            const g = allGrades.find(gg => gg.studentId === s.id)?.grades ?? [];
            return { studentId: s.id, avg: computeStudentGeneralAvg(g, p) };
          });
          const sorted = allAvgs
            .filter(a => a.avg !== undefined)
            .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
          const idx = sorted.findIndex(a => a.studentId === student.id);
          return {
            period: p,
            average: studentAvg,
            rank: idx >= 0 ? idx + 1 : undefined,
            mention: mentionForAverage(studentAvg),
          };
        });

        // 9. Stats classe (pour la periode demandee, ou annuel)
        const allGenerals = classmates
          .map(s => {
            const g = allGrades.find(gg => gg.studentId === s.id)?.grades ?? [];
            return computeStudentGeneralAvg(g, period);
          })
          .filter((v): v is number => v !== undefined);

        const classMaxAverage = allGenerals.length > 0 ? Math.max(...allGenerals) : undefined;
        const classMinAverage = allGenerals.length > 0 ? Math.min(...allGenerals) : undefined;
        const classAvgValue = allGenerals.length > 0 ? mean(allGenerals) : undefined;

        // Rang general de l'eleve
        const sortedGenerals = classmates
          .map(s => {
            const g = allGrades.find(gg => gg.studentId === s.id)?.grades ?? [];
            return { studentId: s.id, avg: computeStudentGeneralAvg(g, period) };
          })
          .filter(a => a.avg !== undefined)
          .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
        const myIdx = sortedGenerals.findIndex(a => a.studentId === student.id);

        const result: BulletinData = {
          student,
          schoolClass,
          periods: periods.length > 0 ? periods : [1, 2, 3, 4, 5],
          rows,
          totalCoef,
          totalPoints: round2(totalPoints),
          generalAverage,
          generalMention,
          generalRank: myIdx >= 0 ? myIdx + 1 : undefined,
          periodSummaries,
          classSize,
          classMaxAverage: classMaxAverage !== undefined ? round2(classMaxAverage) : undefined,
          classMinAverage: classMinAverage !== undefined ? round2(classMinAverage) : undefined,
          classAverage: classAvgValue !== undefined ? round2(classAvgValue) : undefined,
        };

        setData(result);
        return result;
      } catch (e: any) {
        setError(e?.message ?? 'Erreur de chargement du bulletin.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetchBulletin, reset };
}
