// src/pages/comptabilite/tarifs.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tarifs officiels EIEF — alignés sur les DEUX fiches de renseignements
// (public/fichederenseignements.pdf et la fiche dédiée aux classes d'examen).
//
//  • Fiche "hors classes d'examen" : Maternelle / Primaire / Collège / Lycée.
//  • Fiche "classes d'examen"      : 6ème Année (CEE),
//                                    10ème Année (BEPC),
//                                    Terminale (BAC).
//
// Toute modification doit refléter exactement ce qui est communiqué aux
// familles via ces fiches.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cycles scolaires reconnus pour la facturation.
 *
 * Les classes "ordinaires" (Maternelle/Primaire/Collège/Lycée) et les classes
 * "examen" (CEE/BEPC/BAC) ont des tarifs distincts → on les modélise comme
 * des cycles à part entière.
 */
export type Cycle =
  | 'MATERNELLE'
  | 'PRIMAIRE'
  | 'COLLEGE'
  | 'LYCEE'
  | 'CEE'   // 6ème Année — fin de primaire
  | 'BEPC'  // 10ème Année — fin de collège
  | 'BAC';  // Terminale — fin de lycée

/** Type de versement de scolarité : première inscription ou réinscription. */
export type TypeInscription = 'INSCRIPTION' | 'REINSCRIPTION';

// ── Frais d'inscription / réinscription ─────────────────────────────────────
// "Frais d'inscription/Réinscription: GNF 100 000"
// Règle : "Plus de 3 enfants, les frais d'inscriptions ou de reinscriptions
//          sont exemptés." → cf. helper computeFamilyBalance.ts
export const FRAIS_INSCRIPTION = 100_000;

/**
 * Nombre d'enfants à partir duquel l'inscription/réinscription est gratuite
 * pour TOUS les enfants de la famille (≥ 3 enfants).
 */
export const SEUIL_GRATUITE_INSCRIPTION = 3;

// ── Scolarité annuelle (Total Scolarité) ────────────────────────────────────
// Hors classes d'examen, max 25 élèves/classe.

export const SCOLARITE_NOUVELLE_INSCRIPTION: Record<Cycle, number> = {
  // Fiche 1 — hors classes d'examen
  MATERNELLE:  5_800_000,
  PRIMAIRE:    6_300_000,
  COLLEGE:     7_800_000,
  LYCEE:       8_300_000,
  // Fiche 2 — classes d'examen
  CEE:         8_300_000,  // 6ème Année
  BEPC:        9_800_000,  // 10ème Année
  BAC:        10_300_000,  // Terminale
};

export const SCOLARITE_REINSCRIPTION: Record<Cycle, number> = {
  // Fiche 1 — hors classes d'examen
  MATERNELLE:  5_600_000,
  PRIMAIRE:    6_100_000,
  COLLEGE:     7_600_000,
  LYCEE:       8_100_000,
  // Fiche 2 — classes d'examen
  CEE:         7_100_000,
  BEPC:        8_600_000,
  BAC:         9_100_000,
};

// ── Prestations annexes à la charge des parents ─────────────────────────────
// Tous montants en GNF, tels que repris sur la fiche.

/** Cantine : 400 000 GNF / mois. */
export const TARIF_CANTINE_MOIS = 400_000;

/** Transport autobus selon distance, par mois. */
export const TARIF_TRANSPORT_MOIS = {
  PETIT_TRAJET: 300_000,
  LONG_TRAJET:  350_000,
} as const;

/** Garderie : 100 000 GNF / mois (mardi/jeudi 16h-18h). */
export const TARIF_GARDERIE_MOIS = 100_000;

/** Cours religieux (Coraniques ou Bibliques) : 100 000 GNF / mois. */
export const TARIF_COURS_RELIGIEUX_MOIS = 100_000;

/** Activités — tarifs mensuels. */
export const TARIF_ACTIVITES_MOIS = {
  KARATE:   200_000,
  NATATION: 300_000,
  /** Robotique, Pâtisserie, Couture, Programmation, Infographie. */
  ATELIER:  200_000,
};

// ── Tenues (paiement unique à l'achat) ──────────────────────────────────────
// La fiche affiche "350 000 / 450 000" pour les 2 tenues scolaires
// → le comptable choisit manuellement à la saisie.
export const TARIF_TENUE_SCOLAIRE_OPTIONS = [350_000, 450_000] as const;

/** Tenue de sport (EPS). */
export const TARIF_TENUE_SPORT = 100_000;

/** Tenue Scout. */
export const TARIF_TENUE_SCOUT = 250_000;

/** Tenue de Karaté (kimono). */
export const TARIF_TENUE_KARATE = 200_000;

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Détermine le cycle à partir d'un libellé ou niveau de classe.
 *
 * Important : les classes "examen" (CEE/BEPC/BAC) sont testées AVANT les
 * cycles ordinaires correspondants pour éviter qu'un "6ème" en Primaire ne
 * soit confondu avec un "6ème" en Collège (la sixième française) ou
 * inversement.
 *
 * Conventions guinéennes :
 *   • 6ème Année (= 6AP) → CEE (fin primaire)
 *   • 10ème Année (= 10A) → BEPC (fin collège)
 *   • Terminale → BAC (fin lycée)
 */
export function detecterCycle(label: string | undefined | null): Cycle | null {
  if (!label) return null;
  const upper = label.toUpperCase().trim();

  // ── 1) Classes d'examen (priorité haute) ───────────────────────────────
  // CEE : 6ème Année / 6AP / Certificat
  if (/(6\s*[EÈ]ME?\s*ANN[EÉ]E|6\s*AP|CEE|CERTIFICAT\s+D[''ÉE]?TUDES)/.test(upper)) {
    return 'CEE';
  }
  // BEPC : 10ème Année / 10A / Brevet
  if (/(10\s*[EÈ]ME?\s*ANN[EÉ]E|10\s*A|BEPC|BREVET)/.test(upper)) {
    return 'BEPC';
  }
  // BAC : Terminale / Tle / Bac
  if (/(TERMINALE|^TLE\b|\bTLE\b|BACCALAUR|^BAC\b|\bBAC\b)/.test(upper)) {
    return 'BAC';
  }

  // ── 2) Cycles ordinaires ───────────────────────────────────────────────
  if (/(MATERNELLE|CRECHE|GARDERIE|PS|MS|GS|PETITE\s+SECTION|MOYENNE\s+SECTION|GRANDE\s+SECTION)/.test(upper)) {
    return 'MATERNELLE';
  }
  if (/(PRIMAIRE|CP|CE1|CE2|CM1|CM2|[1-5]\s*AP|[1-5]\s*[EÈ]ME?\s*ANN[EÉ]E\s*PRIMAIRE)/.test(upper)) {
    return 'PRIMAIRE';
  }
  if (/(COLLEGE|COLLÈGE|6E|5E|4E|3E|6EME|5EME|4EME|3EME|SIXIEME|CINQUIEME|QUATRIEME|TROISIEME|[7-9]\s*[EÈ]ME?\s*ANN[EÉ]E|[7-9]\s*A)/.test(upper)) {
    return 'COLLEGE';
  }
  if (/(LYCEE|LYCÉE|2NDE|1ERE|1ÈRE|SECONDE|PREMIERE|PREMIÈRE|1[12]\s*[EÈ]ME?\s*ANN[EÉ]E)/.test(upper)) {
    return 'LYCEE';
  }
  return null;
}

/** Renvoie le tarif annuel de scolarité selon le cycle et le type d'inscription. */
export function tarifScolariteAnnuel(cycle: Cycle, type: TypeInscription): number {
  return type === 'INSCRIPTION'
    ? SCOLARITE_NOUVELLE_INSCRIPTION[cycle]
    : SCOLARITE_REINSCRIPTION[cycle];
}

/** Libellé humain pour un cycle. */
export const LIBELLE_CYCLE: Record<Cycle, string> = {
  MATERNELLE: 'Maternelle',
  PRIMAIRE:   'Primaire',
  COLLEGE:    'Collège',
  LYCEE:      'Lycée',
  CEE:        '6ème Année — CEE',
  BEPC:       '10ème Année — BEPC',
  BAC:        'Terminale — BAC',
};

/** Vrai si le cycle est une classe d'examen (CEE, BEPC, BAC). */
export function estClasseExamen(cycle: Cycle | null): boolean {
  return cycle === 'CEE' || cycle === 'BEPC' || cycle === 'BAC';
}
