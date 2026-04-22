import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Bell,
  AlertCircle,
  Clock,
  Megaphone,
  Search,
  CornerDownRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, Badge, Avatar, Input, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { userService, TeacherResponse } from '../../services/userService';
import {
  getAnnouncements,
  getInbox,
  getSentMessages,
  sendMessage,
  markMessageAsRead,
  getForumTopics,
  addForumReply,
  AnnouncementResponse,
  MessageResponse,
  ForumPostResponse,
} from '../../services/communicationApi';

interface Conversation {
  interlocutorId: string;
  interlocutorName: string;
  messages: MessageResponse[];
  hasUnread: boolean;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

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

  inbox.forEach((m) => upsert(m, true));
  sent.forEach((m) => upsert(m, false));

  map.forEach((conv) => {
    conv.messages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
  });

  return map;
};

const ParentCommunication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'annonces' | 'messagerie' | 'forum'>('annonces');

  const [annonces, setAnnonces] = useState<AnnouncementResponse[]>([]);
  const [annoncesLoading, setAnnoncesLoading] = useState(false);
  const [annoncesError, setAnnoncesError] = useState<string | null>(null);

  const [inbox, setInbox] = useState<MessageResponse[]>([]);
  const [sent, setSent] = useState<MessageResponse[]>([]);
  const [messagerieLoading, setMessagerieLoading] = useState(false);
  const [messagerieError, setMessagerieError] = useState<string | null>(null);
  const [selectedInterlocutorId, setSelectedInterlocutorId] = useState<string | null>(null);
  const [searchConversation, setSearchConversation] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [teacherContacts, setTeacherContacts] = useState<TeacherResponse[]>([]);

  const [topics, setTopics] = useState<ForumPostResponse[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumError, setForumError] = useState<string | null>(null);
  const [expandedForumId, setExpandedForumId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Operation reussie');

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const loadAnnonces = useCallback(async () => {
    setAnnoncesLoading(true);
    setAnnoncesError(null);
    try {
      const data = await getAnnouncements('PARENT');
      setAnnonces(data);
    } catch (err: any) {
      setAnnoncesError(err?.message || 'Impossible de charger les annonces.');
    } finally {
      setAnnoncesLoading(false);
    }
  }, []);

  const loadMessagerie = useCallback(async () => {
    if (!user?.id) return;
    setMessagerieLoading(true);
    setMessagerieError(null);
    try {
      const [inboxData, sentData] = await Promise.all([
        getInbox(user.id),
        getSentMessages(user.id),
      ]);
      setInbox(inboxData);
      setSent(sentData);
    } catch (err: any) {
      setMessagerieError(err?.message || 'Impossible de charger les messages.');
    } finally {
      setMessagerieLoading(false);
    }
  }, [user?.id]);

  const loadTeacherContacts = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const contacts = await userService.getTeachersByParent(token, user.id);
      setTeacherContacts(contacts);
    } catch (err) {
      console.error(err);
    }
  }, [token, user?.id]);

  const loadForum = useCallback(async () => {
    setForumLoading(true);
    setForumError(null);
    try {
      setTopics(await getForumTopics());
    } catch (err: any) {
      setForumError(err?.message || 'Impossible de charger le forum.');
    } finally {
      setForumLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'annonces') loadAnnonces();
    if (activeTab === 'messagerie') {
      loadMessagerie();
      loadTeacherContacts();
    }
    if (activeTab === 'forum') loadForum();
  }, [activeTab, loadAnnonces, loadMessagerie, loadForum, loadTeacherContacts]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !recipientId.trim()) return;

    const isAllowedRecipient = teacherContacts.some((teacher) => teacher.userId === recipientId.trim());
    if (!isAllowedRecipient) {
      setMessagerieError('Destinataire invalide. Choisissez un enseignant autorise.');
      return;
    }

    setSendingMessage(true);
    try {
      await sendMessage(user.id, {
        recipientId: recipientId.trim(),
        content: newMessage.trim(),
      });
      setNewMessage('');
      setMessagerieError(null);
      showSuccess('Message envoye');
      await loadMessagerie();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedInterlocutorId(conversation.interlocutorId);

    const matchedTeacher = teacherContacts.find(
      (t) => t.userId === conversation.interlocutorId,
    );
    if (matchedTeacher?.userId) {
      setRecipientId(matchedTeacher.userId);
    } else {
      setRecipientId('');
    }

    const unread = inbox.filter((m) => m.senderId === conversation.interlocutorId && !m.readAt);
    await Promise.all(unread.map((m) => markMessageAsRead(m.id))).catch(console.error);
    if (unread.length > 0) await loadMessagerie();
  };

  const contactOptions = useMemo(
    () =>
      teacherContacts.map((teacher) => ({
        value: teacher.userId,
        label: `${teacher.firstName} ${teacher.lastName}`,
      })),
    [teacherContacts],
  );

  const isRecipientAllowed = useMemo(
    () => teacherContacts.some((teacher) => teacher.userId === recipientId.trim()),
    [teacherContacts, recipientId],
  );

  const handleReplySubmit = async (topicId: string) => {
    const body = replyTexts[topicId]?.trim();
    if (!body || !user?.id) return;

    setSendingReply(topicId);
    try {
      await addForumReply(topicId, user.id, { subject: '', body });
      setReplyTexts((prev) => ({ ...prev, [topicId]: '' }));
      showSuccess('Reponse publiee');
      await loadForum();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(null);
    }
  };

  const conversations = useMemo(
    () => buildConversations(inbox, sent),
    [inbox, sent],
  );

  const filteredConversations = useMemo(
    () =>
      Array.from(conversations.values()).filter((c) =>
        c.interlocutorName.toLowerCase().includes(searchConversation.toLowerCase()),
      ),
    [conversations, searchConversation],
  );

  const selectedConv = selectedInterlocutorId
    ? conversations.get(selectedInterlocutorId) ?? null
    : null;

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <Loader2 size={28} className="animate-spin" />
    </div>
  );

  const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <AlertCircle size={32} className="text-rouge-400" />
      <p className="text-sm font-bold text-gray-600 dark:text-gray-300">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-xs font-black text-bleu-600 bg-bleu-50 px-4 py-2 rounded-xl hover:bg-bleu-100 transition-colors"
      >
        <RefreshCw size={12} /> Reessayer
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8"
    >
      <div className="flex flex-col gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <Megaphone size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Communication</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Annonces, echanges et forum parent</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {(['annonces', 'messagerie', 'forum'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'text-sm font-bold transition-all relative pb-2 capitalize',
                activeTab === tab ? 'text-bleu-600 dark:text-or-400' : 'text-gray-400 hover:text-gray-600',
              )}
            >
              {tab === 'annonces' ? 'Annonces' : tab === 'messagerie' ? 'Messagerie' : 'Forum'}
              {activeTab === tab && <motion.div layoutId="parent-comm-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'annonces' && (
          <motion.div key="annonces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 bg-gradient-to-br from-bleu-900 to-indigo-900 text-white border-none shadow-soft flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><Bell size={22} className="text-or-400" /></div>
                <div>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Annonces</p>
                  <h3 className="text-2xl font-black">{annonces.length}</h3>
                </div>
              </Card>
              <Card className="p-5 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 shadow-soft flex items-center gap-4">
                <div className="p-3 bg-rouge-50 dark:bg-rouge-900/10 rounded-2xl text-rouge-500"><AlertCircle size={22} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ciblees parent</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{annonces.filter((a) => a.targetRole === 'PARENT').length}</h3>
                </div>
              </Card>
            </div>

            {annoncesLoading && <LoadingSpinner />}
            {annoncesError && <ErrorBanner message={annoncesError} onRetry={loadAnnonces} />}

            {!annoncesLoading && !annoncesError && (
              <Card className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
                {annonces.length === 0 ? (
                  <div className="py-16 text-center text-sm font-bold text-gray-400">Aucune annonce pour le moment.</div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {annonces.map((msg) => (
                      <div key={msg.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl flex-shrink-0 bg-bleu-50 text-bleu-600 dark:bg-bleu-900/10">
                            <MessageSquare size={20} />
                          </div>
                          <div className="text-left font-bold">
                            <h3 className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                              {msg.title}
                              {msg.targetRole && (
                                <Badge className="bg-bleu-100 text-bleu-700 border-none text-[8px] px-1.5 h-5 font-black">
                                  {msg.targetRole}
                                </Badge>
                              )}
                            </h3>
                            <p className="text-[11px] text-gray-500 font-semibold line-clamp-1 mt-1 max-w-lg">{msg.content}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white">{msg.authorName}</p>
                          <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 justify-end mt-0.5"><Clock size={10} /> {formatDate(msg.publishedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'messagerie' && (
          <motion.div key="messagerie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
              <div className="flex h-[520px]">
                <div className="w-80 border-r border-gray-100 dark:border-white/5 flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={searchConversation}
                        onChange={(e) => setSearchConversation(e.target.value)}
                        placeholder="Rechercher un contact..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl text-[12px] font-semibold"
                      />
                    </div>
                    <select
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      className="w-full text-[11px] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2.5"
                    >
                      <option value="">Choisir un enseignant destinataire</option>
                      {contactOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {messagerieLoading && <LoadingSpinner />}
                  {messagerieError && <ErrorBanner message={messagerieError} onRetry={loadMessagerie} />}

                  {!messagerieLoading && !messagerieError && (
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                      {filteredConversations.map((conv) => {
                        const last = conv.messages[conv.messages.length - 1];
                        return (
                          <button
                            key={conv.interlocutorName}
                            onClick={() => handleSelectConversation(conv)}
                            className={cn(
                              'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors',
                              selectedInterlocutorId === conv.interlocutorId && 'bg-bleu-50/50 dark:bg-bleu-900/10 border-l-2 border-l-bleu-500',
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar name={conv.interlocutorName} size="md" className="flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-[12px] font-bold text-gray-900 dark:text-white truncate">{conv.interlocutorName}</h4>
                                  {conv.hasUnread && <div className="w-2 h-2 bg-bleu-500 rounded-full flex-shrink-0" />}
                                </div>
                                <p className="text-[11px] text-gray-500 font-semibold truncate leading-relaxed">{last?.content || 'Aucun message'}</p>
                                <p className="text-[9px] text-gray-400 font-semibold mt-1.5 flex items-center gap-1"><Clock size={9} /> {last ? formatDate(last.sentAt) : '-'}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  {selectedConv ? (
                    <>
                      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center gap-4">
                        <Avatar name={selectedConv.interlocutorName} size="md" />
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{selectedConv.interlocutorName}</h3>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {selectedConv.messages.map((msg) => (
                          <div key={msg.id} className={cn('flex', msg.senderId === user?.id ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                              'max-w-[75%] p-3.5 rounded-2xl text-sm font-semibold shadow-sm',
                              msg.senderId === user?.id
                                ? 'bg-bleu-600 text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-bl-md border border-gray-100 dark:border-white/10',
                            )}>
                              <p className="leading-relaxed">{msg.content}</p>
                              <p className={cn('text-[9px] font-semibold mt-2', msg.senderId === user?.id ? 'text-bleu-200' : 'text-gray-400')}>
                                {formatDate(msg.sentAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendMessage();
                              }}
                              placeholder="Ecrire un message..."
                              className="w-full"
                            />
                          </div>
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || !recipientId.trim() || sendingMessage || !isRecipientAllowed}
                            className="h-10 px-4"
                          >
                            <Send size={16} className="mr-2" /> Envoyer
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center p-8">
                      <div>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare size={32} className="text-gray-300" />
                        </div>
                        <p className="font-bold text-gray-400">Selectionnez une conversation</p>
                        <p className="text-[11px] text-gray-400 font-semibold mt-1">Ouvrez une discussion pour afficher les messages</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'forum' && (
          <motion.div key="forum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {forumLoading && <LoadingSpinner />}
            {forumError && <ErrorBanner message={forumError} onRetry={loadForum} />}

            {!forumLoading && !forumError && topics.map((thread) => (
              <Card key={thread.id} className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm dark:bg-gray-900/50">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{thread.subject || 'Discussion'}</h3>
                    <button
                      onClick={() => setExpandedForumId(expandedForumId === thread.id ? null : thread.id)}
                      className="text-xs text-bleu-600 font-bold"
                    >
                      {expandedForumId === thread.id ? 'Masquer' : 'Voir'}
                    </button>
                  </div>
                  <p className="text-[12px] text-gray-600 dark:text-gray-300 font-semibold">{thread.body}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-2">{thread.authorName} • {formatDate(thread.postedAt)}</p>
                </div>

                {expandedForumId === thread.id && (
                  <div className="px-5 pb-5 border-t border-gray-50 dark:border-white/5 pt-4 space-y-3">
                    {thread.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2 text-left">
                        <CornerDownRight size={14} className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{reply.authorName}</p>
                          <p className="text-[11px] text-gray-500">{reply.body}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <Input
                        value={replyTexts[thread.id] || ''}
                        onChange={(e) => setReplyTexts((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                        placeholder="Ecrire une reponse..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleReplySubmit(thread.id)}
                        disabled={!replyTexts[thread.id]?.trim() || sendingReply === thread.id}
                      >
                        {sendingReply === thread.id ? <Loader2 size={14} className="animate-spin" /> : 'Repondre'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 bg-vert-600 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-bold"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ParentCommunication;
