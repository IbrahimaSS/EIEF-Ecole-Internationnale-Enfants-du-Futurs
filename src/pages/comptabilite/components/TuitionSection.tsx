import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Users, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, Badge, Button, Card, Input } from '../../../components/ui';
import StudentSearchInput from '../../../components/shared/StudentSearchInput';
import TuitionModalityManager from './TuitionModalityManager';
import {
  AcademicYearOption,
  ClassOption,
  PaymentMethod,
  Student,
  TuitionFeePayload,
  TuitionFeeResponse,
  TuitionFeePaymentPayload,
  TuitionFeeStudentStatusResponse,
} from '../types';
import { formatCurrency, formatDate } from '../utils';

interface Props {
  tuitionFees: TuitionFeeResponse[];
  academicYears: AcademicYearOption[];
  classes: ClassOption[];
  students: Student[];
  status: TuitionFeeStudentStatusResponse | null;
  catalogLoading: boolean;
  loading: boolean;
  actionLoading: boolean;
  onCreateTuitionFee: (payload: TuitionFeePayload) => Promise<unknown>;
  onUpdateTuitionFee: (tuitionFeeId: string, payload: TuitionFeePayload) => Promise<unknown>;
  onDeleteTuitionFee: (tuitionFeeId: string) => Promise<unknown>;
  onSearchStatus: (studentId: string) => void;
  onSubmitPayment: (payload: TuitionFeePaymentPayload) => Promise<unknown>;
}

const TuitionSection: React.FC<Props> = ({
  actionLoading,
  academicYears,
  catalogLoading,
  classes,
  loading,
  onCreateTuitionFee,
  onDeleteTuitionFee,
  onSearchStatus,
  onSubmitPayment,
  onUpdateTuitionFee,
  status,
  students,
  tuitionFees,
}) => {
  const [studentId, setStudentId] = useState('');
  const [selectedInstallmentId, setSelectedInstallmentId] = useState('');
  const [amount, setAmount] = useState(0);
  const [reference, setReference] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bulkPaying, setBulkPaying] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkReferenceBase, setBulkReferenceBase] = useState('');
  const [bulkMethod, setBulkMethod] = useState<PaymentMethod>('CASH');

  // Auto-déclenchement de la recherche du statut quand un élève est sélectionné
  useEffect(() => {
    if (studentId) {
      onSearchStatus(studentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // Pré-remplit l'échéance et le montant à payer quand le statut change
  useEffect(() => {
    if (!status?.installments?.length) {
      setSelectedInstallmentId('');
      setAmount(0);
      return;
    }

    const nextInstallment = status.installments.find(
      (installment) => Number(installment.remainingAmount) > 0,
    );

    if (nextInstallment) {
      setSelectedInstallmentId(nextInstallment.installmentId);
      setAmount(Number(nextInstallment.remainingAmount));
    } else {
      // Tout est déjà payé
      setSelectedInstallmentId(status.installments[0]?.installmentId || '');
      setAmount(0);
    }
  }, [status]);

  const selectedInstallment = status?.installments.find(
    (installment) => installment.installmentId === selectedInstallmentId,
  );

  // Validation détaillée pour identifier précisément ce qui manque
  const validationErrors: string[] = [];
  if (!status) validationErrors.push('Sélectionnez un élève');
  if (status && !selectedInstallment) validationErrors.push('Sélectionnez une échéance');
  if (!amount || amount <= 0) validationErrors.push('Saisissez un montant');
  if (!reference.trim()) validationErrors.push('Saisissez une référence');
  if (
    selectedInstallment &&
    amount > Number(selectedInstallment.remainingAmount)
  ) {
    validationErrors.push(
      `Le montant dépasse le restant dû (${formatCurrency(Number(selectedInstallment.remainingAmount))})`,
    );
  }

  const canSubmit = validationErrors.length === 0 && !actionLoading;

  const handleSubmit = async () => {
    if (!canSubmit || !status || !selectedInstallment) return;
    setSubmitError(null);
    try {
      await onSubmitPayment({
        studentId: status.studentId,
        installmentId: selectedInstallment.installmentId,
        amount,
        method,
        reference: reference.trim(),
        payerType: 'PARENT',
      });
      toast.success('Versement enregistré', {
        description: `${formatCurrency(amount)} pour ${status.studentName} (${selectedInstallment.installmentLabel})`,
      });
      // Reset du formulaire après succès — l'échéance suivante sera auto-sélectionnée par useEffect
      setReference('');
      setMethod('CASH');
    } catch (err: any) {
      const message = err?.message || "Erreur lors de l'enregistrement du versement";
      setSubmitError(message);
      toast.error('Échec du versement', { description: message });
    }
  };

  // Échéances avec un solde restant (à payer)
  const remainingInstallments = (status?.installments || []).filter(
    (i) => Number(i.remainingAmount) > 0,
  );

  /**
   * Paiement annuel : lance un POST par échéance non soldée, séquentiellement.
   * À chaque succès on incrémente la barre de progression. En cas d'erreur,
   * on stoppe et on indique combien d'échéances ont été soldées avant l'arrêt.
   */
  const handleBulkPay = async () => {
    if (!status || remainingInstallments.length === 0 || !bulkReferenceBase.trim()) {
      return;
    }
    setBulkPaying(true);
    setBulkProgress({ current: 0, total: remainingInstallments.length });
    setSubmitError(null);

    let successCount = 0;
    try {
      for (let i = 0; i < remainingInstallments.length; i++) {
        const installment = remainingInstallments[i];
        await onSubmitPayment({
          studentId: status.studentId,
          installmentId: installment.installmentId,
          amount: Number(installment.remainingAmount),
          method: bulkMethod,
          reference: `${bulkReferenceBase.trim()}-${i + 1}`,
          payerType: 'PARENT',
        });
        successCount += 1;
        setBulkProgress({ current: successCount, total: remainingInstallments.length });
      }

      toast.success("Année scolaire intégralement soldée", {
        description: `${successCount} échéance(s) payée(s) pour ${status.studentName}.`,
      });
      setShowBulkConfirm(false);
      setBulkReferenceBase('');
      setBulkMethod('CASH');
    } catch (err: any) {
      const message = err?.message || "Erreur pendant le paiement groupé";
      const detail =
        successCount > 0
          ? `${successCount} échéance(s) soldée(s) avant l'erreur. Vérifiez et retentez le reste.`
          : "Aucune échéance n'a pu être enregistrée.";
      setSubmitError(`${message} — ${detail}`);
      toast.error('Paiement groupé interrompu', { description: detail });
    } finally {
      setBulkPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <TuitionModalityManager
        tuitionFees={tuitionFees}
        academicYears={academicYears}
        classes={classes}
        loading={catalogLoading}
        actionLoading={actionLoading}
        onCreate={onCreateTuitionFee}
        onUpdate={onUpdateTuitionFee}
        onDelete={onDeleteTuitionFee}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-vert-50 p-3 text-vert-700 dark:bg-vert-900/20 dark:text-vert-300">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Statut de scolarité
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Recherchez un élève par nom, matricule ou classe.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <StudentSearchInput
              students={students}
              value={studentId}
              onChange={(id) => {
                setStudentId(id);
                if (!id) {
                  // Réinitialise le formulaire si on désélectionne
                  setSelectedInstallmentId('');
                  setAmount(0);
                  setReference('');
                  setSubmitError(null);
                }
              }}
              label="Élève"
              required
              placeholder="Tapez un nom, matricule ou classe..."
            />

            {studentId && loading && (
              <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-xs font-bold text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                Chargement du statut...
              </div>
            )}

            {status && !loading && (
              <>
                <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 dark:border-white/10 dark:from-white/5 dark:to-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <Avatar name={status.studentName} size="md" className="ring-2 ring-or-400/40" />
                    <div className="min-w-0">
                      <p className="truncate font-black text-gray-900 dark:text-white">
                        {status.studentName}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-vert-700 dark:text-or-400">
                        {status.className} · {status.academicYearName}
                      </p>
                    </div>
                    {status.hasOverdue && (
                      <Badge variant="error" className="ml-auto text-[9px] font-bold uppercase tracking-widest">
                        {status.overdueCount} retard(s)
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl bg-white p-3 dark:bg-gray-900">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        Attendu
                      </p>
                      <p className="mt-1 text-xs font-black text-gray-900 dark:text-white">
                        {formatCurrency(Number(status.totalExpected))}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 dark:bg-gray-900">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        Payé
                      </p>
                      <p className="mt-1 text-xs font-black text-vert-600">
                        {formatCurrency(Number(status.totalPaid))}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 dark:bg-gray-900">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        Restant
                      </p>
                      <p className="mt-1 text-xs font-black text-rouge-600">
                        {formatCurrency(Number(status.totalRemaining))}
                      </p>
                    </div>
                  </div>
                </div>

                {Number(status.totalRemaining) <= 0 ? (
                  <div className="flex items-center gap-3 rounded-3xl border border-vert-200 bg-vert-50 p-4 text-vert-800 dark:border-vert-900/40 dark:bg-vert-900/10 dark:text-vert-300">
                    <CheckCircle2 size={22} className="shrink-0" />
                    <div>
                      <p className="text-sm font-black">Scolarité entièrement payée</p>
                      <p className="text-xs font-medium">Aucun versement n'est nécessaire pour cet élève.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Bouton "Payer toute l'année" — solde toutes les échéances en une fois */}
                    {remainingInstallments.length >= 2 && !showBulkConfirm && (
                      <button
                        onClick={() => setShowBulkConfirm(true)}
                        className="group flex w-full items-center justify-between gap-3 rounded-3xl border-2 border-or-300 bg-gradient-to-r from-or-50 to-or-100/50 p-4 text-left transition-all hover:from-or-100 hover:to-or-200/50 hover:border-or-400 hover:shadow-lg dark:border-or-500/30 dark:from-or-900/20 dark:to-or-900/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-or-500 p-2.5 text-gray-950 shadow-md group-hover:scale-110 transition-transform">
                            <Zap size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-or-900 dark:text-or-200">
                              Payer toute l'année en une fois
                            </p>
                            <p className="text-[11px] font-bold text-or-700/80 dark:text-or-300/70">
                              Solder les {remainingInstallments.length} échéances restantes ·{' '}
                              {formatCurrency(Number(status.totalRemaining))}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-lg bg-or-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-950 shadow-md">
                          Solde total
                        </span>
                      </button>
                    )}

                    {/* Mini-formulaire de confirmation pour le paiement groupé */}
                    {showBulkConfirm && (
                      <div className="space-y-3 rounded-3xl border-2 border-or-400 bg-or-50/60 p-4 dark:border-or-500/40 dark:bg-or-900/20">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-black text-or-900 dark:text-or-200">
                              <Zap size={16} className="text-or-600" />
                              Confirmer le paiement annuel
                            </h4>
                            <p className="mt-1 text-[11px] font-bold text-or-800/80 dark:text-or-300/80">
                              {remainingInstallments.length} versements seront créés —{' '}
                              {formatCurrency(Number(status.totalRemaining))} au total.
                            </p>
                          </div>
                          {!bulkPaying && (
                            <button
                              onClick={() => {
                                setShowBulkConfirm(false);
                                setBulkReferenceBase('');
                              }}
                              className="text-or-700 hover:text-or-900 text-xs font-black"
                              type="button"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-or-700">
                            Référence de base *
                          </label>
                          <Input
                            value={bulkReferenceBase}
                            onChange={(e) => setBulkReferenceBase(e.target.value)}
                            placeholder="Ex: ANNEE-2026-CAMARA"
                            disabled={bulkPaying}
                          />
                          <p className="mt-1 text-[10px] font-bold text-or-700/70">
                            Chaque échéance recevra une référence unique : <code>{bulkReferenceBase || 'BASE'}-1</code>,{' '}
                            <code>{bulkReferenceBase || 'BASE'}-2</code>, etc.
                          </p>
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-or-700">
                            Mode de paiement
                          </label>
                          <select
                            value={bulkMethod}
                            onChange={(e) => setBulkMethod(e.target.value as PaymentMethod)}
                            disabled={bulkPaying}
                            className="w-full rounded-2xl border border-or-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-or-500 focus:ring-4 focus:ring-or-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          >
                            <option value="CASH">Espèces</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                            <option value="BANK_TRANSFER">Virement bancaire</option>
                            <option value="CHECK">Chèque</option>
                          </select>
                        </div>

                        {/* Progress bar pendant le paiement groupé */}
                        {bulkPaying && bulkProgress.total > 0 && (
                          <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-or-700 mb-1">
                              <span>Enregistrement en cours...</span>
                              <span>
                                {bulkProgress.current} / {bulkProgress.total}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-or-200 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-or-500 to-or-600 transition-all duration-300"
                                style={{
                                  width: `${
                                    (bulkProgress.current / bulkProgress.total) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleBulkPay}
                          disabled={!bulkReferenceBase.trim() || bulkPaying}
                          className="w-full bg-gradient-to-r from-or-500 to-or-600 text-gray-950 hover:from-or-400 hover:to-or-500 font-black flex items-center justify-center gap-2"
                        >
                          {bulkPaying ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Paiement en cours...
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              Confirmer & payer {formatCurrency(Number(status.totalRemaining))}
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                  <div className="space-y-3 rounded-3xl border border-gray-100 p-4 dark:border-white/10">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white">
                      Enregistrer un versement
                    </h4>

                    {/* Échéance */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Échéance *
                      </label>
                      <select
                        value={selectedInstallmentId}
                        onChange={(event) => {
                          setSelectedInstallmentId(event.target.value);
                          const installment = status.installments.find(
                            (item) => item.installmentId === event.target.value,
                          );
                          if (installment) {
                            setAmount(Number(installment.remainingAmount));
                          }
                        }}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-vert-500 focus:outline-none focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-or-400"
                      >
                        {status.installments.map((installment) => (
                          <option key={installment.installmentId} value={installment.installmentId}>
                            {installment.installmentLabel} · Restant{' '}
                            {formatCurrency(Number(installment.remainingAmount))}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Montant */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Montant (GNF) *
                      </label>
                      <Input
                        type="number"
                        value={amount || ''}
                        onChange={(event) => setAmount(Number(event.target.value))}
                        placeholder="0"
                      />
                      {selectedInstallment && (
                        <p className="mt-1 text-[10px] font-bold text-gray-400">
                          Restant dû :{' '}
                          <span className="text-rouge-600">
                            {formatCurrency(Number(selectedInstallment.remainingAmount))}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Référence */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Référence *
                      </label>
                      <Input
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        placeholder="Ex: REC-2026-001 ou n° quittance"
                      />
                    </div>

                    {/* Mode */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Mode de paiement
                      </label>
                      <select
                        value={method}
                        onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-vert-500 focus:outline-none focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-or-400"
                      >
                        <option value="CASH">Espèces</option>
                        <option value="MOBILE_MONEY">Mobile Money</option>
                        <option value="BANK_TRANSFER">Virement bancaire</option>
                        <option value="CHECK">Chèque</option>
                      </select>
                    </div>

                    {/* Erreurs de validation visibles avant clic */}
                    {validationErrors.length > 0 && (
                      <div className="flex items-start gap-2 rounded-2xl border border-or-200 bg-or-50 px-3 py-2 text-or-800 dark:border-or-500/30 dark:bg-or-500/10 dark:text-or-200">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <div className="text-[11px] font-bold leading-relaxed">
                          {validationErrors.join(' • ')}
                        </div>
                      </div>
                    )}

                    {/* Erreur backend après tentative */}
                    {submitError && (
                      <div className="flex items-start gap-2 rounded-2xl border border-rouge-200 bg-rouge-50 px-3 py-2 text-rouge-700 dark:border-rouge-500/30 dark:bg-rouge-500/10 dark:text-rouge-300">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <div className="text-[11px] font-bold leading-relaxed">{submitError}</div>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="w-full"
                    >
                      {actionLoading ? 'Enregistrement...' : 'Valider le versement'}
                    </Button>
                  </div>
                  </>
                )}
              </>
            )}
          </div>
        </Card>

        <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Échéances détaillées</h3>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Suivez les échéances, les montants payés et les retards éventuels.
          </p>

          {!status ? (
            <div className="flex min-h-[280px] items-center justify-center text-center text-gray-400">
              <div>
                <AlertTriangle size={34} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">
                  Recherchez un élève pour afficher ses échéances.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex min-h-[280px] items-center justify-center gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-semibold">Chargement du détail...</span>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {status.installments.map((installment) => (
                <div
                  key={installment.installmentId}
                  className={`rounded-3xl border p-4 ${
                    installment.overdue
                      ? 'border-rouge-200 bg-rouge-50 dark:border-rouge-900/30 dark:bg-rouge-900/10'
                      : Number(installment.remainingAmount) <= 0
                      ? 'border-vert-200 bg-vert-50 dark:border-vert-900/30 dark:bg-vert-900/10'
                      : 'border-gray-100 bg-white dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {installment.installmentLabel}
                        </p>
                        {installment.overdue && (
                          <Badge variant="error" className="text-[9px] px-3 font-bold uppercase tracking-widest">
                            En retard
                          </Badge>
                        )}
                        {Number(installment.remainingAmount) <= 0 && !installment.overdue && (
                          <Badge variant="success" className="text-[9px] px-3 font-bold uppercase tracking-widest">
                            Soldée
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Échéance · {formatDate(installment.dueDate)}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Attendu</p>
                        <p className="mt-1 text-xs font-black text-gray-900 dark:text-white">
                          {formatCurrency(Number(installment.installmentAmount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Payé</p>
                        <p className="mt-1 text-xs font-black text-vert-600">
                          {formatCurrency(Number(installment.paidAmount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Restant</p>
                        <p className="mt-1 text-xs font-black text-rouge-600">
                          {formatCurrency(Number(installment.remainingAmount))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TuitionSection;
