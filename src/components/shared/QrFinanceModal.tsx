/**
 * QrFinanceModal — Scanner QR côté finance.
 *
 * Scan la carte parent → extrait le familyId depuis l'URL
 * → appelle accountingService.getFamilyStatus(familyId)
 * → affiche : montant payé, reste à payer, statut.
 *
 * Même moteur BarcodeDetector / jsQR que QrScannerModal.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { accountingService, TuitionFeeFamilyStatusResponse } from "../../services/accountingService";
import { ApiError } from "../../services/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FinanceResult {
  familyId: string;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
  hasOverdue: boolean;
  overdueCount: number;
  studentsCount: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Callback optionnel : quand une famille est scannée (pour sélectionner dans la page parente) */
  onFamilyScanned?: (familyId: string, status: TuitionFeeFamilyStatusResponse) => void;
}

// ---------------------------------------------------------------------------
// Moteur de décodage — même abstraction que QrScannerModal
// ---------------------------------------------------------------------------

type DecodeEngine = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => Promise<string | null>;

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

async function buildEngine(): Promise<DecodeEngine> {
  const w = window as any;
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
    } catch { /* fallback */ }
  }
  const jsQR = await loadJsQR();
  return async (video, canvas, ctx) => {
    if (video.readyState < 2 || video.videoWidth === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = (jsQR as any)(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
    return result ? result.data : null;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extrait le familyId depuis une URL de type :
 *   http://localhost:3000/famille/{familyId}/paiement
 * ou directement un UUID si le raw n'est pas une URL.
 */
function extractFamilyId(raw: string): string | null {
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    // Pattern attendu : ['famille', '{familyId}', 'paiement']
    const idx = parts.indexOf("famille");
    if (idx !== -1 && parts[idx + 1]) {
      return parts[idx + 1];
    }
    // Fallback : dernier segment si c'est un UUID-like
    const last = parts[parts.length - 1];
    if (last && last.length > 8) return last;
    return null;
  } catch {
    // Pas une URL valide — on retourne le raw brut (cas UUID direct)
    const trimmed = raw.trim();
    return trimmed.length > 8 ? trimmed : null;
  }
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-GN").format(amount) + " GNF";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const QrFinanceModal: React.FC<Props> = ({ open, onClose, onFamilyScanned }) => {
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
  const [result, setResult] = useState<FinanceResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Caméra
  // ------------------------------------------------------------------

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setReady(false);

    if (!engineRef.current) {
      try {
        engineRef.current = await buildEngine();
      } catch {
        setCameraError("Impossible de charger le décodeur QR. Vérifiez votre connexion.");
        return;
      }
    }

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
      await new Promise<void>((resolve) => { video.onloadedmetadata = () => resolve(); });
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
  // Appel API finance
  // ------------------------------------------------------------------

  const handleToken = useCallback(async (raw: string) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setProcessing(true);
    setScanError(null);
    setResult(null);

    const familyId = extractFamilyId(raw);
    if (!familyId) {
      setScanError("QR code non reconnu — ce n'est pas une carte parent EIEF.");
      setProcessing(false);
      setTimeout(() => {
        cooldownRef.current = false;
        lastTokenRef.current = "";
      }, 1500);
      return;
    }

    try {
      const status = await accountingService.getFamilyStatus(familyId);
      const finResult: FinanceResult = {
        familyId: status.familyId,
        totalExpected: status.totalExpected,
        totalPaid: status.totalPaid,
        totalRemaining: status.totalRemaining,
        hasOverdue: status.hasOverdue,
        overdueCount: status.overdueCount,
        studentsCount: status.students?.length ?? 0,
      };
      setResult(finResult);
      onFamilyScanned?.(familyId, status);
      setTimeout(() => { cooldownRef.current = false; }, 4000);
    } catch (err) {
      setScanError(
        err instanceof ApiError
          ? err.message || "Famille introuvable ou non associée à une modalité."
          : "Erreur lors de la récupération du solde famille."
      );
      setTimeout(() => {
        cooldownRef.current = false;
        lastTokenRef.current = "";
      }, 1500);
    } finally {
      setProcessing(false);
    }
  }, [onFamilyScanned]);

  // ------------------------------------------------------------------
  // Boucle de scan
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!ready || !engineRef.current) return;

    const loop = async () => {
      if (!cooldownRef.current && engineRef.current && videoRef.current) {
        try {
          const raw = await engineRef.current(videoRef.current, canvasRef.current, ctxRef.current!);
          if (raw) {
            const token = raw.trim();
            if (token && token !== lastTokenRef.current) {
              lastTokenRef.current = token;
              void handleToken(token);
            }
          }
        } catch { /* frame illisible */ }
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
              <div className="flex items-center justify-between px-5 py-4 text-white bg-gradient-to-r from-emerald-900 to-teal-800">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-emerald-300">
                    Finance QR
                  </p>
                  <p className="text-sm font-black">Scanner la carte parent</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
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
                        <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-lg" />
                        <motion.div
                          animate={{ top: ["8%", "88%", "8%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-2 right-2 h-0.5 bg-emerald-400/80 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]"
                          style={{ top: "8%" }}
                        />
                      </div>
                    </div>
                  )}

                  {!ready && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
                      <Loader2 size={22} className="animate-spin text-emerald-400" />
                      <span className="text-xs font-semibold">Activation de la caméra…</span>
                    </div>
                  )}

                  {processing && (
                    <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-2 text-white">
                      <Loader2 size={22} className="animate-spin text-emerald-400" />
                      <span className="text-xs font-semibold">Récupération du solde famille…</span>
                    </div>
                  )}

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
                    Pointez la caméra vers le QR code de la carte parent
                  </p>
                )}

                {/* Résultat */}
                <AnimatePresence mode="wait">
                  {result && (
                    <motion.div
                      key="res"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl overflow-hidden border border-slate-100"
                    >
                      {/* Badge statut */}
                      <div
                        className={`px-4 py-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                          result.totalRemaining <= 0
                            ? "bg-emerald-50 text-emerald-700"
                            : result.hasOverdue
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {result.totalRemaining <= 0 ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <AlertCircle size={14} />
                        )}
                        {result.totalRemaining <= 0
                          ? "À jour — Tout est réglé"
                          : result.hasOverdue
                          ? `En retard — ${result.overdueCount} échéance${result.overdueCount > 1 ? "s" : ""} dépassée${result.overdueCount > 1 ? "s" : ""}`
                          : "Paiement en cours"}
                      </div>

                      {/* Détails financiers */}
                      <div className="bg-slate-50 px-4 py-3 grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-600 font-black mb-1">
                            <TrendingUp size={10} /> Versé
                          </div>
                          <p className="text-base font-black text-slate-900">
                            {formatCurrency(result.totalPaid)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
                            <Wallet size={10} /> Restant
                          </div>
                          <p
                            className={`text-base font-black ${
                              result.totalRemaining <= 0 ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {result.totalRemaining <= 0
                              ? "0 GNF"
                              : formatCurrency(result.totalRemaining)}
                          </p>
                        </div>
                      </div>

                      {/* Élèves */}
                      <div className="px-4 py-2.5 bg-white border-t border-slate-100">
                        <p className="text-[11px] text-slate-400 font-medium">
                          {result.studentsCount} enfant{result.studentsCount > 1 ? "s" : ""} enregistré{result.studentsCount > 1 ? "s" : ""} dans cette famille
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {scanError && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
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
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-black transition-colors bg-emerald-900 hover:bg-emerald-800"
                  >
                    <RefreshCw size={13} />
                    Scanner la prochaine carte
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

export default QrFinanceModal;
