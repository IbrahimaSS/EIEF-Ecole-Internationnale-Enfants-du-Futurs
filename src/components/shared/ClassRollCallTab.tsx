/**
 * ClassRollCallTab — Vue coordinateur / administrateur
 *
 * Affiche, pour une date donnée, l'état de l'appel soumis par chaque professeur
 * dans sa salle de classe. Remonte présents / absents, permet de contacter
 * les parents des élèves absents.
 *
 * Données : les profs soumettent l'appel via TeacherClasses.tsx → attendanceService.
 * Ce composant lit ces mêmes enregistrements par classe + date.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Phone,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { Card, Button } from "../ui";
import { cn } from "../../utils/cn";
import { attendanceService } from "../../services/attendanceService";
import { AttendanceResponse } from "../../types/academic";

// ─── Types locaux ─────────────────────────────────────────────────────────────

interface ClassResponse {
  id: string;
  name: string;
  level: string;
  mainTeacherName: string;
  studentCount: number;
}

interface ScheduleEntry {
  id: string;
  classId: string;
  subjectId: string;
  dayOfWeek: number;   // 1=Lundi … 7=Dimanche (convention backend)
  startTime: string;
  endTime: string;
  room?: string;
  subjectName: string;
  teacherName: string;
}

interface Props {
  classes: ClassResponse[];
  schedules: ScheduleEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convertit le jour JS (0=dim…6=sam) vers la convention backend (1=lun…7=dim) */
const jsToBackendDay = (d: number) => (d === 0 ? 7 : d);

const TODAY = new Date().toISOString().split("T")[0];

const STATUS_LABEL: Record<string, string> = {
  PRESENT: "Présent",
  ABSENT:  "Absent",
  LATE:    "Retard",
  EXCUSED: "Excusé",
};

const STATUS_COLOR: Record<string, string> = {
  PRESENT: "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300",
  ABSENT:  "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300",
  LATE:    "text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300",
  EXCUSED: "text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
};

// ─── État d'une classe pour une date ─────────────────────────────────────────

interface ClassDayState {
  classId: string;
  /** Créneaux du jour pour cette classe */
  slots: ScheduleEntry[];
  /** Enregistrements d'appel récupérés (null = pas encore chargé) */
  records: AttendanceResponse[] | null;
  loading: boolean;
  error: string | null;
}

// ─── Composant ────────────────────────────────────────────────────────────────

const ClassRollCallTab: React.FC<Props> = ({ classes, schedules }) => {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [classDayStates, setClassDayStates] = useState<ClassDayState[]>([]);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Calcul des classes ayant un cours ce jour-là ──────────────────────────

  const classesForDate = useCallback((date: string): ClassDayState[] => {
    const jsDay = new Date(date + "T12:00:00").getDay();
    const backendDay = jsToBackendDay(jsDay);
    const todaySchedules = schedules.filter(s => s.dayOfWeek === backendDay);

    // Grouper par classId
    const map = new Map<string, ScheduleEntry[]>();
    todaySchedules.forEach(s => {
      if (!map.has(s.classId)) map.set(s.classId, []);
      map.get(s.classId)!.push(s);
    });

    // Garder seulement les classes connues, triées par nom
    const result: ClassDayState[] = [];
    classes.forEach(cls => {
      const slots = map.get(cls.id);
      if (slots && slots.length > 0) {
        result.push({ classId: cls.id, slots, records: null, loading: false, error: null });
      }
    });
    return result.sort((a, b) => {
      const na = classes.find(c => c.id === a.classId)?.name ?? "";
      const nb = classes.find(c => c.id === b.classId)?.name ?? "";
      return na.localeCompare(nb);
    });
  }, [classes, schedules]);

  // ── Chargement de l'appel pour toutes les classes ─────────────────────────

  const loadAll = useCallback(async (date: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const initial = classesForDate(date);
    if (initial.length === 0) { setClassDayStates([]); return; }

    setGlobalLoading(true);
    setClassDayStates(initial.map(s => ({ ...s, loading: true })));

    await Promise.all(
      initial.map(async (state, idx) => {
        try {
          // Tenter l'endpoint direct classe+date (si le backend l'expose)
          let records: AttendanceResponse[] = [];
          try {
            records = await attendanceService.getByClassAndDate(state.classId, date);
          } catch {
            // Fallback : agréger par créneau
            const perSlot = await Promise.all(
              state.slots.map(slot =>
                attendanceService.getByScheduleAndDate(slot.id, date).catch(() => [] as AttendanceResponse[])
              )
            );
            // Dédupliquer par studentId (garder le dernier statut)
            const mergeMap = new Map<string, AttendanceResponse>();
            perSlot.flat().forEach(r => mergeMap.set(r.studentId, r));
            records = Array.from(mergeMap.values());
          }

          setClassDayStates(prev => prev.map((s, i) =>
            i === idx ? { ...s, records, loading: false, error: null } : s
          ));
        } catch {
          setClassDayStates(prev => prev.map((s, i) =>
            i === idx ? { ...s, records: [], loading: false, error: "Erreur de chargement" } : s
          ));
        }
      })
    );
    setGlobalLoading(false);
  }, [classesForDate]);

  useEffect(() => { void loadAll(selectedDate); }, [selectedDate, loadAll]);

  // ── Helpers d'affichage ───────────────────────────────────────────────────

  const getClass = (id: string) => classes.find(c => c.id === id);

  const countByStatus = (records: AttendanceResponse[]) => {
    const counts: Record<string, number> = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    records.forEach(r => { if (r.status in counts) counts[r.status]++; });
    return counts;
  };

  const absentRecords = (records: AttendanceResponse[]) =>
    records.filter(r => r.status === "ABSENT");

  const submitted = (state: ClassDayState) => state.records !== null && state.records.length > 0;
  const pending   = (state: ClassDayState) => state.records !== null && state.records.length === 0;

  // ── Render ────────────────────────────────────────────────────────────────

  const dayLabel = (() => {
    const d = new Date(selectedDate + "T12:00:00");
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <motion.div
      key="appels"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* ── En-tête ── */}
      <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-bleu-500 mb-2">Appels de classe</p>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Suivi des appels soumis par les professeurs
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Consultez en temps réel les présences et absences de chaque classe. Contactez les parents des élèves absents.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <input
            type="date"
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setExpandedClassId(null); }}
            className="h-10 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bleu-500"
          />
          <Button
            onClick={() => { setExpandedClassId(null); void loadAll(selectedDate); }}
            variant="outline"
            className="h-10"
            disabled={globalLoading}
          >
            {globalLoading
              ? <Loader2 size={14} className="animate-spin mr-2"/>
              : <RefreshCw size={14} className="mr-2"/>
            }
            Actualiser
          </Button>
          <span className="text-sm font-semibold text-gray-500 capitalize">{dayLabel}</span>
        </div>
      </Card>

      {/* ── Résumé global ── */}
      {classDayStates.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Classes aujourd'hui",
              value: classDayStates.length,
              color: "text-bleu-600 bg-bleu-50 dark:bg-bleu-900/20",
            },
            {
              label: "Appels soumis",
              value: classDayStates.filter(s => submitted(s)).length,
              color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
            },
            {
              label: "En attente",
              value: classDayStates.filter(s => pending(s)).length,
              color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
            },
            {
              label: "Total absents",
              value: classDayStates.reduce((acc, s) =>
                acc + (s.records ? absentRecords(s.records).length : 0), 0),
              color: "text-red-600 bg-red-50 dark:bg-red-900/20",
            },
          ].map(({ label, value, color }) => (
            <Card key={label} className={cn("p-4 border-none shadow-soft", color)}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
              <p className="text-3xl font-black">{value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* ── Liste des classes ── */}
      {classDayStates.length === 0 && !globalLoading ? (
        <Card className="p-12 border-none shadow-soft dark:bg-gray-900/50 flex flex-col items-center gap-4 text-gray-400">
          <BookOpen size={40} className="opacity-20"/>
          <p className="font-semibold text-sm text-center">
            Aucun cours planifié pour ce jour.<br/>
            <span className="text-xs font-normal">Vérifiez les emplois du temps dans l'onglet correspondant.</span>
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {classDayStates.map(state => {
            const cls = getClass(state.classId);
            if (!cls) return null;

            const isExpanded = expandedClassId === state.classId;
            const counts = state.records ? countByStatus(state.records) : null;
            const absents = state.records ? absentRecords(state.records) : [];
            const hasSubmitted = submitted(state);
            const isPending = pending(state);

            return (
              <Card
                key={state.classId}
                className="border-none shadow-soft dark:bg-gray-900/50 overflow-hidden"
              >
                {/* ── En-tête de la carte classe ── */}
                <button
                  onClick={() => setExpandedClassId(isExpanded ? null : state.classId)}
                  className="w-full p-4 md:p-5 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Icône statut */}
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                    state.loading
                      ? "bg-gray-100 dark:bg-white/10"
                      : hasSubmitted
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : isPending
                          ? "bg-amber-50 dark:bg-amber-900/20"
                          : "bg-gray-100 dark:bg-white/10"
                  )}>
                    {state.loading
                      ? <Loader2 size={18} className="animate-spin text-gray-400"/>
                      : hasSubmitted
                        ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400"/>
                        : isPending
                          ? <Clock size={18} className="text-amber-600 dark:text-amber-400"/>
                          : <AlertCircle size={18} className="text-gray-400"/>
                    }
                  </div>

                  {/* Infos classe */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-black text-gray-900 dark:text-white text-sm">{cls.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{cls.level}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                      {state.slots.map(slot => (
                        <span key={slot.id} className="flex items-center gap-1">
                          <BookOpen size={10}/>
                          {slot.subjectName} · {slot.teacherName} · {slot.startTime}–{slot.endTime}
                          {slot.room ? ` · ${slot.room}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Compteurs */}
                  {counts && hasSubmitted && (
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600">
                        <CheckCircle2 size={13}/> {counts.PRESENT + counts.LATE + counts.EXCUSED} présents
                      </span>
                      {counts.ABSENT > 0 && (
                        <span className="flex items-center gap-1.5 text-[12px] font-bold text-red-600">
                          <XCircle size={13}/> {counts.ABSENT} absent{counts.ABSENT > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}

                  {state.loading ? null : isPending ? (
                    <span className="hidden md:inline text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full shrink-0">
                      Appel non soumis
                    </span>
                  ) : null}

                  {/* Chevron */}
                  <div className="shrink-0 text-gray-400">
                    {isExpanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                  </div>
                </button>

                {/* ── Détail déroulant ── */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-gray-100 dark:border-white/10"
                    >
                      <div className="p-4 md:p-6 space-y-5">

                        {state.loading && (
                          <div className="flex items-center gap-3 text-gray-400 py-4">
                            <Loader2 size={18} className="animate-spin"/>
                            <span className="text-sm">Chargement de l'appel…</span>
                          </div>
                        )}

                        {state.error && (
                          <div className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
                            <AlertCircle size={16}/> {state.error}
                          </div>
                        )}

                        {!state.loading && isPending && (
                          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-amber-700 dark:text-amber-300 text-sm font-semibold">
                            <Clock size={16}/>
                            Le professeur n'a pas encore soumis l'appel pour ce jour.
                          </div>
                        )}

                        {!state.loading && hasSubmitted && counts && (
                          <>
                            {/* Résumé compteurs mobile */}
                            <div className="flex flex-wrap gap-3 md:hidden">
                              {[
                                { label: "Présents", value: counts.PRESENT, cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
                                { label: "Absents",  value: counts.ABSENT,  cls: "text-red-600 bg-red-50 dark:bg-red-900/20" },
                                { label: "Retard",   value: counts.LATE,    cls: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
                                { label: "Excusés",  value: counts.EXCUSED, cls: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
                              ].map(({ label, value, cls }) => (
                                <div key={label} className={cn("px-3 py-2 rounded-xl text-xs font-black", cls)}>
                                  {value} {label}
                                </div>
                              ))}
                            </div>

                            {/* Tableau complet des élèves */}
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                                Liste de l'appel ({state.records!.length} élèves)
                              </p>
                              <div className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                                <table className="w-full text-left">
                                  <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Élève</th>
                                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Note</th>
                                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {state.records!
                                      .sort((a, b) => {
                                        // Absents en premier
                                        if (a.status === "ABSENT" && b.status !== "ABSENT") return -1;
                                        if (b.status === "ABSENT" && a.status !== "ABSENT") return 1;
                                        return (a.studentName ?? "").localeCompare(b.studentName ?? "");
                                      })
                                      .map(record => (
                                        <tr
                                          key={record.studentId}
                                          className={cn(
                                            "transition-colors",
                                            record.status === "ABSENT"
                                              ? "bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20"
                                              : "hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                                          )}
                                        >
                                          <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                              <div className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                                                record.status === "ABSENT"
                                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                                  : "bg-gray-100 dark:bg-white/10 text-gray-500"
                                              )}>
                                                {(record.studentName ?? "?").charAt(0).toUpperCase()}
                                              </div>
                                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {record.studentName ?? "—"}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className={cn(
                                              "text-[11px] font-bold px-2.5 py-1 rounded-full",
                                              STATUS_COLOR[record.status] ?? "text-gray-600 bg-gray-50"
                                            )}>
                                              {STATUS_LABEL[record.status] ?? record.status}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                                            {record.note || "—"}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            {record.status === "ABSENT" && (
                                              <div className="flex items-center justify-end gap-2">
                                                <a
                                                  href={`tel:`}
                                                  title="Appeler le parent"
                                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bleu-50 dark:bg-bleu-900/20 text-bleu-700 dark:text-bleu-300 text-[11px] font-bold hover:bg-bleu-100 dark:hover:bg-bleu-900/30 transition-colors"
                                                  onClick={e => e.preventDefault()}
                                                >
                                                  <Phone size={11}/> Contacter parent
                                                </a>
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Section absents mise en évidence */}
                            {absents.length > 0 && (
                              <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <XCircle size={16} className="text-red-600 dark:text-red-400"/>
                                  <p className="text-[11px] font-black uppercase tracking-widest text-red-700 dark:text-red-300">
                                    {absents.length} absent{absents.length > 1 ? "s" : ""} — à contacter
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {absents.map(r => (
                                    <AbsentContactCard key={r.studentId} record={r}/>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// ─── Carte contact parent absent ──────────────────────────────────────────────

const AbsentContactCard: React.FC<{ record: AttendanceResponse }> = ({ record }) => {
  const [parentPhone, setParentPhone] = useState<string | null>(null);
  const [loadingPhone, setLoadingPhone] = useState(false);

  const fetchParentPhone = async () => {
    if (parentPhone || loadingPhone) return;
    setLoadingPhone(true);
    try {
      // Essayer de récupérer le parent lié à cet élève
      const { apiRequest } = await import("../../services/api");
      const users = await apiRequest<any[]>(`/users?role=PARENT&studentId=${record.studentId}`);
      const phone = users?.[0]?.phone ?? users?.[0]?.phoneNumber ?? null;
      setParentPhone(phone);
    } catch {
      setParentPhone(null);
    } finally {
      setLoadingPhone(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-white/5 px-3 py-2.5 border border-red-100 dark:border-red-900/20">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-[10px] font-black text-red-700 dark:text-red-300 shrink-0">
          {(record.studentName ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{record.studentName}</p>
          {record.note && (
            <p className="text-[10px] text-gray-400 truncate">{record.note}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {parentPhone ? (
          <a
            href={`tel:${parentPhone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors"
          >
            <Phone size={11}/> {parentPhone}
          </a>
        ) : (
          <button
            onClick={() => void fetchParentPhone()}
            disabled={loadingPhone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bleu-50 dark:bg-bleu-900/20 text-bleu-700 dark:text-bleu-300 text-[11px] font-bold hover:bg-bleu-100 dark:hover:bg-bleu-900/30 transition-colors"
          >
            {loadingPhone
              ? <Loader2 size={11} className="animate-spin"/>
              : <Phone size={11}/>
            }
            {loadingPhone ? "Chargement…" : "Voir le numéro"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassRollCallTab;
