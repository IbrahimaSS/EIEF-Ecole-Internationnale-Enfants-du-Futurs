import React, { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Input, Modal } from '../../../components/ui';
import {
  AcademicYearOption,
  ClassOption,
  TuitionFeePayload,
  TuitionFeeResponse,
} from '../types';
import { formatCurrency, formatDate } from '../utils';

interface Props {
  tuitionFees: TuitionFeeResponse[];
  academicYears: AcademicYearOption[];
  classes: ClassOption[];
  loading: boolean;
  actionLoading: boolean;
  onCreate: (payload: TuitionFeePayload) => Promise<unknown>;
  onUpdate: (tuitionFeeId: string, payload: TuitionFeePayload) => Promise<unknown>;
  onDelete: (tuitionFeeId: string) => Promise<unknown>;
}

const createInstallment = (installmentOrder: number) => ({
  label: `Tranche ${installmentOrder}`,
  amount: 0,
  dueDate: '',
  installmentOrder,
});

const createEmptyForm = (): TuitionFeePayload => ({
  name: '',
  description: '',
  academicYearId: '',
  totalAmount: 0,
  classIds: [],
  installments: [createInstallment(1)],
  active: true,
});

const normalizeInstallments = (installments: TuitionFeePayload['installments']) =>
  installments.map((installment, index) => ({
    ...installment,
    installmentOrder: index + 1,
  }));

const TuitionModalityManager: React.FC<Props> = ({
  actionLoading,
  academicYears,
  classes,
  loading,
  onCreate,
  onDelete,
  onUpdate,
  tuitionFees,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TuitionFeePayload>(createEmptyForm);
  const [selectedClassFilterId, setSelectedClassFilterId] = useState('');

  const selectedAcademicYearName = useMemo(
    () => academicYears.find((year) => year.id === formData.academicYearId)?.name ?? null,
    [academicYears, formData.academicYearId],
  );

  const availableClasses = useMemo(() => {
    if (!selectedAcademicYearName) {
      return classes;
    }

    return classes.filter(
      (schoolClass) => !schoolClass.academicYearName || schoolClass.academicYearName === selectedAcademicYearName,
    );
  }, [classes, selectedAcademicYearName]);

  const listFilterClasses = useMemo(() => {
    const referencedClassIds = new Set(
      tuitionFees.flatMap((tuitionFee) => tuitionFee.classIds),
    );

    return classes
      .filter((schoolClass) => referencedClassIds.has(schoolClass.id))
      .sort((left, right) => {
        const yearCompare = (left.academicYearName || '').localeCompare(right.academicYearName || '');
        if (yearCompare !== 0) {
          return yearCompare;
        }

        return left.name.localeCompare(right.name);
      });
  }, [classes, tuitionFees]);

  const filteredTuitionFees = useMemo(() => {
    if (!selectedClassFilterId) {
      return tuitionFees;
    }

    return tuitionFees.filter((tuitionFee) => tuitionFee.classIds.includes(selectedClassFilterId));
  }, [selectedClassFilterId, tuitionFees]);

  const installmentTotal = useMemo(
    () => formData.installments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0),
    [formData.installments],
  );

  const totalDifference = Number(formData.totalAmount || 0) - installmentTotal;

  const resetModal = () => {
    setEditingFeeId(null);
    setFormError(null);
    setFormData(createEmptyForm());
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingFeeId(null);
    setFormError(null);
    setFormData(createEmptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (tuitionFee: TuitionFeeResponse) => {
    setEditingFeeId(tuitionFee.id);
    setFormError(null);
    setFormData({
      name: tuitionFee.name,
      description: tuitionFee.description ?? '',
      academicYearId: tuitionFee.academicYearId,
      totalAmount: Number(tuitionFee.totalAmount),
      classIds: tuitionFee.classIds,
      installments: normalizeInstallments(
        tuitionFee.installments
          .slice()
          .sort((left, right) => left.installmentOrder - right.installmentOrder)
          .map((installment) => ({
            label: installment.label,
            amount: Number(installment.amount),
            dueDate: installment.dueDate,
            installmentOrder: installment.installmentOrder,
          })),
      ),
      active: tuitionFee.isActive,
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Le nom de la modalité est obligatoire.';
    }
    if (!formData.academicYearId) {
      return 'Sélectionnez une année académique.';
    }
    if (Number(formData.totalAmount) <= 0) {
      return 'Le montant total doit être supérieur à 0.';
    }
    if (!formData.classIds.length) {
      return 'Sélectionnez au moins une classe.';
    }
    if (!formData.installments.length) {
      return 'Ajoutez au moins une échéance.';
    }

    const uniqueLabels = new Set<string>();
    for (const installment of formData.installments) {
      if (!installment.label.trim()) {
        return 'Chaque échéance doit avoir un libellé.';
      }
      if (!installment.dueDate) {
        return 'Chaque échéance doit avoir une date limite.';
      }
      if (Number(installment.amount) <= 0) {
        return 'Chaque échéance doit avoir un montant supérieur à 0.';
      }
      const normalizedLabel = installment.label.trim().toLowerCase();
      if (uniqueLabels.has(normalizedLabel)) {
        return 'Les libellés des échéances doivent être uniques.';
      }
      uniqueLabels.add(normalizedLabel);
    }

    if (Math.abs(totalDifference) > 0.01) {
      return 'Le total des échéances doit correspondre exactement au montant total.';
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload: TuitionFeePayload = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      totalAmount: Number(formData.totalAmount),
      classIds: [...formData.classIds],
      installments: normalizeInstallments(formData.installments).map((installment, index) => ({
        label: installment.label.trim(),
        amount: Number(installment.amount),
        dueDate: installment.dueDate,
        installmentOrder: index + 1,
      })),
      active: !!formData.active,
    };

    if (editingFeeId) {
      await onUpdate(editingFeeId, payload);
    } else {
      await onCreate(payload);
    }

    resetModal();
  };

  const handleDelete = async (tuitionFee: TuitionFeeResponse) => {
    const confirmed = window.confirm(
      `Supprimer la modalité "${tuitionFee.name}" ? Cette action est irréversible si aucun versement n'y est lié.`,
    );

    if (!confirmed) {
      return;
    }

    await onDelete(tuitionFee.id);

    if (editingFeeId === tuitionFee.id) {
      resetModal();
    }
  };

  const toggleClassSelection = (classId: string) => {
    setFormData((current) => {
      const alreadySelected = current.classIds.includes(classId);
      return {
        ...current,
        classIds: alreadySelected
          ? current.classIds.filter((id) => id !== classId)
          : [...current.classIds, classId],
      };
    });
  };

  const updateAcademicYear = (academicYearId: string) => {
    const nextAcademicYearName = academicYears.find((year) => year.id === academicYearId)?.name;
    setFormData((current) => ({
      ...current,
      academicYearId,
      classIds: current.classIds.filter((classId) => {
        const schoolClass = classes.find((candidate) => candidate.id === classId);
        return schoolClass && nextAcademicYearName
          ? schoolClass.academicYearName === nextAcademicYearName
          : false;
      }),
    }));
  };

  const updateInstallment = (
    installmentIndex: number,
    field: 'label' | 'amount' | 'dueDate',
    value: string | number,
  ) => {
    setFormData((current) => ({
      ...current,
      installments: current.installments.map((installment, index) =>
        index === installmentIndex
          ? {
              ...installment,
              [field]: field === 'amount' ? Number(value) : value,
            }
          : installment,
      ),
    }));
  };

  const addInstallment = () => {
    setFormData((current) => ({
      ...current,
      installments: [
        ...current.installments,
        createInstallment(current.installments.length + 1),
      ],
    }));
  };

  const removeInstallment = (installmentIndex: number) => {
    setFormData((current) => ({
      ...current,
      installments: normalizeInstallments(
        current.installments.filter((_, index) => index !== installmentIndex),
      ),
    }));
  };

  return (
    <>
      <Card className="border-none shadow-soft p-6 dark:bg-gray-900/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-bleu-50 p-3 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Modalités de frais de scolarité
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Créez, modifiez et supprimez les plans de scolarité par année, classe et échéance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[320px] lg:items-end">
            <div className="w-full lg:w-[320px]">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Filtrer par classe
              </label>
              <select
                value={selectedClassFilterId}
                onChange={(event) => setSelectedClassFilterId(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="">Toutes les classes</option>
                {listFilterClasses.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                    {schoolClass.academicYearName ? ` · ${schoolClass.academicYearName}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={openCreateModal} className="self-start lg:self-end">
              <Plus size={16} /> Nouvelle modalité
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <span className="text-sm font-semibold">Chargement des modalités...</span>
          </div>
        ) : tuitionFees.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-gray-200 p-8 text-center dark:border-white/10">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Aucune modalité de scolarité n'est encore configurée.
            </p>
          </div>
        ) : filteredTuitionFees.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-gray-200 p-8 text-center dark:border-white/10">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Aucune modalité ne correspond à la classe sélectionnée.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredTuitionFees.map((tuitionFee) => (
              <div
                key={tuitionFee.id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-black text-gray-900 dark:text-white">
                        {tuitionFee.name}
                      </h4>
                      <Badge variant={tuitionFee.isActive ? 'success' : 'default'}>
                        {tuitionFee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {tuitionFee.description || 'Aucune description fournie.'}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                      {tuitionFee.academicYearName}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(tuitionFee)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(tuitionFee)}
                      disabled={actionLoading}
                    >
                      <Trash2 size={14} /> Supprimer
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Montant total
                    </p>
                    <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                      {formatCurrency(Number(tuitionFee.totalAmount))}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Classes ciblées
                    </p>
                    <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                      {tuitionFee.classNames.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Échéances
                    </p>
                    <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                      {tuitionFee.installments.length}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tuitionFee.classNames.map((className) => (
                    <Badge key={`${tuitionFee.id}-${className}`} variant="info" className="text-[10px] font-bold uppercase tracking-widest">
                      {className}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  {tuitionFee.installments
                    .slice()
                    .sort((left, right) => left.installmentOrder - right.installmentOrder)
                    .map((installment) => (
                      <div
                        key={installment.id}
                        className="flex flex-col gap-3 rounded-2xl border border-gray-100 px-4 py-3 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-bleu-50 p-2 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
                            <CalendarDays size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {installment.label}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                              Échéance {formatDate(installment.dueDate)}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          {formatCurrency(Number(installment.amount))}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetModal}
        title={editingFeeId ? 'Modifier une modalité' : 'Nouvelle modalité de scolarité'}
        size="xl"
      >
        <div className="space-y-6">
          {formError && (
            <div className="rounded-2xl border border-rouge-200 bg-rouge-50 px-4 py-3 text-sm font-semibold text-rouge-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Input
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ex: Scolarité collège 2025-2026"
              label="Nom de la modalité"
            />
            <Input
              type="number"
              value={formData.totalAmount || ''}
              onChange={(event) => setFormData((current) => ({
                ...current,
                totalAmount: Number(event.target.value),
              }))}
              placeholder="0"
              label="Montant total"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              placeholder="Précisez la portée, les classes concernées et les règles éventuelles."
              className="min-h-[110px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-all focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Année académique
              </label>
              <select
                value={formData.academicYearId}
                onChange={(event) => updateAcademicYear(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="">Sélectionner une année...</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}{year.isActive ? ' (active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <label className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-white/10 dark:text-white">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(event) => setFormData((current) => ({ ...current, active: event.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-bleu-600 focus:ring-bleu-500"
              />
              Modalité active
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Classes concernées
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sélectionnez les classes de l'année académique choisie.
                </p>
              </div>
              <Badge variant="default" className="text-[10px] font-bold uppercase tracking-widest">
                {formData.classIds.length} sélectionnée(s)
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-3xl border border-gray-100 p-4 dark:border-white/10 lg:grid-cols-2">
              {availableClasses.length === 0 ? (
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Aucune classe disponible pour l'année sélectionnée.
                </p>
              ) : (
                availableClasses.map((schoolClass) => {
                  const checked = formData.classIds.includes(schoolClass.id);
                  return (
                    <label
                      key={schoolClass.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-all ${
                        checked
                          ? 'border-bleu-400 bg-bleu-50 dark:border-bleu-500/40 dark:bg-bleu-900/10'
                          : 'border-gray-100 bg-white dark:border-white/10 dark:bg-white/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleClassSelection(schoolClass.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-bleu-600 focus:ring-bleu-500"
                      />
                      <span>
                        <span className="block text-sm font-bold text-gray-900 dark:text-white">
                          {schoolClass.name}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                          {schoolClass.level} · {schoolClass.studentCount}/{schoolClass.maxStudents} élèves
                        </span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Échéancier
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Répartissez le montant total sur une ou plusieurs échéances.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addInstallment}>
                <Plus size={14} /> Ajouter une échéance
              </Button>
            </div>

            <div className="space-y-3">
              {formData.installments.map((installment, index) => (
                <div
                  key={`${editingFeeId || 'new'}-${index}`}
                  className="rounded-3xl border border-gray-100 p-4 dark:border-white/10"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        Échéance {index + 1}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        L'ordre est défini automatiquement.
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstallment(index)}
                      disabled={formData.installments.length === 1}
                    >
                      <Trash2 size={14} /> Retirer
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <Input
                      value={installment.label}
                      onChange={(event) => updateInstallment(index, 'label', event.target.value)}
                      placeholder={`Tranche ${index + 1}`}
                      label="Libellé"
                    />
                    <Input
                      type="number"
                      value={installment.amount || ''}
                      onChange={(event) => updateInstallment(index, 'amount', event.target.value)}
                      placeholder="0"
                      label="Montant"
                    />
                    <Input
                      type="date"
                      value={installment.dueDate}
                      onChange={(event) => updateInstallment(index, 'dueDate', event.target.value)}
                      label="Date limite"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 rounded-3xl bg-gray-50 p-4 dark:bg-gray-900/60 lg:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Montant total saisi
                </p>
                <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                  {formatCurrency(Number(formData.totalAmount))}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Total des échéances
                </p>
                <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                  {formatCurrency(installmentTotal)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Écart
                </p>
                <p className={`mt-1 text-sm font-black ${Math.abs(totalDifference) > 0.01 ? 'text-rouge-600' : 'text-emerald-600'}`}>
                  {formatCurrency(Math.abs(totalDifference))}
                  {Math.abs(totalDifference) > 0.01 ? ' à corriger' : ' équilibré'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={resetModal}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} loading={actionLoading}>
              <CheckCircle2 size={16} />
              {editingFeeId ? 'Enregistrer les modifications' : 'Créer la modalité'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TuitionModalityManager;