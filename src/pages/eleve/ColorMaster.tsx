import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCcw, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

const ColorMaster: React.FC = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState({ name: '', hex: '' });
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [encouragement, setEncouragement] = useState('Trouve la bonne couleur !');

  const colorData = [
    { name: 'Rouge', hex: '#ef4444' },
    { name: 'Bleu', hex: '#3b82f6' },
    { name: 'Vert', hex: '#22c55e' },
    { name: 'Jaune', hex: '#eab308' },
    { name: 'Violet', hex: '#a855f7' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Rose', hex: '#ec4899' },
    { name: 'Gris', hex: '#64748b' }
  ];

  const generateChallenge = () => {
    const t = colorData[Math.floor(Math.random() * colorData.length)];
    setTarget(t);
    
    // Mix options
    const others = colorData.filter(c => c.hex !== t.hex);
    const selectedOthers = others.sort(() => 0.5 - Math.random()).slice(0, 2);
    const mixed = [...selectedOthers, t].sort(() => 0.5 - Math.random());
    setOptions(mixed.map(m => m.hex));
    
    setFeedback(null);
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const handleAnswer = (choice: string) => {
    if (feedback) return;

    const isCorrect = choice === target.hex;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTotalQuestions(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setEncouragement('Quel talent !');
    } else {
      const messages = ["Oups, regarde bien !", "Courage, retente !", "Efforce-toi !"];
      setEncouragement(messages[Math.floor(Math.random() * messages.length)]);
    }

    setTimeout(() => {
      if (totalQuestions + 1 >= 5) {
        setIsFinished(true);
      } else {
        generateChallenge();
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
          <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-500/10 px-4 py-2 rounded-xl border border-pink-100 dark:border-pink-500/20">
            <Trophy size={18} className="text-pink-500" />
            <span className="font-black text-pink-600 dark:text-pink-400">{score} / {totalQuestions}</span>
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
                    className="h-full bg-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalQuestions / 5) * 100}%` }}
                  />
                </div>

                <div className="w-20 h-20 bg-pink-500/10 text-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Palette size={40} />
                </div>

                <div className="text-pink-600 dark:text-pink-400 font-bold text-sm mb-8 italic">
                   "{encouragement}"
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                  Quelle est la couleur :
                </h2>
                <h3 className="text-4xl font-black mb-12" style={{ color: target.hex }}>
                   {target.name}
                </h3>

                <div className="grid grid-cols-3 gap-6">
                   {options.map((opt, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAnswer(opt)}
                        disabled={!!feedback}
                        style={{ backgroundColor: opt }}
                        className={`h-24 rounded-3xl shadow-lg transition-all border-4 ${
                           feedback === 'correct' && opt === target.hex ? 'border-emerald-500 scale-110' :
                           feedback === 'wrong' && opt !== target.hex ? 'border-red-500 opacity-50' :
                           'border-white dark:border-gray-700'
                        }`}
                      >
                         {feedback === 'correct' && opt === target.hex && <Star className="text-white mx-auto" size={32} fill="white" />}
                      </motion.button>
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
                    ? "Tu es un véritable artiste des couleurs !" 
                    : `Tu as obtenu ${score} sur 5. Efforce-toi de bien mémoriser les couleurs !`}
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
                      generateChallenge();
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

export default ColorMaster;
