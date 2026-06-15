/**
 * FamilyFinanceScan — page publique accessible via le QR code de la carte parent.
 *
 * URL : /famille/:familyId/paiement
 *
 * Affiche le résumé de paiement de la famille : montant attendu, versé, restant.
 * Page en lecture seule, aucune authentification requise.
 */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Users,
  Clock,
} from "lucide-react";
import { Badge, Button, Card } from "../../components/ui";
import { accountingService, TuitionFeeFamilyStatusResponse } from "../../services/accountingService";
import { ApiError } from "../../services/api";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-GN").format(amount) + " GNF";

const FamilyFinanceScan: React.FC = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TuitionFeeFamilyStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!familyId) {
      setError("QR code invalide.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    accountingService
      .getFamilyStatus(familyId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setError(err.message || "Impossible de charger les informations de paiement.");
        } else {
          setError("Impossible de charger les informations de paiement.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [familyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="flex items-center gap-3 text-white/80">
          <Loader2 size={24} className="animate-spin text-emerald-400" />
          <span className="text-sm font-semibold">Chargement du dossier famille…</span>
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
            {error || "Le dossier famille demandé est introuvable."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-emerald-700 border-none text-white h-11 px-6"
          >
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  const isSettled = data.totalRemaining <= 0;
  const progressPct =
    data.totalExpected > 0
      ? Math.min(Math.round((data.totalPaid / data.totalExpected) * 100), 100)
      : 100;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,78,59,0.35),_transparent_40%),linear-gradient(180deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] px-4 py-8 md:px-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[32px] overflow-hidden bg-white/95 shadow-2xl shadow-slate-950/30"
        >
          {/* En-tête */}
          <div className="bg-gradient-to-br from-slate-950 via-emerald-900 to-teal-800 text-white px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              {/* Initiales */}
              <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-emerald-300">
                  {(familyId ?? "FA").substring(0, 2).toUpperCase()}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300 font-black mb-2">
                  Dossier financier · Lecture seule
                </p>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Carte Famille EIEF
                </h1>
                <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
                  <Badge variant="default">
                    {data.students.length} enfant{data.students.length > 1 ? "s" : ""}
                  </Badge>
                  {isSettled ? (
                    <Badge variant="success">À jour</Badge>
                  ) : data.hasOverdue ? (
                    <Badge variant="error">{data.overdueCount} en retard</Badge>
                  ) : (
                    <Badge variant="warning">Paiement en cours</Badge>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 flex items-center gap-3 shrink-0">
                <ShieldCheck size={18} className="text-emerald-300" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Accès</div>
                  <div className="text-sm font-bold">Lecture seule</div>
                </div>
              </div>
            </div>
          </div>

          {/* Corps */}
          <div className="p-6 md:p-8 space-y-5 text-slate-900">
            {/* Statut global */}
            <Card
              className={`p-5 rounded-[24px] border shadow-none ${
                isSettled
                  ? "bg-emerald-50 border-emerald-100"
                  : data.hasOverdue
                  ? "bg-red-50 border-red-100"
                  : "bg-amber-50 border-amber-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {isSettled ? (
                  <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle
                    size={24}
                    className={data.hasOverdue ? "text-red-600 shrink-0" : "text-amber-600 shrink-0"}
                  />
                )}
                <div>
                  <p
                    className={`text-base font-black ${
                      isSettled
                        ? "text-emerald-700"
                        : data.hasOverdue
                        ? "text-red-700"
                        : "text-amber-700"
                    }`}
                  >
                    {isSettled
                      ? "Tous les frais sont réglés"
                      : data.hasOverdue
                      ? `${data.overdueCount} échéance${data.overdueCount > 1 ? "s" : ""} en retard`
                      : "Paiement en cours — pas d'échéance dépassée"}
                  </p>
                  <p
                    className={`text-sm mt-0.5 ${
                      isSettled
                        ? "text-emerald-600"
                        : data.hasOverdue
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {isSettled
                      ? "Aucun montant restant à régler."
                      : `Il reste ${formatCurrency(data.totalRemaining)} à verser.`}
                  </p>
                </div>
              </div>
            </Card>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 border border-slate-100 shadow-none rounded-3xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Wallet size={13} /> Attendu
                </div>
                <div className="text-xl font-black">{formatCurrency(data.totalExpected)}</div>
              </Card>
              <Card className="p-4 border border-emerald-100 shadow-none rounded-3xl bg-emerald-50">
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <TrendingUp size={13} /> Versé
                </div>
                <div className="text-xl font-black text-emerald-700">{formatCurrency(data.totalPaid)}</div>
              </Card>
              <Card
                className={`p-4 border shadow-none rounded-3xl ${
                  isSettled ? "bg-slate-50 border-slate-100" : "bg-red-50 border-red-100"
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2 ${
                    isSettled ? "text-slate-500" : "text-red-600"
                  }`}
                >
                  <Clock size={13} /> Restant
                </div>
                <div className={`text-xl font-black ${isSettled ? "text-slate-400" : "text-red-700"}`}>
                  {isSettled ? "0 GNF" : formatCurrency(data.totalRemaining)}
                </div>
              </Card>
            </div>

            {/* Barre de progression */}
            <Card className="p-5 rounded-[24px] border border-slate-100 shadow-none bg-white">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Progression du paiement</span>
                <span className="text-emerald-600">{progressPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isSettled ? "bg-emerald-500" : data.hasOverdue ? "bg-red-500" : "bg-amber-500"
                  }`}
                />
              </div>
            </Card>

            {/* Enfants */}
            {data.students.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                  <Users size={16} className="text-emerald-700" /> Enfants
                </h2>
                {data.students.map((s) => (
                  <Card
                    key={s.studentId}
                    className="p-4 rounded-[20px] border border-slate-100 shadow-none bg-white"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-900">{s.studentName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {s.className} · {s.academicYearName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-emerald-600">
                          {formatCurrency(s.totalPaid)}
                        </p>
                        {s.totalRemaining > 0 && (
                          <p className="text-xs font-bold text-red-500">
                            −{formatCurrency(s.totalRemaining)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Note de bas de page */}
            <p className="text-center text-xs text-slate-400 font-medium pt-2">
              Cette page est en lecture seule · Pour tout renseignement, contactez l'administration EIEF.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyFinanceScan;
