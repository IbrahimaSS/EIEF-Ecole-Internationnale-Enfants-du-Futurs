/**
 * QrScannerModal — scanner QR temps réel, compatible tous navigateurs.
 *
 * Stratégie :
 *  1. BarcodeDetector (Chrome/Edge) — natif, le plus rapide
 *  2. jsQR via CDN (Firefox, Safari, anciens navigateurs) — fallback universel
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  X,
} from "lucide-react";
import { studentCardService } from "../../services/studentCardService";
import { teacherCardService } from "../../services/teacherCardService";
import { ApiError } from "../../services/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Mode "eleve" → studentCardService  |  "professeur" → teacherCardService */
export type ScannerMode = "eleve" | "professeur";

interface CheckInResult {
  /** Nom affiché dans la carte résultat */
  displayName: string;
  /** Sous-titre (classe+matricule élève  ou  matière+matricule prof) */
  subtitle: string;
  avatarUrl: string | null;
  eventType: "ARRIVED" | "DEPARTED" | "ALREADY_OUT";
  eventTime: string;
  message: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** "eleve" (défaut) ou "professeur" */
  mode?: ScannerMode;
}

// ---------------------------------------------------------------------------
// Moteur de décodage — abstraction BarcodeDetector / jsQR
// ---------------------------------------------------------------------------

type DecodeEngine = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => Promise<string | null>;

/** Charge jsQR depuis CDN si besoin */
function loadJsQR(): Promise<(data: Uint8ClampedArray, w: number, h: number) => { data: string } | null> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.jsQR) { resolve(w.jsQR); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    s.onload = () => resolve(w.jsQR);
    s.onerror = () => reject(new Error("jsQR CDN indisponible"));
    document.head.appendChild(s);
  });
}

/** Construit le moteur de décodage adapté au navigateur courant */
async function buildEngine(): Promise<DecodeEngine> {
  const w = window as any;

  // --- BarcodeDetector (Chrome/Edge) ---
  if (w.BarcodeDetector) {
    try {
      let formats = ["qr_code"];
      if (typeof w.BarcodeDetector.getSupportedFormats === "function") {
        const supported: string[] = await w.BarcodeDetector.getSupportedFormats();
        if (!supported.includes("qr_code")) formats = supported;
      }
      const bd = new w.BarcodeDetector({ formats });
      return async (video) => {
        if (video.readyState < 2) return null;
        const codes: any[] = await bd.detect(video);
        return codes.length > 0 ? (codes[0].rawValue as string) : null;
      };
    } catch {
      // BarcodeDetector présent mais cassé → fallback jsQR
    }
  }

  // --- jsQR (tous navigateurs) ---
  const jsQR = await loadJsQR();
  return async (video, canvas, ctx) => {
    if (video.readyState < 2 || video.videoWidth === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (jsQR as any)(img.data, img.width, img.height, {
      inversionAttempts: "dontInvert",
    });
    return result ? result.data : null;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractToken(raw: string): string {
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? raw;
  } catch {
    return raw.trim();
  }
}

function formatTime(raw: string): string {
  const p = raw.split(":");
  return `${p[0]}h${p[1]}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const QrScannerModal: React.FC<Props> = ({ open, onClose, mode = "eleve" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const engineRef = useRef<DecodeEngine | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const lastTokenRef = useRef("");
  const cooldownRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Démarrage caméra
  // ------------------------------------------------------------------

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setReady(false);

    // Construire le moteur si pas encore fait
    if (!engineRef.current) {
      try {
        engineRef.current = await buildEngine();
      } catch {
        setCameraError(
          "Impossible de charger le décodeur QR. Vérifiez votre connexion internet."
        );
        return;
      }
    }

    // Préparer le canvas 2D (pour jsQR)
    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d", { willReadFrequently: true });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });
      await video.play();
      setReady(true);
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError"
          ? "Accès à la caméra refusé. Autorisez-la dans les paramètres du navigateur."
          : err?.name === "NotFoundError"
          ? "Aucune caméra détectée sur cet appareil."
          : "Impossible d'activer la caméra.";
      setCameraError(msg);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    scanLoopRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
  }, []);

  // ------------------------------------------------------------------
  // API check-in
  // ------------------------------------------------------------------

  const handleToken = useCallback(async (token: string) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setProcessing(true);
    setScanError(null);
    setResult(null);

    try {
      if (mode === "professeur") {
        const resp = await teacherCardService.scanForAttendance(token);
        setResult({
          displayName: resp.teacherName,
          subtitle: `${resp.specialty ?? "Professeur"} · ${resp.employeeNumber}`,
          avatarUrl: resp.avatarUrl,
          eventType: resp.eventType,
          eventTime: resp.eventTime,
          message: resp.message,
        });
      } else {
        const resp = await studentCardService.scanForAttendance(token);
        setResult({
          displayName: resp.studentName,
          subtitle: `${resp.className ?? "—"} · #${resp.registrationNumber}`,
          avatarUrl: resp.avatarUrl,
          eventType: resp.eventType,
          eventTime: resp.eventTime,
          message: resp.message,
        });
      }
      setTimeout(() => { cooldownRef.current = false; }, 3000);
    } catch (err) {
      setScanError(
        err instanceof ApiError
          ? err.message || (mode === "professeur" ? "Carte professeur introuvable." : "Carte scolaire introuvable.")
          : "Erreur lors du pointage."
      );
      setTimeout(() => {
        cooldownRef.current = false;
        lastTokenRef.current = "";
      }, 1500);
    } finally {
      setProcessing(false);
    }
  }, [mode]);

  // ------------------------------------------------------------------
  // Boucle de scan
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!ready || !engineRef.current) return;

    const loop = async () => {
      if (!cooldownRef.current && engineRef.current && videoRef.current) {
        try {
          const raw = await engineRef.current(
            videoRef.current,
            canvasRef.current,
            ctxRef.current!
          );
          if (raw) {
            const token = extractToken(raw);
            if (token && token !== lastTokenRef.current) {
              lastTokenRef.current = token;
              void handleToken(token);
            }
          }
        } catch {
          // frame illisible
        }
      }
      scanLoopRef.current = requestAnimationFrame(loop);
    };

    scanLoopRef.current = requestAnimationFrame(loop);
    return () => { if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current); };
  }, [ready, handleToken]);

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------

  useEffect(() => {
    if (open) {
      setResult(null);
      setScanError(null);
      lastTokenRef.current = "";
      cooldownRef.current = false;
      void startCamera();
    } else {
      stopCamera();
    }
  }, [open, startCamera, stopCamera]);

  const handleNext = () => {
    setResult(null);
    setScanError(null);
    lastTokenRef.current = "";
    cooldownRef.current = false;
  };

  // ------------------------------------------------------------------
  // Couleurs événement
  // ------------------------------------------------------------------

  const cfg =
    result?.eventType === "ARRIVED"
      ? { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", icon: <LogIn size={18} />, label: "Arrivée enregistrée" }
      : result?.eventType === "DEPARTED"
      ? { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", icon: <LogOut size={18} />, label: "Départ enregistré" }
      : { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", icon: <ShieldCheck size={18} />, label: "Déjà pointé aujourd'hui" };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-[28px] overflow-hidden bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-5 py-4 text-white ${mode === "professeur" ? "bg-purple-950" : "bg-slate-950"}`}>
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.24em] font-bold ${mode === "professeur" ? "text-purple-300" : "text-cyan-300"}`}>Pointage QR</p>
                  <p className="text-sm font-black">
                    {mode === "professeur" ? "Scanner la carte professeur" : "Scanner la carte élève"}
                  </p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Viewfinder */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

                  {/* Cadre de scan animé */}
                  {ready && !result && !processing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-44 h-44 relative">
                        {mode === "professeur" ? (
                          <>
                            <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-purple-400 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-purple-400 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-purple-400 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-purple-400 rounded-br-lg" />
                            <motion.div
                              animate={{ top: ["8%", "88%", "8%"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute left-2 right-2 h-0.5 bg-purple-400/80 shadow-[0_0_6px_2px_rgba(168,85,247,0.5)]"
                              style={{ top: "8%" }}
                            />
                          </>
                        ) : (
                          <>
                            <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-cyan-400 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-cyan-400 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-cyan-400 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-cyan-400 rounded-br-lg" />
                            <motion.div
                              animate={{ top: ["8%", "88%", "8%"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute left-2 right-2 h-0.5 bg-cyan-400/80 shadow-[0_0_6px_2px_rgba(34,211,238,0.5)]"
                              style={{ top: "8%" }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Chargement */}
                  {!ready && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
                      <Loader2 size={22} className="animate-spin text-cyan-400" />
                      <span className="text-xs font-semibold">Activation de la caméra…</span>
                    </div>
                  )}

                  {/* Traitement */}
                  {processing && (
                    <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-2 text-white">
                      <Loader2 size={22} className="animate-spin text-cyan-400" />
                      <span className="text-xs font-semibold">Enregistrement du pointage…</span>
                    </div>
                  )}

                  {/* Erreur caméra */}
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/80">
                      <AlertCircle size={26} className="text-red-400" />
                      <p className="text-xs font-semibold leading-relaxed">{cameraError}</p>
                      <button
                        onClick={() => { setCameraError(null); void startCamera(); }}
                        className="mt-1 px-4 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw size={11} /> Réessayer
                      </button>
                    </div>
                  )}
                </div>

                {/* Instruction */}
                {ready && !result && !processing && (
                  <p className="text-center text-[11px] text-slate-400 font-medium">
                    {mode === "professeur"
                      ? "Pointez la caméra vers le QR code de la carte professeur"
                      : "Pointez la caméra vers le QR code de la carte scolaire"}
                  </p>
                )}

                {/* Résultat */}
                <AnimatePresence mode="wait">
                  {result && (
                    <motion.div key="res" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-2xl overflow-hidden border border-slate-100"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                          {result.avatarUrl
                            ? <img src={result.avatarUrl} alt={result.displayName} className="w-full h-full object-cover" />
                            : <span className="text-sm font-black text-slate-400">{result.displayName.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{result.displayName}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{result.subtitle}</p>
                        </div>
                      </div>
                      <div className={`flex items-center justify-between px-4 py-3 ${cfg.bg}`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${cfg.dot}`}>{cfg.icon}</span>
                          <div>
                            <p className={`text-sm font-black ${cfg.text}`}>{cfg.label}</p>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                              <Clock size={10} /> {formatTime(result.eventTime)}
                            </div>
                          </div>
                        </div>
                        <CheckCircle2 size={18} className={cfg.text} />
                      </div>
                    </motion.div>
                  )}

                  {scanError && (
                    <motion.div key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3"
                    >
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      <p className="text-sm font-semibold text-red-700">{scanError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton suivant */}
                {(result || scanError) && (
                  <button
                    onClick={handleNext}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-black transition-colors ${
                      mode === "professeur"
                        ? "bg-purple-900 hover:bg-purple-800"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    <RefreshCw size={13} />
                    {mode === "professeur" ? "Scanner le prochain professeur" : "Scanner le prochain élève"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QrScannerModal;
