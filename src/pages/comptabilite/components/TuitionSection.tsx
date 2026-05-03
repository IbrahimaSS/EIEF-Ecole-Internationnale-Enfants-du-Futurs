import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Users } from 'lucide-react';
import { Avatar, Badge, Button, Card, Input } from '../../../components/ui';
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
    }
  }, [status]);

  const selectedInstallment = status?.installments.find(
    (installment) => installment.installmentId === selectedInstallmentId,
  );

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-bleu-50 p-3 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Statut de scolarité
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Rechercher un élève et enregistrer un versement.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <select
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="">Sélectionner un élève...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
                {student.registrationNumber ? ` (${student.registrationNumber})` : ''}
              </option>
            ))}
          </select>

          <Button
            onClick={() => onSearchStatus(studentId)}
            disabled={!studentId || loading}
            className="w-full"
          >
            {loading ? 'Chargement...' : 'Consulter le statut'}
          </Button>

          {status && (
            <>
              <div className="rounded-3xl bg-gray-50 p-4 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <Avatar name={status.studentName} size="md" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{status.studentName}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      {status.className} · {status.academicYearName}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-white p-3 dark:bg-gray-900">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Attendu</p>
                    <p className="mt-1 text-xs font-black text-gray-900 dark:text-white">
                      {formatCurrency(Number(status.totalExpected))}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 dark:bg-gray-900">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Payé</p>
                    <p className="mt-1 text-xs font-black text-emerald-600">
                      {formatCurrency(Number(status.totalPaid))}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 dark:bg-gray-900">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Restant</p>
                    <p className="mt-1 text-xs font-black text-rouge-600">
                      {formatCurrency(Number(status.totalRemaining))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-gray-100 p-4 dark:border-white/10">
                <h4 className="text-sm font-black text-gray-900 dark:text-white">
                  Enregistrer un versement
                </h4>
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
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {status.installments.map((installment) => (
                    <option key={installment.installmentId} value={installment.installmentId}>
                      {installment.installmentLabel} · Restant {formatCurrency(Number(installment.remainingAmount))}
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  value={amount || ''}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  placeholder="Montant"
                />
                <Input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Référence"
                />
                <select
                  value={method}
                  onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <option value="CASH">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="BANK_TRANSFER">Virement bancaire</option>
                  <option value="CHECK">Chèque</option>
                </select>

                <Button
                  onClick={() =>
                    status &&
                    selectedInstallment &&
                    onSubmitPayment({
                      studentId: status.studentId,
                      installmentId: selectedInstallment.installmentId,
                      amount,
                      method,
                      reference,
                      payerType: 'PARENT',
                    })
                  }
                  disabled={!status || !selectedInstallment || !amount || actionLoading}
                  className="w-full"
                >
                  {actionLoading ? 'Enregistrement...' : 'Valider le versement'}
                </Button>
              </div>
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
                  Sélectionnez un élève pour afficher ses échéances.
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
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10'
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
                        <p className="mt-1 text-xs font-black text-emerald-600">
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
