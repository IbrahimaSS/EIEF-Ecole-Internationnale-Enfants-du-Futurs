import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

const MathAdventure: React.FC = () => {
  const navigate = useNavigate();
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [encouragement, setEncouragement] = useState('Prêt pour l\'aventure ?');

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const answer = op === '+' ? a + b : a - b;
    setProblem({ a, b, op, answer });
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    generateProblem();
  }, []);

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

    setTimeout(() => {
      if (totalQuestions + 1 >= 5) {
        setIsFinished(true);
        // Unlock next game
        localStorage.setItem('eief_game_logic_unlocked', 'true');
      } else {
        generateProblem();
      }
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/eleve/jeux')}
            className="gap-2 text-gray-500 hover:text-gray-900 border-none bg-transparent hover:bg-gray-100"
          >
            <ArrowLeft size={18} /> Retour
          </Button>
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
