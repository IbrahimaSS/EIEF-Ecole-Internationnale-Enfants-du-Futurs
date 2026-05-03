import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Gamepad2, Brain, Languages, Calculator, Search, Filter, Lock, Unlock } from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';

interface Game {
  id: string;
  title: string;
  category: string;
  subject: string;
  icon: React.FC<any>;
  color: string;
  bgColor: string;
  description: string;
  path: string;
  isNew?: boolean;
  isLocked?: boolean;
}

const INITIAL_GAMES_CATALOG: Game[] = [
  {
    id: 'memory-mots',
    title: 'Memory des Mots',
    category: 'Logique & Mémoire',
    subject: 'Langues',
    icon: Languages,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Associe les images avec les bons mots pour développer ton vocabulaire.',
    path: '/jeux',
    isNew: true,
    isLocked: false
  },
  {
    id: 'math-adventure',
    title: 'Aventure Mathématique',
    category: 'Calcul Mental',
    subject: 'Mathématiques',
    icon: Calculator,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Résous des additions et soustractions pour faire avancer ton personnage.',
    path: '#',
    isLocked: true
  },
  {
    id: 'logic-puzzle',
    title: 'Puzzle Logique',
    category: 'Réflexion',
    subject: 'Logique',
    icon: Brain,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Résous des énigmes visuelles pour stimuler ta créativité.',
    path: '#',
    isLocked: true
  },
  {
    id: 'color-master',
    title: 'Le Peintre Étoilé',
    category: 'Créativité',
    subject: 'Arts Plastiques',
    icon: Gamepad2,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    description: 'Colorie des toiles avec tes couleurs préférées.',
    path: '#',
    isLocked: true
  }
];

const CatalogueJeux: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [games, setGames] = React.useState(INITIAL_GAMES_CATALOG);

  React.useEffect(() => {
    const isMathUnlocked = localStorage.getItem('eief_game_math_unlocked') === 'true';
    const isLogicUnlocked = localStorage.getItem('eief_game_logic_unlocked') === 'true';
    const isColorUnlocked = localStorage.getItem('eief_game_color_unlocked') === 'true';
    
    setGames(prev => prev.map(g => {
      if (g.id === 'math-adventure' && isMathUnlocked) {
        return { ...g, isLocked: false, path: '/eleve/jeux/math' };
      }
      if (g.id === 'logic-puzzle' && isLogicUnlocked) {
        return { ...g, isLocked: false, path: '/eleve/jeux/logic' };
      }
      if (g.id === 'color-master' && isColorUnlocked) {
        return { ...g, isLocked: false, path: '/eleve/jeux/color' };
      }
      return g;
    }));
  }, []);

  const categories = ['Tous', 'Mathématiques', 'Langues', 'Logique', 'Arts Plastiques'];

  const filteredGames = activeCategory === 'Tous' 
    ? games 
    : games.filter(g => g.subject === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header / Intro */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Gamepad2 size={24} />
             </div>
             <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Catalogue de Jeux</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed mb-6">
            Bienvenue dans ton espace ludo-éducatif ! Apprends en t'amusant avec notre sélection de jeux spécialement conçus pour toi. Choisis une matière et lance-toi dans l'aventure.
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Chercher un jeu..." 
                  className="pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:border-purple-500 w-64 transition-colors"
                />
             </div>
             <Button variant="outline" className="gap-2 text-gray-600 dark:text-gray-300">
                <Filter size={16} /> Filtres
             </Button>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full group hover:shadow-xl hover:border-purple-500/30 transition-all bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col relative">
              {game.isNew && (
                 <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-emerald-500 text-white border-none shadow-sm">NOUVEAU</Badge>
                 </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${game.bgColor} ${game.color}`}>
                    <game.icon size={28} />
                 </div>
                 
                 <div className="mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{game.subject} • {game.category}</span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{game.title}</h3>
                 </div>
                 
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 flex-1">
                    {game.description}
                 </p>
                 
                 <Button 
                   onClick={() => navigate(game.path)} 
                   className={`w-full font-black text-xs uppercase tracking-widest gap-2 transition-all ${
                     !game.isLocked 
                       ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20' 
                       : 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-600 cursor-not-allowed'
                   }`}
                   disabled={game.isLocked}
                 >
                   {game.isLocked ? (
                      <><Lock size={16} /> Verrouillé</>
                   ) : (
                      <><Play size={16} /> Jouer Maintenant</>
                   )}
                 </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CatalogueJeux;
