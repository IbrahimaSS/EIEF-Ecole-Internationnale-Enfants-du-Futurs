/**
 * TeacherDevoirs — Espace devoirs du professeur
 *
 * - Création de devoir avec pièce jointe ou photo prise depuis le téléphone
 * - Visualisation des rendus des élèves (texte + photo)
 * - Notation directe depuis la liste des rendus
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, BookOpen, Calendar, Camera, CheckCircle2,
  ChevronDown, ChevronUp, Clock, FileText, Loader2,
  MessageSquare, Paperclip, Plus, Star, Upload, Users, X,
} from 'lucide-react';
import { Card, Button } from '../../components/ui';
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

const isImageUrl = (url: string | null) =>
  !!url && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(url);

const TeacherDevoirs: React.FC = () => {
  const { user, token } = useAuthStore();
  const [homeworks, setHomeworks]     = useState<HomeworkResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, HomeworkSubmissionResponse[]>>({});
  const [classSubjects, setClassSubjects] = useState<ClassSubjectOption[]>([]);
  const [csLoading, setCsLoading]     = useState(false);

  // Formulaire création
  const [form, setForm]         = useState({ classSubjectId: '', title: '', description: '', dueDate: '' });
  const [formFile, setFormFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Refs fichiers
  const fileRef   = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Notation
  const [gradeModal, setGradeModal] = useState<{ subId: string; grade: string; feedback: string; hwId: string } | null>(null);
  const [grading, setGrading]       = useState(false);

  // ── Chargement ──────────────────────────────────────────────────────────────

  const loadHomeworks = async () => {
    if (!user?.id || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await homeworkService.getByTeacher(user.id, token);
      setHomeworks(data);
    } catch (e: any) {
      setError(e?.message ?? 'Impossible de charger les devoirs.');
    } finally {
      setLoading(false);
    }
  };

  const loadClassSubjects = async () => {
    if (!user?.id || !token) return;
    setCsLoading(true);
    try {
      const data = await apiRequest<ClassSubjectOption[]>(
        `/class-subjects/teacher/${user.id}`,
        { token },
      );
      setClassSubjects(data);
    } catch {
      // Fallback : récupérer depuis les créneaux
      try {
        const schedules = await apiRequest<any[]>(
          `/schedules/teacher/${user.id}`,
          { token },
        );
        const seen = new Set<string>();
        const mapped: ClassSubjectOption[] = [];
        for (const s of schedules) {
          const key = s.classSubjectId ?? `${s.classId}-${s.subjectId}`;
          if (!seen.has(key) && s.classSubjectId) {
            seen.add(key);
            mapped.push({ id: s.classSubjectId, subjectName: s.subjectName, className: s.className });
          }
        }
        setClassSubjects(mapped);
      } catch {
        setCreateError('Impossible de charger les classes. Vérifiez votre connexion.');
      }
    } finally {
      setCsLoading(false);
    }
  };

  useEffect(() => { void loadHomeworks(); }, [user?.id, token]);

  const openCreate = () => {
    setForm({ classSubjectId: '', title: '', description: '', dueDate: '' });
    setFormFile(null);
    setPreviewUrl(null);
    setCreateError(null);
    setShowCreate(true);
    if (classSubjects.length === 0) void loadClassSubjects();
  };

  // ── Gestion fichier ─────────────────────────────────────────────────────────

  const attachFile = (file: File | undefined) => {
    if (!file) return;
    setFormFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setFormFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileRef.current)   fileRef.current.value   = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  // ── Création ────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    setCreateError(null);
    if (!form.classSubjectId) { setCreateError('Veuillez sélectionner une classe.'); return; }
    if (!form.title.trim())   { setCreateError('Le titre est obligatoire.'); return; }
    if (!form.dueDate)        { setCreateError('La date limite est obligatoire.'); return; }
    if (!token || !user?.id)  return;

    setSaving(true);
    try {
      const hw = await homeworkService.create(
        {
          classSubjectId: form.classSubjectId,
          title:          form.title.trim(),
          description:    form.description || undefined,
          dueDate:        form.dueDate + ':00',
        },
        user.id,
        token,
      );
      let finalHw = hw;
      if (formFile) {
        try {
          finalHw = await homeworkService.attachFile(hw.id, formFile, user.id, token);
        } catch {
          // devoir créé mais sans fichier — on continue
        }
      }
      setHomeworks(prev => [finalHw, ...prev]);
      setShowCreate(false);
      clearFile();
    } catch (e: any) {
      setCreateError(e?.message ?? 'Erreur lors de la publication du devoir. Vérifiez votre connexion.');
    } finally {
      setSaving(false);
    }
  };

  // ── Rendus ──────────────────────────────────────────────────────────────────

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
    loadSubmissions(hwId);
  };

  // ── Notation ────────────────────────────────────────────────────────────────

  const handleGrade = async () => {
    if (!gradeModal || !token || !user?.id) return;
    setGrading(true);
    try {
      const updated = await homeworkService.gradeSubmission(
        gradeModal.subId,
        { grade: parseFloat(gradeModal.grade), feedback: gradeModal.feedback },
        user.id,
        token,
      );
      setSubmissions(prev => ({
        ...prev,
        [gradeModal.hwId]: (prev[gradeModal.hwId] ?? []).map(s =>
          s.id === updated.id ? updated : s,
        ),
      }));
      // Mettre à jour le compteur sur le devoir parent
      setHomeworks(prev => prev.map(hw =>
        hw.id === gradeModal.hwId
          ? { ...hw, submissions: (hw.submissions ?? []).map(s => s.id === updated.id ? updated : s) }
          : hw,
      ));
      setGradeModal(null);
    } catch (e: any) {
      alert(e?.message ?? 'Erreur lors de la notation.');
    } finally {
      setGrading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 size={36} className="animate-spin text-bleu-500" />
    </div>
  );

  const pendingGrades = Object.values(submissions).flat().filter(s => s.status === 'SUBMITTED').length;

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
              {homeworks.length} devoir{homeworks.length > 1 ? 's' : ''}
              {pendingGrades > 0 && (
                <span className="ml-2 text-or-600">· {pendingGrades} rendu{pendingGrades > 1 ? 's' : ''} à corriger</span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={openCreate}
          className="flex items-center gap-2 bg-bleu-600 hover:bg-bleu-700 text-white rounded-2xl px-5 h-11 font-black text-sm shadow-md">
          <Plus size={16} /> Nouveau devoir
        </Button>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-semibold">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
          <button onClick={loadHomeworks} className="ml-auto underline text-xs">Réessayer</button>
        </div>
      )}

      {/* ── Modale création ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between z-10">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Nouveau devoir</h2>
                <button onClick={() => setShowCreate(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Classe / Matière */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Classe / Matière *
                  </label>
                  {csLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 size={14} className="animate-spin" /> Chargement des classes…
                    </div>
                  ) : classSubjects.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle size={14} />
                      Aucune classe trouvée.
                      <button onClick={() => void loadClassSubjects()} className="underline text-xs ml-1">Réessayer</button>
                    </div>
                  ) : (
                    <select
                      value={form.classSubjectId}
                      onChange={e => setForm(p => ({ ...p, classSubjectId: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-bleu-500/30">
                      <option value="">-- Sélectionner --</option>
                      {classSubjects.map(cs => (
                        <option key={cs.id} value={cs.id}>{cs.className} — {cs.subjectName}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Titre */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Titre *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ex : Exercices chapitre 3"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-bleu-500/30" />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Consignes</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Instructions, exercices à faire…"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-bleu-500/30" />
                </div>

                {/* Date limite */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Date limite *</label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-bleu-500/30" />
                </div>

                {/* Fichier / Photo */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Photo du devoir (optionnel)
                  </label>

                  {/* Inputs cachés — NE PAS utiliser display:none sur l'input capture (iOS ignore l'attribut) */}
                  <input ref={fileRef} type="file" accept="image/*,application/pdf"
                    onChange={e => attachFile(e.target.files?.[0])}
                    style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }} />
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                    onChange={e => attachFile(e.target.files?.[0])}
                    style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }} />

                  {!formFile ? (
                    <div className="flex gap-3">
                      {/* Bouton caméra — s'ouvre directement sur mobile */}
                      <button type="button"
                        onClick={() => cameraRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 border-dashed border-bleu-200 dark:border-bleu-800 bg-bleu-50/50 dark:bg-bleu-900/10 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 transition-colors text-bleu-600 dark:text-bleu-400">
                        <Camera size={22} />
                        <span className="text-xs font-black">Prendre une photo</span>
                      </button>
                      <button type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500">
                        <Paperclip size={22} />
                        <span className="text-xs font-black">Choisir un fichier</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Aperçu" className="w-full max-h-48 object-cover" />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/5">
                          <Paperclip size={16} className="text-bleu-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{formFile.name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-white/10">
                        <span className="text-[11px] font-bold text-gray-400">
                          {(formFile.size / 1024).toFixed(0)} Ko
                        </span>
                        <button onClick={clearFile} className="text-xs text-red-500 font-bold hover:text-red-600 flex items-center gap-1">
                          <X size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Erreur création */}
                {createError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-semibold">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {createError}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 pb-6 pt-4 border-t border-gray-100 dark:border-white/10 flex gap-3">
                <Button onClick={() => setShowCreate(false)}
                  className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-2xl h-12 font-bold text-sm">
                  Annuler
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={saving || !form.classSubjectId || !form.title || !form.dueDate}
                  className="flex-1 bg-bleu-600 hover:bg-bleu-700 disabled:opacity-50 text-white rounded-2xl h-12 font-black text-sm shadow-md">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={14} className="mr-1.5" />Publier</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Liste des devoirs ── */}
      {homeworks.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <BookOpen size={40} className="text-gray-300" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Aucun devoir</h3>
            <p className="text-sm text-gray-500">Publiez votre premier devoir pour vos élèves.</p>
          </div>
          <Button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-bleu-600 hover:bg-bleu-700 text-white rounded-2xl px-6 h-11 font-black text-sm mx-auto">
            <Plus size={14} /> Créer un devoir
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {homeworks.map(hw => {
            const subs = submissions[hw.id];
            const correctionCount = subs?.filter(s => s.status === 'SUBMITTED').length ?? 0;
            return (
              <Card key={hw.id} className="p-0 border-none shadow-soft overflow-hidden bg-white dark:bg-gray-900/50">

                {/* En-tête cliquable */}
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpand(hw.id)}>
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={cn('p-3 rounded-2xl flex-shrink-0',
                      isOverdue(hw.dueDate) ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                        : 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600')}>
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-bleu-50 dark:bg-bleu-900/30 text-bleu-600 px-2 py-0.5 rounded-lg">
                          {hw.className}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{hw.subjectName}</span>
                        {correctionCount > 0 && (
                          <span className="text-[10px] font-black text-or-600 bg-or-50 dark:bg-or-900/20 px-2 py-0.5 rounded-lg">
                            {correctionCount} à corriger
                          </span>
                        )}
                      </div>
                      <p className="font-black text-gray-900 dark:text-white text-sm">{hw.title}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className={cn('text-[10px] font-bold flex items-center gap-1',
                          isOverdue(hw.dueDate) ? 'text-red-500' : 'text-gray-400')}>
                          <Calendar size={10} />
                          {new Date(hw.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Users size={10} /> {hw.submittedCount}/{hw.totalStudents} rendus
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-bold text-gray-400 text-right mb-1">
                        {hw.totalStudents > 0 ? Math.round((hw.submittedCount / hw.totalStudents) * 100) : 0}%
                      </p>
                      <div className="w-20 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full">
                        <div className="h-full bg-vert-500 rounded-full transition-all"
                          style={{ width: hw.totalStudents > 0 ? `${(hw.submittedCount / hw.totalStudents) * 100}%` : '0%' }} />
                      </div>
                    </div>
                    {expandedId === hw.id
                      ? <ChevronUp size={18} className="text-gray-400" />
                      : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </button>

                {/* Détail déroulant */}
                <AnimatePresence initial={false}>
                  {expandedId === hw.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-gray-100 dark:border-white/10">
                      <div className="p-5 space-y-5">

                        {/* Infos du devoir */}
                        {hw.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{hw.description}</p>
                        )}
                        {hw.fileUrl && (
                          isImageUrl(hw.fileUrl) ? (
                            <a href={hw.fileUrl} target="_blank" rel="noreferrer">
                              <img src={hw.fileUrl} alt="Devoir" className="rounded-2xl max-h-56 object-contain border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5" />
                            </a>
                          ) : (
                            <a href={hw.fileUrl} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-bold text-bleu-600 hover:underline">
                              <Paperclip size={12} /> {hw.fileName ?? 'Fichier joint'}
                            </a>
                          )
                        )}

                        {/* Rendus */}
                        <div>
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                            Rendus des élèves ({(subs ?? []).length} / {hw.totalStudents})
                          </h3>

                          {subs === undefined ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Loader2 size={14} className="animate-spin" /> Chargement…
                            </div>
                          ) : subs.length === 0 ? (
                            <p className="text-sm text-gray-400 font-semibold">Aucun rendu pour l'instant.</p>
                          ) : (
                            <div className="space-y-3">
                              {subs.map(sub => (
                                <div key={sub.id}
                                  className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-white/5">
                                  <div className="flex items-start justify-between gap-3 p-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                      {sub.content && (
                                        <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">"{sub.content}"</p>
                                      )}
                                      {sub.submittedAt && (
                                        <p className="text-[10px] text-gray-400 font-semibold">
                                          Rendu le {new Date(sub.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      )}
                                      {sub.feedback && (
                                        <p className="text-xs text-vert-700 dark:text-vert-400 mt-1.5 flex items-start gap-1.5">
                                          <MessageSquare size={10} className="mt-0.5 flex-shrink-0" /> {sub.feedback}
                                        </p>
                                      )}
                                    </div>
                                    {sub.status !== 'GRADED' && (
                                      <Button
                                        onClick={() => setGradeModal({ subId: sub.id, hwId: hw.id, grade: '', feedback: '' })}
                                        className="flex-shrink-0 text-xs bg-or-500 hover:bg-or-600 text-white px-3 py-2 rounded-xl font-black flex items-center gap-1">
                                        <Star size={11} /> Corriger
                                      </Button>
                                    )}
                                  </div>

                                  {/* Photo rendu élève */}
                                  {sub.fileUrl && (
                                    isImageUrl(sub.fileUrl) ? (
                                      <a href={sub.fileUrl} target="_blank" rel="noreferrer">
                                        <img src={sub.fileUrl} alt="Rendu" className="w-full max-h-48 object-contain border-t border-gray-100 dark:border-white/10 bg-white dark:bg-gray-800" />
                                      </a>
                                    ) : (
                                      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
                                        <a href={sub.fileUrl} target="_blank" rel="noreferrer"
                                          className="text-xs text-bleu-600 font-bold flex items-center gap-1.5 hover:underline">
                                          <Paperclip size={11} /> {sub.fileName}
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
            );
          })}
        </div>
      )}

      {/* ── Modale notation ── */}
      <AnimatePresence>
        {gradeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setGradeModal(null); }}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Corriger le devoir</h2>
                <button onClick={() => setGradeModal(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Note /20</label>
                  <input type="number" min="0" max="20" step="0.5"
                    value={gradeModal.grade}
                    onChange={e => setGradeModal(p => p ? { ...p, grade: e.target.value } : p)}
                    placeholder="Ex : 14"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-3 text-2xl font-black text-center focus:outline-none focus:ring-2 focus:ring-or-500/30" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Commentaire</label>
                  <textarea rows={3} value={gradeModal.feedback}
                    onChange={e => setGradeModal(p => p ? { ...p, feedback: e.target.value } : p)}
                    placeholder="Appréciation, conseils…"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-or-500/30" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setGradeModal(null)}
                  className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-2xl h-12 font-bold text-sm">
                  Annuler
                </Button>
                <Button onClick={handleGrade} disabled={grading || !gradeModal.grade}
                  className="flex-1 bg-or-500 hover:bg-or-600 disabled:opacity-50 text-white rounded-2xl h-12 font-black text-sm">
                  {grading ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={14} className="mr-1.5" />Valider</>}
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
