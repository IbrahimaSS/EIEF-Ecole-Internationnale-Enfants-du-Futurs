import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCcw, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

const LogicPuzzle: React.FC = () => {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState({ sequence: [] as string[], options: [] as string[], answer: '' });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [encouragement, setEncouragement] = useState('Observe bien la suite !');

  const generatePuzzle = () => {
    const sequences = [
      { seq: ['🍎', '🍌', '🍎', '?'], opt: ['🍌', '🍎', '🍇'], ans: '🍌' },
      { seq: ['1', '2', '1', '2', '?'], opt: ['1', '2', '3'], ans: '1' },
      { seq: ['🔵', '🔴', '🔵', '🔴', '?'], opt: ['🔴', '🔵', '🟢'], ans: '🔵' },
      { seq: ['A', 'B', 'A', 'B', '?'], opt: ['A', 'B', 'C'], ans: 'A' },
      { seq: ['☀️', '🌙', '☀️', '🌙', '?'], opt: ['🌙', '☀️', '⭐'], ans: '☀️' }
    ];
    const p = sequences[Math.floor(Math.random() * sequences.length)];
    setPuzzle({ sequence: p.seq, options: p.opt, answer: p.ans });
    setFeedback(null);
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  const handleAnswer = (choice: string) => {
    if (feedback) return;

    const isCorrect = choice === puzzle.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTotalQuestions(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setEncouragement('Bien vu !');
    } else {
      const messages = ["Regarde mieux !", "Courage, retente !", "Efforce-toi !"];
      setEncouragement(messages[Math.floor(Math.random() * messages.length)]);
    }

    setTimeout(() => {
      if (totalQuestions + 1 >= 5) {
        setIsFinished(true);
        // Unlock next game
        localStorage.setItem('eief_game_color_unlocked', 'true');
      } else {
        generatePuzzle();
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
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-500/20">
            <Trophy size={18} className="text-orange-500" />
            <span className="font-black text-orange-600 dark:text-orange-400">{score} / {totalQuestions}</span>
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
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalQuestions / 5) * 100}%` }}
                  />
                </div>

                <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Brain size={40} />
                </div>

                <div className="text-orange-600 dark:text-orange-400 font-bold text-sm mb-8 italic">
                   "{encouragement}"
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
                  Quelle est la suite ?
                </h2>

                <div className="flex justify-center items-center gap-4 mb-12">
                   {puzzle.sequence.map((item, idx) => (
                      <div key={idx} className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border ${item === '?' ? 'bg-orange-50 border-orange-200 text-orange-400 animate-pulse' : 'bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-700'}`}>
                         {item === '?' ? <HelpCircle size={24} /> : item}
                      </div>
                   ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                   {puzzle.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(opt)}
                        disabled={!!feedback}
                        className={`h-20 rounded-2xl text-3xl flex items-center justify-center transition-all border-2 ${
                           feedback === 'correct' && opt === puzzle.answer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' :
                           feedback === 'wrong' && opt !== puzzle.answer ? 'border-red-500 bg-red-50 dark:bg-red-500/10' :
                           'border-gray-100 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5'
                        }`}
                      >
                         {opt}
                      </button>
                   ))}
                </div>
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
                    ? "Tu as parfaitement résolu tous les puzzles logiques !" 
                    : `Tu as obtenu ${score} sur 5. Efforce-toi de bien observer les suites !`}
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
                      generatePuzzle();
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

export default LogicPuzzle;
