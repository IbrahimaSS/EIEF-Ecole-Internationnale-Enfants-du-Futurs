import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CheckCircle2, Clock, Upload, X, Send,
  Paperclip, Calendar, Loader2, Star, MessageSquare, FileText,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import {
  homeworkService, HomeworkResponse, HomeworkSubmissionResponse, isOverdue, statusColor, statusLabel,
} from '../../services/homeworkService';

const EleveDevoirs: React.FC = () => {
  const { user, token } = useAuthStore();
  const [homeworks, setHomeworks] = useState<HomeworkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  // Submit modal
  const [submitModal, setSubmitModal] = useState<HomeworkResponse | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id || !token) return;
    homeworkService.getForStudent(user.id, token)
      .then(setHomeworks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id, token]);

  const myStatus = (hw: HomeworkResponse) => hw.mySubmission?.status ?? 'PENDING';

  const filtered = homeworks.filter(hw => {
    if (filter === 'pending') return myStatus(hw) === 'PENDING';
    if (filter === 'submitted') return myStatus(hw) === 'SUBMITTED';
    if (filter === 'graded') return myStatus(hw) === 'GRADED';
    return true;
  });

  const handleSubmit = async () => {
    if (!submitModal || !token || !user?.id) return;
    setSubmitting(true);
    try {
      let updated: HomeworkSubmissionResponse;
      if (submitFile) {
        updated = await homeworkService.submitFile(submitModal.id, submitFile, user.id, token);
      } else {
        updated = await homeworkService.submit(
          submitModal.id,
          { content: submitContent },
          user.id,
          token,
        );
      }
      setHomeworks(prev => prev.map(hw =>
        hw.id === submitModal.id ? { ...hw, mySubmission: updated } : hw,
      ));
      setSubmitModal(null);
      setSubmitContent('');
      setSubmitFile(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'pending', label: 'À rendre' },
    { key: 'submitted', label: 'Rendus' },
    { key: 'graded', label: 'Notés' },
  ];

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
            <p className="text-[11px] text-gray-500 font-semibold mt-1">
              {homeworks.filter(hw => myStatus(hw) === 'PENDING').length} devoir(s) à rendre
            </p>
          </div>
        </div>
        {/* Filtres */}
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1.5 gap-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={cn('px-4 py-2 rounded-xl text-xs font-black transition-all',
                filter === tab.key
                  ? 'bg-white dark:bg-gray-800 text-bleu-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Aucun devoir</h3>
          <p className="text-sm text-gray-500">Profites-en pour réviser !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(hw => {
            const status = myStatus(hw);
            const overdue = isOverdue(hw.dueDate) && status === 'PENDING';
            return (
              <Card key={hw.id} className={cn(
                'p-6 border-none shadow-soft bg-white dark:bg-gray-900/50 transition-all',
                overdue && 'ring-2 ring-rouge-200 dark:ring-rouge-800/40',
              )}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={cn('p-3 rounded-2xl flex-shrink-0',
                      status === 'GRADED' ? 'bg-vert-50 dark:bg-vert-900/20 text-vert-600'
                        : status === 'SUBMITTED' ? 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600'
                        : overdue ? 'bg-rouge-50 dark:bg-rouge-900/20 text-rouge-500'
                        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500')}>
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-bleu-50 dark:bg-bleu-900/30 text-bleu-600 px-2 py-0.5 rounded-lg">
                          {hw.subjectName}
                        </span>
                        <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-lg', statusColor[status])}>
                          {statusLabel[status]}
                        </span>
                        {hw.mySubmission?.grade !== null && hw.mySubmission?.grade !== undefined && (
                          <span className="text-[10px] font-black text-or-600 bg-or-50 dark:bg-or-900/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Star size={9} /> {hw.mySubmission.grade}/20
                          </span>
                        )}
                      </div>
                      <p className="font-black text-gray-900 dark:text-white">{hw.title}</p>
                      {hw.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{hw.description}</p>}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={cn('text-[10px] font-bold flex items-center gap-1',
                          overdue ? 'text-rouge-500' : 'text-gray-400')}>
                          <Calendar size={10} />
                          {overdue ? 'En retard · ' : ''}
                          {new Date(hw.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">Prof: {hw.teacherName}</span>
                      </div>
                      {hw.fileUrl && (
                        <a href={hw.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-bleu-600 font-bold mt-1.5 hover:underline">
                          <Paperclip size={10} /> {hw.fileName ?? 'Fichier joint'}
                        </a>
                      )}
                      {/* Mon rendu */}
                      {hw.mySubmission && (
                        <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 space-y-1.5">
                          {hw.mySubmission.content && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-2">"{hw.mySubmission.content}"</p>
                          )}
                          {hw.mySubmission.fileUrl && (
                            <a href={hw.mySubmission.fileUrl} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-bleu-600 font-bold hover:underline">
                              <Paperclip size={10} /> {hw.mySubmission.fileName}
                            </a>
                          )}
                          {hw.mySubmission.feedback && (
                            <p className="text-[11px] text-vert-700 dark:text-vert-400 flex items-start gap-1">
                              <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />
                              {hw.mySubmission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {status === 'PENDING' && (
                    <Button onClick={() => { setSubmitModal(hw); setSubmitContent(''); setSubmitFile(null); }}
                      className="flex-shrink-0 flex items-center gap-2 bg-bleu-600 hover:bg-bleu-700 text-white px-4 py-2.5 rounded-2xl font-black text-xs shadow-md">
                      <Send size={13} /> Rendre
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal rendu */}
      <AnimatePresence>
        {submitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Rendre le devoir</h2>
                  <p className="text-xs text-gray-500 mt-1">{submitModal.subjectName} — {submitModal.title}</p>
                </div>
                <button onClick={() => setSubmitModal(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Réponse (texte)</label>
                  <textarea rows={5} value={submitContent} onChange={e => setSubmitContent(e.target.value)}
                    placeholder="Écris ta réponse ici…"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm resize-none" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Ou joindre un fichier</label>
                  <input ref={fileRef} type="file" onChange={e => setSubmitFile(e.target.files?.[0] ?? null)} className="hidden" />
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-semibold text-bleu-600 border border-dashed border-bleu-300 rounded-xl px-4 py-2.5 w-full hover:border-bleu-500">
                    <Paperclip size={14} />
                    {submitFile ? submitFile.name : 'Joindre un fichier (PDF, image…)'}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setSubmitModal(null)} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-2xl h-11 font-bold">
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || (!submitContent && !submitFile)}
                  className="flex-1 bg-bleu-600 hover:bg-bleu-700 text-white rounded-2xl h-11 font-black">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} className="mr-2" />Envoyer</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EleveDevoirs;
