/**
 * FamilyCardsTab
 * ─ Onglet "Générer" : aperçu + impression carte famille (avec QR code)
 * ─ Onglet "Scanner / Payer" : recherche par matricule OU scan caméra
 *   → affichage solde famille → formulaire de paiement
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import {
  AlertCircle, CheckCircle2, CreditCard, IdCard, Loader2,
  Printer, QrCode, RefreshCw, Search, TrendingUp, Users, Wallet, X,
} from "lucide-react";
import { Avatar, Button, Card } from "../ui";
import { cn } from "../../utils/cn";
import { printFamilyCard, FamilyCardData } from "../../pages/admin/printFamilyCard";
import { generateFamilyCode } from "../../utils/familyUtils";
import {
  accountingService,
  TuitionFeeFamilyStatusResponse,
  PaymentMethod,
} from "../../services/accountingService";
import { ApiError } from "../../services/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FamilyEntry {
  key: string;
  familyId?: string;
  familyCode?: string;
  label: string;
  parents: { id: string; firstName: string; lastName: string; phone?: string | null }[];
  students: { id: string; firstName: string; lastName: string; className?: string }[];
}

interface Props {
  families: FamilyEntry[];
  loading: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const SCHOOL_PHONE = "+224 625 549 579";
const FORMAT_GNF = (n: number) => new Intl.NumberFormat("fr-GN").format(n) + " GNF";

// ─── Moteur QR scan (BarcodeDetector → jsQR) ─────────────────────────────────

type DecodeEngine = (v: HTMLVideoElement, c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => Promise<string | null>;

function loadJsQR(): Promise<(d: Uint8ClampedArray, w: number, h: number) => { data: string } | null> {
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
      const formats = ["qr_code"];
      const bd = new w.BarcodeDetector({ formats });
      return async (video: HTMLVideoElement) => {
        if (video.readyState < 2) return null;
        const codes: any[] = await bd.detect(video);
        return codes.length > 0 ? String(codes[0].rawValue) : null;
      };
    } catch { /* fallback */ }
  }
  const jsQR = await loadJsQR();
  return async (video: HTMLVideoElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    if (video.readyState < 2 || video.videoWidth === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = (jsQR as any)(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
    return result ? result.data : null;
  };
}

function extractFamilyId(raw: string): string | null {
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("famille");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    const last = parts[parts.length - 1];
    return last && last.length > 8 ? last : null;
  } catch {
    const t = raw.trim();
    return t.length > 8 ? t : null;
  }
}

// ─── Sous-composant : Résultat financier + paiement ──────────────────────────

interface FinanceResultPanelProps {
  status: TuitionFeeFamilyStatusResponse;
  familyId: string;
  familyLabel: string;
  onPaymentDone: () => void;
  onClose: () => void;
}

const FinanceResultPanel: React.FC<FinanceResultPanelProps> = ({
  status, familyId, familyLabel, onPaymentDone, onClose,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState(String(status.totalRemaining > 0 ? status.totalRemaining : ""));
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);

  const isAJour = status.totalRemaining <= 0;

  const handlePay = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setPayErr("Montant invalide."); return; }
    setSubmitting(true);
    setPayErr(null);
    try {
      await accountingService.registerFamilyPayment({
        familyId,
        amount: amt,
        method,
        reference: reference.trim() || `PAY-${Date.now()}`,
        payerType: "PARENT",
      });
      onPaymentDone();
    } catch (err) {
      setPayErr(err instanceof ApiError ? err.message : "Erreur lors du paiement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10"
    >
      {/* Statut */}
      <div className={cn(
        "px-4 py-3 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-widest",
        isAJour
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
          : status.hasOverdue
            ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
            : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
      )}>
        <div className="flex items-center gap-2">
          {isAJour ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {isAJour
            ? "À jour — Tout est réglé"
            : status.hasOverdue
              ? `En retard — ${status.overdueCount} échéance${status.overdueCount > 1 ? "s" : ""} dépassée${status.overdueCount > 1 ? "s" : ""}`
              : "Paiement en cours"}
        </div>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
          <X size={13} />
        </button>
      </div>

      {/* Nom famille */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Famille</p>
        <p className="text-sm font-black text-gray-900 dark:text-white">{familyLabel}</p>
      </div>

      {/* Montants */}
      <div className="px-4 py-3 grid grid-cols-3 gap-3 bg-slate-50 dark:bg-white/5 border-y border-slate-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">
            <Wallet size={9}/> Attendu
          </div>
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{FORMAT_GNF(status.totalExpected)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-emerald-600 font-black mb-1">
            <TrendingUp size={9}/> Versé
          </div>
          <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">{FORMAT_GNF(status.totalPaid)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-red-500 font-black mb-1">
            <AlertCircle size={9}/> Restant
          </div>
          <p className={cn("text-sm font-black", isAJour ? "text-emerald-600" : "text-red-600")}>
            {isAJour ? "0 GNF" : FORMAT_GNF(status.totalRemaining)}
          </p>
        </div>
      </div>

      {/* Détail par élève */}
      {status.students && status.students.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Détail par élève</p>
          {status.students.map(s => (
            <div key={s.studentId} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{s.studentName}</span>
              <span className={cn("font-bold", s.totalRemaining <= 0 ? "text-emerald-600" : "text-red-600")}>
                {s.totalRemaining <= 0 ? "✓" : `- ${FORMAT_GNF(s.totalRemaining)}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bouton payer */}
      {!isAJour && !showForm && (
        <div className="px-4 pb-4">
          <Button
            onClick={() => setShowForm(true)}
            className="w-full h-10 bg-emerald-600 border-none text-white text-sm font-black"
          >
            <CreditCard size={14} className="mr-2" /> Enregistrer un paiement
          </Button>
        </div>
      )}

      {/* Formulaire de paiement */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-slate-100 dark:border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Paiement</p>

              {payErr && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle size={12}/> {payErr}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Montant (GNF)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: 500000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mode de paiement</label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as PaymentMethod)}
                  className="w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CASH">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="BANK_TRANSFER">Virement bancaire</option>
                  <option value="CHECK">Chèque</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Référence (optionnel)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="N° reçu / transaction"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setShowForm(false); setPayErr(null); }}
                  disabled={submitting}
                  className="h-10 text-sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => void handlePay()}
                  disabled={submitting}
                  className="h-10 bg-emerald-600 border-none text-white text-sm font-black"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin mr-1"/> : <CheckCircle2 size={14} className="mr-1"/>}
                  Valider
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

type TabMode = "generate" | "scan";

const FamilyCardsTab: React.FC<Props> = ({ families, loading, onSuccess, onError }) => {
  const [mode, setMode] = useState<TabMode>("generate");

  // ── Mode Générer ──────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<FamilyEntry | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (families.length === 0) { setSelected(null); return; }
    if (!selected || !families.some(f => f.key === selected.key)) setSelected(families[0]);
  }, [families, selected]);

  const buildQrUrl = useCallback((f: FamilyEntry) =>
    `${window.location.origin}/famille/${f.familyId ?? f.key}/paiement`, []);

  useEffect(() => {
    let cancelled = false;
    if (!selected) { setQrPreviewUrl(null); return () => { cancelled = true; }; }
    void QRCode.toDataURL(buildQrUrl(selected), {
      width: 200, margin: 1, errorCorrectionLevel: "M",
      color: { dark: "#0c2d48", light: "#ffffff" },
    }).then(u => { if (!cancelled) setQrPreviewUrl(u); })
      .catch(() => { if (!cancelled) setQrPreviewUrl(null); });
    return () => { cancelled = true; };
  }, [selected, buildQrUrl]);

  const handlePrint = async () => {
    if (!selected) return;
    setPrinting(true);
    try {
      const fCode = selected.familyCode ?? generateFamilyCode(selected.familyId, selected.key);
      const cardData: FamilyCardData = {
        familyCode:  fCode,
        familyLabel: selected.label,
        parentPhone: selected.parents[0]?.phone ?? undefined,
        children:    selected.students.map(s => ({ firstName: s.firstName, lastName: s.lastName, className: s.className })),
      };
      await printFamilyCard(cardData, buildQrUrl(selected));
      onSuccess("Carte envoyée à l'impression.");
    } catch (e: any) {
      onError(e?.message ?? "Erreur lors de l'impression.");
    } finally {
      setPrinting(false);
    }
  };

  const familyName = selected ? selected.label.replace(/^FAMILLE\s+/i, "").replace(/^Famille\s+/i, "") : "";
  const initials = familyName.substring(0, 2).toUpperCase();
  const fCode = selected ? (selected.familyCode ?? generateFamilyCode(selected.familyId, selected.key)) : "";
  const phone = selected?.parents[0]?.phone ?? null;

  // ── Mode Scanner ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanProcessing, setScanProcessing] = useState(false);
  const [financeStatus, setFinanceStatus] = useState<TuitionFeeFamilyStatusResponse | null>(null);
  const [foundFamilyId, setFoundFamilyId] = useState<string | null>(null);
  const [foundFamilyLabel, setFoundFamilyLabel] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const engineRef = useRef<DecodeEngine | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const lastTokenRef = useRef("");
  const cooldownRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    scanLoopRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setCameraActive(false);
  }, []);

  useEffect(() => { return () => { stopCamera(); }; }, [stopCamera]);
  useEffect(() => { if (mode !== "scan") stopCamera(); }, [mode, stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);
    setCameraActive(true);
    if (!engineRef.current) {
      try { engineRef.current = await buildEngine(); }
      catch { setCameraError("Impossible de charger le décodeur QR."); return; }
    }
    if (!ctxRef.current) ctxRef.current = canvasRef.current.getContext("2d", { willReadFrequently: true });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await new Promise<void>(res => { video.onloadedmetadata = () => res(); });
      await video.play();
      setCameraReady(true);
    } catch (err: any) {
      const msg = err?.name === "NotAllowedError"
        ? "Accès à la caméra refusé. Autorisez-la dans les paramètres du navigateur."
        : err?.name === "NotFoundError"
          ? "Aucune caméra détectée."
          : "Impossible d'activer la caméra.";
      setCameraError(msg);
    }
  }, []);

  const resolveFinance = useCallback(async (familyId: string, label: string) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setScanProcessing(true);
    setScanError(null);
    setFinanceStatus(null);
    try {
      const status = await accountingService.getFamilyStatus(familyId);
      setFoundFamilyId(familyId);
      setFoundFamilyLabel(label);
      setFinanceStatus(status);
      setTimeout(() => { cooldownRef.current = false; }, 4000);
    } catch (err) {
      setScanError(err instanceof ApiError ? err.message : "Famille introuvable.");
      setTimeout(() => { cooldownRef.current = false; lastTokenRef.current = ""; }, 1500);
    } finally {
      setScanProcessing(false);
    }
  }, []);

  // Boucle de scan caméra
  useEffect(() => {
    if (!cameraReady || !engineRef.current) return;
    const loop = async () => {
      if (!cooldownRef.current && engineRef.current && videoRef.current) {
        try {
          const raw = await engineRef.current(videoRef.current, canvasRef.current, ctxRef.current!);
          if (raw) {
            const token = raw.trim();
            if (token && token !== lastTokenRef.current) {
              lastTokenRef.current = token;
              const familyId = extractFamilyId(token);
              if (familyId) {
                const entry = families.find(f => f.familyId === familyId || f.key === familyId);
                void resolveFinance(familyId, entry?.label ?? "Famille inconnue");
              } else {
                setScanError("QR code non reconnu — ce n'est pas une carte EIEF.");
                setTimeout(() => { cooldownRef.current = false; lastTokenRef.current = ""; }, 1500);
              }
            }
          }
        } catch { /* frame illisible */ }
      }
      scanLoopRef.current = requestAnimationFrame(loop);
    };
    scanLoopRef.current = requestAnimationFrame(loop);
    return () => { if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current); };
  }, [cameraReady, families, resolveFinance]);

  // Recherche par matricule / nom
  const searchResults = searchQuery.trim().length >= 2
    ? families.filter(f =>
        f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.familyCode ?? generateFamilyCode(f.familyId, f.key)).toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSearchSelect = async (f: FamilyEntry) => {
    setSearchQuery(f.label.replace(/^FAMILLE\s+/i, "").replace(/^Famille\s+/i, ""));
    if (!f.familyId) { setScanError("Cette famille n'a pas d'identifiant financier."); return; }
    await resolveFinance(f.familyId, f.label);
  };

  const resetScan = () => {
    setFinanceStatus(null);
    setFoundFamilyId(null);
    setFoundFamilyLabel("");
    setScanError(null);
    setSearchQuery("");
    lastTokenRef.current = "";
    cooldownRef.current = false;
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      key="family-cards"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-vert-500 mb-2">Cartes familles</p>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Cartes d'identité et suivi des frais scolaires.
        </h3>
        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {([["generate", "Générer les cartes"], ["scan", "Scanner / Payer"]] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setMode(t)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                mode === t
                  ? "bg-vert-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* ── MODE GÉNÉRER ── */}
      {mode === "generate" && (
        <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
          {/* Liste familles */}
          <Card className="p-4 border-none shadow-soft dark:bg-gray-900/50">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 size={20} className="animate-spin"/>
                <span className="text-sm">Chargement…</span>
              </div>
            ) : families.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <IdCard size={32} className="opacity-25"/>
                <span className="text-sm">Aucune famille trouvée.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {families.map(f => {
                  const active = f.key === selected?.key;
                  return (
                    <button key={f.key} onClick={() => setSelected(f)}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                        active
                          ? "border-vert-500 bg-vert-50 dark:bg-vert-900/20"
                          : "border-gray-100 bg-white hover:border-vert-200 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      )}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-vert-50 dark:bg-vert-900/30 flex items-center justify-center text-vert-600 dark:text-vert-300 shrink-0">
                          <Users size={16}/>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{f.label}</div>
                          <div className="text-[10px] text-gray-400 font-medium">
                            {f.students.length} enfant{f.students.length > 1 ? "s" : ""}
                            {f.parents[0]?.phone ? ` · ${f.parents[0].phone}` : ""}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Aperçu + actions */}
          <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50">
            {!selected ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <IdCard size={44} className="opacity-25"/>
                <p className="font-semibold text-sm">Sélectionnez une famille.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Aperçu carte */}
                <div
                  className="relative overflow-hidden text-white shadow-2xl"
                  style={{
                    width: "100%", maxWidth: 420, margin: "0 auto",
                    borderRadius: 14, aspectRatio: "86/54",
                    background: "linear-gradient(135deg,#0a1628 0%,#0c2d48 35%,#145a7a 65%,#1a7a6d 100%)",
                  }}
                >
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#c8a84e,#f0d878,#c8a84e)", zIndex:5 }} />
                  <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 90% 10%,rgba(255,255,255,.06) 0%,transparent 60%),radial-gradient(ellipse 50% 80% at 10% 90%,rgba(26,122,109,.15) 0%,transparent 50%)", zIndex:1, pointerEvents:"none" }} />
                  <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", height:"100%", padding:"10px 14px 8px" }}>
                    {/* Header carte */}
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <img src="/logo_eief.jpeg" alt="EIEF" style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,.95)", padding:3, objectFit:"contain", flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", lineHeight:1.15 }}>Ecole Internationale Les Enfants du Futur</div>
                        <div style={{ fontSize:7.5, color:"rgba(255,255,255,.55)", marginTop:1 }}>Sanoyah, Conakry — République de Guinée</div>
                      </div>
                      <div style={{ background:"linear-gradient(135deg,#c8a84e,#e8c860)", color:"#0a1628", fontSize:7, fontWeight:800, padding:"3px 7px", borderRadius:4, textTransform:"uppercase", letterSpacing:"0.12em", flexShrink:0 }}>
                        Carte Famille
                      </div>
                    </div>
                    <div style={{ height:1, margin:"0 0 6px", background:"linear-gradient(90deg,transparent,rgba(200,168,78,.4) 20%,rgba(200,168,78,.4) 80%,transparent)" }} />
                    {/* Corps carte */}
                    <div style={{ display:"flex", gap:10, flex:1, alignItems:"center" }}>
                      <div style={{ width:56, height:68, borderRadius:6, border:"1.5px solid rgba(200,168,78,.5)", background:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontSize:18, fontWeight:900, color:"rgba(255,255,255,.45)" }}>{initials}</span>
                      </div>
                      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:4 }}>
                        <div style={{ fontSize:12, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.02em", lineHeight:1.1 }}>Famille {familyName}</div>
                        <div style={{ fontSize:7, fontWeight:700, color:"rgba(200,168,78,.85)", letterSpacing:"0.08em" }}># {fCode}</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                          {phone && (
                            <div>
                              <div style={{ fontSize:6, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(200,168,78,.85)", marginBottom:1 }}>Téléphone</div>
                              <div style={{ fontSize:8, fontWeight:600, color:"#fff" }}>{phone}</div>
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize:6, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(200,168,78,.85)", marginBottom:1 }}>Enfant(s)</div>
                            <div style={{ fontSize:8, fontWeight:600, color:"#fff" }}>{selected.students.length} élève{selected.students.length > 1 ? "s" : ""}</div>
                          </div>
                        </div>
                      </div>
                      {/* QR */}
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flexShrink:0 }}>
                        <div style={{ width:52, height:52, background:"#fff", borderRadius:6, padding:3, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {qrPreviewUrl
                            ? <img src={qrPreviewUrl} alt="QR" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
                            : <QrCode size={28} style={{ color:"#cbd5e1", opacity:.4 }}/>
                          }
                        </div>
                        <div style={{ fontSize:5.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,.45)", textAlign:"center" }}>Frais scolaires</div>
                      </div>
                    </div>
                    {/* Footer carte */}
                    <div style={{ marginTop:5, textAlign:"center", fontSize:6.5, color:"rgba(255,255,255,.4)", fontWeight:500, lineHeight:1.3 }}>
                      En cas de perte, appelez le <strong style={{ color:"rgba(255,255,255,.65)", fontWeight:700 }}>{SCHOOL_PHONE}</strong> — Sanoyah, Conakry - République de Guinée
                    </div>
                  </div>
                </div>

                {/* Bouton impression */}
                <div className="flex justify-center gap-3">
                  <Button onClick={() => setSelected({ ...selected })} variant="outline" disabled={printing} className="h-11">
                    <RefreshCw size={15} className="mr-2"/> Actualiser
                  </Button>
                  <Button onClick={() => void handlePrint()} disabled={printing} className="h-11 px-8 bg-vert-600 border-none text-white">
                    {printing ? <Loader2 size={15} className="animate-spin mr-2"/> : <Printer size={15} className="mr-2"/>}
                    Imprimer la carte
                  </Button>
                </div>

                {/* Liste enfants */}
                {selected.students.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Enfants inscrits</div>
                    <div className="space-y-1">
                      {selected.students.map(s => (
                        <div key={s.id} className="flex items-center gap-3">
                          <Avatar name={`${s.firstName} ${s.lastName}`} size="xs"/>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{s.firstName} {s.lastName}</span>
                          {s.className && <span className="text-xs text-gray-400 ml-auto">{s.className}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── MODE SCANNER / PAYER ── */}
      {mode === "scan" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,1fr] gap-6">
          {/* Colonne gauche : recherche + caméra */}
          <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50 space-y-5">
            {/* Recherche par matricule */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Recherche par matricule ou nom</p>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setScanError(null); setFinanceStatus(null); }}
                  placeholder="Ex: FAM-1234 ou Diallo…"
                  className="w-full h-11 pl-9 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vert-500"
                />
              </div>
              {/* Résultats de recherche */}
              {searchResults.length > 0 && !financeStatus && (
                <div className="mt-2 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                  {searchResults.map(f => (
                    <button key={f.key} onClick={() => void handleSearchSelect(f)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-vert-50 dark:hover:bg-vert-900/20 border-b border-gray-50 dark:border-white/5 last:border-0 transition-colors text-left">
                      <div className="w-8 h-8 rounded-xl bg-vert-50 dark:bg-vert-900/20 flex items-center justify-center text-vert-600 dark:text-vert-300 shrink-0">
                        <Users size={14}/>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{f.label}</div>
                        <div className="text-[10px] text-gray-400">{f.familyCode ?? generateFamilyCode(f.familyId, f.key)} · {f.students.length} enfant{f.students.length > 1 ? "s" : ""}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Séparateur */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/10"/>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/10"/>
            </div>

            {/* Scanner caméra */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Scanner la carte QR</p>
              {!cameraActive ? (
                <Button onClick={() => void startCamera()} className="w-full h-11 bg-vert-600 border-none text-white">
                  <QrCode size={15} className="mr-2"/> Activer la caméra
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted/>
                    {cameraReady && !financeStatus && !scanProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-44 relative">
                          <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-vert-400 rounded-tl-lg"/>
                          <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-vert-400 rounded-tr-lg"/>
                          <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-vert-400 rounded-bl-lg"/>
                          <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-vert-400 rounded-br-lg"/>
                          <motion.div
                            animate={{ top: ["8%", "88%", "8%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-2 right-2 h-0.5 bg-vert-400/80 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]"
                            style={{ top: "8%" }}
                          />
                        </div>
                      </div>
                    )}
                    {!cameraReady && !cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
                        <Loader2 size={22} className="animate-spin text-vert-400"/>
                        <span className="text-xs font-semibold">Activation de la caméra…</span>
                      </div>
                    )}
                    {scanProcessing && (
                      <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-2 text-white">
                        <Loader2 size={22} className="animate-spin text-vert-400"/>
                        <span className="text-xs font-semibold">Récupération du solde…</span>
                      </div>
                    )}
                    {cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/80">
                        <AlertCircle size={26} className="text-red-400"/>
                        <p className="text-xs font-semibold leading-relaxed">{cameraError}</p>
                        <button
                          onClick={() => { setCameraError(null); void startCamera(); }}
                          className="px-4 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw size={11}/> Réessayer
                        </button>
                      </div>
                    )}
                  </div>
                  <Button onClick={stopCamera} variant="outline" className="w-full h-10 text-sm">
                    <X size={14} className="mr-2"/> Arrêter la caméra
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Colonne droite : résultat financier */}
          <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50">
            {scanProcessing && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <Loader2 size={32} className="animate-spin text-vert-500"/>
                <p className="text-sm font-semibold">Récupération du solde famille…</p>
              </div>
            )}

            {!scanProcessing && !financeStatus && !scanError && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <QrCode size={44} className="opacity-25"/>
                <p className="font-semibold text-sm text-center">
                  Recherchez une famille par matricule<br/>ou scannez sa carte QR.
                </p>
              </div>
            )}

            {scanError && !scanProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 px-4 py-3 mb-4"
              >
                <AlertCircle size={16} className="text-red-500 shrink-0"/>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">{scanError}</p>
              </motion.div>
            )}

            {financeStatus && foundFamilyId && !scanProcessing && (
              <div className="space-y-4">
                <FinanceResultPanel
                  status={financeStatus}
                  familyId={foundFamilyId}
                  familyLabel={foundFamilyLabel}
                  onClose={resetScan}
                  onPaymentDone={() => {
                    onSuccess("Paiement enregistré avec succès.");
                    resetScan();
                  }}
                />
                <Button onClick={resetScan} variant="outline" className="w-full h-10 text-sm">
                  <RefreshCw size={13} className="mr-2"/> Nouvelle recherche
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default FamilyCardsTab;
