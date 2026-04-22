import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Bell,
  AlertCircle,
  CheckCircle2,
  Megaphone,
  History,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  CornerDownRight,
} from 'lucide-react';
import { Card, StatCard, Button, Avatar, Modal, Input, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getForumTopics,
  createForumTopic,
  addForumReply,
  deleteForumTopic,
  getInbox,
  getSentMessages,
  sendMessage,
  markMessageAsRead,
  AnnouncementResponse,
  ForumPostResponse,
  MessageResponse,
} from '../../services/communicationApi';
import { AdminUserResponse, userService } from '../../services/userService';

interface Conversation {
  interlocutorId: string;
  interlocutorName: string;
  messages: MessageResponse[];
  hasUnread: boolean;
}

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const targetRoleLabel = (role: string | null | undefined): string => {
  const map: Record<string, string> = {
    PARENT: 'Parents',
    TEACHER: 'Enseignants',
    STUDENT: 'Eleves',
  };
  return role ? (map[role] ?? role) : 'Tous';
};

const audienceToRole = (audience: string): string | undefined => {
  const map: Record<string, string> = {
    Parents: 'PARENT',
    Enseignants: 'TEACHER',
    Eleves: 'STUDENT',
  };
  return map[audience];
};

const buildConversations = (inbox: MessageResponse[], sent: MessageResponse[]): Map<string, Conversation> => {
  const map = new Map<string, Conversation>();

  const upsert = (message: MessageResponse, isIncoming: boolean) => {
    const key = isIncoming ? message.senderId : message.recipientId;
    const interlocutorName = isIncoming ? message.senderName : message.recipientName;
    const existing = map.get(key);

    if (existing) {
      existing.messages.push(message);
      if (isIncoming && !message.readAt) {
        existing.hasUnread = true;
      }
      return;
    }

    map.set(key, {
      interlocutorId: key,
      interlocutorName,
      messages: [message],
      hasUnread: isIncoming && !message.readAt,
    });
  };

  inbox.forEach((message) => upsert(message, true));
  sent.forEach((message) => upsert(message, false));

  map.forEach((conversation) => {
    conversation.messages.sort(
      (left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime(),
    );
  });

  return map;
};

const AdminCommunication: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [activeMainTab, setActiveMainTab] = useState<'messagerie' | 'forum'>('messagerie');
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Operation reussie');

  const [selectedAudience, setSelectedAudience] = useState('Tous');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [topicSubject, setTopicSubject] = useState('');
  const [topicBody, setTopicBody] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [expandedForumId, setExpandedForumId] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumPostResponse[]>([]);
  const [inbox, setInbox] = useState<MessageResponse[]>([]);
  const [sent, setSent] = useState<MessageResponse[]>([]);
  const [contacts, setContacts] = useState<AdminUserResponse[]>([]);

  const [selectedInterlocutorId, setSelectedInterlocutorId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [searchConversation, setSearchConversation] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showSuccess = (message: string) => {
    setSuccessMsg(message);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const loadData = useCallback(async () => {
    if (!user?.id || !token) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [nextAnnouncements, nextTopics, nextInbox, nextSent, nextUsers] = await Promise.all([
        getAnnouncements(),
        getForumTopics(),
        getInbox(user.id),
        getSentMessages(user.id),
        userService.getAllUsers(token),
      ]);

      setAnnouncements(nextAnnouncements);
      setForumTopics(nextTopics);
      setInbox(nextInbox);
      setSent(nextSent);
      setContacts(
        nextUsers.filter((contact) => {
          const isSelf = contact.id === user.id;
          const isActive = contact.active ?? contact.isActive ?? true;
          return !isSelf && isActive;
        }),
      );
    } catch (err: any) {
      setError(err?.message ?? 'Erreur de chargement des donnees.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const conversations = useMemo(() => buildConversations(inbox, sent), [inbox, sent]);

  const filteredConversations = useMemo(
    () => Array.from(conversations.values()).filter((conversation) =>
      conversation.interlocutorName.toLowerCase().includes(searchConversation.toLowerCase()),
    ),
    [conversations, searchConversation],
  );

  const selectedConversation = selectedInterlocutorId
    ? conversations.get(selectedInterlocutorId) ?? null
    : null;

  const isRecipientAllowed = useMemo(
    () => contacts.some((contact) => contact.id === recipientId.trim()),
    [contacts, recipientId],
  );

  const unreadCount = inbox.filter((message) => !message.readAt).length;
  const urgentAnnouncements = announcements.filter((announcement) =>
    /urgent|alerte/i.test(announcement.title) || /urgent|alerte/i.test(announcement.content),
  ).length;

  const handleCreateAnnouncement = async () => {
    if (!user?.id || !announcementTitle.trim() || !announcementContent.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const created = await createAnnouncement(user.id, {
        title: announcementTitle.trim(),
        content: announcementContent.trim(),
        targetRole: audienceToRole(selectedAudience),
      });
      setAnnouncements((prev) => [created, ...prev]);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setSelectedAudience('Tous');
      setIsAddAnnouncementOpen(false);
      showSuccess('Annonce diffusee');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la creation de l annonce.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await deleteAnnouncement(announcementId);
      setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== announcementId));
      showSuccess('Annonce supprimee');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la suppression de l annonce.');
    }
  };

  const handleCreateTopic = async () => {
    if (!user?.id || !topicSubject.trim() || !topicBody.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const created = await createForumTopic(user.id, {
        subject: topicSubject.trim(),
        body: topicBody.trim(),
      });
      setForumTopics((prev) => [created, ...prev]);
      setTopicSubject('');
      setTopicBody('');
      setIsAddTopicOpen(false);
      showSuccess('Sujet publie');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la creation du sujet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (topicId: string) => {
    const body = replyTexts[topicId]?.trim();
    if (!user?.id || !body) {
      return;
    }

    setSendingReply(topicId);
    try {
      const reply = await addForumReply(topicId, user.id, { subject: 'Reponse', body });
      setForumTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? { ...topic, replies: [...(topic.replies ?? []), reply] }
            : topic,
        ),
      );
      setReplyTexts((prev) => ({ ...prev, [topicId]: '' }));
      showSuccess('Reponse envoyee');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de l envoi de la reponse.');
    } finally {
      setSendingReply(null);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await deleteForumTopic(topicId);
      setForumTopics((prev) => prev.filter((topic) => topic.id !== topicId));
      showSuccess('Sujet supprime');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la suppression du sujet.');
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedInterlocutorId(conversation.interlocutorId);
    setRecipientId(conversation.interlocutorId);

    const unread = inbox.filter((message) => message.senderId === conversation.interlocutorId && !message.readAt);
    if (unread.length === 0) {
      return;
    }

    await Promise.all(unread.map((message) => markMessageAsRead(message.id))).catch(console.error);
    await loadData();
  };

  const handleSendMessage = async () => {
    if (!user?.id || !recipientId.trim() || !newMessage.trim()) {
      return;
    }

    if (!isRecipientAllowed) {
      setError('Destinataire invalide. Choisissez un utilisateur autorise.');
      return;
    }

    setSubmitting(true);
    try {
      await sendMessage(user.id, {
        recipientId: recipientId.trim(),
        content: newMessage.trim(),
      });
      setNewMessage('');
      await loadData();
      showSuccess('Message envoye');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de l envoi du message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-rouge-50 dark:bg-rouge-900/20 border border-rouge-100 dark:border-rouge-500/20 rounded-2xl text-rouge-600 dark:text-rouge-400 text-sm font-semibold"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rouge-100 rounded-lg transition-all">
            x
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
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
                      activeMainTab === tab ? 'text-bleu-600 dark:text-or-400' : 'text-gray-400 hover:text-gray-600',
                    )}
                  >
                    {tab === 'messagerie' ? 'Messagerie & Annonces' : 'Espace forum'}
                    {activeMainTab === tab && (
                      <motion.div layoutId="admin-communication-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />
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
            onClick={() => setIsHistoryOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            <History size={18} /> Historique
          </Button>
          <Button
            onClick={() => setIsAddAnnouncementOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20 active:scale-95 transition-all"
          >
            <Send size={18} /> Nouvelle annonce
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Annonces" value={loading ? '…' : String(announcements.length)} subtitle="Diffusion active" icon={<Megaphone />} color="bleu" />
        <StatCard title="Messages recus" value={loading ? '…' : String(inbox.length)} subtitle="Boite de reception" icon={<MessageSquare />} color="or" />
        <StatCard title="Non lus" value={loading ? '…' : String(unreadCount)} subtitle="Actions requises" icon={<AlertCircle />} color="rouge" />
        <StatCard title="Alertes" value={loading ? '…' : String(urgentAnnouncements)} subtitle="Annonces urgentes" icon={<Bell />} color="vert" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm font-semibold">Chargement...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeMainTab === 'messagerie' && (
            <motion.div key="messagerie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">Annonces</h2>
                  <button onClick={loadData} className="text-bleu-600 hover:text-bleu-700">
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
                  {announcements.map((announcement) => {
                    const urgent = /urgent|alerte/i.test(announcement.title) || /urgent|alerte/i.test(announcement.content);
                    return (
                      <Card key={announcement.id} className="p-5 border-none shadow-soft dark:bg-gray-900/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-left">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm font-black text-gray-900 dark:text-white">{announcement.title}</h3>
                              {urgent && <Badge variant="error" className="border-none">URGENT</Badge>}
                            </div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">{announcement.content}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <span>{targetRoleLabel(announcement.targetRole)}</span>
                              <span>{formatDate(announcement.publishedAt)}</span>
                              <span>{announcement.authorName}</span>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteAnnouncement(announcement.id)} className="text-rouge-500 hover:text-rouge-700">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="xl:col-span-3">
                <Card className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50 h-[700px] flex">
                  <div className="w-80 border-r border-gray-100 dark:border-white/5 h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-3">
                      <Input
                        value={searchConversation}
                        onChange={(e) => setSearchConversation(e.target.value)}
                        placeholder="Chercher une conversation..."
                        className="w-full"
                      />
                      <select
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-sm font-semibold border border-gray-100 dark:border-white/10"
                      >
                        <option value="">Choisir un destinataire</option>
                        {contacts.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName} · {targetRoleLabel(contact.roleName)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                      {filteredConversations.length === 0 && (
                        <p className="p-6 text-center text-xs font-bold text-gray-400">Aucune conversation</p>
                      )}
                      {filteredConversations.map((conversation) => {
                        const lastMessage = conversation.messages[conversation.messages.length - 1];
                        return (
                          <button
                            key={conversation.interlocutorId}
                            onClick={() => handleSelectConversation(conversation)}
                            className={cn(
                              'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all relative overflow-hidden',
                              selectedInterlocutorId === conversation.interlocutorId && 'bg-bleu-50/50 dark:bg-bleu-900/10',
                            )}
                          >
                            {selectedInterlocutorId === conversation.interlocutorId && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-bleu-600" />
                            )}
                            <div className="flex gap-3">
                              <Avatar name={conversation.interlocutorName} size="md" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs font-black text-gray-900 dark:text-white">{conversation.interlocutorName}</p>
                                  {conversation.hasUnread && <div className="w-2 h-2 bg-bleu-500 rounded-full" />}
                                </div>
                                <p className="text-[11px] font-semibold text-gray-500 line-clamp-1">{lastMessage?.content}</p>
                                <p className="text-[9px] text-gray-400 font-bold mt-1">{lastMessage ? formatDate(lastMessage.sentAt) : ''}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-1 h-full flex flex-col relative">
                    {selectedConversation ? (
                      <>
                        <div className="p-4 border-b border-gray-50 dark:border-white/5 flex items-center gap-3">
                          <Avatar name={selectedConversation.interlocutorName} size="md" />
                          <div className="text-left font-bold">
                            <p className="text-sm text-gray-900 dark:text-white">{selectedConversation.interlocutorName}</p>
                          </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-6">
                          {selectedConversation.messages.map((message) => {
                            const isMine = message.senderId === user?.id;
                            return (
                              <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                                <div
                                  className={cn(
                                    'max-w-[75%] p-4 rounded-3xl text-sm font-semibold shadow-sm',
                                    isMine
                                      ? 'bg-bleu-600 text-white rounded-br-md text-right'
                                      : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-bl-md text-left',
                                  )}
                                >
                                  <p className="leading-relaxed">{message.content}</p>
                                  <p className={cn('text-[9px] mt-2 font-bold opacity-60', isMine ? 'text-white' : 'text-gray-400')}>
                                    {formatDate(message.sentAt)}{message.readAt && isMine ? ' · Lu' : ''}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-4 border-t border-gray-50 dark:border-white/5 space-y-2">
                          <div className="flex items-center gap-3">
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Ecrivez un message..."
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSendMessage();
                                }
                              }}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={submitting || !newMessage.trim() || !isRecipientAllowed}
                              className="p-3 bg-bleu-600 text-white rounded-2xl hover:bg-bleu-700 shadow-lg shadow-bleu-500/30 disabled:opacity-50"
                            >
                              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <MessageSquare size={100} strokeWidth={0.5} />
                        <p className="mt-4 font-black">Choisissez une conversation</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeMainTab === 'forum' && (
            <motion.div key="forum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Forum</h2>
                <Button onClick={() => setIsAddTopicOpen(true)} className="bg-bleu-600 text-white border-none">
                  <Plus size={16} className="mr-2" /> Nouveau sujet
                </Button>
              </div>

              <div className="space-y-4">
                {forumTopics.map((thread) => (
                  <Card key={thread.id} className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm dark:bg-gray-900/50">
                    <div className="p-6 text-left">
                      <div className="flex items-start gap-4">
                        <Avatar name={thread.authorName} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white">{thread.authorName}</h4>
                            <span className="text-[10px] text-gray-400 ml-auto">{formatDate(thread.postedAt)}</span>
                          </div>
                          <p className="text-xs font-bold text-bleu-600 mb-1">{thread.subject || 'Discussion'}</p>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{thread.body}</p>
                          <div className="flex items-center gap-3 mt-4">
                            <button
                              onClick={() => setExpandedForumId(expandedForumId === thread.id ? null : thread.id)}
                              className="text-[11px] font-bold text-bleu-600 hover:text-bleu-700 flex items-center gap-1 bg-bleu-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <MessageSquare size={12} /> {thread.replies?.length ?? 0} Reponses
                            </button>
                            <button onClick={() => handleDeleteTopic(thread.id)} className="text-rouge-500 hover:text-rouge-700">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedForumId === thread.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]"
                        >
                          <div className="p-6 space-y-6">
                            {(thread.replies ?? []).map((reply) => (
                              <div key={reply.id} className="flex gap-4 pl-8 relative">
                                <div className="absolute left-2 top-2 text-gray-200"><CornerDownRight size={20} /></div>
                                <Avatar name={reply.authorName} size="sm" />
                                <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-50 text-left">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-black text-gray-900 dark:text-white">{reply.authorName}</p>
                                    <p className="text-[9px] font-bold text-gray-400">{formatDate(reply.postedAt)}</p>
                                  </div>
                                  <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 leading-relaxed">{reply.body}</p>
                                </div>
                              </div>
                            ))}

                            <div className="pl-8 pt-4 flex gap-4">
                              <Avatar name={user ? `${user.firstName} ${user.lastName}` : 'Moi'} size="sm" />
                              <div className="flex-1 relative">
                                <Input
                                  value={replyTexts[thread.id] ?? ''}
                                  onChange={(e) => setReplyTexts((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleReplySubmit(thread.id);
                                    }
                                  }}
                                  placeholder="Votre reponse..."
                                  className="w-full pl-5 pr-12 py-3"
                                />
                                <button
                                  onClick={() => handleReplySubmit(thread.id)}
                                  disabled={sendingReply === thread.id}
                                  className="absolute right-1.5 top-1.5 p-2 bg-bleu-600 text-white rounded-xl disabled:opacity-50"
                                >
                                  {sendingReply === thread.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
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
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <Modal isOpen={isAddAnnouncementOpen} onClose={() => setIsAddAnnouncementOpen(false)} title="Nouvelle annonce">
        <div className="space-y-4">
          <Input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Titre" />
          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
          >
            <option value="Tous">Tous</option>
            <option value="Parents">Parents</option>
            <option value="Enseignants">Enseignants</option>
            <option value="Eleves">Eleves</option>
          </select>
          <textarea
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
            placeholder="Contenu de l'annonce..."
            className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-sm font-semibold focus:border-bleu-500 focus:ring-1 focus:ring-bleu-500 outline-none resize-none"
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleCreateAnnouncement} disabled={submitting || !announcementTitle.trim() || !announcementContent.trim()} className="bg-bleu-600 text-white border-none disabled:opacity-50">
              {submitting ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAddTopicOpen} onClose={() => setIsAddTopicOpen(false)} title="Nouveau sujet">
        <div className="space-y-4">
          <Input value={topicSubject} onChange={(e) => setTopicSubject(e.target.value)} placeholder="Sujet" />
          <textarea
            value={topicBody}
            onChange={(e) => setTopicBody(e.target.value)}
            placeholder="Exprimez-vous..."
            className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-sm font-semibold focus:border-bleu-500 focus:ring-1 focus:ring-bleu-500 outline-none resize-none"
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleCreateTopic} disabled={submitting || !topicSubject.trim() || !topicBody.trim()} className="bg-bleu-600 text-white border-none disabled:opacity-50">
              {submitting ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Historique recent">
        <div className="space-y-4 max-h-[420px] overflow-y-auto">
          {sent.length === 0 ? (
            <p className="text-sm text-gray-400 font-semibold">Aucun message envoye recemment.</p>
          ) : (
            sent.slice().reverse().map((message) => (
              <Card key={message.id} className="p-4 border-none shadow-soft">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Vers {message.recipientName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message.content}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-2">{formatDate(message.sentAt)}</p>
              </Card>
            ))
          )}
        </div>
      </Modal>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-vert-100 min-w-[300px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-vert-100 text-vert-500 rounded-xl">
                <CheckCircle2 size={24} />
              </div>
              <div className="text-left font-bold">
                <p className="text-sm text-gray-900 dark:text-white">{successMsg}</p>
                <p className="text-[11px] text-gray-500 font-semibold">Operation reussie</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminCommunication;
