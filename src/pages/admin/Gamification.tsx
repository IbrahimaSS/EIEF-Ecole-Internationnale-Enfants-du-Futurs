import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Plus, Search, Filter, Edit3, Trash2, 
  Gamepad, BookOpen, Calculator, Brain, Languages, Globe, Leaf,
  ChevronRight, Save, X, Sparkles, Trophy, ListOrdered, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { GAMES_DATABASE, GameDef, CLASS_LEVELS, SUBJECTS } from './gamesData';
import { Question } from './quizData';

// Clés LocalStorage
const LOCAL_GAMES_KEY = "eief_custom_games";
const LOCAL_QUESTIONS_KEY = "eief_custom_questions";

const AdminGamification: React.FC = () => {
  // --- États ---
  const [games, setGames] = useState<GameDef[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Record<string, Question[]>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameDef | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'questions'>('info');

  // Form State pour le Jeu
  const [formData, setFormData] = useState<Partial<GameDef>>({
    title: '',
    subject: 'Mathématiques',
    classLevel: 'Terminale',
    difficulty: 'moyen',
    description: '',
    icon: 'Gamepad2',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/20',
    path: '/eleve/jeux/quiz'
  });

  // Form State pour les Questions
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);

  // --- Chargement initial ---
  useEffect(() => {
    const savedGames = localStorage.getItem(LOCAL_GAMES_KEY);
    const savedQuestions = localStorage.getItem(LOCAL_QUESTIONS_KEY);
    
    const baseGames = [...GAMES_DATABASE];
    const customGamesList = savedGames ? JSON.parse(savedGames) : [];
    
    setGames([...customGamesList, ...baseGames]);
    if (savedQuestions) setCustomQuestions(JSON.parse(savedQuestions));
  }, []);

  // --- Filtrage ---
  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === 'Tous' || g.classLevel === selectedClass;
      return matchSearch && matchClass;
    });
  }, [games, searchTerm, selectedClass]);

  // --- Actions ---
  const handleOpenModal = (game?: GameDef) => {
    if (game) {
      setEditingGame(game);
      setFormData(game);
      setQuestions(customQuestions[game.id] || []);
    } else {
      setEditingGame(null);
      setFormData({
        title: '',
        subject: 'Mathématiques',
        classLevel: 'Terminale',
        difficulty: 'moyen',
        description: '',
        icon: 'Gamepad2',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600/20',
        path: '/eleve/jeux/quiz'
      });
      setQuestions([{ id: 1, text: '', options: ['', '', '', ''], answer: '', explanation: '' }]);
    }
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      id: questions.length + 1, 
      text: '', 
      options: ['', '', '', ''], 
      answer: '', 
      explanation: '' 
    }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...(newQuestions[qIndex].options || [])];
    newOptions[oIndex] = value;
    newQuestions[qIndex].options = newOptions;
    setQuestions(newQuestions);
  };

  const handleSave = () => {
    let targetId = editingGame?.id;
    let newGamesList = [...games];

    if (!editingGame) {
      targetId = `game-${Date.now()}`;
      const newGame = { ...formData, id: targetId } as GameDef;
      newGamesList = [newGame, ...games];
      
      // Sauvegarder uniquement les jeux custom dans localStorage
      const currentCustom = JSON.parse(localStorage.getItem(LOCAL_GAMES_KEY) || '[]');
      localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify([newGame, ...currentCustom]));
    } else {
      newGamesList = games.map(g => g.id === editingGame.id ? { ...g, ...formData } as GameDef : g);
      // Mettre à jour localStorage si c'est un jeu custom
      const currentCustom = JSON.parse(localStorage.getItem(LOCAL_GAMES_KEY) || '[]');
      const updatedCustom = currentCustom.map((g: any) => g.id === editingGame.id ? { ...g, ...formData } : g);
      localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(updatedCustom));
    }

    // Sauvegarder les questions
    const newCustomQuestions = { ...customQuestions, [targetId!]: questions as Question[] };
    setCustomQuestions(newCustomQuestions);
    localStorage.setItem(LOCAL_QUESTIONS_KEY, JSON.stringify(newCustomQuestions));

    setGames(newGamesList);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce jeu ?")) {
      setGames(games.filter(g => g.id !== id));
      const currentCustom = JSON.parse(localStorage.getItem(LOCAL_GAMES_KEY) || '[]');
      localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(currentCustom.filter((g: any) => g.id !== id)));
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* ═══ STATS RAPIDES ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Jeux', value: games.length, icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Matières', value: SUBJECTS.length - 1, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Classes Couvertes', value: new Set(games.map(g => g.classLevel)).size, icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Parties Jouées', value: '1.2k', icon: Trophy, color: 'text-or-500', bg: 'bg-or-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-soft flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* ═══ BARRE D'ACTIONS ═══ */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1 w-full max-w-2xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher un jeu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900/50 font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner"
            />
          </div>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900/50 font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="Tous">Toutes les classes</option>
            {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/30"
        >
          <Plus size={20} /> Ajouter un Jeu
        </Button>
      </div>

      {/* ═══ GRILLE DES JEUX ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGames.map((game) => (
            <motion.div
              key={game.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="group relative p-6 border-none shadow-soft hover:shadow-xl transition-all overflow-hidden bg-white dark:bg-gray-900/50">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${game.bgColor} ${game.color}`}>
                    <Gamepad2 size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(game)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(game.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-100 text-gray-600 border-none text-[9px] font-black uppercase">
                      {game.classLevel}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-black uppercase">
                      {game.subject}
                    </Badge>
                  </div>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{game.title}</h4>
                  <p className="text-xs text-gray-400 font-medium line-clamp-2">{game.description}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-1">
                    <ListOrdered size={12} /> {customQuestions[game.id]?.length || 0} questions
                  </span>
                  <div className="flex items-center gap-1 text-blue-500">
                    Détails <ChevronRight size={12} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══ MODAL AJOUT / ÉDITION ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header Modal */}
            <div className="p-8 md:p-10 border-b border-gray-50 dark:border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Sparkles size={24} />
                  </div>
                  {editingGame ? 'Modifier le Jeu' : 'Nouveau Jeu Éducatif'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <Gamepad2 size={16} className="inline mr-2" /> Infos Générales
                </button>
                <button 
                  onClick={() => setActiveTab('questions')}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'questions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <ListOrdered size={16} className="inline mr-2" /> Questions ({questions.length})
                </button>
              </div>
            </div>

            {/* Content Modal */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 no-scrollbar">
              {activeTab === 'info' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Titre du Jeu</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                      placeholder="Ex: Quiz sur les fonctions"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Matière</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                    >
                      {SUBJECTS.filter(s => s !== 'Tous').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Classe</label>
                    <select 
                      value={formData.classLevel}
                      onChange={(e) => setFormData({ ...formData, classLevel: e.target.value as any })}
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                    >
                      {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Difficulté</label>
                    <select 
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                    >
                      <option value="facile">Facile</option>
                      <option value="moyen">Moyen</option>
                      <option value="difficile">Difficile</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-blue-500/50 font-bold resize-none"
                      placeholder="Décrivez brièvement le contenu..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10 relative">
                      <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg">
                        {qIdx + 1}
                      </div>
                      <button 
                        onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                        className="absolute -top-2 -right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="space-y-6">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Question</label>
                          <input 
                            type="text" 
                            value={q.text}
                            onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                            className="w-full px-5 py-3 rounded-xl bg-white dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-sm"
                            placeholder="Saisissez la question ici..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[0, 1, 2, 3].map((oIdx) => (
                            <div key={oIdx} className="relative group">
                              <input 
                                type="text" 
                                value={q.options?.[oIdx] || ''}
                                onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 outline-none transition-all font-bold text-xs ${q.answer === q.options?.[oIdx] && q.answer !== '' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent focus:border-blue-500/50'}`}
                                placeholder={`Option ${oIdx + 1}`}
                              />
                              <button 
                                onClick={() => updateQuestion(qIdx, 'answer', q.options?.[oIdx])}
                                className={`absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${q.answer === q.options?.[oIdx] && q.answer !== '' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'}`}
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Explication Pédagogique (Optionnel)</label>
                          <textarea 
                            value={q.explanation}
                            onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                            rows={2}
                            className="w-full px-5 py-3 rounded-xl bg-white dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-xs resize-none"
                            placeholder="Pourquoi c'est la bonne réponse ?"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button 
                    onClick={handleAddQuestion}
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-400 font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all"
                  >
                    <Plus size={20} className="mr-2" /> Ajouter une Question
                  </Button>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-8 md:p-10 border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
              <div className="flex gap-4">
                <Button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-14 rounded-2xl bg-white dark:bg-gray-800 text-gray-500 font-black uppercase tracking-widest shadow-sm"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-500/30"
                >
                  <Save size={20} className="mr-2" /> {editingGame ? 'Enregistrer les modifications' : 'Publier le Jeu'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminGamification;
