import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, X, Upload, Users, CheckCircle2, Clock,
  Star, MessageSquare, ChevronDown, ChevronUp, Loader2,
  FileText, Paperclip, Calendar,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import {
  homeworkService,
  HomeworkResponse,
  HomeworkSubmissionResponse,
  isOverdue,
  statusColor,
  statusLabel,
} from '../../services/homeworkService';
import { apiRequest } from '../../services/api';

interface ClassSubjectOption {
  id: string;
  subjectName: string;
  className: string;
}

const TeacherDevoirs: React.FC = () => {
  const { user, token } = useAuthStore();
  const [homeworks, setHomeworks] = useState<HomeworkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, HomeworkSubmissionResponse[]>>({});
  const [classSubjects, setClassSubjects] = useState<ClassSubjectOption[]>([]);

  // Form state
  const [form, setForm] = useState({ classSubjectId: '', title: '', description: '', dueDate: '' });
  const [formFile, setFormFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Grade modal
  const [gradeModal, setGradeModal] = useState<{ subId: string; grade: string; feedback: string } | null>(null);

  useEffect(() => {
    if (!user?.id || !token) return;
    // Load teacher's homework
    homeworkService.getByTeacher(user.id, token)
      .then(setHomeworks)
      .catch(console.error)
      .finally(() => setLoading(false));
    // Load class-subjects for this teacher
    apiRequest<ClassSubjectOption[]>(`/class-subjects/teacher/${user.id}`, { token })
      .then(setClassSubjects)
      .catch(() => {});
  }, [user?.id, token]);

  const loadSubmissions = async (hwId: string) => {
    if (!token || !user?.id || submissions[hwId]) return;
    try {
      const subs = await homeworkService.getSubmissions(hwId, user.id, token);
      setSubmissions(prev => ({ ...prev, [hwId]: subs }));
    } catch { /* ignore */ }
  };

  const toggleExpand = (hwId: string) => {
    if (expandedId === hwId) {
      setExpandedId(null);
    } else {
      setExpandedId(hwId);
      loadSubmissions(hwId);
    }
  };

  const handleCreate = async () => {
    if (!token || !user?.id || !form.classSubjectId || !form.title || !form.dueDate) return;
    setSaving(true);
    try {
      const hw = await homeworkService.create(
        { classSubjectId: form.classSubjectId, title: form.title, description: form.description, dueDate: form.dueDate + ':00' },
        user.id,
        token,
      );
      if (formFile) {
        const updated = await homeworkService.attachFile(hw.id, formFile, user.id, token);
        setHomeworks(prev => [updated, ...prev]);
      } else {
        setHomeworks(prev => [hw, ...prev]);
      }
      setShowCreate(false);
      setForm({ classSubjectId: '', title: '', description: '', dueDate: '' });
      setFormFile(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleGrade = async () => {
    if (!gradeModal || !token || !user?.id) return;
    try {
      const updated = await homeworkService.gradeSubmission(
        gradeModal.subId,
        { grade: parseFloat(gradeModal.grade), feedback: gradeModal.feedback },
        user.id,
        token,
      );
      // Update local submissions cache
      setSubmissions(prev => {
        const next = { ...prev };
        for (const hwId of Object.keys(next)) {
          next[hwId] = next[hwId].map(s => s.id === updated.id ? updated : s);
        }
        return next;
      });
      setGradeModal(null);
    } catch (e) {
      console.error(e);
    }
  };

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
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Mes Devoirs</h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-1">Gérez les devoirs de vos classes</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-bleu-600 hover:bg-bleu-700 text-white rounded-2xl px-5 h-11 font-black text-sm shadow-md">
          <Plus size={16} /> Nouveau devoir
        </Button>
      </div>

      {/* Modal création */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Nouveau devoir</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Classe / Matière</label>
                  <select value={form.classSubjectId} onChange={e => setForm(p => ({ ...p, classSubjectId: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold">
                    <option value="">-- Sélectionner --</option>
                    {classSubjects.map(cs => (
                      <option key={cs.id} value={cs.id}>{cs.className} — {cs.subjectName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Titre</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ex: Exercices chapitre 3"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Instructions, consignes..."
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm resize-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Date limite</label>
                  <input type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Pièce jointe (optionnel)</label>
                  <input ref={fileRef} type="file" onChange={e => setFormFile(e.target.files?.[0] ?? null)} className="hidden" />
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-semibold text-bleu-600 hover:text-bleu-700 border border-dashed border-bleu-300 rounded-xl px-4 py-2.5 w-full">
                    <Paperclip size={14} />
                    {formFile ? formFile.name : 'Joindre un fichier (PDF, image…)'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-2xl h-11 font-bold">
                  Annuler
                </Button>
                <Button onClick={handleCreate} disabled={saving || !form.classSubjectId || !form.title || !form.dueDate}
                  className="flex-1 bg-bleu-600 hover:bg-bleu-700 text-white rounded-2xl h-11 font-black">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Publier'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des devoirs */}
      {homeworks.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Aucun devoir</h3>
          <p className="text-sm text-gray-500">Commencez par créer un devoir pour vos élèves.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworks.map(hw => (
            <Card key={hw.id} className="p-0 border-none shadow-soft overflow-hidden bg-white dark:bg-gray-900/50">
              {/* Header du devoir */}
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(hw.id)}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-3 bg-bleu-50 dark:bg-bleu-900/20 rounded-2xl text-bleu-600 flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-black bg-bleu-50 dark:bg-bleu-900/30 text-bleu-600 px-2 py-0.5 rounded-lg">
                        {hw.className}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{hw.subjectName}</span>
                    </div>
                    <p className="font-black text-gray-900 dark:text-white text-sm">{hw.title}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className={cn('text-[10px] font-bold flex items-center gap-1',
                        isOverdue(hw.dueDate) ? 'text-rouge-500' : 'text-gray-400')}>
                        <Calendar size={10} />
                        {new Date(hw.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Users size={10} /> {hw.submittedCount}/{hw.totalStudents} rendus
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-gray-500">{hw.submittedCount} / {hw.totalStudents}</p>
                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-1">
                      <div className="h-full bg-vert-500 rounded-full transition-all"
                        style={{ width: hw.totalStudents > 0 ? `${(hw.submittedCount / hw.totalStudents) * 100}%` : '0%' }} />
                    </div>
                  </div>
                  {expandedId === hw.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {/* Détail & rendus */}
              <AnimatePresence>
                {expandedId === hw.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-gray-100 dark:border-white/5">
                    <div className="p-6 space-y-5">
                      {hw.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{hw.description}</p>
                      )}
                      {hw.fileUrl && (
                        <a href={hw.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-bleu-600 hover:text-bleu-700">
                          <Paperclip size={12} /> {hw.fileName ?? 'Fichier joint'}
                        </a>
                      )}

                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        Rendus ({(submissions[hw.id] ?? []).length})
                      </h3>

                      {!(submissions[hw.id]) ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Loader2 size={14} className="animate-spin" /> Chargement…
                        </div>
                      ) : submissions[hw.id].length === 0 ? (
                        <p className="text-sm text-gray-400 font-semibold">Aucun rendu pour l'instant.</p>
                      ) : (
                        <div className="space-y-3">
                          {submissions[hw.id].map(sub => (
                            <div key={sub.id} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <p className="text-sm font-black text-gray-900 dark:text-white">{sub.studentName}</p>
                                  <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-lg', statusColor[sub.status])}>
                                    {statusLabel[sub.status]}
                                  </span>
                                  {sub.grade !== null && (
                                    <span className="text-[10px] font-black text-or-600 bg-or-50 dark:bg-or-900/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                      <Star size={9} /> {sub.grade}/20
                                    </span>
                                  )}
                                </div>
                                {sub.content && <p className="text-xs text-gray-500 line-clamp-2">{sub.content}</p>}
                                {sub.fileUrl && (
                                  <a href={sub.fileUrl} target="_blank" rel="noreferrer"
                                    className="text-[11px] text-bleu-600 font-bold flex items-center gap-1 mt-1">
                                    <Paperclip size={10} /> {sub.fileName}
                                  </a>
                                )}
                                {sub.feedback && (
                                  <p className="text-[11px] text-vert-700 dark:text-vert-400 mt-1 flex items-start gap-1">
                                    <MessageSquare size={10} className="mt-0.5 flex-shrink-0" /> {sub.feedback}
                                  </p>
                                )}
                              </div>
                              {sub.status !== 'GRADED' && (
                                <Button
                                  onClick={() => setGradeModal({ subId: sub.id, grade: '', feedback: '' })}
                                  className="flex-shrink-0 text-xs bg-or-500 hover:bg-or-600 text-white px-3 py-1.5 rounded-xl font-black">
                                  <Star size={12} className="mr-1" /> Noter
                                </Button>
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

      {/* Modal notation */}
      <AnimatePresence>
        {gradeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Noter le rendu</h2>
                <button onClick={() => setGradeModal(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Note /20</label>
                  <input type="number" min="0" max="20" step="0.5"
                    value={gradeModal.grade}
                    onChange={e => setGradeModal(p => p ? { ...p, grade: e.target.value } : p)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Commentaire</label>
                  <textarea rows={3} value={gradeModal.feedback}
                    onChange={e => setGradeModal(p => p ? { ...p, feedback: e.target.value } : p)}
                    placeholder="Appréciation..."
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setGradeModal(null)} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-2xl h-11 font-bold">
                  Annuler
                </Button>
                <Button onClick={handleGrade} disabled={!gradeModal.grade}
                  className="flex-1 bg-or-500 hover:bg-or-600 text-white rounded-2xl h-11 font-black">
                  <CheckCircle2 size={14} className="mr-1" /> Valider
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeacherDevoirs;
