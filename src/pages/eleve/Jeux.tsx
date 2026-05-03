import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, ArrowLeft, Trophy, Star, Gamepad2, Settings, CheckCircle2, Info, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

interface CardData {
  id: number;
  content: string;
  type: 'emoji' | 'word';
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARDS_CONTENT = [
  { pairId: 1, emoji: '🍎', word: 'Pomme' },
  { pairId: 2, emoji: '🐱', word: 'Chat' },
  { pairId: 3, emoji: '🚗', word: 'Voiture' },
  { pairId: 4, emoji: '☀️', word: 'Soleil' },
  { pairId: 5, emoji: '🏠', word: 'Maison' },
  { pairId: 6, emoji: '🚀', word: 'Fusée' },
];

const Jeux: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [encouragement, setEncouragement] = useState('À toi de jouer ! Trouve toutes les paires.');

  // Initialize game
  const initializeGame = () => {
    const newCards: CardData[] = [];
    let idCounter = 0;
    
    CARDS_CONTENT.forEach(item => {
      newCards.push({ id: idCounter++, content: item.emoji, type: 'emoji', pairId: item.pairId, isFlipped: false, isMatched: false });
      newCards.push({ id: idCounter++, content: item.word, type: 'word', pairId: item.pairId, isFlipped: false, isMatched: false });
    });

    // Shuffle
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setIsWon(false);
    setEncouragement('À toi de jouer ! Trouve toutes les paires.');
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (id: number) => {
    // Prevent clicking if 2 cards are already flipped, or if card is already flipped/matched
    if (flippedCards.length === 2) return;
    
    const cardIndex = cards.findIndex(c => c.id === id);
    if (cards[cardIndex].isFlipped || cards[cardIndex].isMatched) return;

    // Flip the card
    const newCards = [...cards];
    newCards[cardIndex].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // Check for match if 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      const card1 = newCards.find(c => c.id === newFlippedCards[0]);
      const card2 = newCards.find(c => c.id === newFlippedCards[1]);

      if (card1 && card2 && card1.pairId === card2.pairId && card1.type !== card2.type) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true } : c
          ));
          setFlippedCards([]);
          setScore(s => s + 10);
          
          // Check win condition
          if (newCards.filter(c => !c.isMatched).length === 2) {
             setIsWon(true);
             // Save progress for the catalog
             localStorage.setItem('eief_game_memory_completed', 'true');
             localStorage.setItem('eief_game_math_unlocked', 'true');
          }
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === card1?.id || c.id === card2?.id ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          
          // Add encouragement message
          const encouragements = [
            "Courage, essaye encore !",
            "Faut retenter, tu vas y arriver !",
            "Efforce-toi, la prochaine sera la bonne !",
            "Ne baisse pas les bras !",
            "Presque ! Continue comme ça."
          ];
          setEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 select-none">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm">
         <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 transition-colors">
               <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
               <Gamepad2 className="text-bleu-500" size={24} />
               <h1 className="text-xl font-black text-gray-900 dark:text-white">Espace Jeux</h1>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 transition-colors">
               <Settings size={24} />
            </button>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
         {/* Instructions */}
         <div className="bg-bleu-50 dark:bg-bleu-900/20 border border-bleu-200 dark:border-bleu-800/50 rounded-2xl p-4 mb-6 flex gap-4 items-start">
            <div className="text-bleu-600 dark:text-bleu-400 mt-1 shrink-0">
               <Info size={24} />
            </div>
            <div>
               <h3 className="font-black text-gray-900 dark:text-white text-lg mb-1">Comment jouer ?</h3>
               <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Retourne les cartes pour trouver les paires correspondantes. Tu dois associer une image avec son nom (ex: 🍎 + Pomme). Essaie de terminer le jeu en faisant le moins de coups possible !
               </p>
            </div>
         </div>

         {/* Stats Bar */}
         <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex gap-6">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">Score</span>
                  <div className="flex items-center gap-1 text-or-500 font-black text-xl">
                     <Star size={20} fill="currentColor" /> {score}
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">Coups</span>
                  <span className="text-gray-900 dark:text-white font-black text-xl">{moves}</span>
               </div>
               <div className="hidden md:flex flex-col border-l border-gray-100 dark:border-white/10 pl-6">
                  <span className="text-[10px] font-black uppercase text-gray-400">Message</span>
                  <span className="text-bleu-600 dark:text-bleu-400 font-bold text-sm italic">"{encouragement}"</span>
               </div>
            </div>
            <Button onClick={initializeGame} variant="outline" className="flex gap-2 text-xs font-bold rounded-xl h-10">
               <RefreshCcw size={16} /> Recommencer
            </Button>
         </div>

         {/* Game Board */}
         <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 perspective-1000">
            {cards.map(card => (
               <motion.div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="relative h-28 md:h-36 w-full cursor-pointer transform-style-3d"
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
               >
                  {/* Front of card (Hidden side) */}
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-bleu-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-800">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white font-black text-xl">?</span>
                     </div>
                  </div>

                  {/* Back of card (Revealed side) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-gray-100 dark:border-gray-700">
                     {card.isMatched && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1"
                        >
                           <CheckCircle2 size={16} />
                        </motion.div>
                     )}
                     <span className={`font-black ${card.type === 'emoji' ? 'text-5xl md:text-6xl' : 'text-xl md:text-2xl text-gray-800 dark:text-gray-100'} ${card.isMatched ? 'opacity-50' : ''}`}>
                        {card.content}
                     </span>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Win Screen */}
         <AnimatePresence>
            {isWon && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
               >
                  <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full border border-gray-100 dark:border-white/10">
                     <div className="w-24 h-24 bg-or-100 dark:bg-or-500/20 text-or-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy size={48} />
                     </div>
                     <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Gagné !</h2>
                     <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">
                        Tu as trouvé toutes les paires en <span className="font-black text-or-500">{moves} coups</span> !
                     </p>
                     
                     <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 mb-8 text-sm font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                        🌟 Félicitations ! Tu as débloqué l'Aventure Mathématique !
                     </div>

                     <div className="flex flex-col gap-3">
                        {isAuthenticated ? (
                           <Button onClick={() => navigate('/eleve/jeux')} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/30">
                              <Gamepad2 size={18} /> Retour au Catalogue
                           </Button>
                        ) : (
                           <Button onClick={() => navigate('/login')} className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex justify-center items-center gap-2 shadow-lg shadow-purple-500/30">
                              <LogIn size={18} /> Voir le Catalogue (Connexion)
                           </Button>
                        )}
                        <Button onClick={initializeGame} variant="outline" className="w-full h-12 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border-none bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2">
                           <RefreshCcw size={16} /> Rejouer au Memory
                        </Button>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default Jeux;


