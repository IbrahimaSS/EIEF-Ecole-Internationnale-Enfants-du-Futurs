import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  GraduationCap, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  FileText,
  ChevronRight,
  Award
} from 'lucide-react';
import { Card, Badge, Avatar, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

const EleveDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const upcomingLessons = [
    { id: 1, subject: 'Mathématiques', time: '08:00 - 10:00', room: 'S. 402', teacher: 'Pr. Diallo' },
    { id: 2, subject: 'Physique-Chimie', time: '10:15 - 12:15', room: 'Lab B', teacher: 'Dr. Condé' },
    { id: 3, subject: 'Anglais', time: '14:00 - 15:30', room: 'S. 201', teacher: 'Mme Smith' },
  ];

  const recentGrades = [
    { id: 1, subject: 'Français', title: 'Dictée trimestrielle', grade: '16.5', max: '20', date: 'il y a 2 jours' },
    { id: 2, subject: 'Mathématiques', title: 'Équations second degré', grade: '14.0', max: '20', date: 'il y a 4 jours' },
    { id: 3, subject: 'Histoire-Géo', title: 'Cartographie Afrique', grade: '18.0', max: '20', date: 'Hier' },
  ];

  const homework = [
    { id: 1, subject: 'SVT', task: 'Schéma de la cellule animale', due: 'Demain', urgent: true },
    { id: 2, subject: 'Philosophie', task: 'Commentaire de texte', due: 'Vendredi', urgent: false },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-bleu-600 to-indigo-700 text-white border-none shadow-xl relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={120} />
           </div>
           <div className="relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4 backdrop-blur-md">
                 <GraduationCap size={24} className="text-white" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Moyenne générale</p>
              <h3 className="text-3xl font-black mt-1">15.42<span className="text-sm opacity-60">/20</span></h3>
              <p className="text-[10px] mt-2 font-semibold bg-white/20 w-fit px-2 py-1 rounded-full">+0.8 vs T1</p>
           </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600">
                 <Award size={24} />
              </div>
              <Badge className="bg-or-50 text-or-600 border-none px-2 h-6 font-bold text-[10px]">Top 5</Badge>
           </div>
           <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rang classe</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">3ème <span className="text-xs font-bold text-gray-400">/ 32</span></h3>
           </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-vert-100 dark:bg-vert-900/30 rounded-2xl text-vert-600">
                 <CheckCircle2 size={24} />
              </div>
              <Badge className="bg-vert-50 text-vert-600 border-none px-2 h-6 font-bold text-[10px]">Assidu</Badge>
           </div>
           <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Taux de présence</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">98%</h3>
           </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rouge-100 dark:bg-rouge-900/30 rounded-2xl text-rouge-600">
                 <Clock size={24} />
              </div>
              <Badge variant="error" className="border-none px-2 h-6 font-bold text-[10px]">À faire</Badge>
           </div>
           <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Devoirs en attente</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{homework.length}</h3>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CENTER COLUMN: GRADES & SCHEDULE */}
        <div className="lg:col-span-2 space-y-8">
          {/* DERNIERS RÉSULTATS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <FileText size={20} className="text-bleu-500" /> Dernières notes
              </h2>
              <button 
                onClick={() => navigate('/eleve/notes')}
                className="text-xs font-bold text-bleu-600 hover:gap-2 transition-all flex items-center gap-1 group"
              >
                Voir tout <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {recentGrades.map((g) => (
                 <Card key={g.id} className="p-4 border-none shadow-soft hover:scale-[1.01] transition-transform cursor-pointer bg-white dark:bg-gray-900/50">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[10px] font-black text-bleu-600 dark:text-or-400 uppercase tracking-widest bg-bleu-50 dark:bg-white/5 px-2 py-1 rounded-lg">{g.subject}</span>
                       <span className="text-[10px] font-bold text-gray-400">{g.date}</span>
                    </div>
                    <div className="flex items-end justify-between">
                       <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{g.title}</p>
                          <p className="text-[11px] text-gray-500 font-semibold mt-1">Évaluation trimestrielle</p>
                       </div>
                       <div className="text-right">
                          <p className={`text-xl font-black ${parseFloat(g.grade) >= 15 ? 'text-vert-600' : 'text-gray-900 dark:text-white'}`}>
                             {g.grade}<span className="text-xs text-gray-400">/{g.max}</span>
                          </p>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
          </div>

          {/* PLANNING DU JOUR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Calendar size={20} className="text-or-500" /> Mon planning aujourd'hui
              </h2>
            </div>
            <Card className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50">
               <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {upcomingLessons.map((lesson) => (
                    <div key={lesson.id} className="p-5 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                       <div className="w-20 text-center flex-shrink-0">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Horaire</p>
                          <p className="text-xs font-black text-gray-900 dark:text-white">{lesson.time.split(' - ')[0]}</p>
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className="text-sm font-bold text-gray-900 dark:text-white">{lesson.subject}</h4>
                             <Badge className="bg-bleu-50 text-bleu-600 dark:bg-bleu-900/20 dark:text-bleu-400 border-none font-bold text-[9px] h-5">{lesson.room}</Badge>
                          </div>
                          <p className="text-[11px] text-gray-500 font-semibold">{lesson.teacher}</p>
                       </div>
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-gray-400">{lesson.time.split(' - ')[1]}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        </div>

        {/* SIDE COLUMN: HOMEWORK & MESSAGES */}
        <div className="space-y-8">
           {/* DEVOIRS À FAIRE */}
           <div className="space-y-4">
             <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 px-2">
               <BookOpen size={20} className="text-vert-500" /> Travaux à rendre
             </h2>
             <div className="space-y-4">
                {homework.map((h) => (
                  <Card key={h.id} className={`p-4 border-none shadow-soft relative overflow-hidden ${h.urgent ? 'bg-rouge-50/30' : 'bg-white dark:bg-gray-900/50'}`}>
                     {h.urgent && <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-full bg-rouge-600 translate-x-1/2 -translate-y-1/2 rotate-45 transform" />
                     </div>}
                     <div className="flex items-start justify-between relative z-10 mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${h.urgent ? 'text-rouge-600' : 'text-gray-500'}`}>{h.subject}</span>
                        <Badge className={`${h.urgent ? 'bg-rouge-600 text-white' : 'bg-gray-100 text-gray-500'} border-none font-bold text-[9px] h-5`}>
                           {h.due}
                        </Badge>
                     </div>
                     <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{h.task}</p>
                     <Button variant="outline" className="w-full mt-4 h-9 text-[11px] font-bold rounded-xl border-gray-100 dark:border-white/10 hover:bg-white dark:hover:bg-white/5">Déposer mon travail</Button>
                  </Card>
                ))}
             </div>
           </div>

           {/* MESSAGERIE RAPIDE */}
           <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 px-2">
                <Avatar name="Admin" size="xs" /> Messages récents
              </h2>
              <Card className="p-4 border-none shadow-soft bg-white dark:bg-gray-900/50">
                 <div className="flex items-start gap-3">
                    <Avatar name="Scolarité" size="sm" />
                    <div>
                       <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Bureau Scolarité</p>
                          <span className="text-[9px] font-bold text-gray-400">10:15</span>
                       </div>
                       <p className="text-[11px] text-gray-500 font-semibold leading-relaxed line-clamp-2">N'oubliez pas d'imprimer vos convocations pour l'examen blanc...</p>
                    </div>
                 </div>
                 <Button 
                   onClick={() => navigate('/eleve/communication')}
                   className="w-full mt-4 h-9 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-[11px] font-bold rounded-xl border-none hover:bg-gray-100 dark:hover:bg-white/10"
                 >
                   Voir tous les messages
                 </Button>
              </Card>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EleveDashboard;
