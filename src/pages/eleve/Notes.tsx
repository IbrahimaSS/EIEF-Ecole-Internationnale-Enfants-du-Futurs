import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  TrendingUp,
  BookOpen,
  Award,
  Download,
  BarChart3,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Minus,
} from 'lucide-react';
import { Card } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import {
  studentService,
  StudentNotesResponse,
} from '../../services/studentService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatNote = (v: number) => v.toFixed(1);

const evolutionDisplay = (evo: number) => {
  if (evo > 0) return { label: `+${evo.toFixed(1)}`, color: 'text-vert-600', icon: <ArrowUpRight size={14} /> };
  if (evo < 0) return { label: evo.toFixed(1),         color: 'text-rouge-600', icon: <ArrowDownRight size={14} /> };
  return          { label: '=',                         color: 'text-gray-400',  icon: <Minus size={14} /> };
};

// ── Composant ────────────────────────────────────────────────────────────────

type Semestre = 1 | 2 | 3 | 4 | 5;
const SEMESTRES: Semestre[] = [1, 2, 3, 4, 5];

const EleveNotes: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedSem, setSelectedSem] = useState<Semestre>(1);
  const [searchTerm, setSearchTerm]   = useState('');
  const [data, setData]               = useState<StudentNotesResponse | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    studentService
      .getNotes(user.id, selectedSem)
      .then(setData)
      .catch(() => setError('Impossible de charger les notes.'))
      .finally(() => setLoading(false));
  }, [user?.id, selectedSem]);

  const filteredSubjects = (data?.subjects ?? []).filter((s) =>
    s.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Squelette ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-6 animate-pulse pb-10">
      <div className="h-12 w-64 rounded-2xl bg-gray-100 dark:bg-white/5" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-gray-100 dark:bg-white/5" />
        ))}
      </div>
      <div className="h-64 rounded-3xl bg-gray-100 dark:bg-white/5" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <GraduationCap size={28} />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Mes Notes & Bulletins
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Consulte tes moyennes et tes rapports semestriels
            </p>
          </div>
        </div>

        {/* Sélecteur semestre */}
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1.5 gap-1 self-start lg:self-center">
          {SEMESTRES.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSem(sem)}
              className={cn(
                'px-6 py-2.5 rounded-xl text-xs font-black transition-all',
                selectedSem === sem
                  ? 'bg-white dark:bg-gray-800 text-bleu-600 dark:text-or-400 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              Semestre {sem}
            </button>
          ))}
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="py-8 text-center text-rouge-600 font-bold text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSem}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {!error && data && data.subjects.length > 0 ? (
            <>
              {/* STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-6 group hover:scale-[1.02] transition-transform">
                  <div className="p-4 bg-bleu-50 dark:bg-bleu-900/10 rounded-2xl text-bleu-600 group-hover:rotate-12 transition-transform">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Moyenne</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatNote(data.overallAverage)}
                      <span className="text-xs text-gray-400">/20</span>
                    </h3>
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-6 group hover:scale-[1.02] transition-transform">
                  <div className="p-4 bg-or-50 dark:bg-or-900/10 rounded-2xl text-or-600 group-hover:rotate-12 transition-transform">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rang</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {data.rank}
                      <span className="text-xs text-gray-400 ml-1">/ {data.classSize}</span>
                    </h3>
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-6 group hover:scale-[1.02] transition-transform">
                  <div className="p-4 bg-vert-50 dark:bg-vert-900/10 rounded-2xl text-vert-600 group-hover:rotate-12 transition-transform">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progression</p>
                    <h3 className={cn(
                      'text-2xl font-black',
                      data.progression >= 0 ? 'text-vert-600' : 'text-rouge-600'
                    )}>
                      {data.progression >= 0 ? '+' : ''}{data.progression.toFixed(2)}
                    </h3>
                  </div>
                </Card>

                <Card
                  className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-6 group hover:scale-[1.02] transition-transform cursor-pointer"
                  onClick={() => window.print()}
                >
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl text-indigo-600 group-hover:rotate-12 transition-transform">
                    <Download size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Absences</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {data.absences}
                      <span className="text-xs text-gray-400 ml-1">séances</span>
                    </h3>
                  </div>
                </Card>
              </div>

              {/* TABLEAU DES MATIÈRES */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={20} className="text-bleu-600" /> Détail des matières
                  </h2>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Chercher une matière..."
                      className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-xl text-xs font-semibold shadow-soft w-full sm:w-64 outline-none focus:ring-2 focus:ring-bleu-500/20 transition-all"
                    />
                  </div>
                </div>

                <Card className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Matière</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Coefficient</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Note</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Évolution</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Appréciation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {filteredSubjects.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400 font-semibold">
                              Aucune matière trouvée.
                            </td>
                          </tr>
                        ) : (
                          filteredSubjects.map((s) => {
                            const evo = evolutionDisplay(s.evolution);
                            return (
                              <tr key={s.subjectId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-5">
                                  <p className="text-sm font-black text-gray-900 dark:text-white">{s.subjectName}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <p className="text-sm font-bold text-gray-500">x{s.coefficient}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <div className={cn(
                                    'inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-base shadow-sm group-hover:scale-110 transition-transform',
                                    s.value >= 15
                                      ? 'bg-vert-50 text-vert-600 dark:bg-vert-900/20 dark:text-vert-400'
                                      : s.value >= 10
                                      ? 'bg-gray-50 text-gray-900 dark:bg-white/5 dark:text-white'
                                      : 'bg-rouge-50 text-rouge-600 dark:bg-rouge-900/20 dark:text-rouge-400'
                                  )}>
                                    {formatNote(s.value)}
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <div className={cn('flex items-center justify-center gap-1 text-[11px] font-black', evo.color)}>
                                    {evo.icon}
                                    {evo.label}
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <p className="text-[12px] font-semibold text-gray-500 italic line-clamp-1">
                                    {s.comment || '—'}
                                  </p>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* APPRÉCIATION GÉNÉRALE */}
              {data.appreciation && (
                <Card className="p-8 border-none shadow-soft bg-gradient-to-r from-bleu-600 to-indigo-700 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                    <Award size={120} />
                  </div>
                  <div className="relative z-10 max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-4 flex items-center gap-2">
                      <CheckCircle2 size={14} /> Appréciation générale du conseil
                    </p>
                    <p className="text-xl font-bold italic leading-relaxed">
                      "{data.appreciation}"
                    </p>
                  </div>
                </Card>
              )}
            </>
          ) : (
            !error && (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={40} className="text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  Semestre {selectedSem} — notes non publiées
                </h3>
                <p className="text-[13px] text-gray-500 font-semibold max-w-sm mx-auto">
                  Les notes de ce semestre n'ont pas encore été saisies. Reviens plus tard.
                </p>
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default EleveNotes;
