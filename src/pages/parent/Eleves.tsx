import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  TrendingUp, 
  Activity, 
  BookOpen, 
  Clock, 
  Award,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  Download,
  BarChart3
} from 'lucide-react';
import { Card, Avatar, Badge, Button } from '../../components/ui';
import { cn } from '../../utils/cn';

type Semestre = 'S1' | 'S2';

interface Matiere {
  nom: string;
  note: string;
  coef: number;
  appreciation: string;
}

interface SemestreData {
  moyenneGle: string;
  rang: string;
  absences: number;
  retards: number;
  matieres: Matiere[];
  appreciationConseil: string;
}

interface Enfant {
  id: number;
  name: string;
  classe: string;
  niveau: string;
  semestres: Record<Semestre, SemestreData>;
  emploiDuTemps: { jour: string; heure: string; matiere: string; salle: string }[];
}

const ParentEleves: React.FC = () => {
  const [expandedChild, setExpandedChild] = useState<number | null>(1);
  const [selectedSemestre, setSelectedSemestre] = useState<Record<number, Semestre>>({ 1: 'S1', 2: 'S1' });

  const enfants: Enfant[] = [
    {
      id: 1,
      name: 'Aïssatou Bah',
      classe: 'Terminale S1',
      niveau: 'Lycée',
      semestres: {
        S1: {
          moyenneGle: '14.2',
          rang: '5ème / 32',
          absences: 2,
          retards: 0,
          appreciationConseil: 'Bon début d\'année. Aïssatou montre un réel potentiel qu\'elle doit concrétiser au prochain semestre.',
          matieres: [
            { nom: 'Mathématiques', note: '15.0', coef: 5, appreciation: 'Bon travail' },
            { nom: 'Physique-Chimie', note: '14.0', coef: 4, appreciation: 'Sérieuse et investie' },
            { nom: 'SVT', note: '13.0', coef: 3, appreciation: 'Peut mieux faire' },
            { nom: 'Français', note: '12.5', coef: 3, appreciation: 'Expression à améliorer' },
            { nom: 'Anglais', note: '15.5', coef: 2, appreciation: 'Good work' },
            { nom: 'Histoire-Géo', note: '14.0', coef: 2, appreciation: 'Assez bien' },
          ],
        },
        S2: {
          moyenneGle: '15.5',
          rang: '3ème / 32',
          absences: 0,
          retards: 1,
          appreciationConseil: 'Excellent semestre. Aïssatou progresse remarquablement. Félicitations du conseil de classe.',
          matieres: [
            { nom: 'Mathématiques', note: '17.5', coef: 5, appreciation: 'Excellent travail' },
            { nom: 'Physique-Chimie', note: '15.0', coef: 4, appreciation: 'Très bien, à continuer' },
            { nom: 'SVT', note: '14.0', coef: 3, appreciation: 'Bon niveau' },
            { nom: 'Français', note: '13.5', coef: 3, appreciation: 'Des progrès notables' },
            { nom: 'Anglais', note: '16.0', coef: 2, appreciation: 'Very good' },
            { nom: 'Histoire-Géo', note: '14.5', coef: 2, appreciation: 'Solide' },
          ],
        },
      },
      emploiDuTemps: [
        { jour: 'Lundi', heure: '08:00 - 10:00', matiere: 'Mathématiques', salle: 'Salle 402' },
        { jour: 'Lundi', heure: '10:15 - 12:15', matiere: 'Physique-Chimie', salle: 'Labo B' },
        { jour: 'Mardi', heure: '08:00 - 10:00', matiere: 'SVT', salle: 'Salle 301' },
        { jour: 'Mardi', heure: '10:15 - 12:15', matiere: 'Français', salle: 'Salle 205' },
      ]
    },
    {
      id: 2,
      name: 'Mamadou Bah',
      classe: '4ème B',
      niveau: 'Collège',
      semestres: {
        S1: {
          moyenneGle: '11.0',
          rang: '18ème / 35',
          absences: 4,
          retards: 5,
          appreciationConseil: 'Semestre insuffisant. Un manque de travail personnel notable. Mamadou doit se ressaisir.',
          matieres: [
            { nom: 'Mathématiques', note: '09.5', coef: 4, appreciation: 'Insuffisant, reprendre les bases' },
            { nom: 'Français', note: '12.0', coef: 4, appreciation: 'Correct, mais peut progresser' },
            { nom: 'Anglais', note: '08.5', coef: 2, appreciation: 'Difficultés notables' },
            { nom: 'Histoire-Géo', note: '13.0', coef: 2, appreciation: 'Intérêt visible' },
            { nom: 'SVT', note: '11.5', coef: 3, appreciation: 'Moyen' },
          ],
        },
        S2: {
          moyenneGle: '12.0',
          rang: '12ème / 35',
          absences: 2,
          retards: 3,
          appreciationConseil: 'Amélioration sensible. Mamadou a fourni des efforts. Le conseil encourage à poursuivre.',
          matieres: [
            { nom: 'Mathématiques', note: '11.0', coef: 4, appreciation: 'Peut mieux faire' },
            { nom: 'Français', note: '13.5', coef: 4, appreciation: 'Bon travail' },
            { nom: 'Anglais', note: '10.0', coef: 2, appreciation: 'Des lacunes à combler' },
            { nom: 'Histoire-Géo', note: '14.0', coef: 2, appreciation: 'Participation active' },
            { nom: 'SVT', note: '12.5', coef: 3, appreciation: 'Convenable' },
          ],
        },
      },
      emploiDuTemps: [
        { jour: 'Lundi', heure: '08:00 - 10:00', matiere: 'Français', salle: 'Salle 102' },
        { jour: 'Lundi', heure: '10:15 - 12:15', matiere: 'Mathématiques', salle: 'Salle 104' },
        { jour: 'Mardi', heure: '08:00 - 10:00', matiere: 'Anglais', salle: 'Salle 103' },
      ]
    }
  ];

  const toggleChild = (id: number) => {
    setExpandedChild(expandedChild === id ? null : id);
  };

  const setSemestreForChild = (childId: number, sem: Semestre) => {
    setSelectedSemestre(prev => ({ ...prev, [childId]: sem }));
  };

  const semestres: { key: Semestre; label: string }[] = [
    { key: 'S1', label: 'Semestre 1' },
    { key: 'S2', label: 'Semestre 2' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 max-w-6xl mx-auto"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <GraduationCap size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mes enfants</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Suivez les résultats scolaires par semestre</p>
          </div>
        </div>
      </div>

      {/* ENFANTS ACCORDÉON */}
      <div className="space-y-6">
        {enfants.map((enfant) => {
          const isExpanded = expandedChild === enfant.id;
          const currentSem = selectedSemestre[enfant.id] || 'S1';
          const semData = enfant.semestres[currentSem];
          const moyenneNum = semData.moyenneGle !== '-' ? parseFloat(semData.moyenneGle) : 0;
          const isSemEnCours = semData.matieres.length === 0;

          return (
            <Card key={enfant.id} className="p-0 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50 overflow-hidden">
              {/* ENFANT HEADER (TOUJOURS VISIBLE) */}
              <button 
                onClick={() => toggleChild(enfant.id)}
                className="w-full p-6 flex flex-col sm:flex-row items-center gap-6 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <Avatar name={enfant.name} size="lg" className="ring-4 ring-gray-100 dark:ring-gray-800 shadow-md flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{enfant.name}</h2>
                    <Badge className="bg-bleu-50 text-bleu-600 dark:bg-bleu-900/20 dark:text-bleu-400 border-none font-bold text-[10px] w-fit">
                      {enfant.classe}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400 border-none font-bold text-[10px] w-fit">
                      {enfant.niveau}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className={!isSemEnCours ? (moyenneNum >= 14 ? 'text-vert-500' : moyenneNum >= 10 ? 'text-or-500' : 'text-rouge-500') : 'text-gray-400'} />
                      <span className="text-[12px] font-semibold text-gray-500">Moyenne:</span>
                      <span className={`font-black text-lg ${!isSemEnCours ? (moyenneNum >= 14 ? 'text-vert-600 dark:text-vert-400' : moyenneNum >= 10 ? 'text-or-600' : 'text-rouge-600') : 'text-gray-400'}`}>
                        {semData.moyenneGle}{!isSemEnCours && <span className="text-[10px] text-gray-400">/20</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-or-500" />
                      <span className="text-[12px] font-semibold text-gray-500">Rang:</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{semData.rang}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity size={16} className={semData.absences > 2 ? 'text-rouge-500' : 'text-vert-500'} />
                      <span className="text-[12px] font-semibold text-gray-500">Absences:</span>
                      <span className={`font-bold text-sm ${semData.absences > 2 ? 'text-rouge-600' : 'text-gray-900 dark:text-white'}`}>
                        {semData.absences}h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-gray-400 flex-shrink-0">
                  {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </button>

              {/* CONTENU DÉPLIÉ */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 dark:border-white/5">

                      {/* SÉLECTEUR DE SEMESTRE */}
                      <div className="px-6 pt-5 pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={18} className="text-bleu-500" />
                          <h3 className="font-bold text-gray-900 dark:text-white">Résultats scolaires</h3>
                        </div>
                        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
                          {semestres.map(sem => (
                            <button 
                              key={sem.key}
                              onClick={(e) => { e.stopPropagation(); setSemestreForChild(enfant.id, sem.key); }}
                              className={cn(
                                "px-4 py-2 rounded-lg text-[11px] font-bold transition-all",
                                currentSem === sem.key 
                                  ? "bg-white dark:bg-gray-800 text-bleu-600 dark:text-or-400 shadow-sm" 
                                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              )}
                            >
                              {sem.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={currentSem}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isSemEnCours ? (
                            /* SEMESTRE EN COURS (PAS DE NOTES) */
                            <div className="p-8 text-center">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock size={32} className="text-gray-300 dark:text-gray-600" />
                              </div>
                              <p className="font-bold text-gray-500 text-sm">Semestre en cours</p>
                              <p className="text-[11px] text-gray-400 font-semibold mt-2 max-w-md mx-auto">{semData.appreciationConseil}</p>
                            </div>
                          ) : (
                            /* BULLETIN + EMPLOI DU TEMPS */
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                              
                              {/* BULLETIN */}
                              <div className="col-span-2 p-6 border-r border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-bleu-500" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Bulletin - {semestres.find(s => s.key === currentSem)?.label}</h3>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    className="text-[10px] font-bold text-bleu-600 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 flex items-center gap-1 h-8 px-3"
                                  >
                                    <Download size={12} /> Télécharger PDF
                                  </Button>
                                </div>

                                {/* STATS RAPIDES */}
                                <div className="grid grid-cols-3 gap-3 mb-5">
                                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Moyenne</p>
                                    <p className={`text-xl font-black mt-1 ${moyenneNum >= 14 ? 'text-vert-600' : moyenneNum >= 10 ? 'text-or-600' : 'text-rouge-600'}`}>
                                      {semData.moyenneGle}<span className="text-[10px] text-gray-400">/20</span>
                                    </p>
                                  </div>
                                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Rang</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{semData.rang}</p>
                                  </div>
                                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Absences</p>
                                    <p className={`text-xl font-black mt-1 ${semData.absences > 2 ? 'text-rouge-600' : 'text-vert-600'}`}>{semData.absences}h</p>
                                  </div>
                                </div>

                                {/* TABLEAU DES NOTES */}
                                <div className="overflow-x-auto border border-gray-100 dark:border-white/5 rounded-xl">
                                  <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-white/5">
                                      <tr>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Matière</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Note</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Coef.</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Appréciation</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                      {semData.matieres.map((m, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                          <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{m.nom}</td>
                                          <td className="px-4 py-3 text-center">
                                            <span className={`font-black ${parseFloat(m.note) >= 14 ? 'text-vert-600 dark:text-vert-400' : parseFloat(m.note) >= 10 ? 'text-gray-900 dark:text-white' : 'text-rouge-600'}`}>
                                              {m.note}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-center font-semibold text-gray-500">{m.coef}</td>
                                          <td className="px-4 py-3 text-[12px] font-semibold text-gray-500 italic">{m.appreciation}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* APPRÉCIATION CONSEIL DE CLASSE */}
                                <div className={cn(
                                  "mt-4 p-4 rounded-xl border",
                                  moyenneNum >= 14 
                                    ? "bg-vert-50 dark:bg-vert-900/10 border-vert-100 dark:border-vert-900/20 text-vert-700 dark:text-vert-400" 
                                    : moyenneNum >= 10 
                                      ? "bg-or-50 dark:bg-or-900/10 border-or-100 dark:border-or-900/20 text-or-700 dark:text-or-400" 
                                      : "bg-rouge-50 dark:bg-rouge-900/10 border-rouge-100 dark:border-rouge-900/20 text-rouge-700 dark:text-rouge-400"
                                )}>
                                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Avis du conseil de classe</p>
                                  <p className="text-[12px] font-semibold leading-relaxed">{semData.appreciationConseil}</p>
                                </div>

                                {semData.absences > 0 && (
                                  <div className="mt-3 p-3 bg-rouge-50 dark:bg-rouge-900/10 rounded-xl flex items-center gap-3 text-rouge-600 dark:text-rouge-400">
                                    <AlertTriangle size={18} />
                                    <p className="text-[12px] font-bold">{semData.absences} heure(s) d'absence et {semData.retards} retard(s) ce semestre.</p>
                                  </div>
                                )}
                              </div>

                              {/* EMPLOI DU TEMPS (mini) */}
                              <div className="col-span-1 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                  <Calendar size={18} className="text-or-500" />
                                  <h3 className="font-bold text-gray-900 dark:text-white">Emploi du temps</h3>
                                </div>
                                <div className="space-y-3">
                                  {enfant.emploiDuTemps.map((cours, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-bleu-600 dark:text-bleu-400 uppercase tracking-wider">{cours.jour}</span>
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={10}/>{cours.heure}</span>
                                      </div>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">{cours.matiere}</p>
                                      <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{cours.salle}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* ÉVOLUTION */}
                                <div className="mt-6 p-4 bg-bleu-50 dark:bg-bleu-900/10 rounded-xl">
                                  <p className="text-[10px] font-bold text-bleu-600 uppercase tracking-widest mb-3">Évolution</p>
                                  <div className="space-y-2">
                                    {(['S1', 'S2'] as Semestre[]).map(sem => {
                                      const d = enfant.semestres[sem];
                                      if (d.moyenneGle === '-') return null;
                                      const moy = parseFloat(d.moyenneGle);
                                      return (
                                        <div key={sem} className="flex items-center justify-between text-sm">
                                          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{semestres.find(s => s.key === sem)?.label}</span>
                                          <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                              <div 
                                                className={cn("h-full rounded-full", moy >= 14 ? 'bg-vert-500' : moy >= 10 ? 'bg-or-500' : 'bg-rouge-500')}
                                                style={{ width: `${(moy / 20) * 100}%` }}
                                              />
                                            </div>
                                            <span className={cn("text-[11px] font-black", moy >= 14 ? 'text-vert-600' : moy >= 10 ? 'text-or-600' : 'text-rouge-600')}>
                                              {d.moyenneGle}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ParentEleves;
