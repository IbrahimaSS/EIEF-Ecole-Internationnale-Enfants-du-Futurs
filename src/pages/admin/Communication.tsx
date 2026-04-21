import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Bell, Users, AlertCircle, CheckCircle2,
  Clock, Smartphone, ChevronRight, MoreVertical, Megaphone,
  X, History, Activity, Filter, Eye, Trash2, Edit, Zap, Loader2,
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar, Modal, Input, Select, Popover } from '../../components/ui';
import { cn } from '../../utils/cn';

import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getForumTopics,
  createForumTopic,
  addForumReply,
  deleteForumTopic,
  getInbox,
  AnnouncementResponse,
  ForumPostResponse,
  MessageResponse,
} from '../../services/communicationApi';

// ─── Hook auth ────────────────────────────────────────────────────────────────

const useAuthUser = () => {
  try {
    const raw = window.localStorage.getItem('auth-storage');
    if (!raw) return { userId: null, userName: 'Moi' };
    const parsed = JSON.parse(raw);
    return {
      userId: parsed?.state?.user?.id ?? null,
      userName: parsed?.state?.user?.name ?? 'Moi',
    };
  } catch {
    return { userId: null, userName: 'Moi' };
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const minutes = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

/** Backend role → label UI */
const targetRoleLabel = (role: string | null | undefined): string => {
  const map: Record<string, string> = {
    PARENT: 'Parents',
    TEACHER: 'Enseignants',
    STUDENT: 'Élèves',
  };
  return role ? (map[role] ?? role) : 'Tous';
};

/** Label UI → backend role (undefined = tous) */
const audienceToRole = (audience: string): string | undefined => {
  const map: Record<string, string> = {
    Parents: 'PARENT',
    Enseignants: 'TEACHER',
    'Élèves': 'STUDENT',
  };
  return map[audience];
};

// ─── Composant ───────────────────────────────────────────────────────────────

const AdminCommunication: React.FC = () => {
  const { userId, userName } = useAuthUser();

  // Tabs & filtres
  const [activeMainTab, setActiveMainTab] = useState<'messagerie' | 'forum'>('messagerie');
  const [activeFilter, setActiveFilter] = useState<'Tous' | 'Annonce' | 'Message' | 'Urgent'>('Tous');

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Message transmis !');

  // Formulaires
  const [selectedAudience, setSelectedAudience] = useState('Tous');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementType, setAnnouncementType] = useState<'annonce' | 'message' | 'urgent'>('annonce');
  const [topicSubject, setTopicSubject] = useState('');
  const [topicBody, setTopicBody] = useState('');
  const [replyText, setReplyText] = useState('');
  const [testPhone, setTestPhone] = useState('');

  // UI
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedForumId, setExpandedForumId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Données
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumPostResponse[]>([]);
  const [inbox, setInbox] = useState<MessageResponse[]>([]);

  // ── Chargement ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ann, topics] = await Promise.all([getAnnouncements(), getForumTopics()]);
      setAnnouncements(ann);
      setForumTopics(topics);
      if (userId) {
        setInbox(await getInbox(userId));
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur de chargement des données.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Toast ──────────────────────────────────────────────────────────────────

  const showSuccess = (msg = 'Message transmis !') => {
    setSuccessMsg(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  // ── Actions annonces ──────────────────────────────────────────────────────

  const handleCreateAnnouncement = async () => {
    if (!userId || !announcementTitle.trim() || !announcementContent.trim()) return;
    setSubmitting(true);
    try {
      const created = await createAnnouncement(userId, {
        title: announcementTitle,
        content: announcementContent,
        targetRole: audienceToRole(selectedAudience),
      });
      setAnnouncements((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setSelectedAudience('Tous');
      showSuccess('Annonce diffusée avec succès !');
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la création de l'annonce.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setOpenMenuId(null);
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showSuccess('Annonce supprimée.');
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la suppression.');
    }
  };

  // ── Actions forum ─────────────────────────────────────────────────────────

  const handleCreateTopic = async () => {
    if (!userId || !topicSubject.trim() || !topicBody.trim()) return;
    setSubmitting(true);
    try {
      const created = await createForumTopic(userId, { subject: topicSubject, body: topicBody });
      setForumTopics((prev) => [created, ...prev]);
      setIsAddTopicModalOpen(false);
      setTopicSubject('');
      setTopicBody('');
      showSuccess('Sujet publié avec succès !');
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la création du sujet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (topicId: string) => {
    if (!userId || !replyText.trim()) return;
    setSubmitting(true);
    try {
      const reply = await addForumReply(topicId, userId, { subject: 'Réponse', body: replyText });
      setForumTopics((prev) =>
        prev.map((t) => t.id === topicId ? { ...t, replies: [...(t.replies ?? []), reply] } : t)
      );
      setReplyText('');
      showSuccess('Réponse envoyée !');
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de l'envoi de la réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await deleteForumTopic(id);
      setForumTopics((prev) => prev.filter((t) => t.id !== id));
      showSuccess('Sujet supprimé.');
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la suppression du sujet.');
    }
  };

  // ── Données dérivées ──────────────────────────────────────────────────────

  type UiMessage = {
    id: string;
    titre: string;
    contenu: string;
    date: string;
    cible: string;
    statut: string;
    type: 'Annonce' | 'Message' | 'Urgent';
    urgent: boolean;
  };

  const uiMessages: UiMessage[] = announcements.map((a) => ({
    id: a.id,
    titre: a.title,
    contenu: a.content,
    date: formatDate(a.publishedAt),
    cible: targetRoleLabel(a.targetRole),   // string | null → accepté
    statut: 'Envoyé',
    type: 'Annonce',
    urgent: false,
  }));

  const filteredMessages =
    activeFilter === 'Tous'
      ? uiMessages
      : uiMessages.filter((m) => m.type === activeFilter || (activeFilter === 'Urgent' && m.urgent));

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Bandeau erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-rouge-50 dark:bg-rouge-900/20 border border-rouge-100 dark:border-rouge-500/20 rounded-2xl text-rouge-600 dark:text-rouge-400 text-sm font-semibold"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rouge-100 rounded-lg transition-all">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2" onClick={() => setOpenMenuId(null)}>
        <div className="text-left font-bold">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-soft">
              <Megaphone className="text-bleu-600 dark:text-bleu-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight uppercase">Communication</h1>
              <div className="flex items-center gap-8 mt-3">
                {(['messagerie', 'forum'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveMainTab(tab)}
                    className={cn(
                      'text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-2',
                      activeMainTab === tab ? 'text-bleu-600 dark:text-or-400' : 'text-gray-400 hover:text-gray-600'
                    )}
                  >
                    {tab === 'messagerie' ? 'Messagerie & Annonces' : 'Espace forum'}
                    {activeMainTab === tab && (
                      <motion.div layoutId="main-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            <History size={18} /> Historique email
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20 active:scale-95 transition-all"
          >
            <Send size={18} /> Nouvelle annonce
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Messages envoyés" value={loading ? '…' : String(announcements.length)} subtitle="Trimestre en cours" icon={<Send />} trend={{ value: '+12.5%', direction: 'up' }} color="bleu" />
        <StatCard title="Taux d'ouverture" value="78%" subtitle="Engagement global" icon={<Activity />} color="or" />
        <StatCard title="Messages non lus" value={loading ? '…' : String(inbox.filter((m) => !m.readAt).length)} subtitle="Actions requises" icon={<AlertCircle />} color="rouge" />
        <StatCard title="Canaux actifs" value="3/3" subtitle="Omnicanalité active" icon={<Zap />} color="vert" />
      </div>

      {/* CONTENU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">

            {/* ═══ MESSAGERIE ═══ */}
            {activeMainTab === 'messagerie' && (
              <motion.div key="messagerie" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                  <div className="p-1 px-2 bg-white dark:bg-white/5 rounded-2xl flex items-center gap-1 shadow-soft border border-gray-100 dark:border-white/5">
                    {(['Tous', 'Annonce', 'Message', 'Urgent'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={cn(
                          'px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap',
                          activeFilter === f ? 'bg-bleu-600 dark:bg-or-500 text-white shadow-lg' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={loadData}
                      className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-gray-400 hover:text-bleu-600 transition-all shadow-sm"
                      title="Rafraîchir"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Filter size={18} />}
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-40 gap-3 text-gray-400">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-sm font-semibold">Chargement des annonces…</span>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                    <Megaphone size={32} className="opacity-30" />
                    <p className="text-sm font-semibold">Aucune annonce pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.map((msg) => (
                      <Card key={msg.id} className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md group relative hover:shadow-xl transition-all duration-300">
                        {msg.urgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rouge-600 to-rouge-400 animate-pulse" />}
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex gap-6">
                              <div className={cn(
                                'p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm ring-1 ring-black/5 dark:ring-white/5',
                                msg.urgent ? 'bg-rouge-50 dark:bg-rouge-900/20 text-rouge-600' : 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600'
                              )}>
                                <Megaphone size={26} strokeWidth={2.5} />
                              </div>
                              <div className="text-left font-bold" onClick={() => setOpenMenuId(null)}>
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <h4 className="text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-bleu-600 transition-colors">{msg.titre}</h4>
                                  {msg.urgent && (
                                    <Badge variant="error" className="text-[9px] font-bold px-3 py-0.5 border-none shadow-sm uppercase tracking-widest animate-bounce">Urgent</Badge>
                                  )}
                                  <Badge className="bg-gray-100 dark:bg-white/5 text-gray-500 border-none text-[8px] font-bold px-2 uppercase tracking-widest leading-none">{msg.type}</Badge>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-5 leading-relaxed font-semibold italic">"{msg.contenu}"</p>
                                <div className="flex flex-wrap items-center gap-6">
                                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Users size={14} className="text-bleu-500" /> <span className="opacity-60">Cible :</span> <span className="text-gray-600 dark:text-gray-300">{msg.cible}</span>
                                  </div>
                                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Clock size={14} className="text-or-500" /> <span className="opacity-60">Date :</span> <span className="text-gray-600 dark:text-gray-300">{msg.date}</span>
                                  </div>
                                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-vert-500 uppercase tracking-widest">
                                    <CheckCircle2 size={14} /> {msg.statut}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Popover
                              isOpen={openMenuId === msg.id}
                              onClose={() => setOpenMenuId(null)}
                              trigger={
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === msg.id ? null : msg.id); }}
                                  className="p-2 text-gray-300 dark:text-gray-700 hover:text-gray-900 dark:hover:text-white transition-all bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                                >
                                  <MoreVertical size={20} />
                                </button>
                              }
                            >
                              <div className="bg-white dark:bg-gray-900 rounded-[1.2rem] shadow-2xl border border-gray-100 dark:border-white/10 p-2 min-w-[200px] text-left">
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                                  <Eye size={16} className="text-bleu-600" /> Voir les statistiques
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                                  <Edit size={16} className="text-or-600" /> Modifier l'envoi
                                </button>
                                <div className="h-px bg-gray-50 dark:bg-white/5 my-1 mx-2" />
                                <button
                                  onClick={() => handleDeleteAnnouncement(msg.id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all"
                                >
                                  <Trash2 size={16} /> Supprimer
                                </button>
                              </div>
                            </Popover>
                          </div>
                        </div>
                        <div className="px-6 py-3 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between border-t border-gray-100 dark:border-white/5 invisible group-hover:visible transition-all">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Taux de lecture : <span className="text-bleu-600">84%</span></p>
                          <button className="text-[10px] font-bold text-bleu-600 hover:underline uppercase tracking-widest flex items-center gap-1">Détails de diffusion <ChevronRight size={12} /></button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══ FORUM ═══ */}
            {activeMainTab === 'forum' && (
              <motion.div key="forum" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-1 rounded-2xl shadow-soft border border-gray-100 dark:border-white/10">
                    {['Tous', 'Enseignants', 'Parents', 'Général'].map((f) => (
                      <button key={f} className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-all">{f}</button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setIsAddTopicModalOpen(true)}
                    className="bg-gradient-to-r from-or-600 to-or-400 text-gray-900 h-12 px-8 rounded-2xl font-bold text-[11px] uppercase tracking-widest border-none shadow-lg shadow-or-500/20 active:scale-95 transition-all"
                  >
                    Nouveau sujet
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-40 gap-3 text-gray-400">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-sm font-semibold">Chargement du forum…</span>
                  </div>
                ) : forumTopics.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                    <MessageSquare size={32} className="opacity-30" />
                    <p className="text-sm font-semibold">Aucun sujet pour le moment. Soyez le premier à publier !</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {forumTopics.map((t) => (
                      <Card key={t.id} className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md group hover:shadow-lg transition-all">
                        <div
                          className="p-6 flex items-start gap-6 cursor-pointer"
                          onClick={() => setExpandedForumId(expandedForumId === t.id ? null : t.id)}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Avatar name={t.authorName} size="md" className="ring-2 ring-gray-100 dark:ring-white/5 group-hover:ring-or-500 transition-all" />
                            <div className={cn('w-1 flex-1 rounded-full min-h-[40px] transition-all', expandedForumId === t.id ? 'bg-or-500/50' : 'bg-gray-50 dark:bg-white/5')} />
                          </div>
                          <div className="flex-1 text-left font-bold">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-sm text-gray-900 dark:text-white uppercase tracking-tight font-black">{t.authorName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-auto">{formatDate(t.postedAt)}</p>
                            </div>
                            <p className="text-lg text-gray-800 dark:text-gray-200 mb-2 leading-relaxed font-bold">{t.subject}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed italic line-clamp-2">"{t.body}"</p>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-or-500 transition-colors">
                                <MessageSquare size={14} className="text-or-500" /> {t.replies?.length ?? 0} <span className="opacity-60">réponses</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedForumId === t.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5"
                            >
                              <div className="p-6 pl-20 space-y-6">
                                <div className="space-y-4">
                                  {(t.replies ?? []).map((r) => (
                                    <div key={r.id} className="flex items-start gap-4">
                                      <Avatar name={r.authorName} size="sm" className="ring-1 ring-white/10" />
                                      <div className="flex-1 bg-white dark:bg-gray-900/50 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{r.authorName}</p>
                                          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{formatDate(r.postedAt)}</p>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold italic">"{r.body}"</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex items-start gap-4 pt-2">
                                  <Avatar name={userName} size="sm" className="ring-2 ring-or-500/30" />
                                  <div className="flex-1 relative">
                                    <textarea
                                      value={replyText}
                                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                                      className="w-full h-20 p-4 pr-14 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-or-500/20 outline-none transition-all font-semibold italic text-sm resize-none shadow-inner"
                                      placeholder="Écrire une réponse..."
                                    />
                                    <button
                                      onClick={() => handleReplySubmit(t.id)}
                                      disabled={submitting}
                                      className="absolute right-2 top-2 p-2.5 bg-or-500 hover:bg-or-600 text-white rounded-xl shadow-lg shadow-or-500/30 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
          <Card className="p-8 border-none shadow-soft bg-gradient-to-br from-gray-900 via-gray-900 to-bleu-950 dark:from-gray-950 dark:via-gray-950 dark:to-bleu-900/40 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-bleu-500/10 rounded-full blur-[60px] -mr-24 -mt-24 group-hover:bg-bleu-500/20 transition-all duration-1000" />
            <h3 className="font-bold text-[11px] text-bleu-400 mb-8 flex items-center gap-3 uppercase tracking-widest">
              <Activity size={18} /> Canaux de diffusion
            </h3>
            <div className="space-y-8">
              {[
                { label: 'Parents inscrits', count: '1,240', status: '98% Actifs' },
                { label: 'Enseignants connectés', count: '84', status: 'Temps réel' },
                { label: 'Forfaits SMS restants', count: '8,520', status: 'Pack pro' },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-left font-bold">
                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">{c.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{c.count}</p>
                  </div>
                  <Badge className="bg-white/5 text-gray-300 border-white/10 text-[9px] font-bold px-3 py-1 uppercase tracking-widest">{c.status}</Badge>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setIsTestModalOpen(true)}
              className="w-full mt-10 bg-white/10 hover:bg-white text-white hover:text-bleu-900 border border-white/20 hover:border-white font-bold text-[11px] h-12 flex gap-3 shadow-xl transition-all uppercase tracking-widest backdrop-blur-sm"
            >
              Tester un envoi SMS <ChevronRight size={18} />
            </Button>
          </Card>

          <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md text-left group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-[11px]">Alerte programmée</h3>
            <div className="p-6 bg-or-50/50 dark:bg-or-950/20 border border-or-100 dark:border-or-500/20 rounded-[2rem] flex items-start gap-6 group-hover:border-or-500/40 transition-all">
              <div className="p-3 bg-or-500 text-white rounded-2xl shadow-lg shadow-or-500/20 animate-pulse">
                <Bell size={22} />
              </div>
              <div className="font-bold">
                <p className="text-[11px] text-or-600 dark:text-or-400 mb-2 uppercase tracking-widest">Rappel automatique</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed italic line-clamp-2">
                  Relance des impayés prévue demain à 09:00 via SMS.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL : NOUVELLE ANNONCE */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl text-bleu-600 shadow-inner"><Megaphone size={24} /></div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Nouvelle annonce</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Diffusion globale ou ciblée</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Titre de l'annonce</label>
              <Input placeholder="Ex: Réunion de rentrée..." value={announcementTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnnouncementTitle(e.target.value)} className="h-12 rounded-2xl border-gray-100 dark:border-white/10" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type de message</label>
              <Select
                value={announcementType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAnnouncementType(e.target.value as any)}
                className="h-[3.2rem] rounded-2xl border-gray-100 dark:border-white/10"
                options={[
                  { value: 'annonce', label: 'Annonce officielle' },
                  { value: 'message', label: 'Message simple' },
                  { value: 'urgent', label: 'Alerte urgente' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Audience cible</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Tous', 'Parents', 'Enseignants', 'Élèves'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedAudience(c)}
                  className={cn(
                    'p-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95',
                    selectedAudience === c
                      ? 'bg-bleu-600 dark:bg-or-500 text-white border-transparent shadow-lg shadow-bleu-500/20 scale-[1.02]'
                      : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-bleu-400 hover:bg-bleu-50 dark:hover:bg-bleu-900/10 text-gray-400 dark:text-gray-500'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contenu du message</label>
            <textarea
              value={announcementContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnnouncementContent(e.target.value)}
              className="w-full h-32 p-4 rounded-[2rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-bleu-500/20 outline-none transition-all font-semibold italic text-sm"
              placeholder="Saisissez votre message ici..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl border-none bg-gray-50 dark:bg-white/5" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
            <Button
              disabled={submitting || !announcementTitle.trim() || !announcementContent.trim()}
              onClick={handleCreateAnnouncement}
              className="flex-1 h-12 bg-bleu-600 text-white shadow-lg shadow-bleu-600/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Diffuser l'annonce"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL : TEST SMS */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} size="md"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600 shadow-inner"><Smartphone size={24} /></div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Test d'envoi SMS</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Vérification de la passerelle</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="p-6 bg-bleu-50 dark:bg-bleu-900/10 rounded-3xl border border-bleu-100 dark:border-bleu-900/20 text-left">
            <p className="text-xs font-semibold text-bleu-800 dark:text-bleu-300 leading-relaxed italic">
              Cette action utilisera <span className="text-bleu-600 font-extrabold">1 crédit SMS</span> de votre forfait (8,520 restants).
            </p>
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Numéro de téléphone</label>
            <Input placeholder="+224 620 00 00 00" value={testPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestPhone(e.target.value)} className="h-12 rounded-2xl border-gray-100 dark:border-white/10 shadow-sm" />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl border-none bg-gray-50 dark:bg-white/5" onClick={() => setIsTestModalOpen(false)}>Fermer</Button>
            <Button onClick={() => { setIsTestModalOpen(false); showSuccess('SMS de test envoyé !'); }} className="flex-1 h-12 bg-or-500 text-gray-900 shadow-lg shadow-or-500/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl border-none hover:bg-or-600 hover:scale-[1.02]">
              Envoyer le test
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL : HISTORIQUE */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} size="xl"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-600 dark:text-gray-400 shadow-inner"><History size={24} /></div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Historique des envois</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Suivi détaillé des communications</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="overflow-hidden rounded-[2rem] border border-gray-100 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <tr>
                  <th className="px-6 py-4">Expéditeur</th>
                  <th className="px-6 py-4">Destinataire</th>
                  <th className="px-6 py-4">Contenu</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {inbox.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm font-semibold">Aucun message dans la boîte de réception.</td>
                  </tr>
                ) : inbox.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-semibold italic">
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{m.senderName}</td>
                    <td className="px-6 py-4 text-gray-500">{m.recipientName}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{m.content}</td>
                    <td className="px-6 py-4 text-[10px] text-gray-400 uppercase">{formatDate(m.sentAt)}</td>
                    <td className="px-6 py-4">
                      <Badge className={cn('px-3 py-1 text-[9px] font-bold uppercase tracking-widest leading-none border-none', m.readAt ? 'bg-vert-50 text-vert-600' : 'bg-or-50 text-or-600')}>
                        {m.readAt ? 'Lu' : 'Non lu'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" className="h-11 rounded-2xl text-[10px] font-bold uppercase tracking-widest px-8" onClick={() => setIsHistoryModalOpen(false)}>Fermer</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL : NOUVEAU SUJET FORUM */}
      <Modal isOpen={isAddTopicModalOpen} onClose={() => setIsAddTopicModalOpen(false)} size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600 shadow-inner"><MessageSquare size={24} /></div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Nouveau sujet</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Lancer une discussion communautaire</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sujet de discussion</label>
            <Input placeholder="Ex: Organisation de la fête..." value={topicSubject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopicSubject(e.target.value)} className="h-12 rounded-2xl border-gray-100 dark:border-white/10" />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message initial</label>
            <textarea
              value={topicBody}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTopicBody(e.target.value)}
              className="w-full h-32 p-4 rounded-[2rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-bleu-500/20 outline-none transition-all font-semibold italic text-sm"
              placeholder="Décrivez votre sujet ici..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl border-none bg-gray-50 dark:bg-white/5" onClick={() => setIsAddTopicModalOpen(false)}>Annuler</Button>
            <Button
              disabled={submitting || !topicSubject.trim() || !topicBody.trim()}
              onClick={handleCreateTopic}
              className="flex-1 h-12 bg-or-600 text-gray-900 shadow-lg shadow-or-500/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Publier le sujet'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* TOAST */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-vert-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 backdrop-blur-md">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
                <CheckCircle2 size={28} />
              </div>
              <div className="text-left font-bold">
                <p className="text-base tracking-tight">{successMsg}</p>
                <p className="text-[12px] text-white/80 italic">La diffusion a été lancée avec succès.</p>
              </div>
              <button onClick={() => setIsSuccess(false)} className="ml-6 p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminCommunication;
