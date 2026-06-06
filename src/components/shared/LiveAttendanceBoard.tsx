/**
 * LiveAttendanceBoard — tableau de bord temps réel des pointages QR du jour.
 * Rafraîchissement automatique toutes les 30 secondes.
 * Utilisé dans le PointageTab coordinateur et manager.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";
import { studentCardService, QrAttendanceLogEntry } from "../../services/studentCardService";

const REFRESH_INTERVAL = 30_000; // 30 s

function fmtTime(t: string | null): string {
  if (!t) return "—";
  const p = t.split(":");
  return `${p[0]}h${p[1]}`;
}

const LiveAttendanceBoard: React.FC = () => {
  const [logs, setLogs] = useState<QrAttendanceLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await studentCardService.getTodayAttendance();
      setLogs(data);
      setLastRefresh(new Date());
      setCountdown(REFRESH_INTERVAL / 1000);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    intervalRef.current = setInterval(load, REFRESH_INTERVAL);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [load]);

  const present = logs.filter((l) => l.status === "IN_SCHOOL").length;
  const departed = logs.filter((l) => l.status === "DEPARTED").length;
  const total = logs.length;

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 flex items-center gap-3">
          <LogIn size={18} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 leading-none">{total}</p>
            <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 mt-0.5 uppercase tracking-wide">Arrivés</p>
          </div>
        </div>
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex items-center gap-3">
          <Users size={18} className="text-blue-600 shrink-0" />
          <div>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 leading-none">{present}</p>
            <p className="text-[10px] font-bold text-blue-600/70 dark:text-blue-400/70 mt-0.5 uppercase tracking-wide">À l'école</p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-100 dark:bg-white/5 px-4 py-3 flex items-center gap-3">
          <LogOut size={18} className="text-slate-500 shrink-0" />
          <div>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-300 leading-none">{departed}</p>
            <p className="text-[10px] font-bold text-slate-500/70 mt-0.5 uppercase tracking-wide">Partis</p>
          </div>
        </div>
      </div>

      {/* Header barre */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <Activity size={13} className="text-cyan-500 animate-pulse" />
          Temps réel — rafraîchissement dans {countdown}s
          {lastRefresh && (
            <span className="text-slate-400">
              · dernière màj {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
        <button
          onClick={() => { setLoading(true); void load(); }}
          className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
        >
          <RefreshCw size={12} /> Rafraîchir
        </button>
      </div>

      {/* Liste */}
      {loading && logs.length === 0 ? (
        <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
          <Loader2 size={20} className="animate-spin text-cyan-500" />
          <span className="text-sm font-semibold">Chargement des pointages…</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
          <CheckCircle2 size={36} className="opacity-20" />
          <p className="text-sm font-semibold">Aucun élève pointé aujourd'hui pour l'instant.</p>
          <p className="text-xs">Les arrivées apparaîtront ici dès le premier scan QR.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Élève</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classe</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrivée</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Départ</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-[10px] font-black text-slate-400">
                          {log.avatarUrl
                            ? <img src={log.avatarUrl} alt={log.studentName} className="w-full h-full object-cover" />
                            : log.studentName.split(" ").map((p) => p[0]).slice(0, 2).join("")
                          }
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{log.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">#{log.registrationNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{log.className ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <Clock size={12} /> {fmtTime(log.checkInTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                        <Clock size={12} /> {fmtTime(log.checkOutTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.status === "IN_SCHOOL" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> À l'école
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black">
                          <LogOut size={10} /> Parti(e)
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveAttendanceBoard;
