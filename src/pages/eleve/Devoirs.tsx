/**
 * EleveDevoirs — Espace devoirs de l'élève
 *
 * - Voir les devoirs donnés par le professeur (texte + photo)
 * - Rendre un devoir : prendre une photo depuis le téléphone ou joindre un fichier
 * - Voir la note et le commentaire du professeur
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, BookOpen, Calendar, Camera, CheckCircle2,
  Clock, FileText, Loader2, MessageSquare, Paperclip, Send,
  Star, Upload, X,
} from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import {
  homeworkService, HomeworkResponse, HomeworkSubmissionResponse,
  isOverdue, statusColor, statusLabel,
} from '../../services/homeworkService';

const isImageUrl = (url: string | null) =>
  !!url && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(url);

const EleveDevoirs: React.FC = () => {
  const { user, token } = useAuthStore();
  const [homeworks, setHomeworks]   = useState<HomeworkResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  // Modal rendu
  const [submitModal, setSubmitModal]   = useState<HomeworkResponse | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitFile, setSubmitFile]     = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  const fileRef   = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // ── Chargement ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id || !token) return;
    setLoading(true);
    homeworkService.getForStudent(user.id, token)
      .then(setHomeworks)
      .catch((e: any) => setError(e?.message ?? 'Impossible de charger les devoirs.'))
      .finally(() => setLoading(false));
  }, [user?.id, token]);

  // ── Filtres ─────────────────────────────────────────────────────────────────

  const myStatus = (hw: HomeworkResponse) => hw.mySubmission?.status ?? 'PENDING';

  const filtered = homeworks.filter(hw => {
    if (filter === 'pending')   return myStatus(hw) === 'PENDING';
    if (filter === 'submitted') return myStatus(hw) === 'SUBMITTED';
    if (filter === 'graded')    return myStatus(hw) === 'GRADED';
    return true;
  });

  // ── Gestion fichier ─────────────────────────────────────────────────────────

  const attachFile = (file: File | undefined) => {
    if (!file) return;
    setSubmitFile(file);
    setSubmitContent('');
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setSubmitFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileRef.current)   fileRef.current.value   = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  const openModal = (hw: HomeworkResponse) => {
    setSubmitModal(hw);
    setSubmitContent('');
    clearFile();
    setSubmitError(null);
  };

  // ── Soumission ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!submitModal || !token || !user?.id) return;
    if (!submitFile && !submitContent.trim()) {
      setSubmitError('Ajoute une réponse ou une photo avant d\'envoyer.');
      return;
    }
    setSubmitError(null);
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
        hw.id === submitModal.id
          ? { ...hw, mySubmission: updated, submittedCount: hw.submittedCount + 1 }
          : hw,
      ));
      setSubmitModal(null);
      clearFile();
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Erreur lors de l\'envoi. Réessaie.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const tabs: { key: typeof filter; label: string; count?: number }[] = [
    { key: 'all',       label: 'Tous',    count: homeworks.length },
    { key: 'pending',   label: 'À rendre', count: homeworks.filter(h => myStatus(h) === 'PENDING').length },
    { key: 'submitted', label: 'Rendus',   count: homeworks.filter(h => myStatus(h) === 'SUBMITTED').length },
    { key: 'graded',    label: 'Notés',    count: homeworks.filter(h => myStatus(h) === 'GRADED').length },
  ];

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
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Mes Devoirs</h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              {homeworks.filter(hw => myStatus(hw) === 'PENDING').length} devoir(s) à rendre
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-0.5 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all',
                filter === tab.key
                  ? 'bg-white dark:bg-gray-800 text-bleu-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded-full',
                  filter === tab.key
                    ? 'bg-bleu-100 dark:bg-bleu-900/30 text-bleu-600'
                    : 'bg-gray-200 dark:bg-white/10 text-gray-500')}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-semibold">
          <AlertCircle size={18} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Liste ── */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Aucun devoir</h3>
          <p className="text-sm text-gray-500">Profites-en pour réviser !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(hw => {
            const status  = myStatus(hw);
            const overdue = isOverdue(hw.dueDate) && status === 'PENDING';
            return (
              <Card key={hw.id} className={cn(
                'border-none shadow-soft bg-white dark:bg-gray-900/50 overflow-hidden',
                overdue && 'ring-2 ring-red-200 dark:ring-red-800/40',
              )}>
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className={cn('p-3 rounded-2xl flex-shrink-0',
                        status === 'GRADED'    ? 'bg-vert-50 dark:bg-vert-900/20 text-vert-600'
                          : status === 'SUBMITTED' ? 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600'
                          : overdue             ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                          : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500')}>
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
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
                        {hw.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{hw.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className={cn('text-[10px] font-bold flex items-center gap-1',
                            overdue ? 'text-red-500' : 'text-gray-400')}>
                            <Calendar size={10} />
                            {overdue ? '⚠ En retard · ' : ''}
                            {new Date(hw.dueDate).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">Prof : {hw.teacherName}</span>
                        </div>
                      </div>
                    </div>

                    {status === 'PENDING' && (
                      <Button
                        onClick={() => openModal(hw)}
                        className="flex-shrink-0 flex items-center gap-2 bg-bleu-600 hover:bg-bleu-700 text-white px-4 py-2.5 rounded-2xl font-black text-xs shadow-md">
                        <Send size={13} /> Rendre
                      </Button>
                    )}
                  </div>

                  {/* Photo/fichier du devoir */}
                  {hw.fileUrl && (
                    <div className="mt-4">
                      {isImageUrl(hw.fileUrl) ? (
                        <a href={hw.fileUrl} target="_blank" rel="noreferrer">
                          <img src={hw.fileUrl} alt="Devoir"
                            className="rounded-2xl w-full max-h-52 object-contain bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10" />
                        </a>
                      ) : (
                        <a href={hw.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-bleu-600 hover:underline mt-1">
                          <Paperclip size={12} /> {hw.fileName ?? 'Fichier joint'}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Mon rendu */}
                  {hw.mySubmission && (
                    <div className="mt-4 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 dark:bg-white/5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mon rendu</p>
                      </div>
                      {hw.mySubmission.fileUrl && isImageUrl(hw.mySubmission.fileUrl) ? (
                        <a href={hw.mySubmission.fileUrl} target="_blank" rel="noreferrer">
                          <img src={hw.mySubmission.fileUrl} alt="Mon rendu"
                            className="w-full max-h-48 object-contain bg-white dark:bg-gray-800" />
                        </a>
                      ) : hw.mySubmission.fileUrl ? (
                        <div className="px-4 py-2.5">
                          <a href={hw.mySubmission.fileUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-bleu-600 font-bold hover:underline">
                            <Paperclip size={11} /> {hw.mySubmission.fileName}
                          </a>
                        </div>
                      ) : null}
                      {hw.mySubmission.content && (
                        <div className="px-4 py-3">
                          <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{hw.mySubmission.content}"</p>
                        </div>
                      )}
                      {(hw.mySubmission.feedback || hw.mySubmission.grade !== null) && (
                        <div className="px-4 py-3 bg-vert-50 dark:bg-vert-900/10 border-t border-vert-100 dark:border-vert-900/20 space-y-1">
                          {hw.mySubmission.grade !== null && (
                            <p className="text-sm font-black text-vert-700 dark:text-vert-400 flex items-center gap-2">
                              <Star size={14} /> Note : {hw.mySubmission.grade}/20
                            </p>
                          )}
                          {hw.mySubmission.feedback && (
                            <p className="text-xs text-vert-700 dark:text-vert-400 flex items-start gap-1.5">
                              <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />
                              {hw.mySubmission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                      {hw.mySubmission.submittedAt && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-white/10">
                          <p className="text-[10px] text-gray-400 font-semibold">
                            Rendu le {new Date(hw.mySubmission.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Modale rendu ── */}
      <AnimatePresence>
        {submitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setSubmitModal(null); }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">

              <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/10 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">Rendre le devoir</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{submitModal.subjectName} — {submitModal.title}</p>
                  </div>
                  <button onClick={() => setSubmitModal(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 flex-shrink-0">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Option 1 : Photo depuis le téléphone */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                    📷 Envoyer une photo de ton devoir
                  </label>

                  <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                    onChange={e => attachFile(e.target.files?.[0])}
                    style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }} />
                  <input ref={fileRef} type="file" accept="image/*,application/pdf"
                    onChange={e => attachFile(e.target.files?.[0])}
                    style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }} />

                  {!submitFile ? (
                    <div className="flex gap-3">
                      <button type="button" onClick={() => cameraRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-2.5 py-6 rounded-2xl border-2 border-dashed border-bleu-200 dark:border-bleu-800 bg-bleu-50/50 dark:bg-bleu-900/10 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 transition-colors">
                        <Camera size={28} className="text-bleu-600 dark:text-bleu-400" />
                        <span className="text-xs font-black text-bleu-600 dark:text-bleu-400">Prendre une photo</span>
                      </button>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-2.5 py-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <Upload size={28} className="text-gray-400" />
                        <span className="text-xs font-black text-gray-500">Choisir un fichier</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Aperçu" className="w-full max-h-56 object-contain bg-gray-50 dark:bg-white/5" />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/5">
                          <Paperclip size={16} className="text-bleu-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{submitFile.name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
                        <span className="text-[11px] font-bold text-gray-400">
                          {(submitFile.size / 1024).toFixed(0)} Ko
                        </span>
                        <button onClick={clearFile} className="text-xs text-red-500 font-bold hover:text-red-600 flex items-center gap-1">
                          <X size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Séparateur */}
                {!submitFile && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">ou</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                  </div>
                )}

                {/* Option 2 : Réponse texte */}
                {!submitFile && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                      ✍ Réponse écrite
                    </label>
                    <textarea rows={5} value={submitContent}
                      onChange={e => setSubmitContent(e.target.value)}
                      placeholder="Écris ta réponse ici…"
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-bleu-500/30" />
                  </div>
                )}

                {submitError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-semibold">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {submitError}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 pb-6 pt-4 border-t border-gray-100 dark:border-white/10 flex gap-3">
                <Button onClick={() => setSubmitModal(null)}
                  className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-2xl h-12 font-bold text-sm">
                  Annuler
                </Button>
                <Button onClick={handleSubmit}
                  disabled={submitting || (!submitContent.trim() && !submitFile)}
                  className="flex-1 bg-bleu-600 hover:bg-bleu-700 disabled:opacity-50 text-white rounded-2xl h-12 font-black text-sm shadow-md">
                  {submitting
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><Send size={14} className="mr-1.5" />Envoyer</>}
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
