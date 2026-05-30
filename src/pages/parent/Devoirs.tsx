import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Calendar, Star, MessageSquare, Paperclip,
  Loader2, Users, ChevronDown, FileText, CheckCircle2,
} from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { homeworkService, HomeworkResponse, isOverdue, statusColor, statusLabel } from '../../services/homeworkService';
import { apiRequest } from '../../services/api';

const ParentDevoirs: React.FC = () => {
  const { user, token } = useAuthStore();
  const [homeworks, setHomeworks] = useState<HomeworkResponse[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    if (!user?.id || !token) return;
    const load = async () => {
      try {
        const family = await apiRequest<{ familyId: string }>('/users/me/family', { token });
        setFamilyId(family.familyId);
        const hws = await homeworkService.getForFamily(family.familyId, user.id, token);
        setHomeworks(hws);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, token]);

  const myStatus = (hw: HomeworkResponse) => hw.mySubmission?.status ?? 'PENDING';

  const filtered = homeworks.filter(hw => {
    if (filter === 'pending') return myStatus(hw) === 'PENDING';
    if (filter === 'submitted') return myStatus(hw) === 'SUBMITTED';
    if (filter === 'graded') return myStatus(hw) === 'GRADED';
    return true;
  });

  const tabs = [
    { key: 'all' as const, label: 'Tous' },
    { key: 'pending' as const, label: 'À rendre' },
    { key: 'submitted' as const, label: 'Rendus' },
    { key: 'graded' as const, label: 'Notés' },
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
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Devoirs</h1>
            <p className="text-[11px] text-gray-500 font-semibold mt-1">
              Suivez les devoirs de vos enfants
            </p>
          </div>
        </div>
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

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Aucun devoir</h3>
          <p className="text-sm text-gray-500">Vos enfants n'ont pas de devoir pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(hw => {
            const status = myStatus(hw);
            const overdue = isOverdue(hw.dueDate) && status === 'PENDING';
            return (
              <Card key={hw.id} className={cn(
                'p-6 border-none shadow-soft bg-white dark:bg-gray-900/50',
                overdue && 'ring-2 ring-rouge-200 dark:ring-rouge-800/40',
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-2xl flex-shrink-0',
                    status === 'GRADED' ? 'bg-vert-50 dark:bg-vert-900/20 text-vert-600'
                      : status === 'SUBMITTED' ? 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600'
                      : overdue ? 'bg-rouge-50 dark:bg-rouge-900/20 text-rouge-500'
                      : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500')}>
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
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
                    {hw.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{hw.description}</p>}

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={cn('text-[10px] font-bold flex items-center gap-1',
                        overdue ? 'text-rouge-500' : 'text-gray-400')}>
                        <Calendar size={10} />
                        {overdue ? 'En retard · ' : 'Limite : '}
                        {new Date(hw.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">Prof : {hw.teacherName}</span>
                    </div>

                    {hw.fileUrl && (
                      <a href={hw.fileUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-bleu-600 font-bold mt-1.5 hover:underline">
                        <Paperclip size={10} /> {hw.fileName ?? 'Fichier joint'}
                      </a>
                    )}

                    {/* Rendu de l'enfant */}
                    {hw.mySubmission && (
                      <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 space-y-1.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rendu de l'enfant</p>
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
                            Avis du prof : {hw.mySubmission.feedback}
                          </p>
                        )}
                        {hw.mySubmission.submittedAt && (
                          <p className="text-[10px] text-gray-400 font-semibold">
                            Rendu le {new Date(hw.mySubmission.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
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
