// ── Catalogue des jeux EIEF aligne sur le programme scolaire guineen ───────
//
//   Maternelle  : eveil (memoire, formes, couleurs, comptage)
//   Primaire    : Dictee · Jeux des mots · Calcul · Sciences · Scratch · Anglais
//   College     : Francais (gram/ortho/dictee/conjug/vocab) · Maths · Physique ·
//                 Chimie · Jeux des mots
//   Lycee       : Litterature africaine · Maths · Physique · Chimie · Philo ·
//                 Economie · Anglais
//
// CatalogueJeux.tsx filtre automatiquement selon la classe de l'eleve.

export type Difficulty = 'facile' | 'moyen' | 'difficile';

export type ClassLevel =
  | 'Maternelle'
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '7ème' | '8ème' | '9ème' | '10ème'
  | '11ème' | '12ème' | 'Terminale';

export interface GameDef {
  id: string;
  title: string;
  subject: string;
  classLevel: ClassLevel;
  difficulty: Difficulty;
  description: string;
  path: string;
  icon: string;          // lucide icon name
  color: string;
  glowColor: string;
  bgColor: string;
  isNew?: boolean;
}

// Helpers d'affichage
export const difficultyStars = (d: Difficulty) =>
  d === 'facile' ? '⭐' : d === 'moyen' ? '⭐⭐' : '⭐⭐⭐';

export const difficultyLabel = (d: Difficulty) =>
  d === 'facile' ? 'Facile' : d === 'moyen' ? 'Moyen' : 'Difficile';

export const CLASS_LEVELS: ClassLevel[] = [
  'Maternelle',
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '7ème', '8ème', '9ème', '10ème',
  '11ème', '12ème', 'Terminale',
];

/**
 * Toutes les matieres disponibles dans le catalogue. 'Tous' est la valeur
 * neutre du filtre (aucun filtre matiere).
 */
export const SUBJECTS = [
  'Tous',
  // primaire
  'Dictée', 'Jeux des mots', 'Calcul', 'Sciences', 'Scratch', 'Anglais',
  // college
  'Français', 'Mathématiques', 'Physique', 'Chimie',
  // lycee
  'Littérature africaine', 'Philosophie', 'Économie',
  // bonus eveil
  'Arts', 'Logique',
];

export const GAMES_DATABASE: GameDef[] = [

  // ══════════════ MATERNELLE / PRESCOLAIRE ══════════════
  { id: 'mat-mots-1', title: 'Memory des Mots', subject: 'Jeux des mots', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Associe les images aux mots simples pour developper ton vocabulaire.',
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20', isNew: true },
  { id: 'mat-mots-2', title: 'Les Lettres Magiques', subject: 'Jeux des mots', classLevel: 'Maternelle', difficulty: 'facile',
    description: "Reconnais et nomme les lettres de l'alphabet.",
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },
  { id: 'mat-calc-1', title: 'Compte les Etoiles', subject: 'Calcul', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Compte les objets de 1 a 10.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'mat-calc-2', title: 'Petites Quantites', subject: 'Calcul', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Identifie le plus, le moins, autant — apprends a comparer.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'mat-art-1', title: 'Le Peintre Etoile', subject: 'Arts', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Decouvre les couleurs primaires et secondaires en jouant.',
    path: '/eleve/jeux/color', icon: 'Palette', color: 'text-pink-500', glowColor: 'glow-pink', bgColor: 'bg-pink-500/20' },
  { id: 'mat-log-1', title: 'Suite Magique', subject: 'Logique', classLevel: 'Maternelle', difficulty: 'facile',
    description: 'Trouve la suite logique des formes et des couleurs.',
    path: '/eleve/jeux/logic', icon: 'Brain', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },

  // ══════════════ CP — PRIMAIRE ══════════════
  { id: 'cp-dict-1', title: 'La Dictee des Sons', subject: 'Dictée', classLevel: 'CP', difficulty: 'facile',
    description: 'Ecris les mots a partir des sons que tu entends : ba, ta, ma, pa...',
    path: '/jeux', icon: 'PenTool', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'cp-mots-1', title: 'Syllabes en Folie', subject: 'Jeux des mots', classLevel: 'CP', difficulty: 'facile',
    description: 'Assemble les syllabes pour former des mots simples.',
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },
  { id: 'cp-calc-1', title: 'Additions 1 a 20', subject: 'Calcul', classLevel: 'CP', difficulty: 'facile',
    description: "Calcul mental rapide d'additions simples.",
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'cp-sci-1', title: 'Animaux et Plantes', subject: 'Sciences', classLevel: 'CP', difficulty: 'facile',
    description: 'Associe chaque animal a son milieu de vie.',
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: 'cp-scr-1', title: 'Scratch : Premiers Pas', subject: 'Scratch', classLevel: 'CP', difficulty: 'facile',
    description: 'Deplace ton lutin avec les fleches — initiation au code.',
    path: '/eleve/jeux/logic', icon: 'Cpu', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },
  { id: 'cp-ang-1', title: 'Hello & Colors!', subject: 'Anglais', classLevel: 'CP', difficulty: 'facile',
    description: 'Apprends les couleurs et les salutations en anglais.',
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ══════════════ CE1 — PRIMAIRE ══════════════
  { id: 'ce1-dict-1', title: 'Dictee Niveau CE1', subject: 'Dictée', classLevel: 'CE1', difficulty: 'facile',
    description: 'Mots de la vie quotidienne avec les sons complexes (eu, ou, on...).',
    path: '/jeux', icon: 'PenTool', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'ce1-mots-1', title: 'Le Bon Mot', subject: 'Jeux des mots', classLevel: 'CE1', difficulty: 'facile',
    description: 'Complete les phrases avec le mot juste — genre et nombre.',
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },
  { id: 'ce1-calc-1', title: 'Tables x2 a x5', subject: 'Calcul', classLevel: 'CE1', difficulty: 'facile',
    description: 'Apprends les tables de multiplication 2, 3, 4 et 5.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'ce1-sci-1', title: 'Les Saisons', subject: 'Sciences', classLevel: 'CE1', difficulty: 'facile',
    description: 'Comprends les 4 saisons et les phenomenes naturels.',
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: 'ce1-scr-1', title: 'Scratch : Mouvement', subject: 'Scratch', classLevel: 'CE1', difficulty: 'facile',
    description: 'Cree une histoire avec ton personnage qui marche et parle.',
    path: '/eleve/jeux/logic', icon: 'Cpu', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },
  { id: 'ce1-ang-1', title: 'Numbers & Family', subject: 'Anglais', classLevel: 'CE1', difficulty: 'facile',
    description: 'Compte de 1 a 50 et parle de ta famille en anglais.',
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ══════════════ CE2 — PRIMAIRE ══════════════
  { id: 'ce2-dict-1', title: 'Dictee Niveau CE2', subject: 'Dictée', classLevel: 'CE2', difficulty: 'moyen',
    description: "Pluriels irreguliers, accords du verbe et de l'adjectif.",
    path: '/jeux', icon: 'PenTool', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'ce2-mots-1', title: 'Charade Geante', subject: 'Jeux des mots', classLevel: 'CE2', difficulty: 'moyen',
    description: "Devine le mot a partir d'indices — vocabulaire enrichi.",
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },
  { id: 'ce2-calc-1', title: 'Problemes Faciles', subject: 'Calcul', classLevel: 'CE2', difficulty: 'moyen',
    description: 'Resous des problemes simples (achats, distances, partage).',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'ce2-sci-1', title: 'Le Corps Humain', subject: 'Sciences', classLevel: 'CE2', difficulty: 'moyen',
    description: 'Identifie les organes principaux du corps.',
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: 'ce2-scr-1', title: 'Scratch : Boucles', subject: 'Scratch', classLevel: 'CE2', difficulty: 'moyen',
    description: 'Cree des motifs repetitifs avec les blocs repeter.',
    path: '/eleve/jeux/logic', icon: 'Cpu', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },
  { id: 'ce2-ang-1', title: 'Daily Words', subject: 'Anglais', classLevel: 'CE2', difficulty: 'moyen',
    description: 'Vocabulaire de la salle de classe et de la maison.',
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ══════════════ CM1 — PRIMAIRE ══════════════
  { id: 'cm1-dict-1', title: 'Dictee Niveau CM1', subject: 'Dictée', classLevel: 'CM1', difficulty: 'moyen',
    description: "Homophones (a/a, et/est, son/sont) — pas d'erreur permise !",
    path: '/jeux', icon: 'PenTool', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'cm1-mots-1', title: 'Synonymes Express', subject: 'Jeux des mots', classLevel: 'CM1', difficulty: 'moyen',
    description: 'Trouve le synonyme du mot souligne dans la phrase.',
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },
  { id: 'cm1-calc-1', title: 'Fractions Simples', subject: 'Calcul', classLevel: 'CM1', difficulty: 'moyen',
    description: 'Initie-toi aux fractions : 1/2, 1/4, comparaisons.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'cm1-sci-1', title: "Cycle de l'Eau", subject: 'Sciences', classLevel: 'CM1', difficulty: 'moyen',
    description: "Suis le voyage d'une goutte d'eau : evaporation, pluie, riviere.",
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: 'cm1-scr-1', title: 'Scratch : Variables', subject: 'Scratch', classLevel: 'CM1', difficulty: 'moyen',
    description: 'Cree un jeu de score qui augmente quand tu attrappes des objets.',
    path: '/eleve/jeux/logic', icon: 'Cpu', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },
  { id: 'cm1-ang-1', title: 'My Daily Routine', subject: 'Anglais', classLevel: 'CM1', difficulty: 'moyen',
    description: 'Decris ta journee en anglais : wake up, eat, study, play.',
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ══════════════ CM2 — PRIMAIRE ══════════════
  { id: 'cm2-dict-1', title: 'Dictee CEPE', subject: 'Dictée', classLevel: 'CM2', difficulty: 'difficile',
    description: 'Preparation directe au CEPE : textes complets a recopier sans erreur.',
    path: '/jeux', icon: 'PenTool', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: 'cm2-mots-1', title: 'Mots Croises', subject: 'Jeux des mots', classLevel: 'CM2', difficulty: 'difficile',
    description: 'Resous une grille de mots croises adaptee au niveau CM2.',
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },
  { id: 'cm2-calc-1', title: 'Problemes CEPE', subject: 'Calcul', classLevel: 'CM2', difficulty: 'difficile',
    description: 'Problemes types CEPE : pourcentages, vitesse, surface.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'cm2-sci-1', title: 'Systeme Solaire', subject: 'Sciences', classLevel: 'CM2', difficulty: 'moyen',
    description: 'Les planetes, le soleil et la lune.',
    path: '/eleve/jeux/quiz', icon: 'Leaf', color: 'text-green-500', glowColor: 'glow-green', bgColor: 'bg-green-500/20' },
  { id: 'cm2-scr-1', title: 'Scratch : Mini-jeu', subject: 'Scratch', classLevel: 'CM2', difficulty: 'difficile',
    description: 'Cree un mini-jeu complet : Pong, Snake ou labyrinthe.',
    path: '/eleve/jeux/logic', icon: 'Cpu', color: 'text-orange-500', glowColor: 'glow-orange', bgColor: 'bg-orange-500/20' },
  { id: 'cm2-ang-1', title: 'My Family in English', subject: 'Anglais', classLevel: 'CM2', difficulty: 'moyen',
    description: 'Presente ta famille et tes loisirs en anglais.',
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20', isNew: true },

  // ══════════════ 7ème — COLLEGE ══════════════
  { id: '7e-fr-gram-1', title: 'Grammaire 7e', subject: 'Français', classLevel: '7ème', difficulty: 'moyen',
    description: 'Identifie les classes grammaticales : nom, verbe, adjectif, adverbe.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20', isNew: true },
  { id: '7e-fr-ortho-1', title: 'Orthographe 7e', subject: 'Français', classLevel: '7ème', difficulty: 'moyen',
    description: 'Maitrise les accords basiques sujet-verbe et nom-adjectif.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '7e-fr-dict-1', title: 'Dictee 7e', subject: 'Français', classLevel: '7ème', difficulty: 'moyen',
    description: 'Texte court avec accords et homophones simples.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '7e-fr-conj-1', title: 'Conjugaison 7e', subject: 'Français', classLevel: '7ème', difficulty: 'moyen',
    description: 'Present, imparfait, futur des verbes des 3 groupes.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '7e-fr-voc-1', title: 'Vocabulaire 7e', subject: 'Français', classLevel: '7ème', difficulty: 'moyen',
    description: 'Familles de mots, prefixes (re-, in-, pre-).',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '7e-math-1', title: 'Maths 7e : Entiers Relatifs', subject: 'Mathématiques', classLevel: '7ème', difficulty: 'moyen',
    description: 'Additions et soustractions de nombres positifs et negatifs.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '7e-phy-1', title: 'Physique 7e : Etats de la Matiere', subject: 'Physique', classLevel: '7ème', difficulty: 'moyen',
    description: "Solide, liquide, gaz — changements d'etat.",
    path: '/eleve/jeux/quiz', icon: 'Atom', color: 'text-sky-500', glowColor: 'glow-sky', bgColor: 'bg-sky-500/20' },
  { id: '7e-chim-1', title: 'Chimie 7e : Mixtures', subject: 'Chimie', classLevel: '7ème', difficulty: 'moyen',
    description: 'Distingue corps purs et melanges, separation par filtration.',
    path: '/eleve/jeux/quiz', icon: 'FlaskConical', color: 'text-emerald-500', glowColor: 'glow-emerald', bgColor: 'bg-emerald-500/20' },
  { id: '7e-mots-1', title: 'Mots Caches 7e', subject: 'Jeux des mots', classLevel: '7ème', difficulty: 'facile',
    description: "Trouve les mots de l'histoire du Mali dans la grille.",
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },

  // ══════════════ 8ème — COLLEGE ══════════════
  { id: '8e-fr-gram-1', title: 'Grammaire 8e', subject: 'Français', classLevel: '8ème', difficulty: 'moyen',
    description: 'Phrase simple vs complexe — propositions independantes et subordonnees.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '8e-fr-ortho-1', title: 'Orthographe 8e', subject: 'Français', classLevel: '8ème', difficulty: 'moyen',
    description: 'Accord du participe passe avec etre et avoir — cas simples.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '8e-fr-dict-1', title: 'Dictee 8e', subject: 'Français', classLevel: '8ème', difficulty: 'moyen',
    description: 'Texte narratif avec dialogues et ponctuation complexe.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '8e-fr-conj-1', title: 'Conjugaison 8e', subject: 'Français', classLevel: '8ème', difficulty: 'moyen',
    description: 'Plus-que-parfait, passe simple, conditionnel present.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '8e-fr-voc-1', title: 'Vocabulaire 8e', subject: 'Français', classLevel: '8ème', difficulty: 'moyen',
    description: 'Synonymes, antonymes, paronymes — enrichis ton style.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '8e-math-1', title: 'Maths 8e : Calcul Litteral', subject: 'Mathématiques', classLevel: '8ème', difficulty: 'moyen',
    description: "Initiation a l'algebre : developper et factoriser ax + b.",
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '8e-phy-1', title: 'Physique 8e : Le Circuit', subject: 'Physique', classLevel: '8ème', difficulty: 'moyen',
    description: 'Pile, fil, ampoule, interrupteur — montages serie et parallele.',
    path: '/eleve/jeux/quiz', icon: 'Atom', color: 'text-sky-500', glowColor: 'glow-sky', bgColor: 'bg-sky-500/20' },
  { id: '8e-chim-1', title: 'Chimie 8e : Reactions', subject: 'Chimie', classLevel: '8ème', difficulty: 'moyen',
    description: 'Equilibre une equation chimique simple.',
    path: '/eleve/jeux/quiz', icon: 'FlaskConical', color: 'text-emerald-500', glowColor: 'glow-emerald', bgColor: 'bg-emerald-500/20' },
  { id: '8e-mots-1', title: 'Anagrammes 8e', subject: 'Jeux des mots', classLevel: '8ème', difficulty: 'facile',
    description: 'Recompose les mots melanges — speed challenge !',
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },

  // ══════════════ 9ème — COLLEGE ══════════════
  { id: '9e-fr-gram-1', title: 'Grammaire 9e', subject: 'Français', classLevel: '9ème', difficulty: 'difficile',
    description: 'Voix active vs voix passive — transforme les phrases.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '9e-fr-ortho-1', title: 'Orthographe 9e', subject: 'Français', classLevel: '9ème', difficulty: 'difficile',
    description: 'Accord du participe passe avec un COD avant le verbe.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '9e-fr-dict-1', title: 'Dictee 9e', subject: 'Français', classLevel: '9ème', difficulty: 'difficile',
    description: 'Texte argumentatif avec vocabulaire soutenu.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '9e-fr-conj-1', title: 'Conjugaison 9e', subject: 'Français', classLevel: '9ème', difficulty: 'difficile',
    description: "Subjonctif present et passe — quand et comment l'utiliser.",
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '9e-fr-voc-1', title: 'Vocabulaire 9e', subject: 'Français', classLevel: '9ème', difficulty: 'difficile',
    description: 'Champ lexical, registre de langue, figures de style.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '9e-math-1', title: 'Maths 9e : Pythagore', subject: 'Mathématiques', classLevel: '9ème', difficulty: 'difficile',
    description: 'Triangle rectangle : applique Pythagore pour calculer les cotes.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '9e-phy-1', title: 'Physique 9e : Forces', subject: 'Physique', classLevel: '9ème', difficulty: 'difficile',
    description: 'Mesure les forces avec un dynamometre, masse vs poids.',
    path: '/eleve/jeux/quiz', icon: 'Atom', color: 'text-sky-500', glowColor: 'glow-sky', bgColor: 'bg-sky-500/20' },
  { id: '9e-chim-1', title: 'Chimie 9e : Acides & Bases', subject: 'Chimie', classLevel: '9ème', difficulty: 'difficile',
    description: 'pH, acides forts/faibles, indicateurs colores.',
    path: '/eleve/jeux/quiz', icon: 'FlaskConical', color: 'text-emerald-500', glowColor: 'glow-emerald', bgColor: 'bg-emerald-500/20' },
  { id: '9e-mots-1', title: 'Pendu Litteraire 9e', subject: 'Jeux des mots', classLevel: '9ème', difficulty: 'moyen',
    description: 'Devine les titres des grandes oeuvres africaines.',
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },

  // ══════════════ 10ème — COLLEGE (PREPA BEPC) ══════════════
  { id: '10e-fr-gram-1', title: 'Grammaire 10e (BEPC)', subject: 'Français', classLevel: '10ème', difficulty: 'difficile',
    description: 'Analyse logique complete : propositions subordonnees relatives, conjonctives.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '10e-fr-ortho-1', title: 'Orthographe 10e (BEPC)', subject: 'Français', classLevel: '10ème', difficulty: 'difficile',
    description: 'Difficultes finales : tout/tous, leur/leurs, meme accord.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '10e-fr-dict-1', title: 'Dictee 10e (BEPC)', subject: 'Français', classLevel: '10ème', difficulty: 'difficile',
    description: 'Textes types BEPC — niveau examen national.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '10e-fr-conj-1', title: 'Conjugaison 10e (BEPC)', subject: 'Français', classLevel: '10ème', difficulty: 'difficile',
    description: 'Tous les temps et modes — concordance des temps.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '10e-fr-voc-1', title: 'Vocabulaire 10e (BEPC)', subject: 'Français', classLevel: '10ème', difficulty: 'difficile',
    description: 'Mots savants, etymologie grecque et latine.',
    path: '/jeux', icon: 'Languages', color: 'text-purple-500', glowColor: 'glow-purple', bgColor: 'bg-purple-500/20' },
  { id: '10e-math-1', title: 'Maths BEPC', subject: 'Mathématiques', classLevel: '10ème', difficulty: 'difficile',
    description: 'Annales BEPC : algebre, geometrie, statistiques, Thales et Pythagore.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '10e-phy-1', title: 'Physique BEPC : Mouvement', subject: 'Physique', classLevel: '10ème', difficulty: 'difficile',
    description: 'Vitesse, acceleration, forces — bases de la mecanique.',
    path: '/eleve/jeux/quiz', icon: 'Atom', color: 'text-sky-500', glowColor: 'glow-sky', bgColor: 'bg-sky-500/20' },
  { id: '10e-chim-1', title: 'Chimie BEPC : Solutions', subject: 'Chimie', classLevel: '10ème', difficulty: 'difficile',
    description: 'Concentration, dilution, masse molaire — applications.',
    path: '/eleve/jeux/quiz', icon: 'FlaskConical', color: 'text-emerald-500', glowColor: 'glow-emerald', bgColor: 'bg-emerald-500/20' },
  { id: '10e-mots-1', title: 'Scrabble Express 10e', subject: 'Jeux des mots', classLevel: '10ème', difficulty: 'moyen',
    description: 'Forme les mots les mieux payes — vocabulaire BEPC.',
    path: '/jeux', icon: 'Languages', color: 'text-fuchsia-500', glowColor: 'glow-fuchsia', bgColor: 'bg-fuchsia-500/20' },

  // ══════════════ 11ème — LYCEE ══════════════
  { id: '11e-litt-1', title: 'Senghor & la Negritude', subject: 'Littérature africaine', classLevel: '11ème', difficulty: 'moyen',
    description: "Decouvre l'oeuvre du president-poete senegalais.",
    path: '/jeux', icon: 'BookOpen', color: 'text-rose-500', glowColor: 'glow-rose', bgColor: 'bg-rose-500/20' },
  { id: '11e-math-1', title: 'Maths 11e : Derivees', subject: 'Mathématiques', classLevel: '11ème', difficulty: 'difficile',
    description: 'Calcul de derivees des fonctions usuelles.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '11e-phy-1', title: 'Physique 11e : Optique', subject: 'Physique', classLevel: '11ème', difficulty: 'difficile',
    description: 'Refraction, lentilles convergentes et divergentes.',
    path: '/eleve/jeux/quiz', icon: 'Atom', color: 'text-sky-500', glowColor: 'glow-sky', bgColor: 'bg-sky-500/20' },
  { id: '11e-chim-1', title: 'Chimie 11e : Atome', subject: 'Chimie', classLevel: '11ème', difficulty: 'difficile',
    description: 'Configuration electronique, classification periodique.',
    path: '/eleve/jeux/quiz', icon: 'FlaskConical', color: 'text-emerald-500', glowColor: 'glow-emerald', bgColor: 'bg-emerald-500/20' },
  { id: '11e-phi-1', title: 'Philo 11e : Introduction', subject: 'Philosophie', classLevel: '11ème', difficulty: 'difficile',
    description: 'Premiers concepts : verite, liberte, raison.',
    path: '/eleve/jeux/quiz', icon: 'Brain', color: 'text-indigo-500', glowColor: 'glow-indigo', bgColor: 'bg-indigo-500/20', isNew: true },
  { id: '11e-eco-1', title: 'Eco 11e : Marche', subject: 'Économie', classLevel: '11ème', difficulty: 'moyen',
    description: 'Offre, demande, equilibre — bases du marche.',
    path: '/eleve/jeux/quiz', icon: 'TrendingUp', color: 'text-amber-500', glowColor: 'glow-amber', bgColor: 'bg-amber-500/20' },
  { id: '11e-ang-1', title: 'English 11e : Tenses', subject: 'Anglais', classLevel: '11ème', difficulty: 'difficile',
    description: "Maitrise tous les temps de l'anglais : present, past, future, perfect.",
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ══════════════ 12ème — LYCEE ══════════════
  { id: '12e-litt-1', title: "Camara Laye : L'Enfant Noir", subject: 'Littérature africaine', classLevel: '12ème', difficulty: 'difficile',
    description: 'Ce roman emblematique guineen analyse en profondeur.',
    path: '/jeux', icon: 'BookOpen', color: 'text-rose-500', glowColor: 'glow-rose', bgColor: 'bg-rose-500/20' },
  { id: '12e-math-1', title: 'Maths 12e : Suites', subject: 'Mathématiques', classLevel: '12ème', difficulty: 'difficile',
    description: 'Suites arithmetiques, geometriques, convergence.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: '12e-phy-1', title: 'Physique 12e : Electromagnetisme', subject: 'Physique', classLevel: '12ème', difficulty: 'difficile',
    description: 'Champs magnetiques, induction, courants induits.',
    path: '/eleve/jeux/quiz', icon: 'Atom', color: 'text-sky-500', glowColor: 'glow-sky', bgColor: 'bg-sky-500/20' },
  { id: '12e-chim-1', title: 'Chimie 12e : Cinetique', subject: 'Chimie', classLevel: '12ème', difficulty: 'difficile',
    description: 'Vitesse des reactions, facteurs influents, catalyseurs.',
    path: '/eleve/jeux/quiz', icon: 'FlaskConical', color: 'text-emerald-500', glowColor: 'glow-emerald', bgColor: 'bg-emerald-500/20' },
  { id: '12e-phi-1', title: 'Philo 12e : Conscience', subject: 'Philosophie', classLevel: '12ème', difficulty: 'difficile',
    description: 'Conscience de soi, autrui, le moi et le monde.',
    path: '/eleve/jeux/quiz', icon: 'Brain', color: 'text-indigo-500', glowColor: 'glow-indigo', bgColor: 'bg-indigo-500/20' },
  { id: '12e-eco-1', title: 'Eco 12e : Monnaie', subject: 'Économie', classLevel: '12ème', difficulty: 'difficile',
    description: 'Roles de la monnaie, banques, inflation.',
    path: '/eleve/jeux/quiz', icon: 'TrendingUp', color: 'text-amber-500', glowColor: 'glow-amber', bgColor: 'bg-amber-500/20' },
  { id: '12e-ang-1', title: 'English 12e : Writing', subject: 'Anglais', classLevel: '12ème', difficulty: 'difficile',
    description: 'Essay argumentatif : structure et arguments.',
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },

  // ══════════════ Terminale — LYCEE (PREPA BAC) ══════════════
  { id: 'tle-litt-1', title: 'Litterature Africaine : Bac', subject: 'Littérature africaine', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Achebe, Senghor, Sembene, Mariama Ba — auteurs incontournables.',
    path: '/jeux', icon: 'BookOpen', color: 'text-rose-500', glowColor: 'glow-rose', bgColor: 'bg-rose-500/20', isNew: true },
  { id: 'tle-math-1', title: 'Bac Maths : Integrales', subject: 'Mathématiques', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Calcul integral, primitives, applications geometriques.',
    path: '/eleve/jeux/math', icon: 'Calculator', color: 'text-blue-500', glowColor: 'glow-blue', bgColor: 'bg-blue-500/20' },
  { id: 'tle-phy-1', title: 'Bac Physique : Mecanique', subject: 'Physique', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Lois de Newton, energies, oscillateurs.',
    path: '/eleve/jeux/quiz', icon: 'Atom', color: 'text-sky-500', glowColor: 'glow-sky', bgColor: 'bg-sky-500/20' },
  { id: 'tle-chim-1', title: 'Bac Chimie : Organique', subject: 'Chimie', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Hydrocarbures, fonctions chimiques, polymeres.',
    path: '/eleve/jeux/quiz', icon: 'FlaskConical', color: 'text-emerald-500', glowColor: 'glow-emerald', bgColor: 'bg-emerald-500/20' },
  { id: 'tle-phi-1', title: 'Bac Philo : La Liberte', subject: 'Philosophie', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Pensee critique sur le concept de liberte — niveau Bac.',
    path: '/eleve/jeux/quiz', icon: 'Brain', color: 'text-indigo-500', glowColor: 'glow-indigo', bgColor: 'bg-indigo-500/20' },
  { id: 'tle-eco-1', title: 'Bac Eco : Mondialisation', subject: 'Économie', classLevel: 'Terminale', difficulty: 'difficile',
    description: 'Echanges internationaux, FMI, OMC, IDE.',
    path: '/eleve/jeux/quiz', icon: 'TrendingUp', color: 'text-amber-500', glowColor: 'glow-amber', bgColor: 'bg-amber-500/20' },
  { id: 'tle-ang-1', title: 'Bac English : Reading', subject: 'Anglais', classLevel: 'Terminale', difficulty: 'difficile',
    description: "Comprehension d'un texte long et expression libre.",
    path: '/eleve/jeux/quiz', icon: 'Globe', color: 'text-cyan-500', glowColor: 'glow-cyan', bgColor: 'bg-cyan-500/20' },
];
