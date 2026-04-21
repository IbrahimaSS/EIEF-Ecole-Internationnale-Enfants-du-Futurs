import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, GraduationCap, TrendingUp,
  Calendar, CheckCircle2, FileText, ChevronRight, Award
} from 'lucide-react';
import { Card, Badge, Avatar, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { studentService, StudentDashboardResponse } from '../../services/studentService';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** "2025-04-18T08:00:00" → "il y a 2 jours" */
const timeAgo = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return `il y a ${days} jours`;
};

/** "2025-04-20T08:00:00" → "Demain" / "Vendredi" / "20 avr." */
const deadlineLabel = (isoDate: string): string => {
  const date = new Date(isoDate);
  const diff = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (diff <= 1) return 'Demain';
  if (diff <= 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const isUrgent = (isoDate: string): boolean => {
  const diff = new Date(isoDate).getTime() - Date.now();
  return diff < 48 * 3_600_000; // moins de 48h
};

// ── Composant ─────────────────────────────────────────────────────────────────

const EleveDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [data, setData]       = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

 // Remplace le useEffect par celui-ci
useEffect(() => {
  if (!user?.id) return;
  setLoading(true);
  studentService.getDashboard(user.id)
    .then(setData)
    .catch((err) => {
      console.error('Dashboard error:', err);
      // Affiche un dashboard vide plutôt qu'un écran d'erreur
      setData({
        averageGrade: 0,
        classRank: 0,
        classSize: 0,
        attendanceRate: 0,
        pendingAssignments: 0,
        recentGrades: [],
        todaySchedule: [],
        upcomingAssignments: [],
      });
    })
    .finally(() => setLoading(false));
}, [user?.id]);

  // ── Squelette de chargement ──────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-8 pb-10 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 rounded-3xl bg-gray-100 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
// Supprime ce bloc — plus besoin avec le fallback ci-dessus
if (error) return (
  <div className="flex items-center justify-center h-64 text-rouge-600 font-bold text-sm">
    {error}
  </div>
);

  if (!data) return null;

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
            <h3 className="text-3xl font-black mt-1">
              {data.averageGrade.toFixed(2)}
              <span className="text-sm opacity-60">/20</span>
            </h3>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600">
              <Award size={24} />
            </div>
            {data.classRank <= 5 && (
              <Badge className="bg-or-50 text-or-600 border-none px-2 h-6 font-bold text-[10px]">
                Top 5
              </Badge>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rang classe</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {data.classRank}ème{' '}
              <span className="text-xs font-bold text-gray-400">/ {data.classSize}</span>
            </h3>
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
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {Math.round(data.attendanceRate)}%
            </h3>
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
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {data.pendingAssignments}
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE CENTRALE */}
        <div className="lg:col-span-2 space-y-8">

          {/* DERNIÈRES NOTES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <FileText size={20} className="text-bleu-500" /> Dernières notes
              </h2>
              <button
                onClick={() => navigate('/eleve/notes')}
                className="text-xs font-bold text-bleu-600 flex items-center gap-1 group"
              >
                Voir tout <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.recentGrades.map((g) => (
                <Card key={g.gradeId} className="p-4 border-none shadow-soft hover:scale-[1.01] transition-transform cursor-pointer bg-white dark:bg-gray-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-bleu-600 dark:text-or-400 uppercase tracking-widest bg-bleu-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                      {g.subjectName}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{timeAgo(g.gradedAt)}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                        {g.comment || 'Évaluation'}
                      </p>
                      <p className="text-[11px] text-gray-500 font-semibold mt-1">Trimestre {g.semester}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${g.value >= 15 ? 'text-vert-600' : 'text-gray-900 dark:text-white'}`}>
                        {Number(g.value).toFixed(1)}
                        <span className="text-xs text-gray-400">/20</span>
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
              {data.todaySchedule.length === 0 ? (
                <p className="p-6 text-sm text-gray-400 font-semibold text-center">Aucun cours aujourd'hui 🎉</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {data.todaySchedule.map((lesson) => (
                    <div key={lesson.id} className="p-5 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <div className="w-20 text-center flex-shrink-0">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Horaire</p>
                        <p className="text-xs font-black text-gray-900 dark:text-white">{lesson.startTime}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{lesson.subjectName}</h4>
                          <Badge className="bg-bleu-50 text-bleu-600 dark:bg-bleu-900/20 dark:text-bleu-400 border-none font-bold text-[9px] h-5">
                            {lesson.room}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-500 font-semibold">{lesson.teacherName}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-gray-400">{lesson.endTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* COLONNE LATÉRALE */}
        <div className="space-y-8">

          {/* DEVOIRS À RENDRE */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 px-2">
              <BookOpen size={20} className="text-vert-500" /> Travaux à rendre
            </h2>
            {data.upcomingAssignments.length === 0 ? (
              <p className="text-sm text-gray-400 font-semibold px-2">Aucun devoir en attente 🎉</p>
            ) : (
              <div className="space-y-4">
                {data.upcomingAssignments.map((h) => {
                  const urgent = isUrgent(h.deadline);
                  return (
                    <Card key={h.id} className={`p-4 border-none shadow-soft relative overflow-hidden ${urgent ? 'bg-rouge-50/30' : 'bg-white dark:bg-gray-900/50'}`}>
                      {urgent && (
                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                          <div className="absolute top-0 right-0 w-full h-full bg-rouge-600 translate-x-1/2 -translate-y-1/2 rotate-45 transform" />
                        </div>
                      )}
                      <div className="flex items-start justify-between relative z-10 mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${urgent ? 'text-rouge-600' : 'text-gray-500'}`}>
                          {h.subjectName}
                        </span>
                        <Badge className={`${urgent ? 'bg-rouge-600 text-white' : 'bg-gray-100 text-gray-500'} border-none font-bold text-[9px] h-5`}>
                          {deadlineLabel(h.deadline)}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{h.title}</p>
                      <Button variant="outline" className="w-full mt-4 h-9 text-[11px] font-bold rounded-xl border-gray-100 dark:border-white/10">
                        Déposer mon travail
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* MESSAGERIE */}
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
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed line-clamp-2">
                    N'oubliez pas d'imprimer vos convocations pour l'examen blanc...
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/eleve/communication')}
                className="w-full mt-4 h-9 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-[11px] font-bold rounded-xl border-none"
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