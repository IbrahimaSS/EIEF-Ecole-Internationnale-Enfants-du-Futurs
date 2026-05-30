import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, Star, Users, Paperclip, Loader2,
  FileText, ChevronDown, ChevronUp, MessageSquare, Search,
} from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import {
  homeworkService, HomeworkResponse, HomeworkSubmissionResponse,
  isOverdue, statusColor, statusLabel,
} from '../../services/homeworkService';

const CoordinatorDevoirs: React.FC = () => {
  const { user, token } = useAuthStore();
  const [homeworks, setHomeworks] = useState<HomeworkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, HomeworkSubmissionResponse[]>>({});

  useEffect(() => {
    if (!token) return;
    homeworkService.getAll(token)
      .then(setHomeworks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const loadSubmissions = async (hwId: string) => {
    if (!token || !user?.id || submissions[hwId] !== undefined) return;
    try {
      const subs = await homeworkService.getSubmissions(hwId, user.id, token);
      setSubmissions(prev => ({ ...prev, [hwId]: subs }));
    } catch { /* ignore */ }
  };

  const toggleExpand = (hwId: string) => {
    if (expandedId === hwId) { setExpandedId(null); return; }
    setExpandedId(hwId);
    loadSubmissions(hwId);
  };

  const filtered = homeworks.filter(hw =>
    !search ||
    hw.title.toLowerCase().includes(search.toLowerCase()) ||
    hw.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
    hw.className?.toLowerCase().includes(search.toLowerCase()) ||
    hw.teacherName?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 size={36} className="animate-spin text-bleu-500" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl text-bleu-600">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Suivi des Devoirs</h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-1">
              {homeworks.length} devoir(s) · toutes classes confondues
            </p>
          </div>
        </div>
        {/* Recherche */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-2xl text-xs font-semibold shadow-soft outline-none w-64 border-none focus:ring-2 focus:ring-bleu-500/20" />
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total devoirs', value: homeworks.length, color: 'text-bleu-600 bg-bleu-50 dark:bg-bleu-900/20' },
          { label: 'En retard', value: homeworks.filter(h => isOverdue(h.dueDate)).length, color: 'text-rouge-600 bg-rouge-50 dark:bg-rouge-900/20' },
          { label: 'Taux de rendu', value: homeworks.length > 0 ? `${Math.round((homeworks.reduce((a, h) => a + h.submittedCount, 0) / Math.max(homeworks.reduce((a, h) => a + h.totalStudents, 0), 1)) * 100)}%` : '—', color: 'text-vert-600 bg-vert-50 dark:bg-vert-900/20' },
          { label: 'Enseignants', value: new Set(homeworks.map(h => h.teacherId)).size, color: 'text-or-600 bg-or-50 dark:bg-or-900/20' },
        ].map((s, i) => (
          <Card key={i} className={cn('p-5 border-none shadow-soft', s.color)}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-400 font-semibold">Aucun devoir trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(hw => (
            <Card key={hw.id} className="p-0 border-none shadow-soft overflow-hidden bg-white dark:bg-gray-900/50">
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(hw.id)}>
                <div className="flex items-start gap-4 min-w-0">
                  <div className={cn('p-2.5 rounded-xl flex-shrink-0',
                    isOverdue(hw.dueDate) ? 'bg-rouge-50 dark:bg-rouge-900/20 text-rouge-500'
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
                        <span className="text-[10px] font-black text-rouge-500 bg-rouge-50 dark:bg-rouge-900/20 px-2 py-0.5 rounded-lg">En retard</span>
                      )}
                    </div>
                    <p className="font-black text-gray-900 dark:text-white text-sm">{hw.title}</p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Calendar size={9} />
                        {new Date(hw.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">Prof : {hw.teacherName}</span>
                      <span className="text-[10px] text-vert-600 font-bold flex items-center gap-1">
                        <Users size={9} /> {hw.submittedCount}/{hw.totalStudents} rendus
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:block">
                    <div className="w-20 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full">
                      <div className="h-full bg-vert-500 rounded-full"
                        style={{ width: hw.totalStudents > 0 ? `${(hw.submittedCount / hw.totalStudents) * 100}%` : '0%' }} />
                    </div>
                  </div>
                  {expandedId === hw.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === hw.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-gray-100 dark:border-white/5">
                    <div className="p-5 space-y-4">
                      {hw.description && <p className="text-sm text-gray-600 dark:text-gray-400">{hw.description}</p>}
                      {hw.fileUrl && (
                        <a href={hw.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-bleu-600 font-bold hover:underline">
                          <Paperclip size={11} /> {hw.fileName}
                        </a>
                      )}
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
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
                            <div key={sub.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                              <div className="flex items-center gap-2 mb-1.5">
                                <p className="text-xs font-black text-gray-900 dark:text-white">{sub.studentName}</p>
                                <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded', statusColor[sub.status])}>
                                  {statusLabel[sub.status]}
                                </span>
                                {sub.grade !== null && (
                                  <span className="text-[9px] font-black text-or-600 flex items-center gap-0.5">
                                    <Star size={8} /> {sub.grade}/20
                                  </span>
                                )}
                              </div>
                              {sub.content && <p className="text-[11px] text-gray-500 line-clamp-2 italic">"{sub.content}"</p>}
                              {sub.fileUrl && (
                                <a href={sub.fileUrl} target="_blank" rel="noreferrer"
                                  className="text-[11px] text-bleu-600 font-bold flex items-center gap-1 mt-1 hover:underline">
                                  <Paperclip size={9} /> {sub.fileName}
                                </a>
                              )}
                              {sub.feedback && (
                                <p className="text-[11px] text-vert-600 mt-1 flex items-start gap-1">
                                  <MessageSquare size={9} className="mt-0.5 flex-shrink-0" /> {sub.feedback}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CoordinatorDevoirs;
