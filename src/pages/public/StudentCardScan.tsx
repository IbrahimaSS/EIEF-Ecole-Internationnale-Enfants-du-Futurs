import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, BookOpen, CalendarRange, Loader2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Badge, Button, Card } from "../../components/ui";
import { studentCardService } from "../../services/studentCardService";
import { StudentCardScanData } from "../coordinator/scolarite_module/types";
import { ApiError } from "../../services/api";
import { useParams, useSearchParams } from "react-router-dom";

const SEMESTER_OPTIONS = [1, 2, 3, 4, 5] as const;

const StudentCardScan: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentCardScanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSemester = useMemo(() => {
    const rawValue = searchParams.get("semester");
    if (!rawValue) return null;
    const parsed = Number(rawValue);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setError("QR code invalide.");
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    void studentCardService.getPublicCard(token, selectedSemester ?? undefined)
      .then((response) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((requestError: unknown) => {
        if (cancelled) {
          return;
        }
        if (requestError instanceof ApiError) {
          setError(requestError.message || "Impossible de charger les notes de l'élève.");
          return;
        }
        setError("Impossible de charger les notes de l'élève.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSemester, token]);

  const handleSemesterChange = (semester: number | null) => {
    const nextParams = new URLSearchParams(searchParams);

    if (semester === null) {
      nextParams.delete("semester");
    } else {
      nextParams.set("semester", String(semester));
    }

    setSearchParams(nextParams, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="flex items-center gap-3 text-white/80">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm font-semibold">Chargement de la fiche élève...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <Card className="max-w-md w-full p-8 bg-white border-none shadow-2xl text-center rounded-[28px]">
          <AlertCircle size={38} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-3">QR code invalide ou expiré</h1>
          <p className="text-sm text-slate-500 mb-6">
            {error || "La carte scolaire demandée n'est plus disponible."}
          </p>
          <Button onClick={() => window.location.reload()} className="bg-bleu-600 border-none text-white h-11 px-6">
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  const avatarUrl = data.avatarUrl?.trim();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.28),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[32px] overflow-hidden bg-white/95 shadow-2xl shadow-slate-950/30"
        >
          <div className="bg-slate-950 text-white px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={data.studentName} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-3xl font-black tracking-[0.2em]">
                    {data.studentName.split(" ").map((part) => part.charAt(0)).slice(0, 2).join("")}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300 font-black mb-2">Fiche élève sécurisée</p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight truncate">{data.studentName}</h1>
                <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
                  <Badge variant="default">Classe {data.className || '—'}</Badge>
                  <Badge variant="default">Matricule {data.registrationNumber}</Badge>
                  <Badge variant="success">Semestre {data.notes.semester}</Badge>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-300" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Accès</div>
                  <div className="text-sm font-bold">Lecture seule</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6 text-slate-900">
            <Card className="p-5 rounded-[28px] border border-slate-100 shadow-none bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-cyan-700 font-black mb-2">
                    <CalendarRange size={14} /> Contrôle du semestre
                  </div>
                  <p className="text-sm text-slate-500">
                    Choisissez le semestre à afficher. En mode automatique, la fiche charge le semestre disponible par défaut côté serveur.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSemesterChange(null)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.16em] transition-all ${
                      selectedSemester === null
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    Auto
                  </button>
                  {SEMESTER_OPTIONS.map((semester) => {
                    const isActive = selectedSemester === semester;
                    return (
                      <button
                        key={semester}
                        type="button"
                        onClick={() => handleSemesterChange(semester)}
                        className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.16em] transition-all ${
                          isActive
                            ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        Sem {semester}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <Card className="p-4 border border-slate-100 shadow-none rounded-3xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                  <TrendingUp size={14} /> Moyenne
                </div>
                <div className="text-3xl font-black mt-3">{data.notes.overallAverage.toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-1">sur 20</div>
              </Card>

              <Card className="p-4 border border-slate-100 shadow-none rounded-3xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                  <Users size={14} /> Rang
                </div>
                <div className="text-3xl font-black mt-3">{data.notes.rank}</div>
                <div className="text-xs text-slate-500 mt-1">sur {data.notes.classSize}</div>
              </Card>

              <Card className="p-4 border border-slate-100 shadow-none rounded-3xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                  <BookOpen size={14} /> Progression
                </div>
                <div className="text-3xl font-black mt-3">{data.notes.progression >= 0 ? '+' : ''}{data.notes.progression.toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-1">par rapport au semestre précédent</div>
              </Card>

              <Card className="p-4 border border-slate-100 shadow-none rounded-3xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                  <AlertCircle size={14} /> Absences
                </div>
                <div className="text-3xl font-black mt-3">{data.notes.absences}</div>
                <div className="text-xs text-slate-500 mt-1">absences relevées</div>
              </Card>
            </div>

            <Card className="p-5 rounded-[28px] border border-slate-100 shadow-none bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-700 font-black mb-2">Appréciation générale</div>
              <p className="text-lg font-bold text-slate-900 leading-relaxed">{data.notes.appreciation}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1.5 rounded-full bg-white/80 border border-cyan-100">
                  Semestre affiché: {data.notes.semester}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/80 border border-cyan-100">
                  Mode: {selectedSemester === null ? "Automatique" : "Sélection manuelle"}
                </span>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-black tracking-tight">Notes par matière</h2>
                <div className="text-xs font-semibold text-slate-500">Lecture seule</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.notes.subjects.map((subject) => (
                  <Card key={`${subject.subjectId || subject.subjectName || 'subject'}-${subject.coefficient}`} className="p-5 rounded-[26px] border border-slate-100 shadow-none bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-black text-slate-900 truncate">
                          {subject.subjectName || 'Matière'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Coefficient {subject.coefficient}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-slate-900">{subject.average.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">sur 20</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Progression</span>
                      <span className="font-bold text-slate-900">
                        {subject.progression >= 0 ? '+' : ''}{subject.progression.toFixed(2)}
                      </span>
                    </div>
                    {subject.comment && (
                      <p className="mt-4 text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-4">
                        {subject.comment}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentCardScan;