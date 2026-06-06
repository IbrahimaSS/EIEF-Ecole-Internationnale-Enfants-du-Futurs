/**
 * Page publique affichée après le scan du QR code d'une carte professeur.
 * Route : /pointage-prof/:token
 */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { teacherCardService, TeacherQrScanResult } from "../../services/teacherCardService";

type Phase = "loading" | "success" | "error";

const MONTH_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const QrTeacherPointage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [phase, setPhase] = useState<Phase>("loading");
  const [result, setResult] = useState<TeacherQrScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) { setPhase("error"); setErrorMsg("Token manquant."); return; }
    teacherCardService.scanForAttendance(token)
      .then((data) => { setResult(data); setPhase("success"); })
      .catch((e) => { setErrorMsg(e?.message || "Carte professeur introuvable."); setPhase("error"); });
  }, [token]);

  const fmtTime = (t: string) => { const p = t.split(":"); return `${p[0]}h${p[1]}`; };
  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate()} ${MONTH_FR[dt.getMonth()]} ${dt.getFullYear()}`;
  };

  const cfg =
    result?.eventType === "ARRIVED"
      ? { grad: "from-emerald-900 via-teal-900 to-cyan-900", icon: <LogIn size={28} />, iconBg: "bg-emerald-500", label: "Arrivée enregistrée", notif: "Les admins ont été notifiés" }
      : result?.eventType === "DEPARTED"
      ? { grad: "from-blue-900 via-indigo-900 to-violet-900", icon: <LogOut size={28} />, iconBg: "bg-blue-500", label: "Départ enregistré", notif: "Les admins ont été notifiés" }
      : { grad: "from-amber-900 via-orange-900 to-red-900", icon: <ShieldCheck size={28} />, iconBg: "bg-amber-500", label: "Déjà pointé aujourd'hui", notif: "" };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">

        {phase === "loading" && (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-white/60"
          >
            <Loader2 size={36} className="animate-spin text-cyan-400" />
            <p className="text-sm font-semibold">Enregistrement du pointage…</p>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div key="err" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5 text-center max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-red-900/50 flex items-center justify-center">
              <AlertCircle size={36} className="text-red-400" />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-black mb-2">Carte introuvable</h2>
              <p className="text-white/60 text-sm">{errorMsg}</p>
            </div>
          </motion.div>
        )}

        {phase === "success" && result && (
          <motion.div key="ok" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            {/* Carte professeur */}
            <div className={`rounded-[2rem] overflow-hidden bg-gradient-to-br ${cfg.grad} shadow-2xl`}>
              {/* Header école */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/10">
                <img src="/logo_eief.jpeg" alt="EIEF" className="w-10 h-10 rounded-full object-contain bg-white/90 p-1" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Carte professeur</p>
                  <p className="text-white font-black text-sm">École EIEF</p>
                </div>
              </div>

              {/* Identité */}
              <div className="flex items-center gap-4 px-6 py-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                  {result.avatarUrl
                    ? <img src={result.avatarUrl} alt={result.teacherName} className="w-full h-full object-cover" />
                    : <span className="text-xl font-black text-white/60">{result.teacherName.split(" ").map(p => p[0]).slice(0, 2).join("")}</span>
                  }
                </div>
                <div>
                  <p className="font-black text-white text-lg leading-tight">{result.teacherName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <BookOpen size={12} className="text-white/50" />
                    <span className="text-[11px] font-semibold text-white/60">{result.specialty ?? "Professeur"}</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-medium mt-0.5">Matricule : {result.employeeNumber}</p>
                </div>
              </div>

              {/* Événement */}
              <div className="mx-4 mb-4 rounded-2xl bg-white/10 backdrop-blur px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${cfg.iconBg}`}>
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="text-white font-black text-base leading-tight">{cfg.label}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-white/60 text-[11px] font-semibold">
                      <Clock size={11} /> {fmtTime(result.eventTime)}
                      <span className="mx-1">·</span>
                      {fmtDate(result.date)}
                    </div>
                  </div>
                  <CheckCircle2 size={20} className="text-white/60 ml-auto shrink-0" />
                </div>

                {cfg.notif && (
                  <div className="flex items-center gap-2 pt-3 border-t border-white/10 text-white/50">
                    <Bell size={12} />
                    <p className="text-[10px] font-semibold">{cfg.notif}</p>
                  </div>
                )}
              </div>

              <p className="text-center text-white/25 text-[10px] font-medium pb-5">
                EIEF — Système de pointage automatique
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default QrTeacherPointage;
