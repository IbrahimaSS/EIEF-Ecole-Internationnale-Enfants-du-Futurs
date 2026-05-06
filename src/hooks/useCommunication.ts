/**
 * useCommunication
 *
 * Hook centralisé pour la messagerie EIEF — utilisé par tous les rôles
 * (admin, comptable, enseignant, parent, élève).
 *
 * Fonctionnalités :
 *  - Chargement de la boîte de réception, messages envoyés, contacts autorisés
 *  - Construction des conversations triées
 *  - Envoi de messages, marquage comme lu
 *  - Subscription WebSocket pour les nouveaux messages en temps réel
 *  - Toast automatique sur message reçu
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AnnouncementResponse,
  MessageResponse,
  STOMP_BROKER_URL,
  getAnnouncements,
  getInbox,
  getSentMessages,
  markMessageAsRead,
  sendMessage,
} from '../services/communicationApi';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';

/**
 * Forme générique d'un contact dans la messagerie — chaque service backend
 * peut renvoyer un type légèrement différent (TeacherResponse, ParentResponse…),
 * on les normalise ici.
 */
export interface ChatContact {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  /** Métadonnée optionnelle pour affichage secondaire (ex: classe pour un élève) */
  meta?: string;
}

export interface Conversation {
  interlocutorId: string;
  interlocutorName: string;
  messages: MessageResponse[];
  hasUnread: boolean;
  /** Date du dernier message (pour tri) */
  lastMessageAt: string;
  /** Aperçu du dernier message */
  lastMessagePreview: string;
}

/**
 * Stratégie de chargement des contacts selon le rôle de l'utilisateur connecté.
 * Chaque rôle ne voit que les utilisateurs qu'il est autorisé à contacter.
 */
export type ContactsStrategy =
  | 'ALL_USERS' // admin / comptable
  | 'TEACHER_CONTACTS' // enseignant : ses élèves + parents
  | 'PARENT_CONTACTS' // parent : enseignants de ses enfants + admin
  | 'STUDENT_CONTACTS'; // élève : ses enseignants + admin

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
      if (isIncoming && !msg.readAt) existing.hasUnread = true;
      return;
    }

    map.set(key, {
      interlocutorId: key,
      interlocutorName,
      messages: [msg],
      hasUnread: isIncoming && !msg.readAt,
      lastMessageAt: msg.sentAt,
      lastMessagePreview: msg.content,
    });
  };

  inbox.forEach((m) => upsert(m, true));
  sent.forEach((m) => upsert(m, false));

  // Tri chrono des messages dans chaque conversation + recalcul preview/lastAt
  map.forEach((conv) => {
    conv.messages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
    const last = conv.messages[conv.messages.length - 1];
    if (last) {
      conv.lastMessageAt = last.sentAt;
      conv.lastMessagePreview = last.content;
    }
  });

  return map;
};

interface UseCommunicationOptions {
  /** Stratégie de chargement des contacts. Si non fourni, déduit du rôle. */
  contactsStrategy?: ContactsStrategy;
  /** Charger les annonces aussi */
  loadAnnouncements?: boolean;
  /** Toast quand un nouveau message arrive (par défaut: true) */
  toastOnNewMessage?: boolean;
}

const deduceStrategy = (role: string | undefined): ContactsStrategy => {
  switch (role) {
    case 'admin':
    case 'comptable':
    case 'manager':
      return 'ALL_USERS';
    case 'enseignant':
      return 'TEACHER_CONTACTS';
    case 'parent':
      return 'PARENT_CONTACTS';
    case 'eleve':
      return 'STUDENT_CONTACTS';
    default:
      return 'ALL_USERS';
  }
};

const roleLabel = (role: string | undefined | null) => {
  if (!role) return 'Utilisateur';
  const r = role.toUpperCase();
  if (r.includes('ADMIN')) return 'Administration';
  if (r.includes('TEACHER') || r.includes('ENSEIGNANT')) return 'Enseignant';
  if (r.includes('PARENT')) return 'Parent';
  if (r.includes('STUDENT') || r.includes('ELEVE')) return 'Élève';
  if (r.includes('COMPT')) return 'Comptable';
  if (r.includes('MANAGER')) return 'Manager';
  return role;
};

export function useCommunication(options: UseCommunicationOptions = {}) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const strategy = options.contactsStrategy ?? deduceStrategy(user?.role);
  const toastOnNew = options.toastOnNewMessage ?? true;

  const [inbox, setInbox] = useState<MessageResponse[]>([]);
  const [sent, setSent] = useState<MessageResponse[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conserve la conversation actuellement ouverte pour ne pas afficher de toast
  // si on est déjà en train de discuter avec l'expéditeur.
  const activeConversationRef = useRef<string | null>(null);

  /** Permet aux composants UI de prévenir le hook quelle conversation est ouverte */
  const setActiveConversation = useCallback((interlocutorId: string | null) => {
    activeConversationRef.current = interlocutorId;
  }, []);

  /**
   * Charge les contacts autorisés selon la stratégie.
   * En cas d'erreur sur un endpoint spécifique, on tombe en fallback sur la liste
   * de tous les utilisateurs (côté admin) plutôt que d'afficher une liste vide.
   */
  const loadContacts = useCallback(async (): Promise<ChatContact[]> => {
    if (!user?.id || !token) return [];

    try {
      switch (strategy) {
        case 'ALL_USERS': {
          const all = await userService.getAllUsers(token);
          return all
            .filter((u) => {
              const isSelf = u.id === user.id;
              const isActive = u.active ?? u.isActive ?? true;
              return !isSelf && isActive;
            })
            .map((u) => ({
              id: u.id,
              fullName: `${u.firstName} ${u.lastName}`.trim(),
              email: u.email,
              phone: u.phone ?? undefined,
              role: u.roleName,
              meta: roleLabel(u.roleName),
            }));
        }
        case 'TEACHER_CONTACTS': {
          // Élèves + parents de l'enseignant + admin pour l'admin/direction
          const list = await userService.getContactsByTeacher(token, user.id);
          return list
            .filter((c) => c.id !== user.id)
            .map((c: any) => ({
              id: c.id,
              fullName: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email,
              email: c.email,
              phone: c.phone,
              role: c.roleName ?? 'CONTACT',
              meta: roleLabel(c.roleName),
            }));
        }
        case 'PARENT_CONTACTS': {
          // Enseignants des enfants + (best-effort) admin via getAllUsers
          const teachers = await userService.getTeachersByParent(token, user.id);
          const teacherContacts: ChatContact[] = teachers.map((t) => ({
            id: t.userId ?? t.id,
            fullName: `${t.firstName} ${t.lastName}`.trim(),
            email: t.email,
            phone: t.phone,
            role: 'TEACHER',
            meta: 'Enseignant' + (t.specialty ? ` · ${t.specialty}` : ''),
          }));

          // Tente de récupérer les admins pour autoriser le contact direction
          let adminContacts: ChatContact[] = [];
          try {
            const all = await userService.getAllUsers(token);
            adminContacts = all
              .filter((u) => {
                if (u.id === user.id) return false;
                const r = (u.roleName || '').toUpperCase();
                return r.includes('ADMIN') || r.includes('MANAGER');
              })
              .map((u) => ({
                id: u.id,
                fullName: `${u.firstName} ${u.lastName}`.trim(),
                email: u.email,
                phone: u.phone ?? undefined,
                role: u.roleName,
                meta: roleLabel(u.roleName),
              }));
          } catch {
            /* l'utilisateur parent n'a peut-être pas accès à /users — ignore */
          }

          return [...teacherContacts, ...adminContacts];
        }
        case 'STUDENT_CONTACTS': {
          // Enseignants de l'élève + admin
          const teachers = await userService.getTeachersByStudent(token, user.id);
          const teacherContacts: ChatContact[] = teachers.map((t) => ({
            id: t.userId ?? t.id,
            fullName: `${t.firstName} ${t.lastName}`.trim(),
            email: t.email,
            phone: t.phone,
            role: 'TEACHER',
            meta: 'Enseignant' + (t.specialty ? ` · ${t.specialty}` : ''),
          }));
          return teacherContacts;
        }
        default:
          return [];
      }
    } catch (err: any) {
      console.error('Erreur chargement contacts', err);
      throw err;
    }
  }, [strategy, token, user?.id]);

  /** Recharge inbox + sent + contacts (+ annonces si demandé). */
  const refresh = useCallback(async () => {
    if (!user?.id || !token) return;
    setLoading(true);
    setError(null);
    try {
      const tasks: Promise<unknown>[] = [
        getInbox(user.id),
        getSentMessages(user.id),
        loadContacts(),
      ];
      if (options.loadAnnouncements) tasks.push(getAnnouncements());
      const [nextInbox, nextSent, nextContacts, nextAnn] = await Promise.all(tasks);

      setInbox(nextInbox as MessageResponse[]);
      setSent(nextSent as MessageResponse[]);
      setContacts(nextContacts as ChatContact[]);
      if (options.loadAnnouncements && nextAnn) {
        setAnnouncements(nextAnn as AnnouncementResponse[]);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erreur de chargement de la messagerie.');
    } finally {
      setLoading(false);
    }
  }, [loadContacts, options.loadAnnouncements, token, user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** WebSocket : nouvelle MessageResponse → on l'ajoute à inbox + toast. */
  useEffect(() => {
    if (!token || !user?.id) return;
    let cancelled = false;
    let client: any = null;

    const setup = async () => {
      try {
        // Imports dynamiques pour éviter le coût au chargement initial
        const stompMod = await import('@stomp/stompjs');
        const sockjsMod = await import('sockjs-client');
        if (cancelled) return;

        const Client = (stompMod as any).Client;
        const SockJS = (sockjsMod as any).default ?? sockjsMod;

        client = new Client({
          webSocketFactory: () => new SockJS(STOMP_BROKER_URL),
          connectHeaders: {
            'enfantsfuture-auth-token': `enfantsfuture ${token}`,
          },
          reconnectDelay: 5000,
          onConnect: () => {
            client.subscribe('/user/queue/messages', (frame: any) => {
              try {
                const msg = JSON.parse(frame.body) as MessageResponse;
                // Ajout immédiat à inbox (déduplication par id)
                setInbox((prev) =>
                  prev.some((m) => m.id === msg.id) ? prev : [msg, ...prev],
                );

                // Toast seulement si on n'est PAS en train de regarder cette conversation
                if (toastOnNew && activeConversationRef.current !== msg.senderId) {
                  toast.message('Nouveau message', {
                    description: `${msg.senderName} : ${msg.content.slice(0, 80)}${
                      msg.content.length > 80 ? '…' : ''
                    }`,
                  });
                }
              } catch (e) {
                console.error('Parse WS message échoué', frame.body, e);
              }
            });
          },
          onStompError: (frame: any) => {
            console.error('STOMP error', frame);
          },
          onWebSocketError: (event: any) => {
            // Silencieux : on tombe en fallback REST, l'utilisateur voit ses
            // messages au prochain refresh manuel.
            console.warn('WS error', event);
          },
        });

        client.activate();
      } catch (e) {
        console.warn('WebSocket non disponible — mode REST seul', e);
      }
    };

    setup();
    return () => {
      cancelled = true;
      if (client) {
        try {
          client.deactivate();
        } catch {
          /* ignore */
        }
      }
    };
  }, [token, toastOnNew, user?.id]);

  // ─────────── Conversations ───────────
  const conversations = useMemo(() => buildConversations(inbox, sent), [inbox, sent]);
  const conversationList = useMemo(
    () =>
      Array.from(conversations.values()).sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      ),
    [conversations],
  );
  const unreadCount = useMemo(
    () => inbox.filter((m) => !m.readAt).length,
    [inbox],
  );

  // ─────────── Actions ───────────
  /**
   * Envoie un message à un contact.
   * Validation : le destinataire doit être dans la liste des contacts autorisés.
   * En cas de succès, met à jour l'état local sans recharger toute l'API.
   */
  const send = useCallback(
    async (recipientId: string, content: string) => {
      const trimmedContent = content.trim();
      const trimmedRecipient = recipientId.trim();
      if (!user?.id) throw new Error('Vous devez être connecté');
      if (!trimmedRecipient) throw new Error('Aucun destinataire sélectionné');
      if (!trimmedContent) throw new Error('Le message est vide');

      const allowed = contacts.some((c) => c.id === trimmedRecipient);
      if (!allowed) {
        throw new Error("Destinataire non autorisé pour votre rôle");
      }

      setSending(true);
      try {
        const created = await sendMessage(user.id, {
          recipientId: trimmedRecipient,
          content: trimmedContent,
        });
        // Mise à jour optimiste de la liste sent
        setSent((prev) => [created, ...prev]);
        return created;
      } finally {
        setSending(false);
      }
    },
    [contacts, user?.id],
  );

  /** Marque tous les messages reçus d'un interlocuteur comme lus. */
  const markConversationAsRead = useCallback(
    async (interlocutorId: string) => {
      const unread = inbox.filter(
        (m) => m.senderId === interlocutorId && !m.readAt,
      );
      if (unread.length === 0) return;
      try {
        await Promise.all(unread.map((m) => markMessageAsRead(m.id)));
        // Update local sans rappel API : marque readAt = now
        const now = new Date().toISOString();
        setInbox((prev) =>
          prev.map((m) =>
            m.senderId === interlocutorId && !m.readAt ? { ...m, readAt: now } : m,
          ),
        );
      } catch (err) {
        console.error('markAsRead failed', err);
      }
    },
    [inbox],
  );

  return {
    // données
    user,
    inbox,
    sent,
    contacts,
    conversations,
    conversationList,
    announcements,
    unreadCount,
    // état
    loading,
    sending,
    error,
    setError,
    // actions
    refresh,
    send,
    markConversationAsRead,
    setActiveConversation,
  };
}
