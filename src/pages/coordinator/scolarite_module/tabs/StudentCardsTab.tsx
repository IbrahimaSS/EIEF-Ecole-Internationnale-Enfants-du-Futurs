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
import { Avatar, Badge, Button, Card } from "../../../../components/ui";
import { cn } from "../../../../utils/cn";
import { studentCardService, buildStudentCardPublicUrl } from "../../../../services/studentCardService";
import { printStudentCard } from "../utils/printStudentCard";
import { ClassResponse, StudentCardSummary, StudentResponse } from "../types";

interface Props {
  loading: boolean;
  filteredStudents: StudentResponse[];
  classes: ClassResponse[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const StudentCardsTab: React.FC<Props> = ({
  loading,
  filteredStudents,
  classes,
  onSuccess,
  onError,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [card, setCard] = useState<StudentCardSummary | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);

  const selectedClass = useMemo(
    () => classes.find((item) => item.name === selectedStudent?.className && (item as any).studentCount > 0) 
      ?? classes.find((item) => item.name === selectedStudent?.className) 
      ?? null,
    [classes, selectedStudent?.className],
  );

  const loadCard = useCallback(async (student: StudentResponse) => {
    setSelectedStudent(student);
    setCardLoading(true);
    try {
      const data = await studentCardService.getByStudentId(student.id);
      setCard(data);
    } catch (error: any) {
      setCard(null);
      onError(error?.message || "Impossible de charger la carte de l'élève.");
    } finally {
      setCardLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    if (filteredStudents.length === 0) {
      setSelectedStudent(null);
      setCard(null);
      return;
    }

    if (!selectedStudent || !filteredStudents.some((student) => student.id === selectedStudent.id)) {
      void loadCard(filteredStudents[0]);
    }
  }, [filteredStudents, loadCard, selectedStudent]);

  useEffect(() => {
    let cancelled = false;

    if (!card?.generated || !card.qrToken) {
      setQrPreviewUrl(null);
      return () => {
        cancelled = true;
      };
    }

    void QRCode.toDataURL(buildStudentCardPublicUrl(card.qrToken), {
      width: 220,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }).then((dataUrl) => {
      if (!cancelled) {
        setQrPreviewUrl(dataUrl);
      }
    }).catch(() => {
      if (!cancelled) {
        setQrPreviewUrl(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [card?.generated, card?.qrToken]);

  const handleGenerate = async (mode: "generate" | "regenerate") => {
    if (!selectedStudent) return;
    setProcessing(true);
    try {
      const nextCard = mode === "generate"
        ? await studentCardService.generate(selectedStudent.id)
        : await studentCardService.regenerate(selectedStudent.id);
      setCard(nextCard);
      onSuccess(
        mode === "generate"
          ? "Carte scolaire générée avec succès."
          : "QR code régénéré. L'ancienne carte est désormais invalide.",
      );
    } catch (error: any) {
      onError(error?.message || "Impossible de mettre à jour la carte scolaire.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = async () => {
    if (!selectedStudent || !card?.generated || !card.qrToken) return;
    setProcessing(true);
    try {
      await printStudentCard({
        student: selectedStudent,
        schoolClass: selectedClass,
        qrUrl: buildStudentCardPublicUrl(card.qrToken),
      });
      onSuccess("Carte scolaire envoyée à l'impression.");
    } catch (error: any) {
      onError(error?.message || "Impossible d'imprimer la carte scolaire.");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenPublic = () => {
    if (!card?.generated || !card.qrToken) return;
    window.open(buildStudentCardPublicUrl(card.qrToken), "_blank", "noopener,noreferrer");
  };

  const previewImage = card?.avatarUrl || selectedStudent?.avatarUrl || selectedStudent?.photoUrl || null;

  return (
    <motion.div
      key="cartes"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-bleu-500 mb-2">
              Cartes scolaires
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Générer, imprimer et tester les QR codes élèves.
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
              Chaque élève dispose d'un QR code unique. Après régénération, l'ancien QR devient invalide.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[240px]">
            <div className="rounded-2xl bg-gray-50 dark:bg-white/5 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Élèves filtrés</div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{filteredStudents.length}</div>
            </div>
            <div className="rounded-2xl bg-gray-50 dark:bg-white/5 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Carte active</div>
              <div className="text-sm font-black text-gray-900 dark:text-white mt-2">
                {card?.generated ? "Oui" : "Non"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6">
        <Card className="p-4 border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm font-medium">Chargement des élèves...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 text-center">
              <IdCard size={36} className="opacity-25" />
              <span className="text-sm font-medium">Aucun élève trouvé pour cette recherche.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredStudents.map((student) => {
                const active = student.id === selectedStudent?.id;

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => void loadCard(student)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                      active
                        ? "border-bleu-500 bg-bleu-50 dark:bg-bleu-900/20"
                        : "border-gray-100 bg-white hover:border-bleu-200 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={`${student.firstName} ${student.lastName}`} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm leading-none mb-1 truncate">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium truncate">
                          {student.registrationNumber} · {student.className}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
          {!selectedStudent ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400 text-center">
              <QrCode size={48} className="opacity-25" />
              <div>
                <p className="font-semibold text-sm">Sélectionnez un élève pour gérer sa carte.</p>
              </div>
            </div>
          ) : cardLoading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm font-medium">Chargement de la carte scolaire...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-[28px] overflow-hidden bg-gradient-to-br from-slate-950 via-bleu-900 to-cyan-700 text-white shadow-2xl shadow-bleu-900/20">
                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-4">
                  <img src="/logo_eief.jpeg" alt="EIEF" className="w-12 h-12 rounded-full object-contain bg-white/90 p-1.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200 font-bold">Carte scolaire</p>
                    <h3 className="text-xl font-black truncate">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  </div>
                  <Badge variant={card?.generated ? 'success' : 'default'}>
                    {card?.generated ? 'QR actif' : 'À générer'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr,240px] gap-6 px-6 py-6">
                  <div className="flex gap-5">
                    <div className="w-28 h-32 rounded-3xl overflow-hidden border border-white/15 bg-white/10 flex items-center justify-center shrink-0">
                      {previewImage ? (
                        <img src={previewImage} alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-3xl font-black tracking-[0.2em]">
                          {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                      <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Matricule</div>
                        <div className="text-sm font-bold mt-1">{selectedStudent.registrationNumber}</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Classe</div>
                        <div className="text-sm font-bold mt-1">{selectedStudent.className}</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Année académique</div>
                        <div className="text-sm font-bold mt-1">{selectedClass?.academicYearName || '—'}</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3">
                        <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Usage</div>
                        <div className="text-sm font-bold mt-1">Scan lecture seule des notes</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] bg-white px-4 py-4 text-slate-900 flex flex-col items-center justify-center gap-3 min-h-[240px]">
                    {card?.generated && qrPreviewUrl ? (
                      <>
                        <img src={qrPreviewUrl} alt="QR code de la carte scolaire" className="w-44 h-44 object-contain" />
                        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-700 text-center">
                          QR lecture notes
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-slate-500 space-y-2">
                        <QrCode size={42} className="mx-auto opacity-30" />
                        <p className="text-sm font-semibold">Aucun QR généré pour l’instant</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <Button
                  onClick={() => void handleGenerate(card?.generated ? 'regenerate' : 'generate')}
                  disabled={processing}
                  className="h-11 bg-bleu-600 border-none text-white"
                >
                  {processing ? <Loader2 size={16} className="animate-spin mr-2" /> : <ShieldCheck size={16} className="mr-2" />}
                  {card?.generated ? 'Régénérer le QR' : 'Générer la carte'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void loadCard(selectedStudent)}
                  disabled={cardLoading || processing}
                  className="h-11"
                >
                  <RefreshCw size={16} className="mr-2" /> Actualiser
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handlePrint()}
                  disabled={!card?.generated || processing}
                  className="h-11"
                >
                  <Printer size={16} className="mr-2" /> Imprimer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOpenPublic}
                  disabled={!card?.generated}
                  className="h-11"
                >
                  <ExternalLink size={16} className="mr-2" /> Tester le scan
                </Button>
              </div>

              {card?.generated && card.qrToken && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Lien public du QR</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 break-all">
                    {buildStudentCardPublicUrl(card.qrToken)}
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

export default StudentCardsTab;