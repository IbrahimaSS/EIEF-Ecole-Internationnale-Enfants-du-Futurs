import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { ApiError } from "../../services/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QrScanCheckInResponse {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  className: string | null;
  avatarUrl: string | null;
  eventType: "ARRIVED" | "DEPARTED" | "ALREADY_OUT";
  eventTime: string; // "HH:mm:ss"
  date: string;      // "YYYY-MM-DD"
  message: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(raw: string): string {
  // raw = "HH:mm:ss" ou "HH:mm"
  const parts = raw.split(":");
  return `${parts[0]}h${parts[1]}`;
}

function formatDate(raw: string): string {
  const [year, month, day] = raw.split("-");
  return `${day}/${month}/${year}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const QrPointage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QrScanCheckInResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  const doScan = React.useCallback(async () => {
    if (!token) {
      setError("QR code invalide.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<QrScanCheckInResponse>(
        `/student-cards/scan/${encodeURIComponent(token)}/checkin`,
        { method: "POST" }
      );
      setData(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Impossible d'enregistrer le pointage.");
      } else {
        setError("Impossible d'enregistrer le pointage.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    void doScan();
  }, [doScan]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-white/70">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-cyan-400" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Enregistrement du pointage…</span>
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-white rounded-[28px] p-8 text-center shadow-2xl"
        >
          <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-black text-slate-900 mb-2">Pointage impossible</h1>
          <p className="text-sm text-slate-500 mb-6">{error ?? "QR code invalide ou expiré."}</p>
          <button
            onClick={() => { calledRef.current = false; void doScan(); }}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} /> Réessayer
          </button>
        </motion.div>
      </div>
    );
  }

  // ---- Success ----
  const isArrived = data.eventType === "ARRIVED";
  const isDeparted = data.eventType === "DEPARTED";
  const isAlreadyOut = data.eventType === "ALREADY_OUT";
  const avatarUrl = data.avatarUrl?.trim() || null;

  const colorConfig = isArrived
    ? { bg: "from-emerald-950 via-slate-950 to-slate-950", badge: "bg-emerald-500", icon: <LogIn size={22} />, label: "Arrivée enregistrée", ring: "ring-emerald-400" }
    : isDeparted
    ? { bg: "from-blue-950 via-slate-950 to-slate-950", badge: "bg-blue-500", icon: <LogOut size={22} />, label: "Départ enregistré", ring: "ring-blue-400" }
    : { bg: "from-amber-950 via-slate-950 to-slate-950", badge: "bg-amber-500", icon: <ShieldCheck size={22} />, label: "Déjà pointé aujourd'hui", ring: "ring-amber-400" };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colorConfig.bg} flex items-center justify-center px-4 py-8`}>
      <AnimatePresence>
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 32, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm w-full"
        >
          {/* School header */}
          <div className="flex items-center gap-3 mb-6 px-1">
            <img src="/logo_eief.jpeg" alt="EIEF" className="w-10 h-10 rounded-full object-contain bg-white p-1" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-white/50 font-bold">EIEF</p>
              <p className="text-sm font-black text-white leading-tight">Pointage automatique</p>
            </div>
          </div>

          {/* Main card */}
          <div className="rounded-[32px] overflow-hidden bg-white shadow-2xl shadow-black/40">
            {/* Top strip */}
            <div className={`h-1.5 w-full ${colorConfig.badge}`} />

            <div className="px-7 pt-7 pb-6 space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-3xl overflow-hidden border-4 ${colorConfig.ring} bg-slate-100 flex items-center justify-center shrink-0`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={data.studentName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-slate-400">
                      {data.studentName.split(" ").map(p => p[0]).slice(0, 2).join("")}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-black text-slate-900 leading-tight">{data.studentName}</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{data.className ?? "—"}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">#{data.registrationNumber}</p>
                </div>
              </div>

              {/* Event badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.35 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isArrived ? "bg-emerald-50" : isDeparted ? "bg-blue-50" : "bg-amber-50"}`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${colorConfig.badge}`}>
                  {colorConfig.icon}
                </span>
                <div>
                  <p className={`text-sm font-black ${isArrived ? "text-emerald-700" : isDeparted ? "text-blue-700" : "text-amber-700"}`}>
                    {colorConfig.label}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{data.message}</p>
                </div>
              </motion.div>

              {/* Time + date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                    <Clock size={10} /> Heure
                  </div>
                  <div className="text-2xl font-black text-slate-900">{formatTime(data.eventTime)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                    <CheckCircle2 size={10} /> Date
                  </div>
                  <div className="text-base font-black text-slate-900">{formatDate(data.date)}</div>
                </div>
              </div>

              {/* Parent notified */}
              {(isArrived || isDeparted) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <ShieldCheck size={14} className="text-slate-400 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Le(s) parent(s) ont été notifiés automatiquement.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/30 font-semibold mt-5 tracking-widest uppercase">
            Ecole Internationale Les Enfants du Futur
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QrPointage;
