/**
 * TeacherCardsTab — gestion des cartes professeur avec QR code.
 * Utilisé dans le PointageTab coordinateur et manager.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import {
  ExternalLink,
  IdCard,
  Loader2,
  Printer,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Avatar, Badge, Button, Card } from "../ui";
import { cn } from "../../utils/cn";
import {
  teacherCardService,
  TeacherCardData,
  buildTeacherCardPointageUrl,
} from "../../services/teacherCardService";

interface SimpleTeacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface Props {
  teachers: SimpleTeacher[];
  loading: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const TeacherCardsTab: React.FC<Props> = ({ teachers, loading, onSuccess, onError }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<SimpleTeacher | null>(null);
  const [card, setCard] = useState<TeacherCardData | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);

  const loadCard = useCallback(async (teacher: SimpleTeacher) => {
    setSelectedTeacher(teacher);
    setCardLoading(true);
    try {
      const data = await teacherCardService.getByTeacherId(teacher.id);
      setCard(data);
    } catch (e: any) {
      setCard(null);
      onError(e?.message || "Impossible de charger la carte du professeur.");
    } finally {
      setCardLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    if (teachers.length === 0) { setSelectedTeacher(null); setCard(null); return; }
    if (!selectedTeacher || !teachers.some(t => t.id === selectedTeacher.id)) {
      void loadCard(teachers[0]);
    }
  }, [teachers, loadCard, selectedTeacher]);

  useEffect(() => {
    let cancelled = false;
    if (!card?.generated || !card.qrToken) { setQrPreviewUrl(null); return () => { cancelled = true; }; }
    void QRCode.toDataURL(buildTeacherCardPointageUrl(card.qrToken), {
      width: 200, margin: 1, errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then(url => { if (!cancelled) setQrPreviewUrl(url); })
      .catch(() => { if (!cancelled) setQrPreviewUrl(null); });
    return () => { cancelled = true; };
  }, [card?.generated, card?.qrToken]);

  const handleGenerate = async (mode: "generate" | "regenerate") => {
    if (!selectedTeacher) return;
    setProcessing(true);
    try {
      const next = mode === "generate"
        ? await teacherCardService.generate(selectedTeacher.id)
        : await teacherCardService.regenerate(selectedTeacher.id);
      setCard(next);
      onSuccess(mode === "generate" ? "Carte générée avec succès." : "QR code régénéré. L'ancien QR est désormais invalide.");
    } catch (e: any) {
      onError(e?.message || "Impossible de mettre à jour la carte.");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenPublic = () => {
    if (!card?.generated || !card.qrToken) return;
    window.open(buildTeacherCardPointageUrl(card.qrToken), "_blank", "noopener,noreferrer");
  };

  const handlePrint = async () => {
    if (!selectedTeacher || !card?.generated || !card.qrToken) return;
    setProcessing(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(buildTeacherCardPointageUrl(card.qrToken), {
        width: 300, margin: 1, errorCorrectionLevel: "H",
        color: { dark: "#0c2d48", light: "#ffffff" },
      });

      const hireDateFmt = card.hireDate
        ? new Date(card.hireDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "—";

      const initials = card.fullName.split(" ").map((p: string) => p[0] ?? "").slice(0, 2).join("").toUpperCase();

      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Carte Professeur — ${card.fullName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      background: #e8ecf1;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 10mm;
    }
    .page { display: flex; flex-direction: column; align-items: center; gap: 8mm; }

    /* ── CARTE ── */
    .card {
      width: 86mm; height: 54mm;
      border-radius: 3.5mm; position: relative; overflow: hidden;
      color: #fff; display: flex; flex-direction: column;
      box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.12), 0 16px 40px rgba(0,0,0,.15);
    }
    .card::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg,#0a1628 0%,#0c2d48 35%,#145a7a 65%,#1a7a6d 100%);
      z-index: 0;
    }
    .card::after {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 90% 10%, rgba(255,255,255,.06) 0%, transparent 60%),
        radial-gradient(ellipse 50% 80% at 10% 90%, rgba(26,122,109,.15) 0%, transparent 50%);
      z-index: 1; pointer-events: none;
    }
    .gold-strip {
      position: absolute; top: 0; left: 0; right: 0; height: 0.6mm;
      background: linear-gradient(90deg,#c8a84e,#f0d878,#c8a84e); z-index: 5;
    }
    .card-inner { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }

    /* ── EN-TÊTE ── */
    .header { display: flex; align-items: center; gap: 2.5mm; padding: 3mm 4mm 2mm 4mm; }
    .logo-circle {
      width: 10mm; height: 10mm; border-radius: 50%;
      background: rgba(255,255,255,.95); padding: 0.8mm; flex-shrink: 0;
      box-shadow: 0 1px 4px rgba(0,0,0,.2);
    }
    .logo-circle img { width: 100%; height: 100%; border-radius: 50%; object-fit: contain; }
    .header-info { flex: 1; min-width: 0; }
    .school-name { font-size: 6.2pt; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; line-height: 1.15; }
    .school-sub { font-size: 4.8pt; color: rgba(255,255,255,.55); margin-top: .3mm; letter-spacing: .04em; }
    .badge-carte {
      background: linear-gradient(135deg,#c8a84e,#e8c860); color: #0a1628;
      font-size: 4.5pt; font-weight: 800; padding: .8mm 2.2mm; border-radius: 1mm;
      text-transform: uppercase; letter-spacing: .12em; flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,.2);
    }

    /* ── SÉPARATEUR ── */
    .separator {
      height: .3mm; margin: 0 4mm;
      background: linear-gradient(90deg, transparent, rgba(200,168,78,.4) 20%, rgba(200,168,78,.4) 80%, transparent);
    }

    /* ── CORPS ── */
    .body { display: flex; padding: 2.5mm 4mm 2mm 4mm; gap: 3mm; flex: 1; }

    .photo-col { display: flex; flex-direction: column; align-items: center; gap: 1.5mm; width: 18mm; flex-shrink: 0; }
    .photo-frame {
      width: 18mm; height: 22mm; border-radius: 2mm; overflow: hidden;
      border: .6mm solid rgba(200,168,78,.5); background: rgba(255,255,255,.08);
    }
    .photo-frame img { width: 100%; height: 100%; object-fit: cover; }
    .photo-fallback {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      font-size: 11pt; font-weight: 800; color: rgba(255,255,255,.5);
      background: linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
    }

    .info-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .teacher-name {
      font-size: 9pt; font-weight: 900; line-height: 1.05;
      text-transform: uppercase; letter-spacing: .02em; margin-bottom: 1.8mm;
    }
    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2mm 2.5mm; }
    .field { min-width: 0; }
    .field-label {
      font-size: 4pt; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
      color: rgba(200,168,78,.85); line-height: 1; margin-bottom: .2mm;
    }
    .field-value { font-size: 6pt; font-weight: 600; color: #fff; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .qr-col { display: flex; flex-direction: column; align-items: center; gap: .8mm; flex-shrink: 0; }
    .qr-box { width: 17mm; height: 17mm; background: #fff; border-radius: 1.8mm; padding: 1mm; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
    .qr-box img { width: 100%; height: 100%; object-fit: contain; }
    .qr-label { font-size: 3.8pt; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.5); text-align: center; }

    /* ── PIED ── */
    .footer { padding: 1.2mm 4mm 1.8mm 4mm; text-align: center; font-size: 4.2pt; color: rgba(255,255,255,.45); font-weight: 500; line-height: 1.3; }
    .footer strong { color: rgba(255,255,255,.7); font-weight: 700; }

    @page { size: 86mm 54mm; margin: 0; }
    @media print {
      body { background: none; padding: 0; margin: 0; min-height: auto; }
      .card { box-shadow: none; page-break-inside: avoid; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="gold-strip"></div>
      <div class="card-inner">

        <div class="header">
          <div class="logo-circle">
            <img src="${window.location.origin}/logo_eief.jpeg" alt="Logo"/>
          </div>
          <div class="header-info">
            <div class="school-name">Ecole Internationale Les Enfants du Futur</div>
            <div class="school-sub">Sanoyah, Conakry — République de Guinée</div>
          </div>
          <div class="badge-carte">Carte Professeur</div>
        </div>

        <div class="separator"></div>

        <div class="body">
          <div class="photo-col">
            <div class="photo-frame">
              ${card.avatarUrl
                ? `<img src="${card.avatarUrl}" alt="Photo"/>`
                : `<div class="photo-fallback">${initials}</div>`}
            </div>
          </div>

          <div class="info-col">
            <div class="teacher-name">${card.fullName}</div>
            <div class="fields">
              <div class="field">
                <div class="field-label">Matricule</div>
                <div class="field-value">${card.employeeNumber ?? "—"}</div>
              </div>
              <div class="field">
                <div class="field-label">Matière</div>
                <div class="field-value">${card.specialty ?? "—"}</div>
              </div>
              <div class="field">
                <div class="field-label">Téléphone</div>
                <div class="field-value">${card.phone ?? "—"}</div>
              </div>
              <div class="field">
                <div class="field-label">Depuis</div>
                <div class="field-value">${hireDateFmt}</div>
              </div>
            </div>
          </div>

          <div class="qr-col">
            <div class="qr-box">
              <img src="${qrDataUrl}" alt="QR"/>
            </div>
            <div class="qr-label">Scanner pour pointer</div>
          </div>
        </div>

        <div class="footer">
          En cas de perte, appelez le <strong>+224 625 549 579</strong> — Sanoyah, Conakry - République de Guinée
        </div>

      </div>
    </div>
  </div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
</body>
</html>`;

      const win = window.open("", "_blank");
      if (win) { win.document.write(html); win.document.close(); }
      onSuccess("Carte envoyée à l'impression.");
    } catch {
      onError("Erreur lors de la génération PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div key="teacher-cards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-6"
    >
      <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-purple-500 mb-2">Cartes professeurs</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Générer et imprimer les cartes QR des enseignants.
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Chaque professeur dispose d'un QR code unique pour le pointage automatique arrivée/départ.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        {/* Liste professeurs */}
        <Card className="p-4 border-none shadow-soft dark:bg-gray-900/50">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Chargement…</span>
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <IdCard size={32} className="opacity-25" />
              <span className="text-sm">Aucun professeur trouvé.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {teachers.map(t => {
                const active = t.id === selectedTeacher?.id;
                return (
                  <button key={t.id} onClick={() => void loadCard(t)}
                    className={cn("w-full rounded-2xl border px-4 py-3 text-left transition-all",
                      active ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                             : "border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={`${t.firstName} ${t.lastName}`} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {t.firstName} {t.lastName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium truncate">{t.email ?? ""}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Carte du prof sélectionné */}
        <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50">
          {!selectedTeacher ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
              <QrCode size={44} className="opacity-25" />
              <p className="font-semibold text-sm">Sélectionnez un professeur.</p>
            </div>
          ) : cardLoading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={22} className="animate-spin" /> <span className="text-sm">Chargement…</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visuel carte — même design que la carte élève */}
              <div
                className="relative overflow-hidden text-white shadow-2xl"
                style={{
                  width: "100%", maxWidth: 420, margin: "0 auto",
                  borderRadius: 14, aspectRatio: "86/54",
                  background: "linear-gradient(135deg,#0a1628 0%,#0c2d48 35%,#145a7a 65%,#1a7a6d 100%)",
                }}
              >
                {/* Bande dorée */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#c8a84e,#f0d878,#c8a84e)", zIndex:5 }} />
                {/* Reflets */}
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 90% 10%,rgba(255,255,255,.06) 0%,transparent 60%),radial-gradient(ellipse 50% 80% at 10% 90%,rgba(26,122,109,.15) 0%,transparent 50%)", zIndex:1, pointerEvents:"none" }} />

                <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", height:"100%", padding:"10px 14px 8px" }}>
                  {/* Header */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <img src="/logo_eief.jpeg" alt="EIEF" style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,.95)", padding:3, objectFit:"contain", flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", lineHeight:1.15 }}>Ecole Internationale Les Enfants du Futur</div>
                      <div style={{ fontSize:7.5, color:"rgba(255,255,255,.55)", marginTop:1 }}>Sanoyah, Conakry — République de Guinée</div>
                    </div>
                    <div style={{ background:"linear-gradient(135deg,#c8a84e,#e8c860)", color:"#0a1628", fontSize:7, fontWeight:800, padding:"3px 7px", borderRadius:4, textTransform:"uppercase", letterSpacing:"0.12em", flexShrink:0 }}>
                      Carte Professeur
                    </div>
                  </div>

                  {/* Séparateur doré */}
                  <div style={{ height:1, margin:"0 0 6px", background:"linear-gradient(90deg,transparent,rgba(200,168,78,.4) 20%,rgba(200,168,78,.4) 80%,transparent)" }} />

                  {/* Corps */}
                  <div style={{ display:"flex", gap:10, flex:1 }}>
                    {/* Photo */}
                    <div style={{ width:56, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ width:56, height:68, borderRadius:6, overflow:"hidden", border:"1.5px solid rgba(200,168,78,.5)", background:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {card?.avatarUrl
                          ? <img src={card.avatarUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                          : <span style={{ fontSize:18, fontWeight:900, color:"rgba(255,255,255,.45)" }}>
                              {(card?.fullName ?? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`).split(" ").map((p: string) => p[0] ?? "").slice(0,2).join("").toUpperCase()}
                            </span>
                        }
                      </div>
                    </div>

                    {/* Infos */}
                    <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
                      <div style={{ fontSize:12, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.02em", marginBottom:6, lineHeight:1.1 }}>
                        {card?.fullName ?? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 8px" }}>
                        {[
                          { label:"Matricule", value: card?.employeeNumber ?? "—" },
                          { label:"Matière",   value: card?.specialty ?? "—" },
                          { label:"Téléphone", value: card?.phone ?? "—" },
                          { label:"Depuis",    value: card?.hireDate ? new Date(card.hireDate).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—" },
                        ].map(f => (
                          <div key={f.label} style={{ minWidth:0 }}>
                            <div style={{ fontSize:6, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(200,168,78,.85)", lineHeight:1, marginBottom:1 }}>{f.label}</div>
                            <div style={{ fontSize:8.5, fontWeight:600, color:"#fff", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* QR */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flexShrink:0 }}>
                      <div style={{ width:52, height:52, background:"#fff", borderRadius:6, padding:3, boxShadow:"0 2px 8px rgba(0,0,0,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {card?.generated && qrPreviewUrl
                          ? <img src={qrPreviewUrl} alt="QR" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                          : <QrCode size={28} style={{ color:"#cbd5e1", opacity:.4 }} />
                        }
                      </div>
                      <div style={{ fontSize:5.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,.45)", textAlign:"center" }}>
                        {card?.generated ? "Scanner" : "À générer"}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ marginTop:5, textAlign:"center", fontSize:6.5, color:"rgba(255,255,255,.4)", fontWeight:500, lineHeight:1.3 }}>
                    En cas de perte, appelez le <strong style={{ color:"rgba(255,255,255,.65)", fontWeight:700 }}>+224 625 549 579</strong> — Sanoyah, Conakry - République de Guinée
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <Button onClick={() => void handleGenerate(card?.generated ? "regenerate" : "generate")}
                  disabled={processing}
                  className="h-11 bg-purple-600 border-none text-white"
                >
                  {processing ? <Loader2 size={15} className="animate-spin mr-2" /> : <ShieldCheck size={15} className="mr-2" />}
                  {card?.generated ? "Régénérer QR" : "Générer la carte"}
                </Button>
                <Button variant="outline" onClick={() => void loadCard(selectedTeacher)} disabled={cardLoading || processing} className="h-11">
                  <RefreshCw size={15} className="mr-2" /> Actualiser
                </Button>
                <Button variant="outline" onClick={() => void handlePrint()} disabled={!card?.generated || processing} className="h-11">
                  <Printer size={15} className="mr-2" /> Imprimer
                </Button>
                <Button variant="outline" onClick={handleOpenPublic} disabled={!card?.generated} className="h-11">
                  <ExternalLink size={15} className="mr-2" /> Tester scan
                </Button>
              </div>

              {card?.generated && card.qrToken && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Lien QR pointage</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 break-all">
                    {buildTeacherCardPointageUrl(card.qrToken)}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default TeacherCardsTab;
