/**
 * TeacherCardsTab — gestion des cartes professeur avec QR code.
 * Utilisé dans le PointageTab coordinateur et manager.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import {
  BookOpen,
  ExternalLink,
  IdCard,
  Loader2,
  Phone,
  Printer,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Calendar,
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
        color: { dark: "#0f172a", light: "#ffffff" },
      });

      const hireDateFmt = card.hireDate
        ? new Date(card.hireDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
        : "—";

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Carte Professeur</title>
        <style>
          body{margin:0;font-family:'Segoe UI',sans-serif;background:#f1f5f9}
          .card{width:340px;border-radius:24px;overflow:hidden;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0e7490 100%);color:white;box-shadow:0 20px 60px rgba(0,0,0,.4);margin:40px auto}
          .header{display:flex;align-items:center;gap:12px;padding:20px 24px 16px;border-bottom:1px solid rgba(255,255,255,.12)}
          .logo{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.9);padding:4px;object-fit:contain}
          .school{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.25em;color:rgba(255,255,255,.5)}
          .school-name{font-weight:900;font-size:13px}
          .body{display:flex;gap:16px;padding:20px 24px}
          .avatar{width:70px;height:80px;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.1);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:rgba(255,255,255,.6)}
          .avatar img{width:100%;height:100%;object-fit:cover}
          .info{flex:1}
          .name{font-size:16px;font-weight:900;margin:0 0 4px}
          .specialty{font-size:11px;color:rgba(255,255,255,.6);font-weight:600;margin-bottom:8px}
          .row{font-size:10px;color:rgba(255,255,255,.5);font-weight:600;margin-bottom:3px}
          .row span{color:white;font-weight:700}
          .qr-section{background:white;border-radius:20px;margin:0 16px 16px;padding:14px 16px;display:flex;align-items:center;gap:16px}
          .qr-img{width:80px;height:80px}
          .qr-text{flex:1}
          .qr-label{font-size:11px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:.15em;margin-bottom:4px}
          .qr-hint{font-size:10px;color:#64748b;font-weight:600}
          .footer{text-align:center;font-size:10px;color:rgba(255,255,255,.25);padding-bottom:16px}
        </style></head><body>
        <div class="card">
          <div class="header">
            <img class="logo" src="${window.location.origin}/logo_eief.jpeg" onerror="this.style.display='none'"/>
            <div><div class="school">Carte Professeur</div><div class="school-name">École EIEF</div></div>
          </div>
          <div class="body">
            <div class="avatar">${card.avatarUrl ? `<img src="${card.avatarUrl}"/>` : card.fullName.split(" ").map(p => p[0]).slice(0,2).join("")}</div>
            <div class="info">
              <div class="name">${card.fullName}</div>
              <div class="specialty">${card.specialty ?? "Professeur"}</div>
              <div class="row">Matricule : <span>${card.employeeNumber}</span></div>
              <div class="row">Depuis : <span>${hireDateFmt}</span></div>
              ${card.phone ? `<div class="row">Tél : <span>${card.phone}</span></div>` : ""}
            </div>
          </div>
          <div class="qr-section">
            <img class="qr-img" src="${qrDataUrl}"/>
            <div class="qr-text">
              <div class="qr-label">Scanner pour pointer</div>
              <div class="qr-hint">Arrivée & départ automatique</div>
            </div>
          </div>
          <div class="footer">EIEF — Système de pointage automatique</div>
        </div>
        <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
        </body></html>`;

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
              {/* Visuel carte */}
              <div className="rounded-[28px] overflow-hidden bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-700 text-white shadow-2xl shadow-purple-900/20">
                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-4">
                  <img src="/logo_eief.jpeg" alt="EIEF" className="w-12 h-12 rounded-full object-contain bg-white/90 p-1.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-purple-200 font-bold">Carte professeur</p>
                    <h3 className="text-xl font-black truncate">{card?.fullName ?? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`}</h3>
                  </div>
                  <Badge variant={card?.generated ? "success" : "default"}>
                    {card?.generated ? "QR actif" : "À générer"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr,200px] gap-6 px-6 py-6">
                  <div className="flex gap-5">
                    <div className="w-24 h-28 rounded-3xl overflow-hidden border border-white/15 bg-white/10 flex items-center justify-center shrink-0">
                      {card?.avatarUrl
                        ? <img src={card.avatarUrl} alt={card.fullName} className="w-full h-full object-cover" />
                        : <span className="text-2xl font-black text-white/40">{(card?.fullName ?? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`).split(" ").map(p => p[0]).slice(0,2).join("")}</span>
                      }
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                      <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Matricule</div>
                        <div className="text-sm font-bold mt-1">{card?.employeeNumber ?? "—"}</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3 flex items-start gap-2">
                        <BookOpen size={14} className="text-white/50 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Matière</div>
                          <div className="text-sm font-bold mt-1">{card?.specialty ?? "—"}</div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3 flex items-start gap-2">
                        <Phone size={14} className="text-white/50 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Téléphone</div>
                          <div className="text-sm font-bold mt-1">{card?.phone ?? "—"}</div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3 flex items-start gap-2">
                        <Calendar size={14} className="text-white/50 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Arrivée à EIEF</div>
                          <div className="text-sm font-bold mt-1">
                            {card?.hireDate ? new Date(card.hireDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR preview */}
                  <div className="rounded-[26px] bg-white px-4 py-4 text-slate-900 flex flex-col items-center justify-center gap-3 min-h-[220px]">
                    {card?.generated && qrPreviewUrl ? (
                      <>
                        <img src={qrPreviewUrl} alt="QR" className="w-40 h-40 object-contain" />
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-700 text-center">Scanner pour pointer</div>
                      </>
                    ) : (
                      <div className="text-center text-slate-500 space-y-2">
                        <QrCode size={38} className="mx-auto opacity-30" />
                        <p className="text-xs font-semibold">Aucun QR généré</p>
                      </div>
                    )}
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
