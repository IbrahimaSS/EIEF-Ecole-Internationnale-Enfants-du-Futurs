import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Bell, AlertCircle, Clock, Megaphone,
  CornerDownRight, Search, Paperclip, UserCheck, Loader2, RefreshCw,
} from 'lucide-react';
import { Card, Badge, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCurrentUserId = (): string | null => {
  try {
    const raw = window.localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

// ─── Types locaux ─────────────────────────────────────────────────────────────

interface Conversation {
  interlocutorName: string;
  messages: MessageResponse[];
  hasUnread: boolean;
}

const buildConversations = (
  inbox: MessageResponse[],
  sent: MessageResponse[]
): Map<string, Conversation> => {
  const map = new Map<string, Conversation>();

  const upsert = (msg: MessageResponse, isIncoming: boolean) => {
    const key = isIncoming ? msg.senderName : msg.recipientName;
    const existing = map.get(key);
    if (existing) {
      existing.messages.push(msg);
      if (isIncoming && !msg.readAt) existing.hasUnread = true;
    } else {
      map.set(key, {
        interlocutorName: key,
        messages: [msg],
        hasUnread: isIncoming && !msg.readAt,
      });
    }
  };

  inbox.forEach((m) => upsert(m, true));
  sent.forEach((m) => upsert(m, false));

  map.forEach((conv) => {
    conv.messages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  });

  return map;
};

// ─── Composant ───────────────────────────────────────────────────────────────

const EleveCommunication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'annonces' | 'messagerie' | 'forum'>('annonces');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Message envoyé');

  // Annonces
  const [annonces, setAnnonces] = useState<AnnouncementResponse[]>([]);
  const [annoncesLoading, setAnnoncesLoading] = useState(false);
  const [annoncesError, setAnnoncesError] = useState<string | null>(null);

  // Messagerie
  const [inbox, setInbox] = useState<MessageResponse[]>([]);
  const [sent, setSent] = useState<MessageResponse[]>([]);
  const [messagerieLoading, setMessagerieLoading] = useState(false);
  const [messagerieError, setMessagerieError] = useState<string | null>(null);
  const [selectedInterlocutor, setSelectedInterlocutor] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchConversation, setSearchConversation] = useState('');
  const [recipientId, setRecipientId] = useState('');

  // Forum
  const [topics, setTopics] = useState<ForumPostResponse[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumError, setForumError] = useState<string | null>(null);
  const [expandedForumId, setExpandedForumId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  const currentUserId = getCurrentUserId();

  // ── Loaders ───────────────────────────────────────────────────────────────

  const loadAnnonces = useCallback(async () => {
    setAnnoncesLoading(true);
    setAnnoncesError(null);
    try {
      const data = await getAnnouncements('STUDENT');
      setAnnonces(data);
    } catch (err: any) {
      setAnnoncesError(err?.message || 'Impossible de charger les annonces.');
    } finally {
      setAnnoncesLoading(false);
    }
  }, []);

  const loadMessagerie = useCallback(async () => {
    if (!currentUserId) return;
    setMessagerieLoading(true);
    setMessagerieError(null);
    try {
      const [inboxData, sentData] = await Promise.all([
        getInbox(currentUserId),
        getSentMessages(currentUserId),
      ]);
      setInbox(inboxData);
      setSent(sentData);
    } catch (err: any) {
      setMessagerieError(err?.message || 'Impossible de charger les messages.');
    } finally {
      setMessagerieLoading(false);
    }
  }, [currentUserId]);

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
    if (activeTab === 'messagerie') loadMessagerie();
    if (activeTab === 'forum') loadForum();
  }, [activeTab, loadAnnonces, loadMessagerie, loadForum]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !recipientId.trim()) return;
    setSendingMessage(true);
    try {
      await sendMessage(currentUserId, { recipientId: recipientId.trim(), content: newMessage.trim() });
      setNewMessage('');
      showSuccess('Message envoyé !');
      await loadMessagerie();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSelectConversation = async (name: string) => {
    setSelectedInterlocutor(name);
    const unread = inbox.filter((m) => m.senderName === name && !m.readAt);
    await Promise.all(unread.map((m) => markMessageAsRead(m.id))).catch(console.error);
    if (unread.length > 0) await loadMessagerie();
  };

  const handleReplySubmit = async (topicId: string) => {
    const text = replyTexts[topicId]?.trim();
    if (!text || !currentUserId) return;
    setSendingReply(topicId);
    try {
      await addForumReply(topicId, currentUserId, { subject: '', body: text });
      setReplyTexts((prev) => ({ ...prev, [topicId]: '' }));
      showSuccess('Réponse publiée !');
      await loadForum();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSendingReply(null);
    }
  };

  // ── Dérivés ───────────────────────────────────────────────────────────────

  const conversations = currentUserId
    ? buildConversations(inbox, sent)
    : new Map<string, Conversation>();

  const filteredConversations = Array.from(conversations.values()).filter((c) =>
    c.interlocutorName.toLowerCase().includes(searchConversation.toLowerCase())
  );

  const selectedConv = selectedInterlocutor ? conversations.get(selectedInterlocutor) : null;

  // ── Render helpers ────────────────────────────────────────────────────────

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
        <RefreshCw size={12} /> Réessayer
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER */}
      <div className="flex flex-col gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <Megaphone size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Espace Echanges</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Annonces, questions aux profs et entraide élèves
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {(['annonces', 'messagerie', 'forum'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'text-sm font-bold transition-all relative pb-2 capitalize',
                activeTab === tab ? 'text-bleu-600 dark:text-or-400' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {tab === 'annonces' ? 'Annonces EIEF' : tab === 'messagerie' ? 'Mes Professeurs' : 'Forum Entraide'}
              {activeTab === tab && (
                <motion.div layoutId="eleve-comm-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ═══ ANNONCES ═══ */}
        {activeTab === 'annonces' && (
          <motion.div key="annonces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-bleu-900 to-indigo-900 text-white border-none shadow-soft flex items-center gap-4">
                <div className="p-4 bg-white/10 rounded-2xl"><Bell size={24} className="text-or-400" /></div>
                <div>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Messages officiels</p>
                  <h3 className="text-2xl font-black">{annonces.length}</h3>
                </div>
              </Card>
              <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-4">
                <div className="p-4 bg-rouge-50 dark:bg-rouge-900/20 text-rouge-500 rounded-2xl"><AlertCircle size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ciblées</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {annonces.filter((a) => a.targetRole).length}
                  </h3>
                </div>
              </Card>
            </div>

            {annoncesLoading && <LoadingSpinner />}
            {annoncesError && <ErrorBanner message={annoncesError} onRetry={loadAnnonces} />}

            {!annoncesLoading && !annoncesError && (
              <Card className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50">
                {annonces.length === 0 ? (
                  <div className="py-16 text-center text-sm font-bold text-gray-400">Aucune annonce pour le moment.</div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {annonces.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
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
                            <p className="text-[11px] text-gray-500 font-semibold line-clamp-1 mt-1 max-w-lg leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white">{msg.authorName}</p>
                          <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 justify-end mt-0.5">
                            <Clock size={10} /> {formatDate(msg.publishedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </motion.div>
        )}

        {/* ═══ MESSAGERIE ═══ */}
        {activeTab === 'messagerie' && (
          <motion.div key="messagerie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {messagerieLoading && <LoadingSpinner />}
            {messagerieError && <ErrorBanner message={messagerieError} onRetry={loadMessagerie} />}

            {!messagerieLoading && !messagerieError && (
              <Card className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50 h-[550px] flex">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-100 dark:border-white/5 h-full flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-white/5">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={searchConversation}
                        onChange={(e) => setSearchConversation(e.target.value)}
                        placeholder="Chercher un interlocuteur..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-bleu-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                    {filteredConversations.length === 0 && (
                      <p className="p-6 text-center text-xs font-bold text-gray-400">Aucune conversation</p>
                    )}
                    {filteredConversations.map((conv) => {
                      const lastMsg = conv.messages[conv.messages.length - 1];
                      return (
                        <button
                          key={conv.interlocutorName}
                          onClick={() => handleSelectConversation(conv.interlocutorName)}
                          className={cn(
                            'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all relative overflow-hidden',
                            selectedInterlocutor === conv.interlocutorName && 'bg-bleu-50/50 dark:bg-bleu-900/10'
                          )}
                        >
                          {selectedInterlocutor === conv.interlocutorName && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-bleu-600" />
                          )}
                          <div className="flex gap-3">
                            <Avatar name={conv.interlocutorName} size="md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-black text-gray-900 dark:text-white">{conv.interlocutorName}</p>
                                {conv.hasUnread && <div className="w-2 h-2 bg-bleu-500 rounded-full" />}
                              </div>
                              <p className="text-[11px] font-semibold text-gray-500 line-clamp-1">{lastMsg?.content}</p>
                              <p className="text-[9px] text-gray-400 font-bold mt-1">
                                {lastMsg ? formatDate(lastMsg.sentAt) : ''}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chat */}
                <div className="flex-1 h-full flex flex-col relative">
                  {selectedConv ? (
                    <>
                      <div className="p-4 border-b border-gray-50 dark:border-white/5 flex items-center gap-3">
                        <Avatar name={selectedConv.interlocutorName} size="md" />
                        <div className="text-left font-bold">
                          <p className="text-sm text-gray-900 dark:text-white">{selectedConv.interlocutorName}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <UserCheck size={10} className="text-vert-500" /> Conversation privée
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {selectedConv.messages.map((m) => {
                          const isMine = m.senderName !== selectedConv.interlocutorName;
                          return (
                            <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                              <div
                                className={cn(
                                  'max-w-[75%] p-4 rounded-3xl text-sm font-semibold shadow-sm',
                                  isMine
                                    ? 'bg-bleu-600 text-white rounded-br-md text-right'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-bl-md text-left'
                                )}
                              >
                                <p className="leading-relaxed">{m.content}</p>
                                <p className={cn('text-[9px] mt-2 font-bold opacity-60', isMine ? 'text-white' : 'text-gray-400')}>
                                  {formatDate(m.sentAt)}{m.readAt && isMine && ' · Lu'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 border-t border-gray-50 dark:border-white/5 space-y-2">
                        <input
                          value={recipientId}
                          onChange={(e) => setRecipientId(e.target.value)}
                          placeholder="UUID du destinataire..."
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-semibold outline-none focus:ring-2 focus:ring-bleu-500/20 text-gray-400"
                        />
                        <div className="flex items-center gap-3">
                          <button className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-2xl hover:text-gray-900 transition-colors">
                            <Paperclip size={18} />
                          </button>
                          <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Pose ta question..."
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-bleu-500/20"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={sendingMessage}
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
                      <p className="mt-4 font-black">Choisis une conversation</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* ═══ FORUM ═══ */}
        {activeTab === 'forum' && (
          <motion.div key="forum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white px-2">Espace d'entraide entre élèves</h2>

            {forumLoading && <LoadingSpinner />}
            {forumError && <ErrorBanner message={forumError} onRetry={loadForum} />}

            {!forumLoading && !forumError && (
              <div className="space-y-4">
                {topics.length === 0 && (
                  <p className="text-center py-12 text-sm font-bold text-gray-400">Aucun sujet pour le moment.</p>
                )}
                {topics.map((thread) => (
                  <Card key={thread.id} className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50">
                    <div className="p-6 text-left">
                      <div className="flex items-start gap-4">
                        <Avatar name={thread.authorName} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-black text-gray-900 dark:text-white">{thread.authorName}</p>
                            <span className="text-[10px] font-bold text-gray-400">{formatDate(thread.postedAt)}</span>
                          </div>
                          <p className="text-xs font-bold text-bleu-600 mb-1">{thread.subject}</p>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{thread.body}</p>
                          <button
                            onClick={() => setExpandedForumId(expandedForumId === thread.id ? null : thread.id)}
                            className="mt-4 text-[11px] font-black text-bleu-600 bg-bleu-50 px-3 py-1.5 rounded-xl hover:bg-bleu-100 transition-colors flex items-center gap-2"
                          >
                            <MessageSquare size={12} />
                            {thread.replies?.length ?? 0} Réponse{(thread.replies?.length ?? 0) !== 1 ? 's' : ''}
                          </button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedForumId === thread.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
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
                              <Avatar name="Moi" size="sm" />
                              <div className="flex-1 relative">
                                <input
                                  value={replyTexts[thread.id] ?? ''}
                                  onChange={(e) => setReplyTexts((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleReplySubmit(thread.id); }}
                                  placeholder="Ajoute ton aide..."
                                  className="w-full pl-5 pr-12 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl text-xs font-semibold shadow-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-bleu-500/20"
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
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-vert-100 min-w-[300px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-vert-100 text-vert-500 rounded-xl"><UserCheck size={24} /></div>
              <div className="text-left font-bold">
                <p className="text-sm text-gray-900 dark:text-white">{successMsg}</p>
                <p className="text-[11px] text-gray-500 font-semibold">Opération réussie</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EleveCommunication;
