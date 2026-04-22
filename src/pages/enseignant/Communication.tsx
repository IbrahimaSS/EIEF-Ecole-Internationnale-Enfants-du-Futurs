import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Bell,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Megaphone,
  CornerDownRight,
  Plus,
  Send,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, Badge, Button, Avatar, Modal, Input } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import {
  getAnnouncements,
  getForumTopics,
  createForumTopic,
  addForumReply,
  getInbox,
  getSentMessages,
  sendMessage,
  markMessageAsRead,
  AnnouncementResponse,
  ForumPostResponse,
  MessageResponse,
} from '../../services/communicationApi';
import { ContactResponse, userService } from '../../services/userService';

interface Conversation {
  interlocutorId: string;
  interlocutorName: string;
  messages: MessageResponse[];
  hasUnread: boolean;
}

const buildConversations = (
  inbox: MessageResponse[],
  sent: MessageResponse[],
): Map<string, Conversation> => {
  const map = new Map<string, Conversation>();

  const upsert = (msg: MessageResponse, isIncoming: boolean) => {
    const key = isIncoming ? msg.senderId : msg.recipientId;
    const interlocutorName = isIncoming ? msg.senderName : msg.recipientName;
    const existing = map.get(key);

    if (existing) {
      existing.messages.push(msg);
      if (isIncoming && !msg.readAt) {
        existing.hasUnread = true;
      }
      return;
    }

    map.set(key, {
      interlocutorId: key,
      interlocutorName,
      messages: [msg],
      hasUnread: isIncoming && !msg.readAt,
    });
  };

  inbox.forEach((msg) => upsert(msg, true));
  sent.forEach((msg) => upsert(msg, false));

  map.forEach((conversation) => {
    conversation.messages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
  });

  return map;
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const minutes = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const EnseignantCommunication: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'annonces' | 'messagerie' | 'forum'>('annonces');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Operation reussie');
  const [expandedForumId, setExpandedForumId] = useState<string | null>(null);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [topicSubject, setTopicSubject] = useState('');
  const [topicBody, setTopicBody] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [submittingTopic, setSubmittingTopic] = useState(false);
  const [inbox, setInbox] = useState<MessageResponse[]>([]);
  const [sent, setSent] = useState<MessageResponse[]>([]);
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [selectedInterlocutorId, setSelectedInterlocutorId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [searchConversation, setSearchConversation] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumPostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allAnnouncements, topics] = await Promise.all([
        getAnnouncements(),
        getForumTopics(),
      ]);

      setAnnouncements(
        allAnnouncements.filter(
          (announcement) => announcement.targetRole === null || announcement.targetRole === 'TEACHER',
        ),
      );
      setForumTopics(topics);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les donnees de communication.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessaging = useCallback(async () => {
    if (!user?.id || !token) {
      return;
    }

    try {
      const [nextInbox, nextSent, nextContacts] = await Promise.all([
        getInbox(user.id),
        getSentMessages(user.id),
        userService.getContactsByTeacher(token, user.id),
      ]);
      setInbox(nextInbox);
      setSent(nextSent);
      setContacts(nextContacts);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger la messagerie enseignant.');
    }
  }, [token, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeMainTab === 'messagerie') {
      loadMessaging();
    }
  }, [activeMainTab, loadMessaging]);

  const urgentAnnouncements = useMemo(
    () => announcements.filter((announcement) => /urgent|alerte/i.test(announcement.title) || /urgent|alerte/i.test(announcement.content)),
    [announcements],
  );

  const handleCreateTopic = async () => {
    if (!user?.id || !topicSubject.trim() || !topicBody.trim()) {
      return;
    }

    setSubmittingTopic(true);
    try {
      const created = await createForumTopic(user.id, {
        subject: topicSubject.trim(),
        body: topicBody.trim(),
      });
      setForumTopics((prev) => [created, ...prev]);
      setTopicSubject('');
      setTopicBody('');
      setIsAddTopicModalOpen(false);
      showSuccess('Sujet publie');
    } catch (err: any) {
      setError(err?.message || 'Impossible de publier le sujet.');
    } finally {
      setSubmittingTopic(false);
    }
  };

  const handleReplySubmit = async (topicId: string) => {
    const body = replyTexts[topicId]?.trim();
    if (!body || !user?.id) {
      return;
    }

    setSendingReply(topicId);
    try {
      await addForumReply(topicId, user.id, { subject: 'Reponse', body });
      setReplyTexts((prev) => ({ ...prev, [topicId]: '' }));
      await loadData();
      showSuccess('Reponse envoyee');
    } catch (err: any) {
      setError(err?.message || 'Impossible de publier la reponse.');
    } finally {
      setSendingReply(null);
    }
  };

  const conversations = useMemo(
    () => buildConversations(inbox, sent),
    [inbox, sent],
  );

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

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedInterlocutorId(conversation.interlocutorId);
    setRecipientId(conversation.interlocutorId);

    const unread = inbox.filter((message) => message.senderId === conversation.interlocutorId && !message.readAt);
    await Promise.all(unread.map((message) => markMessageAsRead(message.id))).catch(console.error);
    if (unread.length > 0) {
      await loadMessaging();
    }
  };

  const handleSendMessage = async () => {
    if (!user?.id || !newMessage.trim() || !recipientId.trim()) {
      return;
    }

    if (!isRecipientAllowed) {
      setError('Destinataire invalide. Choisissez un contact autorise.');
      return;
    }

    setSendingMessage(true);
    try {
      await sendMessage(user.id, {
        recipientId: recipientId.trim(),
        content: newMessage.trim(),
      });
      setNewMessage('');
      setError(null);
      showSuccess('Message envoye');
      await loadMessaging();
    } catch (err: any) {
      setError(err?.message || 'Impossible d envoyer le message.');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8"
    >
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rouge-100 bg-rouge-50 p-4 text-sm font-semibold text-rouge-600 dark:border-rouge-500/20 dark:bg-rouge-900/20 dark:text-rouge-400">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rouge-500 hover:text-rouge-700">
            x
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 border-b border-gray-100 pb-2 dark:border-white/5">
        <div className="text-left font-bold w-full">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
              <Megaphone size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black gradient-bleu-or-text tracking-tight">Espace Communication</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Consultez les annonces et participez au forum enseignant</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveMainTab('annonces')}
                className={cn(
                  'text-sm font-bold transition-all relative pb-2',
                  activeMainTab === 'annonces' ? 'text-bleu-600 dark:text-or-400' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                Annonces & Messages
                {activeMainTab === 'annonces' && <motion.div layoutId="teacher-main-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
              </button>
              <button
                onClick={() => setActiveMainTab('messagerie')}
                className={cn(
                  'text-sm font-bold transition-all relative pb-2',
                  activeMainTab === 'messagerie' ? 'text-bleu-600 dark:text-or-400' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                Messagerie
                {activeMainTab === 'messagerie' && <motion.div layoutId="teacher-main-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
              </button>
              <button
                onClick={() => setActiveMainTab('forum')}
                className={cn(
                  'text-sm font-bold transition-all relative pb-2',
                  activeMainTab === 'forum' ? 'text-bleu-600 dark:text-or-400' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                Espace Forum
                {activeMainTab === 'forum' && <motion.div layoutId="teacher-main-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
              </button>
            </div>

            {activeMainTab === 'forum' && (
              <Button
                onClick={() => setIsAddTopicModalOpen(true)}
                className="bg-bleu-600 text-white font-bold h-10 px-6 rounded-xl shadow-lg border-none hover:scale-[1.02] flex items-center gap-2"
              >
                <Plus size={16} /> Nouveau Sujet
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeMainTab === 'annonces' && (
            <motion.div key="annonces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-bleu-900 to-indigo-900 text-white border-none shadow-soft flex items-center gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <Bell size={24} className="text-or-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold opacity-80">Annonces visibles</p>
                    <h3 className="text-2xl font-black">{announcements.length}</h3>
                  </div>
                </Card>
                <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-4">
                  <div className="p-4 bg-rouge-50 dark:bg-rouge-500/10 rounded-2xl text-rouge-500">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-500">Alertes urgentes</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{urgentAnnouncements.length}</h3>
                  </div>
                </Card>
                <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-4">
                  <div className="p-4 bg-vert-50 dark:bg-vert-500/10 rounded-2xl text-vert-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-500">Messages globaux</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{announcements.filter((announcement) => announcement.targetRole === null).length}</h3>
                  </div>
                </Card>
              </div>

              <Card className="p-0 overflow-hidden border-none shadow-soft dark:bg-gray-900/50">
                {announcements.length === 0 ? (
                  <div className="py-16 text-center text-sm font-bold text-gray-400">Aucune annonce pour le moment.</div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {announcements.map((msg) => {
                      const urgent = /urgent|alerte/i.test(msg.title) || /urgent|alerte/i.test(msg.content);
                      return (
                        <div key={msg.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              'p-3 rounded-2xl flex-shrink-0 border shadow-sm',
                              urgent
                                ? 'bg-rouge-50 border-rouge-100 text-rouge-600 dark:bg-rouge-500/10'
                                : 'bg-white border-gray-100 text-bleu-600 dark:bg-gray-800',
                            )}>
                              {urgent ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                            </div>
                            <div className="text-left font-bold">
                              <h3 className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                {msg.title}
                                {urgent && <Badge variant="error" className="h-5 text-[9px] px-1.5 border-none">URGENT</Badge>}
                                {msg.targetRole && <Badge className="bg-gray-100 text-gray-500 font-bold border-none text-[9px] h-5">{msg.targetRole}</Badge>}
                              </h3>
                              <p className="text-[11px] text-gray-500 font-semibold line-clamp-1 mt-1 max-w-lg">{msg.content}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 justify-end">
                            <div className="text-right">
                              <p className="text-[11px] font-bold text-gray-900 dark:text-white">{msg.authorName}</p>
                              <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 justify-end mt-0.5">
                                <Clock size={10} /> {formatDate(msg.publishedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeMainTab === 'messagerie' && (
            <motion.div key="messagerie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50 h-[560px] flex">
                <div className="w-80 border-r border-gray-100 dark:border-white/5 h-full flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-3">
                    <Input
                      value={searchConversation}
                      onChange={(e) => setSearchConversation(e.target.value)}
                      placeholder="Chercher un contact..."
                      className="w-full"
                    />
                    <select
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-sm font-semibold border border-gray-100 dark:border-white/10"
                    >
                      <option value="">Choisir un contact</option>
                      {contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.firstName} {contact.lastName} · {contact.roleName}
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
                              <div className={cn(
                                'max-w-[75%] p-4 rounded-3xl text-sm font-semibold shadow-sm',
                                isMine
                                  ? 'bg-bleu-600 text-white rounded-br-md text-right'
                                  : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-bl-md text-left',
                              )}>
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
                              if (e.key === 'Enter') handleSendMessage();
                            }}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={sendingMessage || !newMessage.trim() || !isRecipientAllowed}
                            className="p-3 bg-bleu-600 text-white rounded-2xl hover:bg-bleu-700 shadow-lg shadow-bleu-500/30 disabled:opacity-50"
                          >
                            {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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
            </motion.div>
          )}

          {activeMainTab === 'forum' && (
            <motion.div key="forum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-2">
                <Users className="text-bleu-500" size={24} />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Discussions</h2>
                <button onClick={loadData} className="ml-auto text-bleu-600 hover:text-bleu-700">
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="grid gap-4">
                {forumTopics.length === 0 && (
                  <p className="text-center py-12 text-sm font-bold text-gray-400">Aucun sujet pour le moment.</p>
                )}
                {forumTopics.map((thread) => (
                  <Card key={thread.id} className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm dark:bg-gray-900/50">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar name={thread.authorName} size="md" />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{thread.authorName}</h4>
                            <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1"><Clock size={10} /> {formatDate(thread.postedAt)}</span>
                          </div>
                          <p className="text-xs font-bold text-bleu-600 mb-1">{thread.subject || 'Discussion'}</p>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">{thread.body}</p>

                          <div className="flex gap-4 mt-4">
                            <button
                              onClick={() => setExpandedForumId(expandedForumId === thread.id ? null : thread.id)}
                              className="text-[11px] font-bold text-bleu-600 hover:text-bleu-700 flex items-center gap-1 bg-bleu-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <MessageSquare size={12} /> {(thread.replies?.length ?? 0)} Reponse{(thread.replies?.length ?? 0) > 1 ? 's' : ''}
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
                          className="bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5"
                        >
                          <div className="p-6 space-y-4 text-left">
                            {(thread.replies ?? []).map((reply) => (
                              <div key={reply.id} className="flex items-start gap-3 pl-8 relative">
                                <CornerDownRight className="absolute left-2 top-2 text-gray-300" size={16} />
                                <Avatar name={reply.authorName} size="sm" />
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm flex-1 border border-gray-100 dark:border-white/5">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white">{reply.authorName}</span>
                                    <span className="text-[9px] font-semibold text-gray-400">{formatDate(reply.postedAt)}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{reply.body}</p>
                                </div>
                              </div>
                            ))}

                            <div className="pl-8 pt-4 flex gap-3">
                              <Avatar name={user ? `${user.firstName} ${user.lastName}` : 'Vous'} size="sm" />
                              <div className="flex-1 relative">
                                <Input
                                  value={replyTexts[thread.id] ?? ''}
                                  onChange={(e) => setReplyTexts((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                                  placeholder="Votre reponse..."
                                  className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white dark:bg-gray-800 text-sm font-semibold border-gray-200 dark:border-white/10"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleReplySubmit(thread.id);
                                  }}
                                />
                                <button
                                  onClick={() => handleReplySubmit(thread.id)}
                                  disabled={sendingReply === thread.id}
                                  className="absolute right-2 top-1.5 p-1.5 bg-bleu-600 text-white rounded-xl hover:bg-bleu-700 transition-colors disabled:opacity-50"
                                >
                                  {sendingReply === thread.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
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

      <Modal isOpen={isAddTopicModalOpen} onClose={() => setIsAddTopicModalOpen(false)} title="Nouveau Sujet">
        <div className="space-y-4">
          <Input
            value={topicSubject}
            onChange={(e) => setTopicSubject(e.target.value)}
            placeholder="Titre de votre sujet"
            className="font-semibold"
          />
          <textarea
            value={topicBody}
            onChange={(e) => setTopicBody(e.target.value)}
            placeholder="Exprimez-vous..."
            className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-sm font-semibold focus:border-bleu-500 focus:ring-1 focus:ring-bleu-500 outline-none resize-none"
          />
          <div className="flex justify-end pt-4">
            <Button
              className="bg-bleu-600 text-white font-bold px-6 border-none disabled:opacity-50"
              onClick={handleCreateTopic}
              disabled={submittingTopic || !topicSubject.trim() || !topicBody.trim()}
            >
              {submittingTopic ? 'Publication...' : 'Publier'}
            </Button>
          </div>
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

export default EnseignantCommunication;
