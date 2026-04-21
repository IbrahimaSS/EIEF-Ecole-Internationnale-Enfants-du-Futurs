// utils/scheduleUtils.ts

import { ScheduleResponse } from "../types/schedule";

// Correspondance dayOfWeek (Java: 1=Lundi...6=Samedi) → label affiché
export const DAY_LABELS: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
};

export const SUBJECT_COLORS: string[] = [
  "blue", "indigo", "violet", "amber", "emerald", "rose", "cyan", "orange",
];

/**
 * Attribue une couleur cohérente à chaque matière (basé sur son nom).
 * Même matière → même couleur dans toute l'application.
 */
export const getSubjectColor = (subjectName: string): string => {
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

/**
 * Convertit "HH:mm" en nombre décimal d'heures (ex: "08:30" → 8.5).
 */
export const timeToDecimal = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
};

/**
 * Calcule la durée en heures entre startTime et endTime.
 */
export const getDuration = (start: string, end: string): number =>
  timeToDecimal(end) - timeToDecimal(start);

/**
 * Retourne le cours qui est actuellement en cours (si existant).
 */
export const getCurrentCourse = (
  schedules: ScheduleResponse[],
): ScheduleResponse | null => {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Dimanche, 1=Lundi...
  // Java backend: 1=Lundi, ..., 7=Dimanche → adapter
  const javaDayOfWeek = currentDay === 0 ? 7 : currentDay;

  const todayCourses = schedules.filter((s) => s.dayOfWeek === javaDayOfWeek);

  const currentDecimal =
    now.getHours() + now.getMinutes() / 60;

  return (
    todayCourses.find((s) => {
      const start = timeToDecimal(s.startTime);
      const end = timeToDecimal(s.endTime);
      return currentDecimal >= start && currentDecimal < end;
    }) ?? null
  );
};

/**
 * Retourne le prochain cours après le cours actuel (ou le prochain de la journée).
 */
export const getNextCourse = (
  schedules: ScheduleResponse[],
): ScheduleResponse | null => {
  const now = new Date();
  const currentDay = now.getDay();
  const javaDayOfWeek = currentDay === 0 ? 7 : currentDay;

  const todayCourses = schedules
    .filter((s) => s.dayOfWeek === javaDayOfWeek)
    .sort((a, b) => timeToDecimal(a.startTime) - timeToDecimal(b.startTime));

  const currentDecimal = now.getHours() + now.getMinutes() / 60;

  return todayCourses.find((s) => timeToDecimal(s.startTime) > currentDecimal) ?? null;
};
