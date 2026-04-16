import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  TrendingUp, 
  BookOpen, 
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart3,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, Badge, Button, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';

type Trimestre = 'T1' | 'T2' | 'T3';

const EleveNotes: React.FC = () => {
  const [selectedTrimestre, setSelectedTrimestre] = useState<Trimestre>('T2');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for the student
  const gradesData = {
    T1: {
      moyenneGle: '14.5',
      rang: '5ème',
      absences: 2,
      matieres: [
        { nom: 'Mathématiques', note: '15.0', coef: 5, evolution: '+1.5', remark: 'Bon travail' },
        { nom: 'Physique-Chimie', note: '13.5', coef: 4, evolution: '-0.5', remark: 'Attention en TP' },
        { nom: 'Français', note: '12.0', coef: 3, evolution: '+0.0', remark: 'Correct' },
        { nom: 'Anglais', note: '16.5', coef: 2, evolution: '+2.0', remark: 'Excellent' },
        { nom: 'Histoire-Géo', note: '14.0', coef: 2, evolution: '+1.0', remark: 'Bien' },
      ],
      appreciation: 'Un bon premier trimestre. Fatoumata est sérieuse et appliquée.'
    },
    T2: {
      moyenneGle: '15.42',
      rang: '3ème',
      absences: 0,
      matieres: [
        { nom: 'Mathématiques', note: '17.5', coef: 5, evolution: '+2.5', remark: 'Très forte progression' },
        { nom: 'Physique-Chimie', note: '15.0', coef: 4, evolution: '+1.5', remark: 'Participation active' },
        { nom: 'Français', note: '13.5', coef: 3, evolution: '+1.5', remark: 'Niveau en hausse' },
        { nom: 'Anglais', note: '16.0', coef: 2, evolution: '-0.5', remark: 'Toujours très bien' },
        { nom: 'Histoire-Géo', note: '14.5', coef: 2, evolution: '+0.5', remark: 'Solide' },
        { nom: 'SVT', note: '16.0', coef: 3, evolution: '+2.0', remark: 'Très prometteur' },
      ],
      appreciation: 'Excellent trimestre. Les efforts ont payé dans toutes les matières. Félicitations !'
    },
    T3: {
      moyenneGle: '-',
      rang: '-',
      absences: 0,
      matieres: [],
      appreciation: 'Trimestre en cours.'
    }
  };

  const currentData = gradesData[selectedTrimestre];
  const filteredMatieres = currentData.matieres.filter(m => 
    m.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <GraduationCap size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mes Notes & Bulletins</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Consulte tes moyennes et tes rapports trimestriels</p>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1.5 gap-1 self-start lg:self-center">
           {(['T1', 'T2', 'T3'] as Trimestre[]).map((tri) => (
             <button
               key={tri}
               onClick={() => setSelectedTrimestre(tri)}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                 selectedTrimestre === tri 
                   ? "bg-white dark:bg-gray-800 text-bleu-600 dark:text-or-400 shadow-md" 
                   : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
               )}
             >
               Trimestre {tri.slice(1)}
             </button>
           ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={selectedTrimestre}
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 10 }}
           transition={{ duration: 0.3 }}
           className="space-y-8"
        >
          {currentData.matieres.length > 0 ? (
            <>
              {/* STATS OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-6 group hover:scale-[1.02] transition-transform">
                    <div className="p-4 bg-bleu-50 dark:bg-bleu-900/10 rounded-2xl text-bleu-600 group-hover:rotate-12 transition-transform">
                       <TrendingUp size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Moyenne</p>
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white">{currentData.moyenneGle}<span className="text-xs text-gray-400">/20</span></h3>
                    </div>
                 </Card>
                 <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-6 group hover:scale-[1.02] transition-transform">
                    <div className="p-4 bg-or-50 dark:bg-or-900/10 rounded-2xl text-or-600 group-hover:rotate-12 transition-transform">
                       <Award size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rang</p>
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white">{currentData.rang}</h3>
                    </div>
                 </Card>
                 <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-6 group hover:scale-[1.02] transition-transform">
                    <div className="p-4 bg-vert-50 dark:bg-vert-900/10 rounded-2xl text-vert-600 group-hover:rotate-12 transition-transform">
                       <BarChart3 size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progression</p>
                       <h3 className="text-2xl font-black text-vert-600">+0.92</h3>
                    </div>
                 </Card>
                 <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft/20 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-transparent flex items-center justify-center border-dashed border-2 border-indigo-100 dark:border-white/5 cursor-pointer hover:bg-indigo-50 transition-colors">
                    <div className="text-center">
                       <Download size={20} className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                       <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Télécharger PDF</span>
                    </div>
                 </Card>
              </div>

              {/* GRADES TABLE */}
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
                             {filteredMatieres.map((m, idx) => (
                               <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                  <td className="px-6 py-5">
                                     <p className="text-sm font-black text-gray-900 dark:text-white">{m.nom}</p>
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                     <p className="text-sm font-bold text-gray-500">x{m.coef}</p>
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                     <div className={cn(
                                       "inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-base shadow-sm group-hover:scale-110 transition-transform",
                                       parseFloat(m.note) >= 15 ? 'bg-vert-50 text-vert-600 dark:bg-vert-900/20 dark:text-vert-400' : 'bg-gray-50 text-gray-900 dark:bg-white/5 dark:text-white'
                                     )}>
                                        {m.note}
                                     </div>
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                     <div className={cn(
                                       "flex items-center justify-center gap-1 text-[11px] font-black",
                                       m.evolution.startsWith('+') ? 'text-vert-600' : m.evolution.startsWith('-') ? 'text-rouge-600' : 'text-gray-400'
                                     )}>
                                        {m.evolution.startsWith('+') && <ArrowUpRight size={14} />}
                                        {m.evolution.startsWith('-') && <ArrowDownRight size={14} />}
                                        {m.evolution}
                                     </div>
                                  </td>
                                  <td className="px-6 py-5">
                                     <p className="text-[12px] font-semibold text-gray-500 italic line-clamp-1">{m.remark}</p>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </Card>
              </div>

              {/* APPRECIATION GENERALE */}
              <Card className="p-8 border-none shadow-soft bg-gradient-to-r from-bleu-600 to-indigo-700 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                    <Award size={120} />
                 </div>
                 <div className="relative z-10 max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-4 flex items-center gap-2">
                       <CheckCircle2 size={14} /> Appréciation générale du conseil
                    </p>
                    <p className="text-xl font-bold italic leading-relaxed">
                       "{currentData.appreciation}"
                    </p>
                 </div>
              </Card>
            </>
          ) : (
            <div className="py-24 text-center">
               <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={40} className="text-gray-300 dark:text-gray-600" />
               </div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Trimestre en cours</h3>
               <p className="text-[13px] text-gray-500 font-semibold max-w-sm mx-auto">
                  Les notes de ce trimestre n'ont pas encore été publiées. Reviens plus tard pour consulter tes résultats.
               </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default EleveNotes;
