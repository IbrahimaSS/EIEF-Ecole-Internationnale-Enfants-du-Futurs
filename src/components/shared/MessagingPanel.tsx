import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CheckCheck,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, Badge, Button } from '../ui';
import { cn } from '../../utils/cn';
import { useCommunication, ChatContact } from '../../hooks/useCommunication';
import ContactPicker from './ContactPicker';

interface MessagingPanelProps {
  /** Liste des rôles autorisés à être contactés (optionnel — par défaut tous ceux du hook) */
  filterRoles?: string[];
  /** Hauteur fixée du panneau (px ou tailwind class). Default: 600px */
  height?: number;
  /** Titre affiché en haut du panneau */
  title?: string;
  subtitle?: string;
}

const formatRelative = (iso: string) => {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diff < 1) return "À l'instant";
  if (diff < 60) return `il y a ${diff} min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `il y a ${h}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDayHeader = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Panneau de messagerie réutilisable — utilisé par admin / enseignant /
 * parent / élève. Affiche les conversations à gauche, le fil au centre,
 * et un composer en bas. Gère un mode "Nouveau message" qui ouvre un
 * sélecteur de contact.
 */
const MessagingPanel: React.FC<MessagingPanelProps> = ({
  filterRoles,
  height = 600,
  title = 'Messagerie',
  subtitle,
}) => {
  const {
    user,
    contacts,
    conversationList,
    conversations,
    unreadCount,
    loading,
    sending,
    error,
    setError,
    refresh,
    send,
    markConversationAsRead,
    setActiveConversation,
  } = useCommunication();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composerText, setComposerText] = useState('');
  const [searchConv, setSearchConv] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newRecipientId, setNewRecipientId] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const threadRef = useRef<HTMLDivElement>(null);

  const selectedConv = selectedId ? conversations.get(selectedId) ?? null : null;

  const filteredConvs = useMemo(() => {
    const q = searchConv.trim().toLowerCase();
    if (!q) return conversationList;
    return conversationList.filter(
      (c) =>
        c.interlocutorName.toLowerCase().includes(q) ||
        c.lastMessagePreview.toLowerCase().includes(q),
    );
  }, [conversationList, searchConv]);

  // Notifie le hook quelle conversation est ouverte (pour ne pas spammer de toasts)
  useEffect(() => {
    setActiveConversation(selectedId);
    return () => setActiveConversation(null);
  }, [selectedId, setActiveConversation]);

  // Marquer comme lu quand on ouvre une conversation
  useEffect(() => {
    if (selectedId) {
      markConversationAsRead(selectedId);
    }
  }, [selectedId, markConversationAsRead]);

  // Auto-scroll en bas du fil quand de nouveaux messages arrivent
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [selectedConv?.messages.length]);

  const selectedContact: ChatContact | undefined = useMemo(
    () => contacts.find((c) => c.id === selectedId),
    [contacts, selectedId],
  );

  const handleSend = async () => {
    if (!selectedId || !composerText.trim()) return;
    try {
      await send(selectedId, composerText);
      setComposerText('');
      toast.success('Message envoyé');
    } catch (err: any) {
      toast.error("Échec de l'envoi", {
        description: err?.message || 'Impossible d\'envoyer le message.',
      });
    }
  };

  const handleStartNew = async () => {
    if (!newRecipientId || !newMessage.trim()) return;
    try {
      await send(newRecipientId, newMessage);
      toast.success('Message envoyé');
      setSelectedId(newRecipientId);
      setNewRecipientId('');
      setNewMessage('');
      setIsNewOpen(false);
    } catch (err: any) {
      toast.error("Échec de l'envoi", {
        description: err?.message || 'Impossible d\'envoyer le message.',
      });
    }
  };

  // Groupe les messages par jour pour les séparateurs
  const messagesByDay = useMemo(() => {
    if (!selectedConv) return [];
    const groups: Array<{ day: string; messages: typeof selectedConv.messages }> = [];
    let currentDay = '';
    selectedConv.messages.forEach((m) => {
      const day = new Date(m.sentAt).toDateString();
      if (day !== currentDay) {
        groups.push({ day: m.sentAt, messages: [m] });
        currentDay = day;
      } else {
        groups[groups.length - 1].messages.push(m);
      }
    });
    return groups;
  }, [selectedConv]);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft dark:border-white/10 dark:bg-gray-900/60"
      style={{ height }}
    >
      {/* COLONNE GAUCHE — liste des conversations */}
      <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-gradient-to-b from-gray-50 to-white dark:border-white/5 dark:from-gray-900 dark:to-gray-900/60">
        <div className="border-b border-gray-100 p-4 dark:border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-black text-gray-900 dark:text-white">
                <MessageSquare size={18} className="text-vert-600 dark:text-or-400" />
                {title}
              </h3>
              {subtitle && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={refresh}
                disabled={loading}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-vert-600 transition-colors disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-or-400"
                title="Actualiser"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setIsNewOpen(true)}
                className="rounded-lg bg-gradient-to-r from-vert-600 to-vert-700 p-2 text-white shadow-md hover:from-vert-500 hover:to-vert-600 transition-colors"
                title="Nouveau message"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Barre de recherche conversations */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              value={searchConv}
              onChange={(e) => setSearchConv(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-gray-900 outline-none focus:border-vert-500 focus:ring-2 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-or-400"
            />
          </div>

          {unreadCount > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-rouge-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-rouge-700 dark:bg-rouge-900/20 dark:text-rouge-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rouge-500" />
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversationList.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-8 text-xs font-bold text-gray-400">
              <Loader2 size={14} className="animate-spin" /> Chargement...
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-500">
                {conversationList.length === 0
                  ? 'Aucune conversation pour le moment.'
                  : 'Aucun résultat.'}
              </p>
              {conversationList.length === 0 && (
                <button
                  onClick={() => setIsNewOpen(true)}
                  className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-vert-700 dark:text-or-400 hover:underline"
                >
                  <Plus size={12} /> Démarrer une conversation
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredConvs.map((conv) => {
                const active = conv.interlocutorId === selectedId;
                return (
                  <li key={conv.interlocutorId}>
                    <button
                      onClick={() => setSelectedId(conv.interlocutorId)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                        active
                          ? 'bg-vert-50 dark:bg-or-500/10'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5',
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar name={conv.interlocutorName} size="sm" className="ring-2 ring-or-400/30" />
                        {conv.hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rouge-500 ring-2 ring-white dark:ring-gray-900" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p
                            className={cn(
                              'truncate text-sm',
                              conv.hasUnread
                                ? 'font-black text-gray-900 dark:text-white'
                                : 'font-bold text-gray-700 dark:text-gray-300',
                            )}
                          >
                            {conv.interlocutorName}
                          </p>
                          <span className="shrink-0 text-[10px] font-bold text-gray-400">
                            {formatRelative(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'truncate text-xs',
                            conv.hasUnread
                              ? 'font-bold text-gray-700 dark:text-gray-200'
                              : 'text-gray-500 dark:text-gray-400',
                          )}
                        >
                          {conv.lastMessagePreview}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* COLONNE DROITE — fil + composer (ou écran d'accueil) */}
      <section className="flex min-h-0 flex-col">
        {error && (
          <div className="flex items-center gap-2 border-b border-rouge-100 bg-rouge-50 px-4 py-2 text-rouge-700 dark:border-rouge-500/30 dark:bg-rouge-500/10 dark:text-rouge-300">
            <AlertCircle size={14} />
            <span className="text-xs font-bold flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-xs font-black">
              <X size={14} />
            </button>
          </div>
        )}

        {isNewOpen ? (
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Nouveau message
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Sélectionnez un contact autorisé puis composez votre message.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsNewOpen(false);
                  setNewRecipientId('');
                  setNewMessage('');
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <ContactPicker
                contacts={contacts}
                value={newRecipientId}
                onChange={(id) => setNewRecipientId(id)}
                filterRoles={filterRoles}
                required
              />

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Message <span className="text-rouge-500">*</span>
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message ici..."
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-or-400"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewOpen(false);
                    setNewRecipientId('');
                    setNewMessage('');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleStartNew}
                  disabled={!newRecipientId || !newMessage.trim() || sending}
                  className="flex items-center gap-2 bg-gradient-to-r from-vert-600 to-vert-700 text-white hover:from-vert-500 hover:to-vert-600"
                >
                  {sending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Envoyer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : !selectedConv ? (
          <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-vert-500 to-bleu-700 text-white shadow-xl">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Sélectionnez une conversation
            </h3>
            <p className="mt-2 max-w-sm text-sm font-medium text-gray-500 dark:text-gray-400">
              Choisissez un échange dans la liste, ou démarrez une nouvelle conversation
              avec un contact autorisé.
            </p>
            <Button
              onClick={() => setIsNewOpen(true)}
              className="mt-5 flex items-center gap-2 bg-gradient-to-r from-vert-600 to-vert-700 text-white"
            >
              <Plus size={14} /> Nouveau message
            </Button>
          </div>
        ) : (
          <>
            {/* Header conversation */}
            <header className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-5 py-3 dark:border-white/5 dark:bg-gray-900/80 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={selectedConv.interlocutorName} size="md" className="ring-2 ring-or-400/30" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-gray-900 dark:text-white">
                    {selectedConv.interlocutorName}
                  </p>
                  <p className="truncate text-[10px] font-bold uppercase tracking-widest text-vert-700 dark:text-or-400">
                    {selectedContact?.meta || selectedContact?.role || 'Contact'}
                  </p>
                </div>
              </div>
              <Badge
                variant="default"
                className="text-[9px] font-black uppercase tracking-widest"
              >
                {selectedConv.messages.length} message{selectedConv.messages.length > 1 ? 's' : ''}
              </Badge>
            </header>

            {/* Fil de discussion */}
            <div
              ref={threadRef}
              className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white p-5 space-y-3 dark:from-gray-950/50 dark:to-gray-900/30"
            >
              {messagesByDay.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-center">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:bg-white/5 dark:text-gray-400">
                      {formatDayHeader(group.day)}
                    </span>
                  </div>
                  {group.messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'group max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
                            isMe
                              ? 'bg-gradient-to-br from-vert-600 to-vert-700 text-white rounded-br-sm'
                              : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm dark:bg-gray-800 dark:border-white/5 dark:text-white',
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {m.content}
                          </p>
                          <div
                            className={cn(
                              'mt-1 flex items-center justify-end gap-1 text-[10px] font-bold',
                              isMe ? 'text-vert-100' : 'text-gray-400',
                            )}
                          >
                            <span>{formatTime(m.sentAt)}</span>
                            {isMe && (m.readAt ? <CheckCheck size={11} /> : <CheckCircle2 size={11} />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Composer */}
            <footer className="border-t border-gray-100 p-3 dark:border-white/5">
              <div className="flex items-end gap-2">
                <textarea
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Tapez votre message... (Shift+Entrée pour saut de ligne)"
                  rows={1}
                  className="flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-vert-500 focus:ring-2 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-or-400 max-h-32"
                  style={{ minHeight: 42 }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!composerText.trim() || sending}
                  className="h-[42px] flex items-center gap-2 bg-gradient-to-r from-vert-600 to-vert-700 text-white hover:from-vert-500 hover:to-vert-600 disabled:opacity-50 px-5"
                >
                  {sending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </Button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
};

export default MessagingPanel;
