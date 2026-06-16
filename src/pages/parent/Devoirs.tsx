/**
 * ParentDevoirs — Vue parent des devoirs de ses enfants
 *
 * - Voir les devoirs donnés et leur statut
 * - Voir la photo du devoir rendu par l'enfant
 * - Voir la note et le commentaire du professeur
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle, BookOpen, Calendar, CheckCircle2, Clock,
  FileText, Loader2, MessageSquare, Paperclip, Star, X,
} from 'lucide-react';
import { Card } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { homeworkService, HomeworkResponse, isOverdue, statusColor, statusLabel } from '../../services/homeworkService';
import { apiRequest } from '../../services/api';

const isImageUrl = (url: string | null) =>
  !!url && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(url);

const ParentDevoirs: React.FC = () => {
  const { user, token } = useAuthStore();
  const [homeworks, setHomeworks] = useState<HomeworkResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    if (!user?.id || !token) return;
    const load = async () => {
      try {
        const family = await apiRequest<{ familyId: string }>('/users/me/family', { token });
        const hws = await homeworkService.getForFamily(family.familyId, user.id, token);
        setHomeworks(hws);
      } catch (e: any) {
        setError(e?.message ?? 'Impossible de charger les devoirs.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.id, token]);

  const myStatus = (hw: HomeworkResponse) => hw.mySubmission?.status ?? 'PENDING';

  const filtered = homeworks.filter(hw => {
    if (filter === 'pending')   return myStatus(hw) === 'PENDING';
    if (filter === 'submitted') return myStatus(hw) === 'SUBMITTED';
    if (filter === 'graded')    return myStatus(hw) === 'GRADED';
    return true;
  });

  const tabs = [
    { key: 'all'       as const, label: 'Tous',     count: homeworks.length },
    { key: 'pending'   as const, label: 'À rendre', count: homeworks.filter(h => myStatus(h) === 'PENDING').length },
    { key: 'submitted' as const, label: 'Rendus',   count: homeworks.filter(h => myStatus(h) === 'SUBMITTED').length },
    { key: 'graded'    as const, label: 'Notés',    count: homeworks.filter(h => myStatus(h) === 'GRADED').length },
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
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Devoirs</h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
              Suivez les devoirs de vos enfants
              {homeworks.filter(h => myStatus(h) === 'PENDING').length > 0 && (
                <span className="ml-2 text-orange-500">
                  · {homeworks.filter(h => myStatus(h) === 'PENDING').length} à rendre
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-0.5 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all',
                filter === tab.key
                  ? 'bg-white dark:bg-gray-800 text-bleu-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
              {tab.label}
              {tab.count > 0 && (
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
          <p className="text-sm text-gray-500">Vos enfants n'ont pas de devoir pour le moment.</p>
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
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-2xl flex-shrink-0',
                      status === 'GRADED'    ? 'bg-vert-50 dark:bg-vert-900/20 text-vert-600'
                        : status === 'SUBMITTED' ? 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600'
                        : overdue             ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500')}>
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black bg-bleu-50 dark:bg-bleu-900/30 text-bleu-600 px-2 py-0.5 rounded-lg">
                          {hw.className}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{hw.subjectName}</span>
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
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{hw.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={cn('text-[10px] font-bold flex items-center gap-1',
                          overdue ? 'text-red-500' : 'text-gray-400')}>
                          <Calendar size={10} />
                          {overdue ? '⚠ En retard · ' : 'Limite : '}
                          {new Date(hw.dueDate).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">Prof : {hw.teacherName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Photo/fichier du devoir donné par le prof */}
                  {hw.fileUrl && (
                    <div className="mt-4 ml-14">
                      {isImageUrl(hw.fileUrl) ? (
                        <a href={hw.fileUrl} target="_blank" rel="noreferrer">
                          <img src={hw.fileUrl} alt="Sujet du devoir"
                            className="rounded-2xl w-full max-h-44 object-contain border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5" />
                        </a>
                      ) : (
                        <a href={hw.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-bleu-600 hover:underline">
                          <Paperclip size={12} /> {hw.fileName ?? 'Fichier joint'}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Rendu de l'enfant */}
                  {hw.mySubmission && (
                    <div className="mt-4 ml-14 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                      <div className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Rendu de votre enfant
                        </p>
                        {hw.mySubmission.submittedAt && (
                          <p className="text-[10px] text-gray-400 font-semibold">
                            {new Date(hw.mySubmission.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>

                      {/* Photo rendu */}
                      {hw.mySubmission.fileUrl && isImageUrl(hw.mySubmission.fileUrl) ? (
                        <a href={hw.mySubmission.fileUrl} target="_blank" rel="noreferrer">
                          <img src={hw.mySubmission.fileUrl} alt="Rendu"
                            className="w-full max-h-52 object-contain bg-white dark:bg-gray-800" />
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

                      {/* Correction du prof */}
                      {(hw.mySubmission.grade !== null && hw.mySubmission.grade !== undefined) || hw.mySubmission.feedback ? (
                        <div className="px-4 py-3 bg-vert-50 dark:bg-vert-900/10 border-t border-vert-100 dark:border-vert-900/20 space-y-1.5">
                          <p className="text-[10px] font-black text-vert-700 dark:text-vert-400 uppercase tracking-widest mb-2">
                            Correction du professeur
                          </p>
                          {hw.mySubmission.grade !== null && hw.mySubmission.grade !== undefined && (
                            <p className="text-lg font-black text-vert-700 dark:text-vert-400 flex items-center gap-2">
                              <Star size={16} /> {hw.mySubmission.grade}/20
                            </p>
                          )}
                          {hw.mySubmission.feedback && (
                            <p className="text-xs text-vert-700 dark:text-vert-400 flex items-start gap-1.5">
                              <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />
                              {hw.mySubmission.feedback}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Pas encore rendu */}
                  {!hw.mySubmission && status === 'PENDING' && (
                    <div className={cn(
                      'mt-4 ml-14 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold',
                      overdue
                        ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'
                        : 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400',
                    )}>
                      <Clock size={12} />
                      {overdue ? 'Devoir non rendu (en retard)' : 'Devoir pas encore rendu'}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ParentDevoirs;
