import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play, Gamepad2, Brain, Languages, Calculator, Search, Lock, Sparkles, Star,
  Palette, Globe, Leaf, Clock, Map as MapIcon, GraduationCap, Filter, ChevronDown, X
} from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import {
  GAMES_DATABASE, CLASS_LEVELS, SUBJECTS, difficultyLabel,
  type GameDef, type ClassLevel, type Difficulty
} from './gamesData';
import { useAuthStore } from '../../store/authStore';
import { apiRequest } from '../../services/api';
import {
  gameService, type GameScore
} from '../../services/gameService';

// ── Icon resolver ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<any>> = {
  Languages, Calculator, Brain, Palette, Globe, Leaf, Clock, Map: MapIcon, Gamepad2
};
const resolveIcon = (name: string) => ICON_MAP[name] || Gamepad2;

// ── Difficulty badge colors ──────────────────────────────────────────────────
const diffColors: Record<Difficulty, string> = {
  facile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  moyen: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  difficile: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
};

// ── Composant ────────────────────────────────────────────────────────────────

const CatalogueJeux: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [studentClass, setStudentClass] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [games, setGames] = useState<GameDef[]>(GAMES_DATABASE);
  
  // Détection multi-sources ultra-robuste (rôle technique ou rôle backend)
  const roleRaw = (user?.role || '').toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const backendRoleRaw = (user?.backendRole || '').toLowerCase();
  
  const isEleve = roleRaw.includes('eleve') || backendRoleRaw.includes('student');

  // Charger les données initiales et écouter les changements (Temps Réel)
  useEffect(() => {
    const loadAllGames = () => {
      let allGames = [...GAMES_DATABASE];
      const savedCustom = localStorage.getItem("eief_custom_games");
      if (savedCustom) {
        const customGames = JSON.parse(savedCustom);
        allGames = [...customGames, ...allGames];
      }
      setGames(allGames);
    };

    loadAllGames();

    // Écouteur pour les changements dans d'autres onglets (Admin -> Élève)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "eief_custom_games") loadAllGames();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Charger le profil étudiant
  useEffect(() => {
    if (isEleve && token) {
      setIsLoadingProfile(true);
      apiRequest<any>('/users/students/me')
        .then((s: any) => {
          setStudentClass(s.className || s.classe || null);
        })
        .catch((err: any) => console.error("Erreur chargement profil étudiant", err))
        .finally(() => setIsLoadingProfile(false));
    }
  }, [isEleve, token]);

  /**
   * Mappe un libelle de classe backend (ex: "Petite Section", "CP", "7eme A",
   * "Maternelle 1") vers un ClassLevel du catalogue. Renvoie 'Tous' si aucune
   * correspondance n'est trouvee.
   * Compatible systeme guineen (college 7e->10e, lycee 11e->Terminale) ET
   * systeme francais (mapping de secours 6e->7e, 5e->8e...).
   */
  const matchClassLevel = (raw: string | null | undefined): ClassLevel | 'Tous' => {
    if (!raw) return 'Tous';
    const u = raw.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    if (u.includes('maternelle') || u.includes('creche') || u.includes('garderie')
        || u.includes('petite section') || u.includes('moyenne section') || u.includes('grande section')
        || /^ps\b|^ms\b|^gs\b/.test(u)) return 'Maternelle';

    const primaire: ClassLevel[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
    for (const p of primaire) {
      if (new RegExp(`\\b${p.toLowerCase()}\\b`).test(u)) return p;
    }

    // College guineen 7e a 10e (fallback systeme francais 6e/5e/4e/3e)
    if (/\b7\s*(eme|e)?\b/.test(u) || /\b6\s*(eme|e)?\b/.test(u) || u.includes('sixieme')) return '7ème';
    if (/\b8\s*(eme|e)?\b/.test(u) || /\b5\s*(eme|e)?\b/.test(u) || u.includes('cinquieme')) return '8ème';
    if (/\b9\s*(eme|e)?\b/.test(u) || /\b4\s*(eme|e)?\b/.test(u) || u.includes('quatrieme')) return '9ème';
    if (/\b10\s*(eme|e)?\b/.test(u) || /\b3\s*(eme|e)?\b/.test(u) || u.includes('troisieme')) return '10ème';

    // Lycee guineen
    if (/\b11\s*(eme|e)?\b/.test(u) || u.includes('seconde') || u.includes('2nde')) return '11ème';
    if (/\b12\s*(eme|e)?\b/.test(u) || u.includes('premiere') || u.includes('1ere')) return '12ème';
    if (u.includes('terminale') || /\bterm\b/.test(u) || u.includes('bac')) return 'Terminale';

    return 'Tous';
  };

  const initialClass = useMemo(() => {
    if (!isEleve) return 'Tous';
    return matchClassLevel(studentClass || user?.classe);
  }, [user, studentClass, isEleve]);

  const [selectedClass, setSelectedClass] = useState<ClassLevel | 'Tous'>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [backendScores, setBackendScores] = useState<GameScore[]>([]);

  // Charger les scores depuis le backend
  useEffect(() => {
    const loadScores = async () => {
      try {
        const scores = await gameService.getMyScores();
        setBackendScores(scores);
      } catch (error) {
        console.error("Erreur lors du chargement des scores:", error);
      }
    };
    loadScores();
  }, []);
  const completedGames = useMemo(() => {
    const completed = new Set<string>();
    
    // 1. Depuis le localStorage (legacy)
    try {
      const raw = localStorage.getItem('eief_completed_games');
      if (raw) (JSON.parse(raw) as string[]).forEach(id => completed.add(id));
    } catch (_e) { /* ignore */ }
    
    if (localStorage.getItem('eief_game_memory_completed') === 'true') completed.add('mat-fr-1');

    // 2. Depuis le backend (source de vérité)
    backendScores.forEach(score => completed.add(score.gameId));

    return Array.from(completed);
  }, [backendScores]);

  const filteredGames = useMemo(() => {
    // 1. Logique de filtrage
    let gamesToFilter = [...games];
    
    const roleRaw = (user?.role || '').toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const backendRoleRaw = (user?.backendRole || '').toLowerCase();
    const isEleveUser = roleRaw.includes('eleve') || backendRoleRaw.includes('student');

    if (isEleveUser) {
      // L'eleve ne voit que les jeux correspondant a SA classe (catalogue guineen).
      const level = matchClassLevel(studentClass || user?.classe);
      if (level === 'Tous') {
        gamesToFilter = [];
      } else {
        gamesToFilter = gamesToFilter.filter(g => g.classLevel === level);
      }
    } else {
      // Admin et autres : on applique les filtres sélectionnés manuellement
      if (selectedClass !== 'Tous') {
        gamesToFilter = gamesToFilter.filter(g => g.classLevel === selectedClass);
      }
    }

    // Filtres communs (Matière, Difficulté, Recherche)
    if (selectedSubject !== 'Tous') {
      gamesToFilter = gamesToFilter.filter(g => g.subject === selectedSubject);
    }
    
    if (selectedDifficulty !== 'Tous') {
      gamesToFilter = gamesToFilter.filter(g => g.difficulty === selectedDifficulty);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      gamesToFilter = gamesToFilter.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    }

    return gamesToFilter;
  }, [games, selectedClass, selectedSubject, selectedDifficulty, searchTerm, user, initialClass, studentClass]);

  // Group by class level
  const groupedGames = useMemo((): Array<[string, GameDef[]]> => {
    const map = new Map<string, GameDef[]>();
    filteredGames.forEach((g: GameDef) => {
      const key = g.classLevel;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    });
    return Array.from(map.entries());
  }, [filteredGames]);

  const activeFiltersCount = [
    selectedClass !== 'Tous' ? 1 : 0,
    selectedSubject !== 'Tous' ? 1 : 0,
    selectedDifficulty !== 'Tous' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setSelectedClass(initialClass);
    setSelectedSubject('Tous');
    setSelectedDifficulty('Tous');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen mesh-gradient-bg -m-6 p-6 overflow-hidden relative">
      {/* Decorative BG */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* ═══ HEADER ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-premium p-8 md:p-12 overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 p-8 opacity-10">
            <Sparkles size={180} className="text-purple-500" />
          </div>

          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Gamepad2 size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-1">
                  ESPACE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">GALACTIQUE</span>
                </h1>
                <Badge variant="default" className="border border-purple-200 text-purple-600 dark:border-purple-500/30 dark:text-purple-400 bg-transparent font-black tracking-[0.2em] text-[10px]">
                  {GAMES_DATABASE.length} JEUX DISPONIBLES
                </Badge>
              </div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 font-medium text-base leading-relaxed mb-6 max-w-xl">
              Explore les jeux éducatifs adaptés à ton niveau. Filtre par classe, matière et difficulté !
            </p>

            {/* Search + Filter toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group flex-1 min-w-[200px] max-w-sm">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Chercher un jeu..."
                  className="pl-11 pr-4 py-3.5 rounded-2xl bg-white/50 dark:bg-gray-950/50 backdrop-blur-md border border-gray-200 dark:border-gray-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full transition-all shadow-inner"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-[50px] px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:scale-105'
                }`}
              >
                <Filter size={16} className="mr-2" />
                Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                <ChevronDown size={14} className={`ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="p-2.5 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-500 hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══ FILTRES PANEL ═══ */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card-premium p-6 space-y-5">
                {/* Classe - Only for Admin */}
                {user?.role === 'admin' && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                      <GraduationCap size={14} /> Classe
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Tous' as const, ...CLASS_LEVELS].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setSelectedClass(lvl)}
                          className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                            selectedClass === lvl
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                              : 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-md text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800/60 border border-white/50 dark:border-gray-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matière */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                    <Languages size={14} /> Matière
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubject(sub)}
                        className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                          selectedSubject === sub
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-md text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800/60 border border-white/50 dark:border-gray-700'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulté */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                    <Star size={14} /> Difficulté
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(['Tous', 'facile', 'moyen', 'difficile'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                          selectedDifficulty === d
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                            : 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-md text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800/60 border border-white/50 dark:border-gray-700'
                        }`}
                      >
                        {d === 'Tous' ? 'Tous' : `${d === 'facile' ? '⭐' : d === 'moyen' ? '⭐⭐' : '⭐⭐⭐'} ${difficultyLabel(d as Difficulty)}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ STATS BAR ═══ */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            <span className="text-gray-900 dark:text-white font-black">{filteredGames.length}</span> jeu{filteredGames.length > 1 ? 'x' : ''} trouvé{filteredGames.length > 1 ? 's' : ''}
            {selectedClass !== 'Tous' && <span className="ml-2 text-purple-500">· {selectedClass}</span>}
            {selectedSubject !== 'Tous' && <span className="ml-2 text-blue-500">· {selectedSubject}</span>}
          </p>
        </div>

        {/* ═══ GAMES GROUPED BY CLASS ═══ */}
        {filteredGames.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Aucun jeu trouvé</h3>
            <p className="text-sm text-gray-500 font-semibold">Essaye de modifier tes filtres.</p>
            <Button onClick={clearFilters} className="mt-6 bg-purple-600 text-white rounded-xl px-6">Réinitialiser</Button>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedGames.map(([classLevel, games]: [string, GameDef[]]) => (
              <motion.div
                key={classLevel}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-5 px-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-md">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{classLevel}</h2>
                    <p className="text-[11px] text-gray-400 font-bold">{games.length} jeu{games.length > 1 ? 'x' : ''}</p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-200 dark:from-purple-800 to-transparent ml-4" />
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {games.map((game: GameDef, i: number) => {
                      const IconComp = resolveIcon(game.icon);
                      const isCompleted = completedGames.includes(game.id);
                      return (
                        <motion.div
                          key={game.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4, delay: i * 0.05, type: "spring" }}
                          whileHover={{ y: -6 }}
                        >
                          <Card className={`h-full group glass-card-premium border-white/40 dark:border-white/5 overflow-hidden flex flex-col relative transition-all duration-500 hover:shadow-xl`}>
                            {/* Glow */}
                            <div className={`absolute top-0 right-0 w-28 h-28 ${game.bgColor} rounded-full blur-[50px] opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none`} />

                            <div className="p-6 flex-1 flex flex-col relative z-10">
                              <div className="flex justify-between items-start mb-5">
                                <div className={`w-13 h-13 p-3 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${game.bgColor} ${game.color} shadow-inner`}>
                                  <IconComp size={26} />
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  {game.isNew && (
                                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none shadow-md px-2.5 py-0.5 font-black text-[8px]">NOUVEAU</Badge>
                                  )}
                                  {isCompleted && (
                                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none shadow-md px-2.5 py-0.5 font-black text-[8px]">TERMINÉ ✓</Badge>
                                  )}
                                </div>
                              </div>

                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${game.color}`}>{game.subject}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] border px-2 py-0.5 rounded-md ${diffColors[game.difficulty]}`}>
                                    {game.difficulty === 'facile' ? '⭐' : game.difficulty === 'moyen' ? '⭐⭐' : '⭐⭐⭐'} {difficultyLabel(game.difficulty)}
                                  </span>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-tight">{game.title}</h3>
                              </div>

                              <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 flex-1">
                                {game.description}
                              </p>

                              <Button
                                onClick={() => navigate(`${game.path}?gameId=${game.id}&difficulty=${game.difficulty}&classLevel=${game.classLevel}`)}
                                className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-[0.15em] gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02] active:scale-95 shadow-lg transition-all duration-300"
                              >
                                <Play size={16} fill="currentColor" /> Jouer
                              </Button>
                            </div>

                            {!isCompleted && (
                              <div className="absolute -bottom-3 -right-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Star size={80} />
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueJeux;
