// src/pages/comptabilite/computeFamilyBalance.ts
// ─────────────────────────────────────────────────────────────────────────────
// Calcule, pour une famille, le montant total dû d'après les tarifs officiels
// (`tarifs.ts`) puis le rapproche des paiements déjà encaissés pour produire
// un solde "reste à payer".
//
// Règles métier (extraites de la fiche de renseignements) :
//   • Frais d'inscription/Réinscription = 100 000 GNF par enfant.
//   • Familles avec 3 enfants ou plus → frais d'inscription EXEMPTÉS pour
//     tous les enfants.
//   • Scolarité annuelle dépend du cycle (Maternelle/Primaire/Collège/Lycée)
//     et du statut (nouvelle inscription vs réinscription).
//   • Cantine, transport, garderie, cours religieux, activités = facturation
//     mensuelle.
//   • Tenues scolaires / sport / scout / karaté = achat unique.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Cycle,
  FRAIS_INSCRIPTION,
  LIBELLE_CYCLE,
  SEUIL_GRATUITE_INSCRIPTION,
  TARIF_ACTIVITES_MOIS,
  TARIF_CANTINE_MOIS,
  TARIF_COURS_RELIGIEUX_MOIS,
  TARIF_GARDERIE_MOIS,
  TARIF_TENUE_KARATE,
  TARIF_TENUE_SCOUT,
  TARIF_TENUE_SPORT,
  TARIF_TRANSPORT_MOIS,
  TypeInscription,
  detecterCycle,
  tarifScolariteAnnuel,
} from './tarifs';

// ── Entrées ──────────────────────────────────────────────────────────────────

/**
 * Options souscrites par un élève (issues de la fiche de renseignements lors
 * de la pré-inscription puis archivées côté étudiant).
 */
export interface StudentBillingOptions {
  hasCantine?: boolean;
  /** "NONE" | "PETIT_TRAJET" | "LONG_TRAJET" */
  transportMode?: string | null;
  hasGarderie?: boolean;
  hasCoursReligieux?: boolean;
  hasActiviteKarate?: boolean;
  hasActiviteNatation?: boolean;
  hasActiviteAtelier?: boolean;
  hasTenueScolaire?: boolean;
  /** Tarif tenue scolaire choisi manuellement par le comptable (350 000 ou 450 000). */
  tenueScolairePrice?: number;
  hasTenueSport?: boolean;
  hasTenueScout?: boolean;
  hasTenueKarate?: boolean;
}

export interface StudentBillingInput {
  id: string;
  fullName: string;
  /** Libellé de classe (sert à déduire le cycle si `cycle` absent). */
  className?: string;
  cycle?: Cycle | null;
  typeInscription: TypeInscription;
  options: StudentBillingOptions;
}

export interface FamilyBillingInput {
  familyId: string;
  familyName?: string;
  students: StudentBillingInput[];
  /** Somme déjà encaissée pour cette famille (toutes lignes confondues). */
  totalPaid: number;
}

// ── Sorties ──────────────────────────────────────────────────────────────────

export interface LineItem {
  /** Identifiant interne pour les listes React (`key`). */
  key: string;
  /** Libellé humain affiché. */
  label: string;
  /** Période ou unité de facturation. Ex: "Annuel", "Par mois". */
  unit: 'ANNUEL' | 'MENSUEL' | 'UNIQUE';
  amount: number;
  studentId?: string;
  studentName?: string;
}

export interface StudentBillingResult {
  studentId: string;
  studentName: string;
  cycle: Cycle | null;
  cycleLabel: string;
  typeInscription: TypeInscription;
  /** Inscription exemptée car famille ≥ 3 enfants. */
  inscriptionWaived: boolean;
  /** Items "obligatoires annuels" (inscription + scolarité + tenues choisies). */
  annualLines: LineItem[];
  /** Items mensuels souscrits (cantine, transport, activités...). */
  monthlyLines: LineItem[];
  /** Sous-total annuel obligatoire pour cet élève. */
  annualSubtotal: number;
  /** Sous-total mensuel (à multiplier par le nombre de mois souhaités). */
  monthlySubtotal: number;
}

export interface FamilyBillingResult {
  familyId: string;
  familyName?: string;
  /** Nombre d'enfants pris en compte pour la règle de gratuité. */
  childrenCount: number;
  inscriptionWaived: boolean;
  students: StudentBillingResult[];
  /** Total annuel obligatoire pour TOUS les élèves de la famille. */
  totalExpectedAnnual: number;
  /** Total mensuel récurrent pour TOUS les élèves. */
  totalMonthlyRecurring: number;
  /** Montant déjà encaissé (passé en entrée). */
  totalPaid: number;
  /** Solde restant sur la part annuelle obligatoire (peut être négatif si la
   *  famille a payé d'avance pour des mois suivants). */
  totalRemaining: number;
}

// ── Calcul ──────────────────────────────────────────────────────────────────

/**
 * Calcule le solde de facturation d'une famille en appliquant la règle
 * "≥ 3 enfants → inscription gratuite" et en agrégeant les frais annuels
 * et mensuels par élève.
 */
export function computeFamilyBalance(input: FamilyBillingInput): FamilyBillingResult {
  const childrenCount = input.students.length;
  const inscriptionWaived = childrenCount >= SEUIL_GRATUITE_INSCRIPTION;

  let totalExpectedAnnual = 0;
  let totalMonthlyRecurring = 0;

  const students: StudentBillingResult[] = input.students.map((student) => {
    const cycle: Cycle | null = student.cycle ?? detecterCycle(student.className);
    const cycleLabel = cycle ? LIBELLE_CYCLE[cycle] : 'Cycle inconnu';
    const annualLines: LineItem[] = [];
    const monthlyLines: LineItem[] = [];

    // 1) Frais d'inscription / réinscription
    if (!inscriptionWaived) {
      annualLines.push({
        key: `${student.id}-inscription`,
        label: student.typeInscription === 'INSCRIPTION'
          ? "Frais d'inscription"
          : 'Frais de réinscription',
        unit: 'UNIQUE',
        amount: FRAIS_INSCRIPTION,
        studentId: student.id,
        studentName: student.fullName,
      });
    }

    // 2) Scolarité annuelle
    if (cycle) {
      annualLines.push({
        key: `${student.id}-scolarite`,
        label: `Scolarité ${cycleLabel} (${student.typeInscription === 'INSCRIPTION' ? 'Nouvelle inscription' : 'Réinscription'})`,
        unit: 'ANNUEL',
        amount: tarifScolariteAnnuel(cycle, student.typeInscription),
        studentId: student.id,
        studentName: student.fullName,
      });
    }

    // 3) Tenues — paiement unique
    const opts = student.options;
    if (opts.hasTenueScolaire) {
      const price = opts.tenueScolairePrice ?? 0;
      annualLines.push({
        key: `${student.id}-tenue-scolaire`,
        label: '2 Tenues scolaires',
        unit: 'UNIQUE',
        amount: price,
        studentId: student.id,
        studentName: student.fullName,
      });
    }
    if (opts.hasTenueSport) {
      annualLines.push({
        key: `${student.id}-tenue-sport`,
        label: 'Tenue de sport (EPS)',
        unit: 'UNIQUE',
        amount: TARIF_TENUE_SPORT,
        studentId: student.id,
        studentName: student.fullName,
      });
    }
    if (opts.hasTenueScout) {
      annualLines.push({
        key: `${student.id}-tenue-scout`,
        label: 'Tenue Scout',
        unit: 'UNIQUE',
        amount: TARIF_TENUE_SCOUT,
        studentId: student.id,
        studentName: student.fullName,
      });
    }
    if (opts.hasTenueKarate) {
      annualLines.push({
        key: `${student.id}-tenue-karate`,
        label: 'Tenue de Karaté (kimono)',
        unit: 'UNIQUE',
        amount: TARIF_TENUE_KARATE,
        studentId: student.id,
        studentName: student.fullName,
      });
    }

    // 4) Services mensuels — affichés séparément (la famille paie au mois)
    if (opts.hasCantine) {
      monthlyLines.push({
        key: `${student.id}-cantine`,
        label: 'Cantine',
        unit: 'MENSUEL',
        amount: TARIF_CANTINE_MOIS,
        studentId: student.id,
        studentName: student.fullName,
      });
    }
    if (opts.transportMode && opts.transportMode !== 'NONE') {
      const mode = opts.transportMode as keyof typeof TARIF_TRANSPORT_MOIS;
      const amount = TARIF_TRANSPORT_MOIS[mode] ?? 0;
      if (amount > 0) {
        monthlyLines.push({
          key: `${student.id}-transport`,
          label: `Transport autobus (${mode === 'PETIT_TRAJET' ? 'petit' : 'long'} trajet)`,
          unit: 'MENSUEL',
          amount,
          studentId: student.id,
          studentName: student.fullName,
        });
      }
    }
    if (opts.hasGarderie) {
      monthlyLines.push({
        key: `${student.id}-garderie`,
        label: 'Garderie',
        unit: 'MENSUEL',
        amount: TARIF_GARDERIE_MOIS,
        studentId: student.id,
        studentName: student.fullName,
      });
    }
    if (opts.hasCoursReligieux) {
      monthlyLines.push({
        key: `${student.id}-cours-religieux`,
        label: 'Cours religieux (Coranique / Biblique)',
        unit: 'MENSUEL',
        amount: TARIF_COURS_RELIGIEUX_MOIS,
        studentId: student.id,
        studentName: student.fullName,
      });
    }
    if (opts.hasActiviteKarate) {
      monthlyLines.push({
        key: `${student.id}-karate`,
        label: 'Activité Karaté',
        unit: 'MENSUEL',
        amount: TARIF_ACTIVITES_MOIS.KARATE,
        studentId: student.id,
        studentName: student.fullName,
      });
    }
    if (opts.hasActiviteNatation) {
      monthlyLines.push({
        key: `${student.id}-natation`,
        label: 'Activité Natation',
        unit: 'MENSUEL',
        amount: TARIF_ACTIVITES_MOIS.NATATION,
        studentId: student.id,
        studentName: student.fullName,
      });
    }
    if (opts.hasActiviteAtelier) {
      monthlyLines.push({
        key: `${student.id}-atelier`,
        label: 'Atelier (Robotique / Pâtisserie / Couture / Programmation / Infographie)',
        unit: 'MENSUEL',
        amount: TARIF_ACTIVITES_MOIS.ATELIER,
        studentId: student.id,
        studentName: student.fullName,
      });
    }

    const annualSubtotal = annualLines.reduce((sum, line) => sum + line.amount, 0);
    const monthlySubtotal = monthlyLines.reduce((sum, line) => sum + line.amount, 0);

    totalExpectedAnnual += annualSubtotal;
    totalMonthlyRecurring += monthlySubtotal;

    return {
      studentId: student.id,
      studentName: student.fullName,
      cycle,
      cycleLabel,
      typeInscription: student.typeInscription,
      inscriptionWaived,
      annualLines,
      monthlyLines,
      annualSubtotal,
      monthlySubtotal,
    };
  });

  return {
    familyId: input.familyId,
    familyName: input.familyName,
    childrenCount,
    inscriptionWaived,
    students,
    totalExpectedAnnual,
    totalMonthlyRecurring,
    totalPaid: input.totalPaid,
    totalRemaining: totalExpectedAnnual - input.totalPaid,
  };
}
