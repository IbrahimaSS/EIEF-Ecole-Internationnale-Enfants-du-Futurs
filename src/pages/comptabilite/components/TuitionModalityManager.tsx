import React, { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Input, Modal } from '../../../components/ui';
import {
  AcademicYearOption,
  ClassOption,
  TuitionFeeFamilyAdjustmentPayload,
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

const AUTO_INSTALLMENT_LABEL = 'Tranche unique';

const WIZARD_STEPS = ['Général', 'Frais initiaux', 'Échéancier', 'Remises', 'Récapitulatif'];

const createEmptyForm = (): TuitionFeePayload => ({
  name: '',
  description: '',
  typeInscription: 'INSCRIPTION',
  academicYearId: '',
  classIds: [],
  installments: [],
  familyAdjustments: [],
  active: true,
});

// ── Gestion Inscription / Réinscription ─────────────────────────────────────
// Le backend ne possède pas (encore) de champ dédié au type d'inscription
// (Nouvelle Inscription vs Réinscription). On contourne en encodant le type
// dans la `description` via un marqueur invisible "[TYPE:INSCRIPTION]" ou
// "[TYPE:REINSCRIPTION]". Les helpers ci-dessous gèrent l'encodage/décodage
// de façon transparente : la description visible reste propre, et chaque
// modalité s'affiche avec un badge clair (Inscription / Réinscription).

export type ModalityType = 'INSCRIPTION' | 'REINSCRIPTION';

const TYPE_MARKER_RE = /^\[TYPE:(INSCRIPTION|REINSCRIPTION)\]\s*/;

const extractType = (description: string | null | undefined): ModalityType => {
  if (!description) return 'INSCRIPTION';
  const match = description.match(TYPE_MARKER_RE);
  return (match?.[1] as ModalityType) || 'INSCRIPTION';
};

const resolveModalityType = (tuitionFee: Pick<TuitionFeeResponse, 'typeInscription' | 'description'>): ModalityType => {
  return tuitionFee.typeInscription ?? extractType(tuitionFee.description);
};

const stripTypeMarker = (description: string | null | undefined): string => {
  if (!description) return '';
  return description.replace(TYPE_MARKER_RE, '');
};

const encodeTypeInDescription = (type: ModalityType, description: string): string => {
  const cleaned = stripTypeMarker(description).trim();
  return `[TYPE:${type}]${cleaned ? ' ' + cleaned : ''}`;
};

const LABEL_BY_TYPE: Record<ModalityType, string> = {
  INSCRIPTION: 'Nouvelle Inscription',
  REINSCRIPTION: 'Réinscription',
};

// ── Frais d'inscription / réinscription ─────────────────────────────────────
// Le backend ne possède pas (encore) de champ dédié pour les frais initiaux
// (inscription / réinscription) distincts des tranches de scolarité. On les
// encode comme une échéance spéciale (la première) avec un libellé porteur
// du marqueur "[INSCRIPTION_FEE]" ou "[REINSCRIPTION_FEE]". Les helpers
// ci-dessous gèrent l'encodage/décodage de façon transparente.
//
// Règle métier : à partir de 3 enfants d'une même famille, ces frais sont
// offerts. La logique de déduction est appliquée côté Encaissement (admin/
// Accounting.tsx → computeFamilyDiscountInfo). Le marqueur ci-dessus permet
// au frontend d'identifier ces frais dans la liste d'échéances.
const INSCRIPTION_FEE_LABEL_PREFIX = '[INSCRIPTION_FEE]';
const REINSCRIPTION_FEE_LABEL_PREFIX = '[REINSCRIPTION_FEE]';
const FEE_LABEL_BY_TYPE: Record<ModalityType, string> = {
  INSCRIPTION: 'Frais d\'inscription',
  REINSCRIPTION: 'Frais de réinscription',
};
const FEE_PREFIX_BY_TYPE: Record<ModalityType, string> = {
  INSCRIPTION: INSCRIPTION_FEE_LABEL_PREFIX,
  REINSCRIPTION: REINSCRIPTION_FEE_LABEL_PREFIX,
};
const isInscriptionFeeLabel = (label: string): boolean =>
  label.startsWith(INSCRIPTION_FEE_LABEL_PREFIX) || label.startsWith(REINSCRIPTION_FEE_LABEL_PREFIX);
const extractInscriptionFee = (
  installments: TuitionFeePayload['installments'],
): { amount: number; dueDate: string } | null => {
  const found = installments.find((inst) => isInscriptionFeeLabel(inst.label));
  if (!found) return null;
  return { amount: Number(found.amount) || 0, dueDate: found.dueDate || '' };
};
const stripInscriptionFee = (installments: TuitionFeePayload['installments']) =>
  installments.filter((inst) => !isInscriptionFeeLabel(inst.label));

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
  const [modalityType, setModalityType] = useState<ModalityType>('INSCRIPTION');
  const [typeFilter, setTypeFilter] = useState<'TOUS' | ModalityType>('TOUS');
  const [inscriptionFeeAmount, setInscriptionFeeAmount] = useState<number>(0);
  const [inscriptionFeeDueDate, setInscriptionFeeDueDate] = useState<string>('');
  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [scolariteAmount, setScolariteAmount] = useState<number>(0);
  const [localFamilyAdjustments, setLocalFamilyAdjustments] = useState<TuitionFeeFamilyAdjustmentPayload[]>([]);

  // On filtre les classes par année académique sélectionnée pour éviter que
  // le backend rejette des classes appartenant à une autre année.
  const availableClasses = useMemo(
    () =>
      classes
        .filter((c) => !formData.academicYearId || !c.academicYearId || c.academicYearId === formData.academicYearId)
        .sort((left, right) => left.name.localeCompare(right.name)),
    [classes, formData.academicYearId],
  );

  // Filtre "Filtrer par classe" du listing : on affiche TOUTES les classes,
  // pas uniquement celles qui sont déjà rattachées à une modalité.
  const listFilterClasses = useMemo(
    () =>
      classes.slice().sort((left, right) => {
        const yearCompare = (left.academicYearName || '').localeCompare(right.academicYearName || '');
        if (yearCompare !== 0) return yearCompare;
        return left.name.localeCompare(right.name);
      }),
    [classes],
  );

  const filteredTuitionFees = useMemo(() => {
    return tuitionFees.filter((tuitionFee) => {
      // Filtre par classe.
      if (selectedClassFilterId && !(tuitionFee.classIds || []).includes(selectedClassFilterId)) {
        return false;
      }
      // Filtre par type (Inscription / Réinscription).
      if (typeFilter !== 'TOUS' && resolveModalityType(tuitionFee) !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [selectedClassFilterId, typeFilter, tuitionFees]);

  const selectedAcademicYear = academicYears.find((year) => year.id === formData.academicYearId);
  const defaultInstallmentDueDate = selectedAcademicYear?.startDate || '';
  // Total des tranches "scolarité" (hors frais d'inscription / réinscription).
  const scolariteInstallmentTotal = useMemo(
    () => formData.installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0),
    [formData.installments],
  );
  const scolariteTotalDifference = scolariteInstallmentTotal - scolariteAmount;
  const hasManualInstallments = formData.installments.length > 0;

  // ── Distribution helpers ──────────────────────────────────────────────────
  const distributeEvenly = () => {
    const count = formData.installments.length;
    if (count === 0 || scolariteAmount <= 0) return;
    const base = Math.floor(scolariteAmount / count);
    const remainder = scolariteAmount - base * count;
    setFormData((current) => ({
      ...current,
      installments: current.installments.map((inst, index) => ({
        ...inst,
        amount: index === count - 1 ? base + remainder : base,
      })),
    }));
  };

  const generateInstallments = (count: number) => {
    if (count <= 0) return;
    const base = scolariteAmount > 0 ? Math.floor(scolariteAmount / count) : 0;
    const remainder = scolariteAmount > 0 ? scolariteAmount - base * count : 0;
    const newInstallments = Array.from({ length: count }, (_, i) => ({
      label: `Tranche ${i + 1}`,
      amount: i === count - 1 ? base + remainder : base,
      dueDate: defaultInstallmentDueDate,
      installmentOrder: i + 1,
    }));
    setFormData((current) => ({ ...current, installments: newInstallments }));
  };

  // ── Family adjustments ────────────────────────────────────────────────────
  const addFamilyAdjustment = () => {
    setLocalFamilyAdjustments((current) => [
      ...current,
      { minimumChildren: current.length + 2, maximumChildren: undefined, discountPercentage: 0 },
    ]);
  };

  const updateFamilyAdjustment = (
    index: number,
    field: keyof TuitionFeeFamilyAdjustmentPayload,
    value: number | undefined,
  ) => {
    setLocalFamilyAdjustments((current) =>
      current.map((adj, i) => (i === index ? { ...adj, [field]: value } : adj)),
    );
  };

  const removeFamilyAdjustment = (index: number) => {
    setLocalFamilyAdjustments((current) => current.filter((_, i) => i !== index));
  };

  const resetModal = () => {
    setEditingFeeId(null);
    setFormError(null);
    setFormData(createEmptyForm());
    setModalityType('INSCRIPTION');
    setInscriptionFeeAmount(0);
    setInscriptionFeeDueDate('');
    setScolariteAmount(0);
    setLocalFamilyAdjustments([]);
    setWizardStep(1);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingFeeId(null);
    setFormError(null);
    setFormData(createEmptyForm());
    setModalityType('INSCRIPTION');
    setInscriptionFeeAmount(0);
    setInscriptionFeeDueDate('');
    setScolariteAmount(0);
    setLocalFamilyAdjustments([]);
    setWizardStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = (tuitionFee: TuitionFeeResponse) => {
    setEditingFeeId(tuitionFee.id);
    setFormError(null);
    const type = resolveModalityType(tuitionFee);
    setModalityType(type);
    const allInstallments = (tuitionFee.installments ?? [])
      .slice()
      .sort((left, right) => left.installmentOrder - right.installmentOrder)
      .map((inst) => ({
        label: inst.label,
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
        installmentOrder: inst.installmentOrder,
      }));
    const feeInfo = extractInscriptionFee(allInstallments);
    const scolariteInstallments = stripInscriptionFee(allInstallments);
    const computedScolariteAmount = scolariteInstallments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
    setInscriptionFeeAmount(feeInfo?.amount ?? 0);
    setInscriptionFeeDueDate(feeInfo?.dueDate ?? '');
    setScolariteAmount(computedScolariteAmount);
    setLocalFamilyAdjustments(
      (tuitionFee.familyAdjustments ?? []).map((adj) => ({
        minimumChildren: adj.minimumChildren,
        maximumChildren: adj.maximumChildren,
        discountPercentage: Number(adj.discountPercentage),
      })),
    );
    setFormData({
      name: tuitionFee.name,
      description: stripTypeMarker(tuitionFee.description ?? ''),
      typeInscription: type,
      academicYearId: tuitionFee.academicYearId,
      classIds: tuitionFee.classIds,
      installments: normalizeInstallments(scolariteInstallments),
      familyAdjustments: [],
      active: tuitionFee.isActive,
    });
    setWizardStep(1);
    setIsModalOpen(true);
  };

  // ── Per-step validation ───────────────────────────────────────────────────
  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return 'Le nom de la modalité est obligatoire.';
        if (!formData.academicYearId) return 'Sélectionnez une année académique.';
        if (!formData.classIds.length) return 'Sélectionnez au moins une classe.';
        return null;
      case 2:
        if (inscriptionFeeAmount > 0 && !inscriptionFeeDueDate && !defaultInstallmentDueDate) {
          return "Veuillez saisir une date d'échéance pour le frais initial.";
        }
        return null;
      case 3: {
        if (scolariteAmount <= 0 && Number(inscriptionFeeAmount || 0) <= 0) {
          return "Saisissez le montant scolarité ou un frais initial.";
        }
        if (scolariteAmount > 0 && hasManualInstallments) {
          for (const inst of formData.installments) {
            if (!inst.label.trim()) return 'Chaque tranche doit avoir un libellé.';
            if (!inst.dueDate) return "Chaque tranche doit avoir une date d'échéance.";
            if (Number(inst.amount) <= 0) return 'Chaque tranche doit avoir un montant supérieur à 0.';
          }
          const labels = formData.installments.map((i) => i.label.trim().toLowerCase());
          if (new Set(labels).size !== labels.length) return 'Les libellés des tranches doivent être uniques.';
          if (Math.abs(scolariteTotalDifference) > 0.01) {
            return `La somme des tranches (${formatCurrency(scolariteInstallmentTotal)}) doit être égale au montant scolarité (${formatCurrency(scolariteAmount)}).`;
          }
        }
        if (scolariteAmount > 0 && !hasManualInstallments && !defaultInstallmentDueDate) {
          return "Impossible de générer la tranche unique sans date de début d'année académique.";
        }
        return null;
      }
      case 4: {
        const sorted = [...localFamilyAdjustments].sort((a, b) => a.minimumChildren - b.minimumChildren);
        let prevMax = 1;
        for (const adj of sorted) {
          if (adj.discountPercentage <= 0 || adj.discountPercentage > 100) {
            return 'Le pourcentage de remise doit être compris entre 0 et 100.';
          }
          if (adj.maximumChildren !== undefined && adj.maximumChildren < adj.minimumChildren) {
            return "Le nombre maximum d'enfants doit être ≥ au minimum.";
          }
          if (adj.minimumChildren <= prevMax) {
            return 'Les plages de remises familiales ne doivent pas se chevaucher.';
          }
          prevMax = adj.maximumChildren !== undefined ? adj.maximumChildren : 999;
        }
        return null;
      }
      default:
        return null;
    }
  };

  const handleNext = () => {
    const error = validateStep(wizardStep);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    setWizardStep((s) => s + 1);
  };

  const handleBack = () => {
    setFormError(null);
    setWizardStep((s) => s - 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    for (let step = 1; step <= 4; step++) {
      const error = validateStep(step);
      if (error) {
        setFormError(error);
        setWizardStep(step);
        return;
      }
    }

    const feeAmount = Number(inscriptionFeeAmount || 0);
    const feeDueDate = inscriptionFeeDueDate || formData.installments[0]?.dueDate || defaultInstallmentDueDate;
    const feeInstallments = feeAmount > 0
      ? [{
          label: `${FEE_PREFIX_BY_TYPE[modalityType]} ${FEE_LABEL_BY_TYPE[modalityType]}`,
          amount: feeAmount,
          dueDate: feeDueDate,
          installmentOrder: 1,
        }]
      : [];

    const scolariteInstallmentsForSubmit = hasManualInstallments
      ? formData.installments.map((inst) => ({
          label: inst.label.trim(),
          amount: Number(inst.amount),
          dueDate: inst.dueDate,
          installmentOrder: inst.installmentOrder,
        }))
      : scolariteAmount > 0
        ? [{
            label: AUTO_INSTALLMENT_LABEL,
            amount: scolariteAmount,
            dueDate: defaultInstallmentDueDate,
            installmentOrder: 1,
          }]
        : [];

    const mergedInstallments = normalizeInstallments([...feeInstallments, ...scolariteInstallmentsForSubmit]);

    const payload: TuitionFeePayload = {
      ...formData,
      name: formData.name.trim(),
      typeInscription: modalityType,
      description: encodeTypeInDescription(modalityType, formData.description.trim()),
      classIds: [...formData.classIds],
      installments: mergedInstallments.map((inst, index) => ({
        label: inst.label,
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
        installmentOrder: index + 1,
      })),
      familyAdjustments: localFamilyAdjustments,
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

    // On capture l'erreur ici pour éviter qu'elle ne remonte en "Uncaught
    // runtime error". Le backend renvoie typiquement :
    //   "Cannot delete a tuition fee modality that already has payments"
    // quand des versements sont déjà rattachés à la modalité.
    // Dans ce cas, on propose à l'utilisateur d'ARCHIVER la modalité
    // (la passer en inactive) plutôt que de la supprimer — c'est la
    // bonne pratique comptable : on garde l'historique mais elle
    // n'apparaît plus comme choix pour les nouveaux versements.
    try {
      await onDelete(tuitionFee.id);
      if (editingFeeId === tuitionFee.id) {
        resetModal();
      }
    } catch (err: any) {
      const raw = (err?.message || '').toString();
      const isHasPayments = raw.toLowerCase().includes('already has payments')
        || raw.toLowerCase().includes('has payments');

      if (!isHasPayments) {
        // Erreur d'une autre nature : on l'affiche telle quelle.
        const msg = `Suppression impossible : ${raw || 'erreur inconnue'}`;
        if (isModalOpen && editingFeeId === tuitionFee.id) {
          setFormError(msg);
        } else {
          window.alert(msg);
        }
        return;
      }

      // Cas "has payments" : on propose l'archivage à la place.
      if (!tuitionFee.isActive) {
        // Déjà archivée → rien à faire de plus.
        window.alert(
          `"${tuitionFee.name}" a déjà des paiements et est déjà archivée (inactive). Elle ne peut donc pas être supprimée pour préserver la traçabilité comptable.`,
        );
        return;
      }

      const archiveConfirmed = window.confirm(
        `Impossible de supprimer "${tuitionFee.name}" : des paiements y sont déjà associés.\n\n`
        + `Veux-tu plutôt l'ARCHIVER (la rendre inactive) ?\n`
        + `→ Elle reste dans l'historique pour les paiements existants.\n`
        + `→ Elle disparaît des choix pour les nouveaux versements.\n\n`
        + `Clique OK pour archiver, ou Annuler pour la garder active.`,
      );

      if (!archiveConfirmed) return;

      try {
        const type = extractType(tuitionFee.description);
        const cleanDescription = stripTypeMarker(tuitionFee.description ?? '');
        const archivePayload: TuitionFeePayload = {
          name: tuitionFee.name,
          description: encodeTypeInDescription(type, cleanDescription),
          typeInscription: type,
          academicYearId: tuitionFee.academicYearId,
          classIds: [...(tuitionFee.classIds || [])],
          installments: (tuitionFee.installments || [])
            .slice()
            .sort((a, b) => a.installmentOrder - b.installmentOrder)
            .map((inst, idx) => ({
              label: inst.label,
              amount: Number(inst.amount),
              dueDate: inst.dueDate,
              installmentOrder: idx + 1,
            })),
          familyAdjustments: (tuitionFee.familyAdjustments ?? []).map((adj) => ({
            minimumChildren: adj.minimumChildren,
            maximumChildren: adj.maximumChildren,
            discountPercentage: Number(adj.discountPercentage),
          })),
          active: false,
        };
        await onUpdate(tuitionFee.id, archivePayload);
        if (editingFeeId === tuitionFee.id) {
          resetModal();
        }
        window.alert(`"${tuitionFee.name}" a été archivée avec succès.`);
      } catch (archiveErr: any) {
        const archiveMsg = `Archivage impossible : ${(archiveErr?.message || 'erreur inconnue')}`;
        if (isModalOpen && editingFeeId === tuitionFee.id) {
          setFormError(archiveMsg);
        } else {
          window.alert(archiveMsg);
        }
      }
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

  // On ne retire plus les classes déjà sélectionnées lorsqu'on change d'année :
  // toutes les classes restent disponibles indépendamment de l'année scolaire.
  const updateAcademicYear = (academicYearId: string) => {
    setFormData((current) => ({
      ...current,
      academicYearId,
      classIds: current.classIds.filter((id) => {
        const cls = classes.find((c) => c.id === id);
        return cls?.academicYearId === academicYearId;
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

  // ── Wizard step rendering ─────────────────────────────────────────────────
  const renderStepIndicator = () => (
    <div className="mb-6 flex items-center">
      {WIZARD_STEPS.map((label, index) => {
        const step = index + 1;
        const active = wizardStep === step;
        const done = wizardStep > step;
        return (
          <React.Fragment key={step}>
            <div className="flex min-w-0 flex-col items-center gap-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                done
                  ? 'bg-vert-500 text-white'
                  : active
                    ? 'bg-bleu-600 text-white ring-4 ring-bleu-100 dark:ring-bleu-900/40'
                    : 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400'
              }`}>
                {done ? '✓' : step}
              </div>
              <span className={`hidden text-[9px] font-bold uppercase tracking-widest lg:block ${
                active ? 'text-bleu-600 dark:text-bleu-300' : done ? 'text-vert-600 dark:text-vert-400' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div className={`mb-3 h-0.5 flex-1 transition-all ${done ? 'bg-vert-400' : 'bg-gray-200 dark:bg-white/10'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <Input
        value={formData.name}
        onChange={(e) => setFormData((c) => ({ ...c, name: e.target.value }))}
        placeholder="Ex: Scolarité Maternelle 2026-2027 — Inscription"
        label="Nom de la modalité"
      />
      <div>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Type d'inscription concerné
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['INSCRIPTION', 'REINSCRIPTION'] as ModalityType[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setModalityType(option);
                setFormData((c) => ({ ...c, typeInscription: option }));
              }}
              className={`rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                modalityType === option
                  ? 'border-bleu-500 bg-bleu-50 dark:border-bleu-400 dark:bg-bleu-900/20'
                  : 'border-gray-200 bg-white hover:border-bleu-300 dark:border-white/10 dark:bg-white/5'
              }`}
            >
              <p className={`text-sm font-bold ${modalityType === option ? 'text-bleu-700 dark:text-bleu-200' : 'text-gray-700 dark:text-gray-300'}`}>
                {LABEL_BY_TYPE[option]}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                {option === 'INSCRIPTION' ? 'Pour les élèves entrants' : 'Pour les élèves déjà inscrits'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((c) => ({ ...c, description: e.target.value }))}
          placeholder="Précisez la portée, les classes concernées et les règles éventuelles."
          className="min-h-[80px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-all focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Année académique</label>
          <select
            value={formData.academicYearId}
            onChange={(e) => updateAcademicYear(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="">Sélectionner une année...</option>
            {academicYears
              .slice()
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
              .map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}{year.isActive ? ' (active)' : ''}
                </option>
              ))}
          </select>
          {!formData.academicYearId && academicYears.length === 0 && (
            <p className="mt-1.5 text-[10px] font-semibold italic text-gray-400">
              Aucune année académique. Créez-en une dans <strong>Administration → Scolarité</strong>.
            </p>
          )}
        </div>
        <label className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-white/10 dark:text-white">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData((c) => ({ ...c, active: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-bleu-600 focus:ring-bleu-500"
          />
          Modalité active
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Classes concernées</p>
            <p className="text-sm font-medium text-gray-500">Sélectionnez les classes de l'année académique choisie.</p>
          </div>
          <Badge variant="default" className="text-[10px] font-bold uppercase tracking-widest">
            {formData.classIds.length} sélectionnée(s)
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 rounded-3xl border border-gray-100 p-4 dark:border-white/10 lg:grid-cols-2">
          {availableClasses.length === 0 ? (
            <p className="text-sm font-medium text-gray-500">Aucune classe. Créez d'abord vos classes dans la section Scolarité.</p>
          ) : availableClasses.map((schoolClass) => {
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
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">{schoolClass.name}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {schoolClass.level} · {schoolClass.studentCount}/{schoolClass.maxStudents} élèves
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      {/* Explication claire pour éviter la double saisie */}
      <div className="rounded-2xl border border-bleu-200 bg-bleu-50/60 px-4 py-3 dark:border-bleu-800/40 dark:bg-bleu-900/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-bleu-600 dark:text-bleu-300 mb-1">
          À quoi sert cette étape ?
        </p>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
          Cette étape est <strong>optionnelle</strong>. Elle sert uniquement à saisir les <strong>frais de dossier</strong> (montant ponctuel payé une seule fois lors de l'inscription).
          Le montant principal de la scolarité se saisit à <strong>l'étape suivante</strong>.
        </p>
        <p className="mt-1.5 text-[10px] font-bold text-orange-600 dark:text-orange-400">
          ⚠️ Ne mettez PAS le montant de la scolarité ici — cela doublerait le total.
        </p>
      </div>

      <div className="rounded-3xl border-2 border-or-200 bg-or-50/50 p-5 dark:border-or-900/30 dark:bg-or-900/10">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-or-700 dark:text-or-300">
          {FEE_LABEL_BY_TYPE[modalityType]} — frais de dossier unique (optionnel)
        </p>
        <p className="mb-4 text-xs font-medium text-gray-600 dark:text-gray-400">
          Montant payé une seule fois (ex : 100 000 GNF). Offert aux familles avec 3 enfants ou plus.
          <strong> Laissez à 0 si vous n'avez pas de frais de dossier.</strong>
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            type="number"
            value={inscriptionFeeAmount || ''}
            onChange={(e) => setInscriptionFeeAmount(Number(e.target.value))}
            placeholder="0"
            label="Montant frais de dossier (GNF)"
          />
          <Input
            type="date"
            value={inscriptionFeeDueDate}
            onChange={(e) => setInscriptionFeeDueDate(e.target.value)}
            label="Date d'échéance"
          />
        </div>
      </div>
      {inscriptionFeeAmount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-or-50 p-3 dark:bg-or-900/10">
          <CalendarDays size={16} className="shrink-0 text-or-600" />
          <p className="text-sm font-semibold text-or-700 dark:text-or-300">
            Frais de dossier : <strong>{formatCurrency(inscriptionFeeAmount)}</strong> — s'ajoutera au montant scolarité de l'étape suivante.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      {Number(inscriptionFeeAmount) > 0 && (
        <div className="rounded-2xl border border-bleu-200 bg-bleu-50/60 px-4 py-3 dark:border-bleu-800/40 dark:bg-bleu-900/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-bleu-600 dark:text-bleu-300 mb-1">
            Récapitulatif des montants
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <span>Frais initial (étape 2) : <strong>{formatCurrency(Number(inscriptionFeeAmount))}</strong></span>
            <span className="text-gray-400">+</span>
            <span>Scolarité (ci-dessous) : <strong>{formatCurrency(scolariteAmount)}</strong></span>
            <span className="text-gray-400">=</span>
            <span className="text-bleu-700 dark:text-bleu-200 font-black">Total : {formatCurrency(Number(inscriptionFeeAmount) + scolariteAmount)}</span>
          </div>
          {scolariteAmount > 0 && scolariteAmount === Number(inscriptionFeeAmount) && (
            <p className="mt-2 text-[10px] font-bold text-orange-600 dark:text-orange-400">
              ⚠️ Le montant scolarité est identique aux frais initiaux. Vérifiez que ce n'est pas une saisie en double.
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Input
          type="number"
          value={scolariteAmount || ''}
          onChange={(e) => setScolariteAmount(Number(e.target.value))}
          placeholder="0"
          label="Montant scolarité (GNF) — hors frais initial"
          helper={
            scolariteAmount > 0
              ? `Total final = ${formatCurrency((Number(inscriptionFeeAmount) || 0) + scolariteAmount)}`
              : "Montant à répartir en tranches (hors frais d'inscription)."
          }
        />
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Générer N tranches automatiquement
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 6, 12].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => generateInstallments(n)}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-bold text-gray-600 transition-all hover:border-bleu-400 hover:bg-bleu-50 hover:text-bleu-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-bleu-500/60 dark:hover:bg-bleu-900/20"
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] font-semibold italic text-gray-400">
            Clique sur un chiffre pour créer N tranches égales.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Échéancier de scolarité</p>
            <p className="text-sm font-medium text-gray-500">
              Ajustez les montants et dates. Laissez vide pour une tranche unique automatique.
            </p>
          </div>
          <div className="flex gap-2">
            {hasManualInstallments && scolariteAmount > 0 && (
              <Button variant="outline" size="sm" onClick={distributeEvenly}>
                Répartir équitablement
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={addInstallment}>
              <Plus size={14} /> Ajouter une tranche
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {!hasManualInstallments ? (
            <div className="rounded-3xl border border-dashed border-gray-200 px-4 py-5 text-sm font-medium text-gray-500 dark:border-white/10 dark:text-gray-400">
              {scolariteAmount > 0
                ? `Aucune tranche saisie — une tranche unique de ${formatCurrency(scolariteAmount)} sera générée.`
                : "Saisissez le montant scolarité ci-dessus ou ajoutez des tranches manuellement."}
            </div>
          ) : (
            formData.installments.map((installment, index) => (
              <div key={`${editingFeeId || 'new'}-${index}`} className="rounded-3xl border border-gray-100 p-4 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-gray-900 dark:text-white">Tranche {index + 1}</p>
                  <Button variant="ghost" size="sm" onClick={() => removeInstallment(index)}>
                    <Trash2 size={14} /> Retirer
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <Input
                    value={installment.label}
                    onChange={(e) => updateInstallment(index, 'label', e.target.value)}
                    placeholder={`Tranche ${index + 1}`}
                    label="Libellé"
                  />
                  <Input
                    type="number"
                    value={installment.amount || ''}
                    onChange={(e) => updateInstallment(index, 'amount', e.target.value)}
                    placeholder="0"
                    label="Montant (GNF)"
                  />
                  <Input
                    type="date"
                    value={installment.dueDate}
                    onChange={(e) => updateInstallment(index, 'dueDate', e.target.value)}
                    label="Date limite"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {(hasManualInstallments || scolariteAmount > 0) && (
          <div className="mt-4 grid grid-cols-3 gap-3 rounded-3xl bg-gray-50 p-4 dark:bg-gray-900/60">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Frais initial</p>
              <p className="mt-1 text-sm font-black text-or-700 dark:text-or-300">
                {formatCurrency(Number(inscriptionFeeAmount) || 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tranches scolarité</p>
              <p className={`mt-1 text-sm font-black ${
                hasManualInstallments && Math.abs(scolariteTotalDifference) > 0.01 ? 'text-rouge-600' : 'text-gray-900 dark:text-white'
              }`}>
                {formatCurrency(hasManualInstallments ? scolariteInstallmentTotal : scolariteAmount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total final</p>
              <p className="mt-1 text-sm font-black text-bleu-700 dark:text-bleu-300">
                {formatCurrency((Number(inscriptionFeeAmount) || 0) + (hasManualInstallments ? scolariteInstallmentTotal : scolariteAmount))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Remises familiales</p>
        <p className="mt-0.5 text-sm font-medium text-gray-500">
          Définissez des remises automatiques selon le nombre d'enfants d'une même famille inscrits. Optionnel.
        </p>
      </div>
      {localFamilyAdjustments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 px-4 py-6 text-center dark:border-white/10">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aucune remise familiale configurée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localFamilyAdjustments.map((adj, index) => (
            <div key={index} className="rounded-3xl border border-gray-100 p-4 dark:border-white/10">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Remise {index + 1}</p>
                <Button variant="ghost" size="sm" onClick={() => removeFamilyAdjustment(index)}>
                  <Trash2 size={14} /> Retirer
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <Input
                  type="number"
                  value={adj.minimumChildren}
                  onChange={(e) => updateFamilyAdjustment(index, 'minimumChildren', Number(e.target.value))}
                  label="Nb enfants minimum"
                  placeholder="2"
                />
                <Input
                  type="number"
                  value={adj.maximumChildren ?? ''}
                  onChange={(e) => updateFamilyAdjustment(index, 'maximumChildren', e.target.value ? Number(e.target.value) : undefined)}
                  label="Nb enfants maximum (optionnel)"
                  placeholder="Sans limite"
                />
                <Input
                  type="number"
                  value={adj.discountPercentage}
                  onChange={(e) => updateFamilyAdjustment(index, 'discountPercentage', Number(e.target.value))}
                  label="Remise (%)"
                  placeholder="10"
                />
              </div>
              {adj.minimumChildren >= 2 && adj.discountPercentage > 0 && (
                <p className="mt-2 text-[10px] font-semibold text-vert-700 dark:text-vert-300">
                  Dès {adj.minimumChildren} enfants{adj.maximumChildren ? ` jusqu'à ${adj.maximumChildren}` : ' et plus'} → {adj.discountPercentage}% de remise.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      <Button variant="outline" onClick={addFamilyAdjustment} className="w-full">
        <Plus size={14} /> Ajouter une règle de remise
      </Button>
    </div>
  );

  const renderStep5 = () => {
    const totalFinal = (Number(inscriptionFeeAmount) || 0) + (hasManualInstallments ? scolariteInstallmentTotal : scolariteAmount);
    return (
      <div className="space-y-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Vérifiez avant d'enregistrer</p>
        <div className="rounded-3xl border border-gray-100 bg-gray-50/60 p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-black text-gray-900 dark:text-white">{formData.name || '—'}</h4>
            <Badge variant={modalityType === 'INSCRIPTION' ? 'info' : 'warning'}>{LABEL_BY_TYPE[modalityType]}</Badge>
            <Badge variant={formData.active ? 'success' : 'default'}>{formData.active ? 'Active' : 'Inactive'}</Badge>
          </div>
          {formData.description && <p className="mt-1 text-sm text-gray-500">{formData.description}</p>}
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {academicYears.find((y) => y.id === formData.academicYearId)?.name || '—'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.classIds.map((id) => {
              const schoolClass = classes.find((c) => c.id === id);
              return schoolClass ? (
                <Badge key={id} variant="info" className="text-[10px] font-bold uppercase tracking-widest">
                  {schoolClass.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>

        <div className="space-y-2">
          {Number(inscriptionFeeAmount) > 0 && (
            <div className="flex items-center justify-between rounded-[1.3rem] border border-or-200 bg-or-50/60 px-4 py-3 dark:border-or-900/30 dark:bg-or-900/10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-or-100 p-2 text-or-700 dark:bg-or-900/30 dark:text-or-300">
                  <CalendarDays size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {FEE_LABEL_BY_TYPE[modalityType]}
                    <Badge variant="warning" className="ml-2 text-[8px] font-bold uppercase tracking-widest">Frais initial</Badge>
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    Échéance {formatDate(inscriptionFeeDueDate || defaultInstallmentDueDate)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(Number(inscriptionFeeAmount))}</p>
            </div>
          )}

          {hasManualInstallments ? (
            formData.installments.map((inst, index) => (
              <div key={index} className="flex items-center justify-between rounded-[1.3rem] border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-bleu-50 p-2 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
                    <CalendarDays size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{inst.label}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Échéance {formatDate(inst.dueDate)}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(Number(inst.amount))}</p>
              </div>
            ))
          ) : scolariteAmount > 0 ? (
            <div className="flex items-center justify-between rounded-[1.3rem] border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-bleu-50 p-2 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300">
                  <CalendarDays size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{AUTO_INSTALLMENT_LABEL}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    Générée automatiquement · {formatDate(defaultInstallmentDueDate)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(scolariteAmount)}</p>
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-[1.3rem] bg-bleu-50 px-4 py-3 font-black text-bleu-800 dark:bg-bleu-900/20 dark:text-bleu-200">
            <p className="text-[10px] font-bold uppercase tracking-widest">Total</p>
            <p className="text-base">{formatCurrency(totalFinal)}</p>
          </div>
        </div>

        {localFamilyAdjustments.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Remises familiales</p>
            {localFamilyAdjustments.map((adj, i) => (
              <p key={i} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                • Dès {adj.minimumChildren} enfants{adj.maximumChildren ? ` jusqu'à ${adj.maximumChildren}` : ' et plus'} → {adj.discountPercentage}% de remise
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="relative overflow-hidden border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-[1.3rem] bg-gradient-to-br from-bleu-600 to-cyan-500 p-3 text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.85)]">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Catalogue des modalités
                </p>
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
                className="w-full rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
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

            <div className="w-full lg:w-[320px]">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Filtrer par type
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-[1.3rem] bg-slate-100 p-1 dark:bg-white/5">
                {(['TOUS', 'INSCRIPTION', 'REINSCRIPTION'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTypeFilter(opt)}
                    className={`rounded-xl px-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      typeFilter === opt
                        ? 'bg-white text-bleu-600 shadow-sm dark:bg-gray-800 dark:text-or-300'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {opt === 'TOUS' ? 'Tous' : opt === 'INSCRIPTION' ? 'Inscription' : 'Réinscription'}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={openCreateModal} className="self-start rounded-2xl bg-gradient-to-r from-bleu-600 via-bleu-500 to-cyan-500 px-5 shadow-[0_18px_35px_-20px_rgba(37,99,235,0.85)] lg:self-end">
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
            {filteredTuitionFees.map((tuitionFee) => {
              const feeType = resolveModalityType(tuitionFee);
              const cleanDescription = stripTypeMarker(tuitionFee.description);
              return (
              <div
                key={tuitionFee.id}
                className="rounded-[1.8rem] border border-slate-200/70 bg-slate-50/70 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-black text-gray-900 dark:text-white">
                        {tuitionFee.name}
                      </h4>
                      <Badge variant={feeType === 'INSCRIPTION' ? 'info' : 'warning'}>
                        {LABEL_BY_TYPE[feeType]}
                      </Badge>
                      <Badge variant={tuitionFee.isActive ? 'success' : 'default'}>
                        {tuitionFee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {cleanDescription || 'Aucune description fournie.'}
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
                      {(tuitionFee.classNames || []).length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Échéances
                    </p>
                    <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                      {(tuitionFee.installments || []).length}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(tuitionFee.classNames || []).map((className) => (
                    <Badge key={`${tuitionFee.id}-${className}`} variant="info" className="text-[10px] font-bold uppercase tracking-widest">
                      {className}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  {(tuitionFee.installments || [])
                    .slice()
                    .sort((left, right) => left.installmentOrder - right.installmentOrder)
                    .map((installment) => (
                      <div
                        key={installment.id}
                        className="flex flex-col gap-3 rounded-[1.3rem] border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/20 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl p-2 ${
                            isInscriptionFeeLabel(installment.label)
                              ? 'bg-or-50 dark:bg-or-900/20 text-or-700 dark:text-or-300'
                              : 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-700 dark:text-bleu-300'
                          }`}>
                            <CalendarDays size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {/* Masque le marqueur technique du libellé. */}
                              {installment.label
                                .replace(INSCRIPTION_FEE_LABEL_PREFIX, '')
                                .replace(REINSCRIPTION_FEE_LABEL_PREFIX, '')
                                .trim() || installment.label}
                              {isInscriptionFeeLabel(installment.label) && (
                                <Badge variant="warning" className="ml-2 text-[8px] font-bold uppercase tracking-widest">
                                  Frais initial
                                </Badge>
                              )}
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
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetModal}
        title={editingFeeId ? 'Modifier une modalité' : 'Nouvelle modalité de scolarité'}
        size="xl"
      >
        <div className="space-y-5">
          {renderStepIndicator()}

          {formError && (
            <div className="rounded-2xl border border-rouge-200 bg-rouge-50 px-4 py-3 text-sm font-semibold text-rouge-700 dark:border-rouge-800/30 dark:bg-rouge-900/20 dark:text-rouge-300">
              {formError}
            </div>
          )}

          {wizardStep === 1 && renderStep1()}
          {wizardStep === 2 && renderStep2()}
          {wizardStep === 3 && renderStep3()}
          {wizardStep === 4 && renderStep4()}
          {wizardStep === 5 && renderStep5()}

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/10">
            <div>
              {wizardStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  ← Précédent
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetModal}>Annuler</Button>
              {wizardStep < 5 ? (
                <Button onClick={handleNext}>
                  Suivant →
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={actionLoading}>
                  <CheckCircle2 size={16} />
                  {editingFeeId ? 'Enregistrer les modifications' : 'Créer la modalité'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TuitionModalityManager;
