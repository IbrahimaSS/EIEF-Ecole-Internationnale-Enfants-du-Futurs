import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CornerDownRight,
  Loader2,
  Megaphone,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import { Avatar, Badge, Button, Card, Input, StatCard } from '../../components/ui';
import { cn } from '../../utils/cn';
import {
  AnnouncementResponse,
  ForumPostResponse,
  addForumReply,
  createForumTopic,
  getAnnouncements,
  getForumTopics,
} from '../../services/communicationApi';
import { useAuthStore } from '../../store/authStore';
import MessagingPanel from '../../components/shared/MessagingPanel';

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const targetRoleLabel = (role: string | null | undefined) => {
  const map: Record<string, string> = { PARENT: 'Parents', TEACHER: 'Enseignants', STUDENT: 'Élèves' };
  return role ? map[role] ?? role : 'Tous';
};

const ParentCommunication: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'annonces' | 'messagerie' | 'forum'>('annonces');
  const [annonces, setAnnonces] = useState<AnnouncementResponse[]>([]);
  const [topics, setTopics] = useState<ForumPostResponse[]>([]);
  const [expandedForumId, setExpandedForumId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [topicSubject, setTopicSubject] = useState('');
  const [topicBody, setTopicBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [a, t] = await Promise.all([getAnnouncements('PARENT'), getForumTopics()]);
      setAnnonces(a);
      setTopics(t);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTopic = async () => {
    if (!user?.id || !topicSubject.trim() || !topicBody.trim()) return;
    setSubmitting(true);
    try {
      const created = await createForumTopic(user.id, {
        subject: topicSubject.trim(),
        body: topicBody.trim(),
      });
      setTopics((prev) => [created, ...prev]);
      setTopicSubject('');
      setTopicBody('');
      setIsAddTopicOpen(false);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la création du sujet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (topicId: string) => {
    const body = replyTexts[topicId]?.trim();
    if (!user?.id || !body) return;
    setSendingReply(topicId);
    try {
      const reply = await addForumReply(topicId, user.id, { subject: 'Réponse', body });
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId ? { ...t, replies: [...(t.replies ?? []), reply] } : t,
        ),
      );
      setReplyTexts((prev) => ({ ...prev, [topicId]: '' }));
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la réponse.');
    } finally {
      setSendingReply(null);
    }
  };

  const urgentCount = annonces.filter(
    (a) => /urgent|alerte/i.test(a.title) || /urgent|alerte/i.test(a.content),
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rouge-100 bg-rouge-50 p-4 text-rouge-600 dark:border-rouge-500/20 dark:bg-rouge-900/20 dark:text-rouge-400">
          <AlertCircle size={18} />
          <span className="text-sm font-bold flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-xs">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-vert-600 to-bleu-700 p-3 text-white shadow-lg">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Communication
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-vert-700 dark:text-or-400">
              Échanges avec l'école · Restez informé
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(['annonces', 'messagerie', 'forum'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-vert-600 text-white shadow-md dark:bg-or-500 dark:text-gray-950'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400',
              )}
            >
              {tab === 'annonces' ? 'Annonces' : tab === 'messagerie' ? 'Messagerie' : 'Forum'}
            </button>
          ))}
        </div>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Annonces"
          value={loading ? '…' : String(annonces.length)}
          subtitle="Diffusées par l'école"
          icon={<Megaphone />}
          color="vert"
        />
        <StatCard
          title="Sujets forum"
          value={loading ? '…' : String(topics.length)}
          subtitle="Discussions ouvertes"
          icon={<MessageSquare />}
          color="or"
        />
        <StatCard
          title="Annonces urgentes"
          value={loading ? '…' : String(urgentCount)}
          subtitle="Alertes prioritaires"
          icon={<AlertCircle />}
          color="rouge"
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Annonces */}
        {activeTab === 'annonces' && (
          <motion.div
            key="annonces"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Toutes les annonces</h2>
              <button
                onClick={loadData}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-vert-600 dark:hover:bg-white/5 dark:hover:text-or-400"
                title="Actualiser"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {loading && annonces.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm font-bold text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Chargement...
              </div>
            ) : annonces.length === 0 ? (
              <Card className="p-12 text-center border-none shadow-soft dark:bg-gray-900/50">
                <Megaphone size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-500">Aucune annonce pour le moment.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {annonces.map((ann) => {
                  const urgent = /urgent|alerte/i.test(ann.title) || /urgent|alerte/i.test(ann.content);
                  return (
                    <Card
                      key={ann.id}
                      className={cn(
                        'p-5 border-none shadow-soft text-left',
                        urgent
                          ? 'bg-rouge-50/50 ring-1 ring-rouge-200 dark:bg-rouge-900/10 dark:ring-rouge-500/30'
                          : 'dark:bg-gray-900/50',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base font-black text-gray-900 dark:text-white">{ann.title}</h3>
                        {urgent && <Badge variant="error" className="border-none">URGENT</Badge>}
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                        {ann.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest">
                        <span className="px-2 py-0.5 rounded-md bg-vert-50 text-vert-700 dark:bg-or-500/10 dark:text-or-400">
                          {targetRoleLabel(ann.targetRole)}
                        </span>
                        <span className="text-gray-400">{formatDate(ann.publishedAt)}</span>
                        <span className="text-gray-400">par {ann.authorName}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Messagerie temps réel */}
        {activeTab === 'messagerie' && (
          <motion.div
            key="messagerie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MessagingPanel
              title="Messagerie"
              subtitle="Échangez avec les enseignants et la direction"
              filterRoles={['TEACHER', 'ADMIN', 'COORDINATOR', 'ENSEIGNANT']}
              height={650}
            />
          </motion.div>
        )}

        {/* Forum */}
        {activeTab === 'forum' && (
          <motion.div
            key="forum"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Forum communautaire</h2>
              <Button
                onClick={() => setIsAddTopicOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-vert-600 to-vert-700 text-white"
              >
                <Plus size={14} /> Nouveau sujet
              </Button>
            </div>

            {/* Modal nouveau sujet */}
            {isAddTopicOpen && (
              <Card className="p-5 border-none shadow-soft dark:bg-gray-900/50 space-y-3">
                <h3 className="text-base font-black text-gray-900 dark:text-white">Lancer un sujet</h3>
                <Input
                  value={topicSubject}
                  onChange={(e) => setTopicSubject(e.target.value)}
                  placeholder="Sujet de la discussion..."
                />
                <textarea
                  value={topicBody}
                  onChange={(e) => setTopicBody(e.target.value)}
                  placeholder="Décrivez votre question ou votre proposition..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddTopicOpen(false);
                      setTopicSubject('');
                      setTopicBody('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleCreateTopic}
                    disabled={!topicSubject.trim() || !topicBody.trim() || submitting}
                    className="bg-gradient-to-r from-vert-600 to-vert-700 text-white"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Publier'}
                  </Button>
                </div>
              </Card>
            )}

            {topics.length === 0 ? (
              <Card className="p-12 text-center border-none shadow-soft dark:bg-gray-900/50">
                <Users size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-500">
                  Aucun sujet pour le moment. Lancez la conversation !
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {topics.map((topic) => {
                  const expanded = expandedForumId === topic.id;
                  return (
                    <Card
                      key={topic.id}
                      className="p-5 border-none shadow-soft cursor-pointer dark:bg-gray-900/50"
                      onClick={() => setExpandedForumId(expanded ? null : topic.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar name={topic.authorName} size="sm" />
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="text-sm font-black text-gray-900 dark:text-white">{topic.subject}</h3>
                          <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-2">{topic.body}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>{topic.authorName}</span>
                            <span>·</span>
                            <span>{formatDate(topic.postedAt)}</span>
                            <span>·</span>
                            <span className="text-vert-700 dark:text-or-400">
                              {topic.replies?.length || 0} réponse{(topic.replies?.length || 0) > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {expanded && (
                        <div className="mt-4 ml-11 space-y-3 border-l-2 border-vert-200 dark:border-or-500/30 pl-4">
                          {topic.replies?.map((r) => (
                            <div key={r.id} className="flex items-start gap-2">
                              <CornerDownRight size={14} className="text-gray-400 mt-1 shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-black text-gray-900 dark:text-white">{r.authorName}</span>
                                  <span className="text-[9px] font-bold text-gray-400">{formatDate(r.postedAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{r.body}</p>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={replyTexts[topic.id] || ''}
                              onChange={(e) =>
                                setReplyTexts((prev) => ({ ...prev, [topic.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleReply(topic.id);
                              }}
                              placeholder="Votre réponse..."
                              className="flex-1"
                            />
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(topic.id);
                              }}
                              disabled={!replyTexts[topic.id]?.trim() || sendingReply === topic.id}
                              className="bg-vert-600 text-white"
                            >
                              {sendingReply === topic.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ParentCommunication;
