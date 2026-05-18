export interface Question {
  id: number;
  text: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface LevelData {
  [level: number]: Question[];
}

export interface QuizSet {
  [gameId: string]: LevelData;
}

export const QUIZ_DATA: QuizSet = {
  // ══════════════════ MATERNELLE ══════════════════
  'mat-sci-1': {
    1: [
      { id: 1, text: "Quelle est la couleur du soleil ?", options: ["Rouge", "Jaune", "Bleu"], answer: "Jaune" },
      { id: 2, text: "Quelle est la couleur de l'herbe ?", options: ["Vert", "Jaune", "Rose"], answer: "Vert" }
    ],
    2: [
      { id: 1, text: "Quelle est la couleur du ciel ?", options: ["Bleu", "Gris", "Noir"], answer: "Bleu" },
      { id: 2, text: "Quelle est la couleur d'une tomate mûre ?", options: ["Vert", "Rouge", "Bleu"], answer: "Rouge" }
    ],
    3: [
      { id: 1, text: "Quelle forme a un ballon ?", options: ["Carré", "Rond", "Triangle"], answer: "Rond" },
      { id: 2, text: "Quelle forme a une boîte de chaussures ?", options: ["Rond", "Rectangle", "Triangle"], answer: "Rectangle" }
    ],
    4: [
      { id: 1, text: "Lequel est un animal ?", options: ["Une fleur", "Un chat", "Un caillou"], answer: "Un chat" },
      { id: 2, text: "Où poussent les pommes ?", options: ["Sur un arbre", "Dans la terre", "Dans l'eau"], answer: "Sur un arbre" }
    ],
    5: [
      { id: 1, text: "Lequel est un fruit ?", options: ["Une carotte", "Une banane", "Une pomme de terre"], answer: "Une banane" },
      { id: 2, text: "Qui fait 'Meuh' ?", options: ["Le chien", "La vache", "Le chat"], answer: "La vache" }
    ]
  },

  // ══════════════════ CP ══════════════════
  'cp-sci-1': {
    1: [
      { id: 1, text: "Où vit le poisson ?", options: ["Dans la forêt", "Dans l'eau", "Dans le désert"], answer: "Dans l'eau" },
      { id: 2, text: "Quel animal a une longue trompe ?", options: ["Le lion", "Le singe", "L'éléphant"], answer: "L'éléphant" }
    ],
    2: [
      { id: 1, text: "Lequel de ces animaux peut voler ?", options: ["Le chat", "L'oiseau", "Le lapin"], answer: "L'oiseau" },
      { id: 2, text: "Combien de pattes a une araignée ?", options: ["4", "6", "8"], answer: "8" }
    ],
    3: [
      { id: 1, text: "De quoi une plante a-t-elle besoin pour pousser ?", options: ["De chocolat", "D'eau et de lumière", "De jouets"], answer: "D'eau et de lumière" },
      { id: 2, text: "Quelle partie de la plante est sous la terre ?", options: ["Les feuilles", "La tige", "Les racines"], answer: "Les racines" }
    ],
    4: [
      { id: 1, text: "Lequel est un mammifère ?", options: ["Le crocodile", "Le dauphin", "Le pigeon"], answer: "Le dauphin" },
      { id: 2, text: "Quel animal produit du lait ?", options: ["La poule", "La vache", "Le serpent"], answer: "La vache" }
    ],
    5: [
      { id: 1, text: "Lequel est un reptile ?", options: ["La grenouille", "Le lézard", "Le moineau"], answer: "Le lézard" },
      { id: 2, text: "Comment s'appelle le bébé du chien ?", options: ["Le chaton", "Le chiot", "Le veau"], answer: "Le chiot" }
    ]
  },

  'cp-fr-1': {
    1: [
      { id: 1, text: "Quelle lettre vient après A ?", options: ["C", "B", "D"], answer: "B" },
      { id: 2, text: "Quelle est la première lettre de 'Maman' ?", options: ["N", "M", "L"], answer: "M" }
    ],
    2: [
      { id: 1, text: "Trouve la syllabe manquante : CA_RE", options: ["TO", "RA", "MI"], answer: "RA" },
      { id: 2, text: "Combien de syllabes dans 'LAVABO' ?", options: ["2", "3", "4"], answer: "3" }
    ],
    3: [
      { id: 1, text: "Lequel est un nom d'objet ?", options: ["Courir", "Table", "Petit"], answer: "Table" },
      { id: 2, text: "Lequel est un verbe ?", options: ["Manger", "Pomme", "Bleu"], answer: "Manger" }
    ],
    4: [
      { id: 1, text: "Quel est le pluriel de 'Le chat' ?", options: ["La chat", "Les chats", "Les chates"], answer: "Les chats" },
      { id: 2, text: "Quel est le féminin de 'Un ami' ?", options: ["Une amie", "Un ami", "Les amis"], answer: "Une amie" }
    ],
    5: [
      { id: 1, text: "Trouve le mot correctement écrit :", options: ["Bateau", "Bato", "Batô"], answer: "Bateau" },
      { id: 2, text: "Complète : Le ciel est ___.", options: ["Bleue", "Bleu", "Bleus"], answer: "Bleu" }
    ]
  },

  // ══════════════════ CE1 ══════════════════
  'ce1-hist-1': {
    1: [
      { id: 1, text: "Combien de régions naturelles y a-t-il en Guinée ?", options: ["2", "3", "4", "5"], answer: "4" },
      { id: 2, text: "Quelle est la capitale de la Guinée ?", options: ["Kindia", "Conakry", "Labé"], answer: "Conakry" }
    ],
    2: [
      { id: 1, text: "Quelle région est le 'Château d'eau' ?", options: ["Basse Guinée", "Moyenne Guinée", "Haute Guinée"], answer: "Moyenne Guinée" },
      { id: 2, text: "Dans quelle région se trouve le Mont Nimba ?", options: ["Basse Guinée", "Guinée Forestière", "Haute Guinée"], answer: "Guinée Forestière" }
    ],
    3: [
      { id: 1, text: "Quelle région est connue pour ses plaines et son riz ?", options: ["Basse Guinée", "Moyenne Guinée", "Haute Guinée"], answer: "Haute Guinée" },
      { id: 2, text: "Quelle région borde l'Océan Atlantique ?", options: ["Basse Guinée", "Moyenne Guinée", "Guinée Forestière"], answer: "Basse Guinée" }
    ],
    4: [
      { id: 1, text: "Quel est le climat de la Basse Guinée ?", options: ["Tropical sec", "Tropical humide", "Sahélien"], answer: "Tropical humide" },
      { id: 2, text: "Quelle est la ville principale de la Moyenne Guinée ?", options: ["Kankan", "Labé", "Nzérékoré"], answer: "Labé" }
    ],
    5: [
      { id: 1, text: "Quel fleuve prend sa source au Fouta Djallon ?", options: ["Le Nil", "Le Sénégal", "Le Congo"], answer: "Le Sénégal" },
      { id: 2, text: "La Guinée est surnommée le 'Château d'eau de l'Afrique' car :", options: ["Il pleut tout le temps", "Beaucoup de fleuves y naissent", "Elle a beaucoup de lacs"], answer: "Beaucoup de fleuves y naissent" }
    ]
  },

  // ══════════════════ CM2 ══════════════════
  'cm2-hist-1': {
    1: [
      { id: 1, text: "En quelle année la Guinée est-elle devenue indépendante ?", options: ["1954", "1958", "1960"], answer: "1958" },
      { id: 2, text: "Qui fut le premier président ?", options: ["Lansana Conté", "Sékou Touré", "Alpha Condé"], answer: "Sékou Touré" }
    ],
    2: [
      { id: 1, text: "Quelle date marque l'indépendance ?", options: ["28 septembre", "2 octobre", "3 avril"], answer: "2 octobre" },
      { id: 2, text: "A quoi la Guinée a-t-elle dit 'NON' le 28 septembre ?", options: ["A l'Afrique", "A la Communauté française", "A l'ONU"], answer: "A la Communauté française" }
    ],
    3: [
      { id: 1, text: "Qui était le général français à l'époque ?", options: ["De Gaulle", "Napoléon", "Macron"], answer: "De Gaulle" },
      { id: 2, text: "Quel pays a aidé la Guinée juste après l'indépendance ?", options: ["Le Ghana", "La France", "Le Portugal"], answer: "Le Ghana" }
    ],
    4: [
      { id: 1, text: "Quel était le parti de Sékou Touré ?", options: ["PUP", "PDG-RDA", "RPG"], answer: "PDG-RDA" },
      { id: 2, text: "Où a été proclamée l'indépendance ?", options: ["Au stade", "A l'Assemblée Nationale", "Au palais"], answer: "A l'Assemblée Nationale" }
    ],
    5: [
      { id: 1, text: "En quelle année Sékou Touré est-il mort ?", options: ["1980", "1984", "1990"], answer: "1984" },
      { id: 2, text: "Qui lui a succédé en 1984 ?", options: ["Lansana Conté", "Dadid Camara", "Sékouba Konaté"], answer: "Lansana Conté" }
    ]
  },

  // ══════════════════ 10ème ══════════════════
  '10e-civ-1': {
    1: [
      { id: 1, text: "Quelle est la devise de la Guinée ?", options: ["Travail - Justice - Solidarité", "Unité - Progrès - Justice", "Liberté - Égalité - Fraternité"], answer: "Travail - Justice - Solidarité" },
      { id: 2, text: "Quelles sont les couleurs du drapeau ?", options: ["Rouge-Jaune-Vert", "Vert-Jaune-Rouge", "Bleu-Blanc-Rouge"], answer: "Rouge-Jaune-Vert" }
    ],
    2: [
      { id: 1, text: "Que signifie le Rouge du drapeau ?", options: ["La forêt", "Le sang des martyrs", "L'or"], answer: "Le sang des martyrs" },
      { id: 2, text: "Que signifie le Jaune ?", options: ["Le soleil et les richesses", "La mer", "La savane"], answer: "Le soleil et les richesses" }
    ],
    3: [
      { id: 1, text: "Que signifie le Vert ?", options: ["La paix", "La végétation", "L'espoir"], answer: "La végétation" },
      { id: 2, text: "Quel est l'hymne national ?", options: ["Liberté", "La Marseillaise", "L'Union"], answer: "Liberté" }
    ],
    4: [
      { id: 1, text: "Qui a écrit les paroles de l'hymne ?", options: ["Sékou Touré", "Fodéba Keïta", "Kémo Kouyaté"], answer: "Fodéba Keïta" },
      { id: 2, text: "Quelle est la forme de l'Etat guinéen ?", options: ["Monarchie", "République", "Empire"], answer: "République" }
    ],
    5: [
      { id: 1, text: "Quel est l'organe qui vote les lois ?", options: ["Le Gouvernement", "L'Assemblée Nationale", "La Cour Suprême"], answer: "L'Assemblée Nationale" },
      { id: 2, text: "A quel âge est-on électeur ?", options: ["16 ans", "18 ans", "21 ans"], answer: "18 ans" }
    ]
  },

  '7e-fr-1': {
    1: [
      { id: 1, text: "Dans la phrase 'L'élève étudie sa leçon', quel est le sujet ?", options: ["étudie", "L'élève", "sa leçon"], answer: "L'élève" },
      { id: 2, text: "Quel est le verbe dans 'Nous mangeons une pomme' ?", options: ["Nous", "mangeons", "pomme"], answer: "mangeons" }
    ],
    2: [
      { id: 1, text: "Conjugue le verbe 'Être' à la 2ème personne du singulier au présent.", options: ["Je suis", "Tu es", "Il est"], answer: "Tu es" },
      { id: 2, text: "Quel est le pluriel de 'Le cheval' ?", options: ["Les chevals", "Les chevaux", "Le chevaux"], answer: "Les chevaux" }
    ]
  },

  '7e-phys-1': {
    1: [
      { id: 1, text: "Quel est l'état de l'eau à 0°C (glace) ?", options: ["Liquide", "Solide", "Gazeux"], answer: "Solide" },
      { id: 2, text: "Comment appelle-t-on le passage du solide au liquide ?", options: ["Fusion", "Solidification", "Vaporisation"], answer: "Fusion" }
    ]
  },

  '8e-fr-1': {
    1: [
      { id: 1, text: "Trouve le mot correctement orthographié :", options: ["Eguille", "Aiguille", "Aiguie"], answer: "Aiguille" },
      { id: 2, text: "Quel est le synonyme de 'Gai' ?", options: ["Triste", "Heureux", "Colère"], answer: "Heureux" }
    ]
  },

  '8e-phys-1': {
    1: [
      { id: 1, text: "Quel instrument mesure la tension électrique ?", options: ["Ampèremètre", "Voltmètre", "Ohmmètre"], answer: "Voltmètre" },
      { id: 2, text: "L'unité de l'intensité électrique est :", options: ["Le Volt", "L'Ampère", "Le Watt"], answer: "L'Ampère" }
    ]
  },

  '9e-chi-1': {
    1: [
      { id: 1, text: "Quel est le symbole chimique du Carbone ?", options: ["Ca", "C", "Co"], answer: "C" },
      { id: 2, text: "Une molécule d'eau est composée de :", options: ["2 hydrogène, 1 oxygène", "1 hydrogène, 2 oxygène", "2 hydrogène, 2 oxygène"], answer: "2 hydrogène, 1 oxygène" }
    ]
  },

  '10e-fr-1': {
    1: [
      { id: 1, text: "Identifie la nature de 'rapidement' :", options: ["Nom", "Adjectif", "Adverbe"], answer: "Adverbe" },
      { id: 2, text: "Quel est le complément d'objet direct (COD) dans 'Il regarde le film' ?", options: ["Il", "regarde", "le film"], answer: "le film" }
    ]
  },

  '10e-phys-1': {
    1: [
      { id: 1, text: "Quelle est l'unité de la puissance électrique ?", options: ["Joule", "Watt", "Volt"], answer: "Watt" },
      { id: 2, text: "La formule de la vitesse est :", options: ["V = d x t", "V = d / t", "V = t / d"], answer: "V = d / t" }
    ]
  },

  '10e-chi-1': {
    1: [
      { id: 1, text: "Un pH inférieur à 7 indique une solution :", options: ["Basique", "Acide", "Neutre"], answer: "Acide" },
      { id: 2, text: "Quel métal est attiré par un aimant ?", options: ["Aluminium", "Cuivre", "Fer"], answer: "Fer" }
    ]
  },

  // ══════════════════ TERMINALE ══════════════════
  't-phi-1': {
    1: [
      { id: 1, text: "Qui a dit 'L'homme est condamné à être libre' ?", options: ["Kant", "Sartre", "Platon"], answer: "Sartre" },
      { id: 2, text: "La liberté consiste à :", options: ["Faire tout ce qu'on veut", "Obéir à la loi qu'on s'est prescrite", "Ne rien faire"], answer: "Obéir à la loi qu'on s'est prescrite" }
    ],
    2: [
      { id: 1, text: "Quel philosophe parle d'impératif catégorique ?", options: ["Hegel", "Kant", "Marx"], answer: "Kant" },
      { id: 2, text: "Le déterminisme affirme que :", options: ["Tout a une cause", "Rien n'est écrit", "L'homme est dieu"], answer: "Tout a une cause" }
    ],
    3: [
      { id: 1, text: "Pour Marx, la liberté est :", options: ["Une illusion", "Le fruit du travail", "Un don du ciel"], answer: "Le fruit du travail" }
    ],
    4: [
      { id: 2, text: "L'existentialisme est un :", options: ["Humanisme", "Nihilisme", "Idéalisme"], answer: "Humanisme" }
    ],
    5: [
       { id: 1, text: "La conscience est :", options: ["Le sommeil", "La connaissance de soi", "L'oubli"], answer: "La connaissance de soi" }
    ]
  }
};
