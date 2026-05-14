export interface Question {
  id: number;
  text: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizSet {
  [gameId: string]: Question[];
}

export const QUIZ_DATA: QuizSet = {
  // CM1 - Quiz Géographie
  'cm1-hist-1': [
    {
      id: 1,
      text: "Quelle est la capitale de la France ?",
      options: ["Lyon", "Paris", "Marseille", "Bordeaux"],
      answer: "Paris",
      explanation: "Paris est la capitale et la plus grande ville de France."
    },
    {
      id: 2,
      text: "Combien y a-t-il de continents sur Terre ?",
      options: ["5", "6", "7", "8"],
      answer: "7",
      explanation: "Les 7 continents sont : Afrique, Antarctique, Asie, Europe, Amérique du Nord, Océanie et Amérique du Sud."
    },
    {
      id: 3,
      text: "Quel est le plus grand océan du monde ?",
      options: ["Océan Atlantique", "Océan Indien", "Océan Pacifique", "Océan Arctique"],
      answer: "Océan Pacifique",
      explanation: "L'océan Pacifique est le plus vaste des océans de la planète."
    },
    {
      id: 4,
      text: "Quel fleuve traverse l'Égypte ?",
      options: ["L'Amazone", "Le Nil", "Le Mississippi", "Le Danube"],
      answer: "Le Nil",
      explanation: "Le Nil est l'un des plus longs fleuves du monde et a permis le développement de l'Égypte antique."
    },
    {
      id: 5,
      text: "Dans quel pays se trouve la Tour de Pise ?",
      options: ["France", "Espagne", "Italie", "Grèce"],
      answer: "Italie",
      explanation: "La Tour de Pise se trouve en Toscane, en Italie."
    }
  ],
  // CM2 - Système Solaire
  'cm2-sci-1': [
    {
      id: 1,
      text: "Quelle est la planète la plus proche du Soleil ?",
      options: ["Vénus", "Mars", "Mercure", "Terre"],
      answer: "Mercure",
      explanation: "Mercure est la première planète du système solaire par ordre de distance au Soleil."
    },
    {
      id: 2,
      text: "Quelle planète est surnommée la 'Planète Rouge' ?",
      options: ["Jupiter", "Mars", "Saturne", "Vénus"],
      answer: "Mars",
      explanation: "Mars doit son surnom à sa couleur rougeâtre due à l'oxyde de fer (rouille) à sa surface."
    },
    {
      id: 3,
      text: "Quelle est la plus grande planète du système solaire ?",
      options: ["Saturne", "Neptune", "Jupiter", "Uranus"],
      answer: "Jupiter",
      explanation: "Jupiter est une géante gazeuse et la plus volumineuse des planètes."
    },
    {
      id: 4,
      text: "Combien de planètes composent notre système solaire ?",
      options: ["7", "8", "9", "10"],
      answer: "8",
      explanation: "Depuis 2006, Pluton n'est plus considérée comme une planète, il en reste donc 8."
    },
    {
      id: 5,
      text: "Quelle planète possède des anneaux très visibles ?",
      options: ["Mars", "Saturne", "Vénus", "Mercure"],
      answer: "Saturne",
      explanation: "Bien que d'autres planètes aient des anneaux, ceux de Saturne sont les plus spectaculaires."
    }
  ],
  // CP - Les Animaux
  'cp-sci-1': [
    {
      id: 1,
      text: "Où vit le poisson ?",
      options: ["Dans la forêt", "Dans l'eau", "Dans le désert"],
      answer: "Dans l'eau",
      explanation: "Les poissons respirent sous l'eau grâce à leurs branchies."
    },
    {
      id: 2,
      text: "Quel animal a une longue trompe ?",
      options: ["Le lion", "Le singe", "L'éléphant"],
      answer: "L'éléphant",
      explanation: "L'éléphant utilise sa trompe pour boire, manger et se doucher."
    },
    {
      id: 3,
      text: "Lequel de ces animaux peut voler ?",
      options: ["Le chat", "L'oiseau", "Le lapin"],
      answer: "L'oiseau",
      explanation: "La plupart des oiseaux utilisent leurs ailes pour voler dans le ciel."
    }
  ],
  // 6ème - Civilisations Quiz
  '6e-hist-1': [
    {
      id: 1,
      text: "Quelle civilisation a construit les pyramides de Gizeh ?",
      options: ["Les Romains", "Les Grecs", "Les Égyptiens", "Les Mayas"],
      answer: "Les Égyptiens",
      explanation: "Les pyramides étaient des tombeaux pour les pharaons d'Égypte."
    },
    {
      id: 2,
      text: "Dans quelle ville se trouve le Colisée ?",
      options: ["Athènes", "Rome", "Alexandrie", "Carthage"],
      answer: "Rome",
      explanation: "Le Colisée est un immense amphithéâtre situé au centre de Rome."
    },
    {
      id: 3,
      text: "Quel peuple a inventé la démocratie ?",
      options: ["Les Perses", "Les Athéniens", "Les Spartiates", "Les Gaulois"],
      answer: "Les Athéniens",
      explanation: "La démocratie est née à Athènes au Ve siècle av. J.-C."
    }
  ],
  // 11ème - Génétique Moléculaire
  '11e-sci-1': [
    {
      id: 1,
      text: "Quelle molécule porte l'information génétique ?",
      options: ["ARN", "ADN", "Protéine", "Glucide"],
      answer: "ADN",
      explanation: "L'Acide Désoxyribonucléique (ADN) est le support de l'hérédité."
    },
    {
      id: 2,
      text: "Combien de paires de chromosomes possède un être humain ?",
      options: ["20", "22", "23", "46"],
      answer: "23",
      explanation: "L'humain a 46 chromosomes au total, soit 23 paires."
    },
    {
      id: 3,
      text: "Quelle base azotée remplace la Thymine dans l'ARN ?",
      options: ["Adénine", "Guanine", "Cytosine", "Uracile"],
      answer: "Uracile",
      explanation: "Dans l'ARN, l'Uracile remplace la Thymine pour s'apparier à l'Adénine."
    }
  ],
  // 11ème - Mouvements Littéraires
  '11e-fr-1': [
    {
      id: 1,
      text: "Quel mouvement littéraire privilégie l'expression des sentiments et du moi ?",
      options: ["Le Réalisme", "Le Classicisme", "Le Romantisme", "Le Naturalisme"],
      answer: "Le Romantisme",
      explanation: "Le Romantisme (XIXe siècle) met l'accent sur la sensibilité et l'imagination."
    },
    {
      id: 2,
      text: "Qui est l'auteur des 'Misérables' ?",
      options: ["Zola", "Baudelaire", "Victor Hugo", "Flaubert"],
      answer: "Victor Hugo",
      explanation: "Victor Hugo est le chef de file du Romantisme français."
    }
  ],
  // 11ème - Histoire Contemporaine
  '11e-hist-1': [
    {
      id: 1,
      text: "En quelle année le mur de Berlin est-il tombé ?",
      options: ["1945", "1968", "1989", "1991"],
      answer: "1989",
      explanation: "La chute du mur en 1989 marque la fin de la Guerre Froide."
    },
    {
      id: 2,
      text: "Quel pays a été le premier à envoyer un homme dans l'espace ?",
      options: ["USA", "URSS", "Chine", "France"],
      answer: "URSS",
      explanation: "Youri Gagarine (URSS) fut le premier homme dans l'espace en 1961."
    }
  ],
  // Terminale - Physique Quantique
  't-sci-1': [
    {
      id: 1,
      text: "Quelle particule est le constituant fondamental de la lumière ?",
      options: ["L'électron", "Le proton", "Le photon", "Le neutron"],
      answer: "Le photon",
      explanation: "Le photon est le quantum d'énergie associé aux ondes électromagnétiques."
    },
    {
      id: 2,
      text: "Qui est l'auteur de l'équation E=mc² ?",
      options: ["Newton", "Einstein", "Planck", "Bohr"],
      answer: "Einstein",
      explanation: "Albert Einstein a formulé cette célèbre équation dans le cadre de la relativité restreinte."
    }
  ],
  // Terminale - Philosophie
  't-phi-1': [
    {
      id: 1,
      text: "Quel philosophe a dit : 'Je pense, donc je suis' ?",
      options: ["Kant", "Sartre", "Descartes", "Platon"],
      answer: "Descartes",
      explanation: "Le 'Cogito ergo sum' de René Descartes est le fondement de sa philosophie rationaliste."
    },
    {
      id: 2,
      text: "Quelle notion s'oppose au déterminisme en philosophie ?",
      options: ["La fatalité", "Le libre arbitre", "La nécessité", "Le hasard"],
      answer: "Le libre arbitre",
      explanation: "Le libre arbitre est la capacité de l'humain à choisir par lui-même, contrairement au déterminisme."
    }
  ]
};
