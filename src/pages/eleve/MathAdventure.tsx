import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCcw, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Badge } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { gameService } from '../../services/gameService';

const MathAdventure: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const gameId = searchParams.get('gameId');
  const level = parseInt(searchParams.get('level') || '1');
  const difficulty = searchParams.get('difficulty') || 'facile';
  const classLevel = searchParams.get('classLevel') || 'Maternelle';

  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [encouragement, setEncouragement] = useState('Prêt pour l\'aventure ?');
  const { isAuthenticated } = useAuthStore();

  const generateProblem = () => {
    let a = 0, b = 0, op = '+';
    let range = 10 * level; // Augmente avec le level
    let allowedOps = ['+'];

    // Dynamic difficulty logic based on classLevel and level
    if (classLevel === 'Maternelle' || classLevel === 'CP') {
      range = (difficulty === 'facile' ? 10 : 20) + (level * 5);
      allowedOps = level > 2 ? ['+', '-'] : ['+'];
    } else if (classLevel.startsWith('CE')) {
      range = (difficulty === 'facile' ? 50 : 100) + (level * 20);
      allowedOps = level > 3 ? ['+', '-', '*'] : ['+', '-'];
    } else if (classLevel.startsWith('CM')) {
      range = (difficulty === 'facile' ? 100 : 500) + (level * 50);
      allowedOps = level > 2 ? ['+', '-', '*', '/'] : ['+', '-', '*'];
    } else {
      // Collège
      range = (difficulty === 'facile' ? 500 : 1000) + (level * 100);
      allowedOps = ['+', '-', '*', '/'];
    }

    op = allowedOps[Math.floor(Math.random() * allowedOps.length)];
    
    if (op === '/') {
      // Ensure integer division
      b = Math.floor(Math.random() * (10 + level)) + 1;
      const res = Math.floor(Math.random() * (10 + level)) + 1;
      a = b * res;
    } else if (op === '*') {
      a = Math.floor(Math.random() * (classLevel.startsWith('CM') ? 20 : 10) + level) + 1;
      b = Math.floor(Math.random() * (10 + level)) + 1;
    } else {
      a = Math.floor(Math.random() * range) + 1;
      b = Math.floor(Math.random() * range) + 1;
    }

    // Ensure subtraction doesn't result in negative for lower levels
    if (op === '-' && a < b && (classLevel === 'Maternelle' || classLevel === 'CP')) {
      [a, b] = [b, a];
    }

    const answer = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;
    setProblem({ a, b, op, answer });
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    generateProblem();
  }, [level]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === problem.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTotalQuestions(prev => prev + 1);
    if (isCorrect) {
      setScore(prev => prev + 1);
      setEncouragement('Excellent !');
    } else {
      const messages = ["Courage !", "Faut retenter !", "Efforce-toi !"];
      setEncouragement(messages[Math.floor(Math.random() * messages.length)]);
    }

    setTimeout(async () => {
      if (totalQuestions + 1 >= 5) {
        const finalScore = isCorrect ? score + 1 : score;
        const isLevelValidated = finalScore >= 4; // 4/5 pour valider
        setIsFinished(true);
        
        // 2. Sauvegarde Backend & Local progression
        if (isAuthenticated && gameId) {
          try {
            await gameService.saveScore({
              gameId,
              score: finalScore,
              difficulty,
              classLevel,
              metadata: JSON.stringify({ 
                level,
                validated: isLevelValidated,
                totalQuestions: 5, 
                successRate: (finalScore / 5) * 100 
              })
            });

            if (isLevelValidated) {
              const progressionKey = `eief_progression_${gameId}`;
              const currentProg = parseInt(localStorage.getItem(progressionKey) || '0');
              if (level > currentProg) {
                localStorage.setItem(progressionKey, level.toString());
              }
            }
          } catch (error) {
            console.error("Erreur sauvegarde score:", error);
          }
        }
      } else {
        generateProblem();
      }
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/eleve/jeux')}
            className="gap-2 text-gray-500 hover:text-gray-900 border-none bg-transparent hover:bg-gray-100"
          >
            <ArrowLeft size={18} /> Retour
          </Button>
          <div className="flex gap-2">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-none font-black text-[10px] px-3">
              {classLevel}
            </Badge>
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-none font-black text-[10px] px-3">
              {difficulty === 'facile' ? '⭐' : difficulty === 'moyen' ? '⭐⭐' : '⭐⭐⭐'} {difficulty.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-500/20">
            <Trophy size={18} className="text-blue-500" />
            <span className="font-black text-blue-600 dark:text-blue-400">{score} / {totalQuestions}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 text-center border-2 border-gray-100 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-100 dark:bg-gray-700">
                  <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalQuestions / 5) * 100}%` }}
                  />
                </div>

                <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Calculator size={40} />
                </div>

                <div className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-8 italic">
                   "{encouragement}"
                </div>

                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-12 tracking-tight">
                  {problem.a} {problem.op === '+' ? '+' : '-'} {problem.b} = ?
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <input 
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Ta réponse..."
                      autoFocus
                      className={`w-full h-16 text-center text-2xl font-black rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 transition-all ${
                        feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' :
                        feedback === 'wrong' ? 'border-red-500 bg-red-50 dark:bg-red-500/10' :
                        'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {feedback === 'correct' && <CheckCircle2 className="text-emerald-500" size={24} />}
                      {feedback === 'wrong' && <XCircle className="text-red-500" size={24} />}
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-blue-500/30"
                  >
                    Valider
                  </Button>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="p-12 border-2 border-emerald-500/30 shadow-2xl bg-white dark:bg-gray-800 rounded-[3rem]">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Trophy size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                   {score === 5 ? 'Bravo !' : 'Courage !'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                  {score === 5 
                    ? "Tu as parfaitement réussi l'aventure avec un score de 5 sur 5 !" 
                    : `Tu as obtenu ${score} sur 5. Efforce-toi encore un peu, tu vas y arriver !`}
                </p>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate('/eleve/jeux')}
                    className="w-full h-14 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black uppercase tracking-widest"
                  >
                    Retour au Catalogue
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setScore(0);
                      setTotalQuestions(0);
                      setIsFinished(false);
                      generateProblem();
                    }}
                    className="w-full h-12 gap-2 text-gray-500 hover:text-gray-900 border-none"
                  >
                    <RefreshCcw size={16} /> Recommencer
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MathAdventure;
