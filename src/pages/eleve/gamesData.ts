// ── Données des jeux classés par Classe, Matière et Difficulté ───────────────

export type Difficulty = 'facile' | 'moyen' | 'difficile';
export type ClassLevel = 'Maternelle' | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6ème' | '5ème' | '4ème' | '3ème' | '10ème' | '11ème' | '12ème' | 'Terminale';

export interface GameDef {
  id: string;
  title: string;
  subject: string;
  classLevel: ClassLevel;
  difficulty: Difficulty;
  description: string;
  path: string;
  icon: string; // lucide icon name
  color: string;
  glowColor: string;
  bgColor: string;
  isNew?: boolean;
}

// Helper: difficulty stars
export const difficultyStars = (d: Difficulty) =>
  d === 'facile' ? '⭐' : d === 'moyen' ? '⭐⭐' : '⭐⭐⭐';

export const difficultyLabel = (d: Difficulty) =>
  d === 'facile' ? 'Facile' : d === 'moyen' ? 'Moyen' : 'Difficile';

export const CLASS_LEVELS: ClassLevel[] = [
  'Maternelle', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '10ème', '11ème', '12ème', 'Terminale'
];

export const SUBJECTS = [
  'Tous', 'Français', 'Mathématiques', 'Sciences', 'Histoire-Géo', 'Anglais', 'Arts', 'Logique'
];

export const GAMES_DATABASE: GameDef[] = [
  // ═══════════════════ MATERNELLE ═══════════════════
  { id: 'mat-fr-1', title: 'Memory des Mots', subject: 'Français', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Associe les images avec les bons mots pour apprendre le vocabulaire.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20', isNew: true },
  { id: 'mat-math-1', title: 'Compte les Étoiles', subject: 'Mathématiques', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Compte les objets et trouve le bon chiffre.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'mat-art-1', title: 'Le Peintre Étoilé', subject: 'Arts', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Reconnais et associe les couleurs avec leur nom.',
    path: '/eleve/jeux/color', icon: 'Palette', color: 'text-pink-500', glowColor: 'glow-pink', bgColor: 'bg-pink-500/20' },
  { id: 'mat-log-1', title: 'Suite Magique', subject: 'Logique', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Trouve la suite logique des formes et des couleurs.',
    path: '/eleve/jeux/logic', icon: 'Brain', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },

  // ═══════════════════ CP ═══════════════════
  { id: 'cp-fr-1', title: 'Syllabes en Folie', subject: 'Français', classLevel: 'CP', difficulty: 'facile',
    description: 'Assemble les syllabes pour former des mots simples.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'cp-math-1', title: 'Additions Express', subject: 'Mathématiques', classLevel: 'CP', difficulty: 'facile',
    description: 'Calcul mental : additions simples de 1 à 10.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'cp-sci-1', title: 'Les Animaux', subject: 'Sciences', classLevel: 'CP', difficulty: 'facile',
    description: 'Associe chaque animal à son habitat naturel.',
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: 'cp-ang-1', title: 'Hello Colors!', subject: 'Anglais', classLevel: 'CP', difficulty: 'facile',
    description: 'Apprends les couleurs en anglais de façon ludique.',
    path: '/eleve/jeux/color', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ═══════════════════ CE1 ═══════════════════
  { id: 'ce1-fr-1', title: 'Chasse aux Lettres', subject: 'Français', classLevel: 'CE1', difficulty: 'moyen',
    description: 'Trouve les lettres manquantes pour compléter les mots.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'ce1-math-1', title: 'Soustractions Ninja', subject: 'Mathématiques', classLevel: 'CE1', difficulty: 'moyen',
    description: 'Calcul mental rapide avec additions et soustractions.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'ce1-hist-1', title: 'Voyage dans le Temps', subject: 'Histoire-Géo', classLevel: 'CE1', difficulty: 'facile',
    description: 'Découvre les grandes périodes de l\'histoire en images.',
    path: '/eleve/jeux/logic', icon: 'Clock', color: 'text-amber-500', glowColor: 'glow-amber', bgColor: 'bg-amber-500/20' },
  { id: 'ce1-log-1', title: 'Puzzle des Formes', subject: 'Logique', classLevel: 'CE1', difficulty: 'moyen',
    description: 'Complète les suites de formes géométriques.',
    path: '/eleve/jeux/logic', icon: 'Brain', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },

  // ═══════════════════ CE2 ═══════════════════
  { id: 'ce2-fr-1', title: 'Grammaire Express', subject: 'Français', classLevel: 'CE2', difficulty: 'moyen',
    description: 'Identifie les noms, verbes et adjectifs dans les phrases.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'ce2-math-1', title: 'Tables de Multiplication', subject: 'Mathématiques', classLevel: 'CE2', difficulty: 'moyen',
    description: 'Entraîne-toi aux tables de multiplication de 2 à 5.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'ce2-sci-1', title: 'Le Corps Humain', subject: 'Sciences', classLevel: 'CE2', difficulty: 'moyen',
    description: 'Place les organes au bon endroit dans le corps.',
    path: '/eleve/jeux/logic', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: 'ce2-ang-1', title: 'English Quiz', subject: 'Anglais', classLevel: 'CE2', difficulty: 'moyen',
    description: 'Teste tes connaissances en vocabulaire anglais.',
    path: '/eleve/jeux/color', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ═══════════════════ CM1 ═══════════════════
  { id: 'cm1-fr-1', title: 'Conjugaison Challenge', subject: 'Français', classLevel: 'CM1', difficulty: 'moyen',
    description: 'Conjugue les verbes au présent, passé et futur.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'cm1-math-1', title: 'Fractions Aventure', subject: 'Mathématiques', classLevel: 'CM1', difficulty: 'difficile',
    description: 'Découvre et manipule les fractions simples.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'cm1-hist-1', title: 'Quiz Géographie', subject: 'Histoire-Géo', classLevel: 'CM1', difficulty: 'moyen',
    description: 'Retrouve les capitales et les continents.',
    path: '/eleve/jeux/quiz', icon: 'Map', color: 'text-amber-500', glowColor: 'glow-amber', bgColor: 'bg-amber-500/20' },
  { id: 'cm1-log-1', title: 'Défi Logique Pro', subject: 'Logique', classLevel: 'CM1', difficulty: 'difficile',
    description: 'Résous des énigmes logiques complexes.',
    path: '/eleve/jeux/logic', icon: 'Brain', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },

  // ═══════════════════ CM2 ═══════════════════
  { id: 'cm2-fr-1', title: 'Orthographe Master', subject: 'Français', classLevel: 'CM2', difficulty: 'difficile',
    description: 'Trouve la bonne orthographe parmi les propositions.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'cm2-math-1', title: 'Problèmes Éclair', subject: 'Mathématiques', classLevel: 'CM2', difficulty: 'difficile',
    description: 'Résous des problèmes de maths en temps limité.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'cm2-sci-1', title: 'Système Solaire', subject: 'Sciences', classLevel: 'CM2', difficulty: 'moyen',
    description: 'Explore les planètes et leurs caractéristiques.',
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: 'cm2-ang-1', title: 'Grammar Quest', subject: 'Anglais', classLevel: 'CM2', difficulty: 'difficile',
    description: 'Construis des phrases correctes en anglais.',
    path: '/eleve/jeux/color', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ═══════════════════ 6ème ═══════════════════
  { id: '6e-fr-1', title: 'Analyse Grammaticale', subject: 'Français', classLevel: '6ème', difficulty: 'moyen',
    description: 'Identifie les fonctions grammaticales dans la phrase.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '6e-math-1', title: 'Géométrie Explorer', subject: 'Mathématiques', classLevel: '6ème', difficulty: 'moyen',
    description: 'Calcule périmètres et aires des figures.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '6e-sci-1', title: 'Labo Virtuel', subject: 'Sciences', classLevel: '6ème', difficulty: 'moyen',
    description: 'Réalise des expériences virtuelles sur la matière.',
    path: '/eleve/jeux/logic', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: '6e-hist-1', title: 'Civilisations Quiz', subject: 'Histoire-Géo', classLevel: '6ème', difficulty: 'moyen',
    description: 'Teste tes connaissances sur les grandes civilisations.',
    path: '/eleve/jeux/quiz', icon: 'Clock', color: 'text-amber-500', glowColor: 'glow-amber', bgColor: 'bg-amber-500/20' },

  // ═══════════════════ 5ème ═══════════════════
  { id: '5e-math-1', title: 'Équations Junior', subject: 'Mathématiques', classLevel: '5ème', difficulty: 'difficile',
    description: 'Résous des équations du premier degré.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '5e-fr-1', title: 'Rédaction Express', subject: 'Français', classLevel: '5ème', difficulty: 'difficile',
    description: 'Remets les paragraphes dans le bon ordre.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '5e-ang-1', title: 'Vocabulary Master', subject: 'Anglais', classLevel: '5ème', difficulty: 'moyen',
    description: 'Enrichis ton vocabulaire anglais thématique.',
    path: '/eleve/jeux/color', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },
  { id: '5e-sci-1', title: 'Chimie Virtuelle', subject: 'Sciences', classLevel: '5ème', difficulty: 'difficile',
    description: 'Découvre les mélanges et les réactions chimiques.',
    path: '/eleve/jeux/logic', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },

  // ═══════════════════ 4ème ═══════════════════
  { id: '4e-math-1', title: 'Pythagore Quest', subject: 'Mathématiques', classLevel: '4ème', difficulty: 'difficile',
    description: 'Applique le théorème de Pythagore dans des défis.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '4e-fr-1', title: 'Figures de Style', subject: 'Français', classLevel: '4ème', difficulty: 'difficile',
    description: 'Identifie les métaphores, comparaisons et hyperboles.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '4e-hist-1', title: 'Révolution Quiz', subject: 'Histoire-Géo', classLevel: '4ème', difficulty: 'difficile',
    description: 'Revois les grandes révolutions de l\'histoire.',
    path: '/eleve/jeux/logic', icon: 'Clock', color: 'text-amber-500', glowColor: 'glow-amber', bgColor: 'bg-amber-500/20' },

  // ═══════════════════ 3ème ═══════════════════
  { id: '3e-math-1', title: 'Brevet Express', subject: 'Mathématiques', classLevel: '3ème', difficulty: 'difficile',
    description: 'Entraîne-toi sur des exercices type Brevet.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20', isNew: true },
  { id: '3e-fr-1', title: 'Dissertation Flash', subject: 'Français', classLevel: '3ème', difficulty: 'difficile',
    description: 'Construis des arguments pour des sujets de réflexion.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '3e-sci-1', title: 'Physique Challenge', subject: 'Sciences', classLevel: '3ème', difficulty: 'difficile',
    description: 'Résous des problèmes de physique-chimie.',
    path: '/eleve/jeux/logic', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: '3e-ang-1', title: 'TOEFL Junior', subject: 'Anglais', classLevel: '3ème', difficulty: 'difficile',
    description: 'Prépare-toi avec des exercices de compréhension avancée.',
    path: '/eleve/jeux/color', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ═══════════════════ 11ème (Lycée) ═══════════════════
  { id: '11e-math-1', title: 'Limites & Dérivées', subject: 'Mathématiques', classLevel: '11ème', difficulty: 'difficile',
    description: 'Maîtrise les concepts fondamentaux de l\'analyse mathématique.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-600', glowColor: 'glow-blue', bgColor: 'bg-blue-600/20', isNew: true },
  { id: '11e-sci-1', title: 'Génétique Moléculaire', subject: 'Sciences', classLevel: '11ème', difficulty: 'difficile',
    description: 'Explore les secrets de l\'ADN et de l\'hérédité.',
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-emerald-600', glowColor: 'glow-emerald', bgColor: 'bg-emerald-600/20' },
  { id: '11e-fr-1', title: 'Mouvements Littéraires', subject: 'Français', classLevel: '11ème', difficulty: 'moyen',
    description: 'Identifie les courants de pensée à travers les siècles.',
    path: '/eleve/jeux/quiz', icon: 'Languages', color: 'text-purple-600', glowColor: 'glow-purple', bgColor: 'bg-purple-600/20' },
  { id: '11e-hist-1', title: 'Histoire Contemporaine', subject: 'Histoire-Géo', classLevel: '11ème', difficulty: 'moyen',
    description: 'Les grands enjeux du monde depuis 1945.',
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-amber-600', glowColor: 'glow-amber', bgColor: 'bg-amber-600/20' },

  // ═══════════════════ Terminale (Lycée) ═══════════════════
  { id: 't-math-1', title: 'Nombres Complexes', subject: 'Mathématiques', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Explore les nombres imaginaires et leurs applications.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-700', glowColor: 'glow-blue', bgColor: 'bg-blue-700/20', isNew: true },
  { id: 't-sci-1', title: 'Physique Quantique', subject: 'Sciences', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Introduction aux mystères de l\'atome et de l\'infiniment petit.',
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-emerald-700', glowColor: 'glow-emerald', bgColor: 'bg-emerald-700/20' },
  { id: 't-phi-1', title: 'Philosophie : La Liberté', subject: 'Logique', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Réflexions philosophiques sur la notion de libre arbitre.',
    path: '/eleve/jeux/quiz', icon: 'Brain', color: 'text-orange-700', glowColor: 'glow-orange', bgColor: 'bg-orange-700/20' },
];
