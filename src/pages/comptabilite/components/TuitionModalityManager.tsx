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
  // Type courant du formulaire (Nouvelle Inscription / Réinscription). Encodé
  // dans la description au submit, décodé lors de l'édition.
  const [modalityType, setModalityType] = useState<ModalityType>('INSCRIPTION');
  // Filtre par type dans la liste des modalités existantes.
  const [typeFilter, setTypeFilter] = useState<'TOUS' | ModalityType>('TOUS');
  // Frais d'inscription / réinscription (saisis séparément des tranches).
  // Sont mergés à la liste d'échéances au moment de la soumission (avec
  // marqueur dans le libellé) et extraits lors du chargement en édition.
  const [inscriptionFeeAmount, setInscriptionFeeAmount] = useState<number>(0);
  const [inscriptionFeeDueDate, setInscriptionFeeDueDate] = useState<string>('');

  // Toutes les classes sont disponibles à la création/édition d'une modalité.
  // On ne filtre plus par année académique pour ne pas masquer des classes
  // dont le champ academicYearName serait absent ou mal renseigné côté backend.
  const availableClasses = useMemo(
    () =>
      classes.slice().sort((left, right) => {
        const yearCompare = (left.academicYearName || '').localeCompare(right.academicYearName || '');
        if (yearCompare !== 0) return yearCompare;
        return left.name.localeCompare(right.name);
      }),
    [classes],
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
      if (typeFilter !== 'TOUS' && extractType(tuitionFee.description) !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [selectedClassFilterId, typeFilter, tuitionFees]);

  // Total des tranches "scolarité" (hors frais d'inscription / réinscription).
  const scolariteInstallmentTotal = useMemo(
    () => formData.installments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0),
    [formData.installments],
  );

  // Total réel = tranches de scolarité + frais initial (inscription /
  // réinscription saisi séparément). C'est ce total qui doit correspondre
  // au "montant total" déclaré pour la modalité.
  const installmentTotal = scolariteInstallmentTotal + Number(inscriptionFeeAmount || 0);

  const totalDifference = Number(formData.totalAmount || 0) - installmentTotal;

  const resetModal = () => {
    setEditingFeeId(null);
    setFormError(null);
    setFormData(createEmptyForm());
    setModalityType('INSCRIPTION');
    setInscriptionFeeAmount(0);
    setInscriptionFeeDueDate('');
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingFeeId(null);
    setFormError(null);
    setFormData(createEmptyForm());
    setModalityType('INSCRIPTION');
    setInscriptionFeeAmount(0);
    setInscriptionFeeDueDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (tuitionFee: TuitionFeeResponse) => {
    setEditingFeeId(tuitionFee.id);
    setFormError(null);
    const type = extractType(tuitionFee.description);
    setModalityType(type);
    // Sépare les frais d'inscription/réinscription des tranches de scolarité
    // pour les éditer indépendamment.
    const allInstallments = (tuitionFee.installments ?? [])
      .slice()
      .sort((left, right) => left.installmentOrder - right.installmentOrder)
      .map((installment) => ({
        label: installment.label,
        amount: Number(installment.amount),
        dueDate: installment.dueDate,
        installmentOrder: installment.installmentOrder,
      }));
    const feeInfo = extractInscriptionFee(allInstallments);
    setInscriptionFeeAmount(feeInfo?.amount ?? 0);
    setInscriptionFeeDueDate(feeInfo?.dueDate ?? '');
    const onlyScolariteInstallments = stripInscriptionFee(allInstallments);
    setFormData({
      name: tuitionFee.name,
      // On retire le marqueur pour que la description affichée reste propre.
      description: stripTypeMarker(tuitionFee.description ?? ''),
      academicYearId: tuitionFee.academicYearId,
      totalAmount: Number(tuitionFee.totalAmount),
      classIds: tuitionFee.classIds,
      installments: normalizeInstallments(
        onlyScolariteInstallments.length > 0
          ? onlyScolariteInstallments
          : [createInstallment(1)],
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
      return 'Le total (frais initial + échéances) doit correspondre exactement au montant total déclaré.';
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    // Si un frais d'inscription/réinscription a été saisi, on le préfixe
    // comme PREMIÈRE échéance avec son marqueur. Date d'échéance par défaut :
    // celle saisie, ou à défaut la date de la première tranche.
    const feeAmount = Number(inscriptionFeeAmount || 0);
    const feeInstallments = feeAmount > 0
      ? [{
          label: `${FEE_PREFIX_BY_TYPE[modalityType]} ${FEE_LABEL_BY_TYPE[modalityType]}`,
          amount: feeAmount,
          dueDate: inscriptionFeeDueDate || formData.installments[0]?.dueDate || '',
          installmentOrder: 1,
        }]
      : [];

    const mergedInstallments = [
      ...feeInstallments,
      ...formData.installments.map((inst) => ({
        label: inst.label.trim(),
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
        installmentOrder: inst.installmentOrder,
      })),
    ];

    const payload: TuitionFeePayload = {
      ...formData,
      name: formData.name.trim(),
      // Encode le type d'inscription dans la description (marqueur invisible
      // pour l'utilisateur, lu côté frontend pour afficher le badge).
      description: encodeTypeInDescription(modalityType, formData.description.trim()),
      totalAmount: Number(formData.totalAmount),
      classIds: [...formData.classIds],
      installments: normalizeInstallments(mergedInstallments).map((installment, index) => ({
        label: installment.label,
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
        // Reconstruit le payload complet à partir des données actuelles,
        // en forçant active=false. On nettoie le marqueur de type dans la
        // description pour ne pas l'encoder deux fois, et on respecte les
        // installments existants (y compris l'éventuel frais initial avec
        // son marqueur).
        const type = extractType(tuitionFee.description);
        const cleanDescription = stripTypeMarker(tuitionFee.description ?? '');
        const payload: TuitionFeePayload = {
          name: tuitionFee.name,
          description: encodeTypeInDescription(type, cleanDescription),
          academicYearId: tuitionFee.academicYearId,
          totalAmount: Number(tuitionFee.totalAmount),
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
          active: false,
        };
        await onUpdate(tuitionFee.id, payload);
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
    setFormData((current) => ({ ...current, academicYearId }));
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

            <div className="w-full lg:w-[320px]">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Filtrer par type
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-white/5">
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
            {filteredTuitionFees.map((tuitionFee) => {
              const feeType = extractType(tuitionFee.description);
              const cleanDescription = stripTypeMarker(tuitionFee.description);
              return (
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
                        className="flex flex-col gap-3 rounded-2xl border border-gray-100 px-4 py-3 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between"
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
              placeholder="Ex: Scolarité Maternelle 2026-2027 — Nouvelle Inscription"
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
              label="Montant total (GNF)"
            />
          </div>

          {/* ── Type d'inscription ── Permet de créer deux modalités distinctes
              par classe : une pour les nouveaux élèves et une pour les
              réinscriptions, conformément à la fiche de renseignements. */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Type d'inscription concerné
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['INSCRIPTION', 'REINSCRIPTION'] as ModalityType[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setModalityType(option)}
                  className={`rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                    modalityType === option
                      ? 'border-bleu-500 bg-bleu-50 dark:border-bleu-400 dark:bg-bleu-900/20'
                      : 'border-gray-200 bg-white hover:border-bleu-300 dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  <p className={`text-sm font-bold ${
                    modalityType === option
                      ? 'text-bleu-700 dark:text-bleu-200'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {LABEL_BY_TYPE[option]}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    {option === 'INSCRIPTION'
                      ? 'Pour les élèves entrants (1ère année à l\'école)'
                      : 'Pour les élèves déjà inscrits l\'année précédente'}
                  </p>
                </button>
              ))}
            </div>
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
              {/* Sélection directe d'une année académique parmi celles déjà
                  définies (Administration → Scolarité). Format affiché :
                  "2026-2027", "2027-2028"... */}
              <select
                value={formData.academicYearId}
                onChange={(event) => updateAcademicYear(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-bleu-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="">Sélectionner une année académique...</option>
                {academicYears
                  .slice()
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                  .map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}{year.isActive ? ' (active)' : ''}
                    </option>
                  ))}
              </select>
              {formData.academicYearId ? (
                <p className="mt-1.5 text-[10px] font-bold text-vert-700 dark:text-vert-300">
                  Année sélectionnée :{' '}
                  {academicYears.find((y) => y.id === formData.academicYearId)?.name || '—'}
                  {academicYears.find((y) => y.id === formData.academicYearId)?.isActive ? ' (active)' : ''}
                </p>
              ) : academicYears.length === 0 ? (
                <p className="mt-1.5 text-[10px] font-semibold italic text-gray-400">
                  Aucune année académique enregistrée. Créez-en une d'abord
                  dans <strong>Administration → Scolarité</strong>.
                </p>
              ) : (
                <p className="mt-1.5 text-[10px] font-semibold italic text-gray-400">
                  Choisis l'année à laquelle cette modalité s'applique.
                </p>
              )}
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
                  Aucune classe enregistrée. Créez d'abord vos classes depuis la section Scolarité.
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

          {/* ── Frais d'inscription / réinscription ──────────────────────
              Saisi séparément des tranches de scolarité. La somme s'ajoute
              automatiquement au "Total des échéances" pour vérifier la
              cohérence avec le Montant total déclaré. */}
          <div className="rounded-3xl border-2 border-or-200 dark:border-or-900/30 bg-or-50/50 dark:bg-or-900/10 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-or-700 dark:text-or-300">
                  {FEE_LABEL_BY_TYPE[modalityType]} (à payer une fois)
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Ce montant est offert aux familles ayant 3 enfants ou plus inscrits.
                </p>
              </div>
            </div>
            <Input
              type="number"
              value={inscriptionFeeAmount || ''}
              onChange={(event) => setInscriptionFeeAmount(Number(event.target.value))}
              placeholder="0"
              label="Montant (GNF)"
            />
            <p className="mt-2 text-[10px] italic text-gray-500 dark:text-gray-400">
              Laisser à 0 si la modalité n'inclut pas de frais initial.
            </p>
          </div>

          <div>
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Échéancier de scolarité
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Répartissez les frais de scolarité (hors frais initial) sur une ou plusieurs tranches.
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
                      min="2026-01-01"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-3xl bg-gray-50 p-4 dark:bg-gray-900/60 lg:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {FEE_LABEL_BY_TYPE[modalityType]}
                </p>
                <p className="mt-1 text-sm font-black text-or-700 dark:text-or-300">
                  {formatCurrency(Number(inscriptionFeeAmount || 0))}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Échéances scolarité
                </p>
                <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                  {formatCurrency(scolariteInstallmentTotal)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Total calculé
                </p>
                <p className="mt-1 text-sm font-black text-gray-900 dark:text-white">
                  {formatCurrency(installmentTotal)}
                </p>
                <p className="text-[9px] text-gray-500">vs déclaré : {formatCurrency(Number(formData.totalAmount))}</p>
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
