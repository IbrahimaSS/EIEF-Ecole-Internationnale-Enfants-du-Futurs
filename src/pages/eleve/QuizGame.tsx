import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCcw, Star, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Badge } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { gameService } from '../../services/gameService';
import { QUIZ_DATA, type Question } from './quizData';

const QuizGame: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const gameId = searchParams.get('gameId') || 'default';
  const level = parseInt(searchParams.get('level') || '1');
  const difficulty = searchParams.get('difficulty') || 'moyen';
  const classLevel = searchParams.get('classLevel') || 'Tous';

  const { isAuthenticated } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // 1. On regarde s'il y a des questions custom (Admin)
    const savedCustom = localStorage.getItem("eief_custom_questions");
    if (savedCustom) {
      const customData = JSON.parse(savedCustom);
      if (customData[gameId] && customData[gameId][level]) {
        setQuestions(customData[gameId][level]);
        return;
      }
    }

    // 2. Sinon on prend les données par défaut
    if (QUIZ_DATA[gameId] && QUIZ_DATA[gameId][level]) {
      setQuestions([...QUIZ_DATA[gameId][level]].sort(() => 0.5 - Math.random()));
    } else {
      // Fallback si le level n'existe pas : on prend le level 1 ou rien
      const fallbackLevel = QUIZ_DATA[gameId] ? Object.keys(QUIZ_DATA[gameId])[0] : null;
      if (fallbackLevel && QUIZ_DATA[gameId][parseInt(fallbackLevel)]) {
        setQuestions([...QUIZ_DATA[gameId][parseInt(fallbackLevel)]].sort(() => 0.5 - Math.random()));
      }
    }
  }, [gameId, level]);

  const handleOptionClick = async (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === questions[currentIdx].answer;
    setIsCorrect(correct);
    let newScore = score;
    if (correct) {
      newScore = score + 1;
      setScore(newScore);
    }
    
    // Si c'est la dernière question, on sauvegarde tout de suite
    if (currentIdx + 1 === questions.length) {
      const isLevelValidated = (newScore / questions.length) >= 0.8; // 80% pour valider

      if (isAuthenticated && gameId) {
        try {
          await gameService.saveScore({
            gameId,
            score: newScore,
            difficulty,
            classLevel,
            metadata: JSON.stringify({ 
              level, 
              validated: isLevelValidated,
              totalQuestions: questions.length, 
              successRate: (newScore / questions.length) * 100 
            })
          });
          
          if (isLevelValidated) {
            // Sauvegarder la progression localement aussi pour déblocage immédiat
            const progressionKey = `eief_progression_${gameId}`;
            const currentProg = parseInt(localStorage.getItem(progressionKey) || '0');
            if (level > currentProg) {
              localStorage.setItem(progressionKey, level.toString());
            }
          }

          console.log("Score enregistré automatiquement !");
        } catch (error) {
          console.error("Erreur sauvegarde score automatique:", error);
        }
      }
    }
    
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
              {difficulty.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-100 dark:border-purple-500/20">
            <Trophy size={18} className="text-purple-500" />
            <span className="font-black text-purple-600 dark:text-purple-400">{score} / {questions.length}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <Card className="p-8 md:p-12 border-none shadow-2xl bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden relative">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-700">
                  <motion.div 
                    className="h-full bg-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
                    <HelpCircle size={28} />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Question {currentIdx + 1} sur {questions.length}</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-10 leading-tight">
                  {currentQuestion.text}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isCorrectOption = opt === currentQuestion.answer;
                    
                    let variantClass = "border-gray-100 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/5";
                    if (selectedOption !== null) {
                      if (isCorrectOption) variantClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                      else if (isSelected) variantClass = "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400";
                      else variantClass = "opacity-50 border-gray-100 dark:border-gray-700";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={selectedOption !== null}
                        className={`group relative p-5 rounded-2xl text-left font-bold transition-all border-2 flex items-center justify-between ${variantClass}`}
                      >
                        <span className="relative z-10">{opt}</span>
                        {selectedOption !== null && isCorrectOption && <CheckCircle2 className="text-emerald-500" size={20} />}
                        {selectedOption !== null && isSelected && !isCorrectOption && <XCircle className="text-red-500" size={20} />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700"
                    >
                      <div className={`p-4 rounded-2xl mb-6 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700' : 'bg-red-50 dark:bg-red-500/5 text-red-700'}`}>
                         <p className="text-sm font-bold flex items-center gap-2">
                           {isCorrect ? <Star size={16} fill="currentColor" /> : <XCircle size={16} />}
                           {isCorrect ? 'Excellent !' : 'Oups, la bonne réponse était : ' + currentQuestion.answer}
                         </p>
                         {currentQuestion.explanation && (
                           <p className="text-xs mt-2 opacity-80 font-medium leading-relaxed">
                             {currentQuestion.explanation}
                           </p>
                         )}
                      </div>
                      
                      <Button 
                        onClick={nextQuestion}
                        className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                      >
                        {currentIdx + 1 === questions.length ? 'Terminer le Quiz' : 'Question Suivante'} <ChevronRight size={20} />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="p-12 border-none shadow-2xl bg-white dark:bg-gray-800 rounded-[3rem]">
                <div className="w-24 h-24 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Trophy size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                   {score === questions.length ? 'Parfait !' : score >= questions.length / 2 ? 'Pas mal !' : 'Continue d\'apprendre !'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                   Tu as obtenu un score de <span className="text-purple-600 font-black">{score} sur {questions.length}</span>.
                </p>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => {
                      // On attend 500ms pour être sûr que la requête asynchrone est partie
                      setTimeout(() => navigate('/eleve/jeux'), 500);
                    }}
                    className="w-full h-14 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black uppercase tracking-widest"
                  >
                    Retour au Catalogue
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setScore(0);
                      setCurrentIdx(0);
                      setSelectedOption(null);
                      setIsCorrect(null);
                      setShowExplanation(false);
                      setIsFinished(false);
                    }}
                    className="w-full h-12 gap-2 text-gray-500 hover:text-gray-900 border-none"
                  >
                    <RefreshCcw size={16} /> Recommencer le Quiz
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

export default QuizGame;
