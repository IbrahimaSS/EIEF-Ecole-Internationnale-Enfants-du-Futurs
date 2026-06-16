/**
 * CoordinatorDevoirs — Suivi des devoirs pour coordinateur et administrateur
 *
 * - Vue globale : stats de rendus, taux de participation
 * - Suivi par enseignant : identifie ceux qui n'ont pas donné de devoirs récemment
 * - Liste détaillée avec rendus des élèves (photos incluses)
 */
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, AlertTriangle, BookOpen, Calendar, CheckCircle2,
  ChevronDown, ChevronUp, Clock, FileText, Loader2, MessageSquare,
  Paperclip, Search, Star, TrendingUp, Users, XCircle,
} from 'lucide-react';
import { Card } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import {
  homeworkService, HomeworkResponse, HomeworkSubmissionResponse,
  isOverdue, statusColor, statusLabel,
} from '../../services/homeworkService';

const isImageUrl = (url: string | null) =>
  !!url && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(url);

const RECENT_DAYS = 7; // Nb de jours pour considérer un prof "actif"

interface TeacherStat {
  teacherId: string;
  teacherName: string;
  totalHomeworks: number;
  lastHomeworkDate: Date | null;
  submissionRate: number; // 0–100
  recentCount: number;    // devoirs dans les RECENT_DAYS derniers jours
}

const CoordinatorDevoirs: React.FC = () => {
  const { user, token } = useAuthStore();
  const [homeworks, setHomeworks]     = useState<HomeworkResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, HomeworkSubmissionResponse[]>>({});
  const [activeView, setActiveView]   = useState<'devoirs' | 'enseignants'>('enseignants');
  const [filterTeacher, setFilterTeacher] = useState<string>('');

  useEffect(() => {
    if (!token) return;
    homeworkService.getAll(token)
      .then(setHomeworks)
      .catch((e: any) => setError(e?.message ?? 'Impossible de charger les devoirs.'))
      .finally(() => setLoading(false));
  }, [token]);

  // ── Stats par enseignant ─────────────────────────────────────────────────────

  const teacherStats = useMemo<TeacherStat[]>(() => {
    const now = new Date();
    const recentThreshold = new Date(now.getTime() - RECENT_DAYS * 24 * 60 * 60 * 1000);
    const map = new Map<string, TeacherStat>();

    for (const hw of homeworks) {
      const existing = map.get(hw.teacherId);
      const hwDate   = new Date(hw.createdAt);
      const totalStudents = hw.totalStudents;
      const submitted     = hw.submittedCount;

      if (!existing) {
        map.set(hw.teacherId, {
          teacherId:        hw.teacherId,
          teacherName:      hw.teacherName,
          totalHomeworks:   1,
          lastHomeworkDate: hwDate,
          submissionRate:   totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0,
          recentCount:      hwDate >= recentThreshold ? 1 : 0,
        });
      } else {
        existing.totalHomeworks++;
        if (!existing.lastHomeworkDate || hwDate > existing.lastHomeworkDate) {
          existing.lastHomeworkDate = hwDate;
        }
        // Moyenne du taux
        existing.submissionRate = Math.round(
          (existing.submissionRate * (existing.totalHomeworks - 1) +
            (totalStudents > 0 ? (submitted / totalStudents) * 100 : 0)) /
          existing.totalHomeworks,
        );
        if (hwDate >= recentThreshold) existing.recentCount++;
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      // Inactifs en premier
      if (!a.recentCount && b.recentCount) return -1;
      if (a.recentCount && !b.recentCount) return 1;
      return (b.lastHomeworkDate?.getTime() ?? 0) - (a.lastHomeworkDate?.getTime() ?? 0);
    });
  }, [homeworks]);

  const inactiveTeachers = teacherStats.filter(t => t.recentCount === 0).length;

  // ── Chargement des rendus ───────────────────────────────────────────────────

  const loadSubmissions = async (hwId: string) => {
    if (!token || !user?.id || submissions[hwId] !== undefined) return;
    try {
      const subs = await homeworkService.getSubmissions(hwId, user.id, token);
      setSubmissions(prev => ({ ...prev, [hwId]: subs }));
    } catch { setSubmissions(prev => ({ ...prev, [hwId]: [] })); }
  };

  const toggleExpand = (hwId: string) => {
    if (expandedId === hwId) { setExpandedId(null); return; }
    setExpandedId(hwId);
    void loadSubmissions(hwId);
  };

  // ── Filtres ─────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => homeworks.filter(hw => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      hw.title.toLowerCase().includes(q) ||
      hw.subjectName?.toLowerCase().includes(q) ||
      hw.className?.toLowerCase().includes(q) ||
      hw.teacherName?.toLowerCase().includes(q);
    const matchTeacher = !filterTeacher || hw.teacherId === filterTeacher;
    return matchSearch && matchTeacher;
  }), [homeworks, search, filterTeacher]);

  // ── Stats globales ──────────────────────────────────────────────────────────

  const totalStudentsExpected = homeworks.reduce((a, h) => a + h.totalStudents, 0);
  const totalSubmitted        = homeworks.reduce((a, h) => a + h.submittedCount, 0);
  const globalRate            = totalStudentsExpected > 0
    ? Math.round((totalSubmitted / totalStudentsExpected) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 size={36} className="animate-spin text-bleu-500" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl text-bleu-600">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Suivi des Devoirs</h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              {homeworks.length} devoir{homeworks.length > 1 ? 's' : ''} · {teacherStats.length} enseignant{teacherStats.length > 1 ? 's' : ''}
              {inactiveTeachers > 0 && (
                <span className="ml-2 text-red-500">· {inactiveTeachers} sans devoir cette semaine</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-0.5">
          {[
            { key: 'enseignants' as const, label: 'Enseignants' },
            { key: 'devoirs'     as const, label: 'Devoirs' },
          ].map(v => (
            <button key={v.key} onClick={() => setActiveView(v.key)}
              className={cn('px-4 py-2 rounded-xl text-xs font-black transition-all',
                activeView === v.key
                  ? 'bg-white dark:bg-gray-800 text-bleu-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-semibold">
          <AlertCircle size={18} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Stats globales ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total devoirs',      value: homeworks.length,                                              color: 'text-bleu-600 bg-bleu-50 dark:bg-bleu-900/20',   icon: BookOpen },
          { label: 'Taux de rendu',      value: `${globalRate}%`,                                             color: 'text-vert-600 bg-vert-50 dark:bg-vert-900/20',   icon: TrendingUp },
          { label: 'En retard',          value: homeworks.filter(h => isOverdue(h.dueDate)).length,           color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', icon: Clock },
          { label: 'Profs inactifs',     value: inactiveTeachers,                                             color: inactiveTeachers > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 bg-gray-50 dark:bg-white/5', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className={cn('p-5 border-none shadow-soft', color)}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
              <Icon size={14} className="opacity-50" />
            </div>
            <p className="text-2xl font-black">{value}</p>
          </Card>
        ))}
      </div>

      {/* ════════════════════════════ VUE ENSEIGNANTS ════════════════════════════ */}
      {activeView === 'enseignants' && (
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Activité des enseignants — {RECENT_DAYS} derniers jours
          </h2>

          {teacherStats.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400 font-semibold">Aucun devoir enregistré.</p>
            </div>
          ) : (
            teacherStats.map(t => {
              const isInactive = t.recentCount === 0;
              const daysSince  = t.lastHomeworkDate
                ? Math.floor((Date.now() - t.lastHomeworkDate.getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <Card key={t.teacherId} className={cn(
                  'p-5 border-none shadow-soft bg-white dark:bg-gray-900/50 transition-all',
                  isInactive && 'ring-2 ring-red-200 dark:ring-red-800/40',
                )}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar initiales */}
                      <div className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0',
                        isInactive
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : 'bg-bleu-100 dark:bg-bleu-900/30 text-bleu-700 dark:text-bleu-300',
                      )}>
                        {t.teacherName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-black text-gray-900 dark:text-white text-sm">{t.teacherName}</p>
                          {isInactive ? (
                            <span className="text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <XCircle size={9} /> Aucun devoir cette semaine
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-vert-600 bg-vert-50 dark:bg-vert-900/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <CheckCircle2 size={9} /> {t.recentCount} devoir{t.recentCount > 1 ? 's' : ''} cette semaine
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                            <BookOpen size={9} /> {t.totalHomeworks} devoir{t.totalHomeworks > 1 ? 's' : ''} au total
                          </span>
                          {daysSince !== null && (
                            <span className={cn('text-[10px] font-bold flex items-center gap-1',
                              daysSince > RECENT_DAYS ? 'text-red-400' : 'text-gray-400')}>
                              <Calendar size={9} />
                              Dernier : il y a {daysSince === 0 ? "aujourd'hui" : `${daysSince} j.`}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <TrendingUp size={9} /> {t.submissionRate}% de rendus
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mini barre taux */}
                    <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 min-w-[80px]">
                      <p className={cn('text-sm font-black', isInactive ? 'text-red-500' : 'text-vert-600')}>
                        {t.submissionRate}%
                      </p>
                      <div className="w-20 h-2 bg-gray-100 dark:bg-white/10 rounded-full">
                        <div className={cn('h-full rounded-full transition-all', isInactive ? 'bg-red-400' : 'bg-vert-500')}
                          style={{ width: `${t.submissionRate}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Bouton : voir les devoirs de cet enseignant */}
                  <button
                    onClick={() => {
                      setFilterTeacher(t.teacherId);
                      setActiveView('devoirs');
                    }}
                    className="mt-3 text-[11px] font-bold text-bleu-600 hover:text-bleu-700 dark:text-bleu-400 underline underline-offset-2">
                    Voir les {t.totalHomeworks} devoir{t.totalHomeworks > 1 ? 's' : ''} →
                  </button>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ════════════════════════════ VUE DEVOIRS ════════════════════════════ */}
      {activeView === 'devoirs' && (
        <div className="space-y-4">

          {/* Barre de recherche + filtre prof */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un devoir…"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-2xl text-sm font-semibold shadow-soft border-none outline-none focus:ring-2 focus:ring-bleu-500/20" />
            </div>
            {filterTeacher && (
              <button
                onClick={() => setFilterTeacher('')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bleu-50 dark:bg-bleu-900/20 text-bleu-700 dark:text-bleu-300 text-xs font-bold">
                {teacherStats.find(t => t.teacherId === filterTeacher)?.teacherName ?? 'Enseignant'}
                <XCircle size={13} />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400 font-semibold">Aucun devoir trouvé.</p>
            </div>
          ) : (
            filtered.map(hw => (
              <Card key={hw.id} className="p-0 border-none shadow-soft overflow-hidden bg-white dark:bg-gray-900/50">

                {/* En-tête */}
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpand(hw.id)}>
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={cn('p-2.5 rounded-xl flex-shrink-0',
                      isOverdue(hw.dueDate)
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                        : 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600')}>
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg">
                          {hw.className}
                        </span>
                        <span className="text-[10px] font-bold text-bleu-500">{hw.subjectName}</span>
                        {isOverdue(hw.dueDate) && (
                          <span className="text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-lg">
                            En retard
                          </span>
                        )}
                      </div>
                      <p className="font-black text-gray-900 dark:text-white text-sm">{hw.title}</p>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                          <Calendar size={9} />
                          {new Date(hw.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">Prof : {hw.teacherName}</span>
                        <span className={cn('text-[10px] font-black flex items-center gap-1',
                          hw.submittedCount === hw.totalStudents && hw.totalStudents > 0
                            ? 'text-vert-600' : 'text-or-600')}>
                          <Users size={9} /> {hw.submittedCount}/{hw.totalStudents} rendus
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className="hidden sm:block">
                      <div className="w-20 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full">
                        <div className="h-full bg-vert-500 rounded-full transition-all"
                          style={{ width: hw.totalStudents > 0 ? `${(hw.submittedCount / hw.totalStudents) * 100}%` : '0%' }} />
                      </div>
                    </div>
                    {expandedId === hw.id
                      ? <ChevronUp size={16} className="text-gray-400" />
                      : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Détail déroulant */}
                <AnimatePresence initial={false}>
                  {expandedId === hw.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-gray-100 dark:border-white/10">
                      <div className="p-5 space-y-5">
                        {hw.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{hw.description}</p>
                        )}

                        {/* Photo du devoir */}
                        {hw.fileUrl && (
                          isImageUrl(hw.fileUrl) ? (
                            <a href={hw.fileUrl} target="_blank" rel="noreferrer">
                              <img src={hw.fileUrl} alt="Devoir"
                                className="rounded-2xl max-h-48 object-contain border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5" />
                            </a>
                          ) : (
                            <a href={hw.fileUrl} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-bleu-600 font-bold hover:underline">
                              <Paperclip size={11} /> {hw.fileName}
                            </a>
                          )
                        )}

                        {/* Rendus des élèves */}
                        <div>
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                            Rendus ({(submissions[hw.id] ?? []).length} / {hw.totalStudents})
                          </h3>
                          {submissions[hw.id] === undefined ? (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <Loader2 size={12} className="animate-spin" /> Chargement…
                            </div>
                          ) : submissions[hw.id].length === 0 ? (
                            <p className="text-xs text-gray-400 font-semibold">Aucun rendu.</p>
                          ) : (
                            <div className="grid sm:grid-cols-2 gap-3">
                              {submissions[hw.id].map(sub => (
                                <div key={sub.id}
                                  className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-white/5">
                                  <div className="p-3">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <p className="text-xs font-black text-gray-900 dark:text-white">{sub.studentName}</p>
                                      <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded', statusColor[sub.status])}>
                                        {statusLabel[sub.status]}
                                      </span>
                                      {sub.grade !== null && (
                                        <span className="text-[9px] font-black text-or-600 flex items-center gap-0.5 ml-auto">
                                          <Star size={8} /> {sub.grade}/20
                                        </span>
                                      )}
                                    </div>
                                    {sub.content && (
                                      <p className="text-[11px] text-gray-500 line-clamp-2 italic mb-1.5">"{sub.content}"</p>
                                    )}
                                    {sub.feedback && (
                                      <p className="text-[11px] text-vert-600 flex items-start gap-1">
                                        <MessageSquare size={9} className="mt-0.5 flex-shrink-0" /> {sub.feedback}
                                      </p>
                                    )}
                                    {sub.submittedAt && (
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(sub.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    )}
                                  </div>
                                  {/* Photo rendu */}
                                  {sub.fileUrl && (
                                    isImageUrl(sub.fileUrl) ? (
                                      <a href={sub.fileUrl} target="_blank" rel="noreferrer">
                                        <img src={sub.fileUrl} alt="Rendu"
                                          className="w-full max-h-32 object-contain border-t border-gray-100 dark:border-white/10 bg-white dark:bg-gray-800" />
                                      </a>
                                    ) : (
                                      <div className="px-3 py-2 border-t border-gray-100 dark:border-white/10">
                                        <a href={sub.fileUrl} target="_blank" rel="noreferrer"
                                          className="text-[11px] text-bleu-600 font-bold flex items-center gap-1 hover:underline">
                                          <Paperclip size={9} /> {sub.fileName}
                                        </a>
                                      </div>
                                    )
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CoordinatorDevoirs;
