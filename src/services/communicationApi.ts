// ============================================================
// services/communicationApi.ts
// Couche d'accès API pour le module Communication
// ============================================================

import { apiRequest } from "./api"; // adapte le chemin si nécessaire

// ─── Types ────────────────────────────────────────────────────

export interface AnnouncementRequest {
  title: string;
  content: string;
  targetRole?: string; // "PARENT" | "TEACHER" | "STUDENT" | null = tous
}

export interface AnnouncementResponse {
  id: string;
  authorName: string;
  title: string;
  content: string;
  targetRole?: string;
  publishedAt: string; // ISO 8601
}

export interface MessageRequest {
  recipientId: string; // UUID
  content: string;
}

export interface MessageResponse {
  id: string;
  senderName: string;
  recipientName: string;
  content: string;
  sentAt: string;   // ISO 8601
  readAt?: string;  // null si non lu
}

export interface ForumPostRequest {
  subject: string;
  body: string;
}

export interface ForumPostResponse {
  id: string;
  authorName: string;
  subject: string;
  body: string;
  postedAt: string; // ISO 8601
  replies: ForumPostResponse[];
}

// ─── Announcements ────────────────────────────────────────────

/**
 * Créer une annonce (ADMIN / STAFF uniquement côté serveur).
 * @param authorId UUID de l'auteur (admin connecté)
 */
export const createAnnouncement = (
  authorId: string,
  data: AnnouncementRequest
): Promise<AnnouncementResponse> =>
  apiRequest<AnnouncementResponse>(
    `/messages/announcements?authorId=${authorId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

/**
 * Récupérer toutes les annonces, avec filtre optionnel sur le rôle cible.
 * @param targetRole "PARENT" | "TEACHER" | "STUDENT" | undefined
 */
export const getAnnouncements = (
  targetRole?: string
): Promise<AnnouncementResponse[]> => {
  const qs = targetRole ? `?targetRole=${targetRole}` : "";
  return apiRequest<AnnouncementResponse[]>(`/messages/announcements${qs}`);
};

/**
 * Mettre à jour une annonce existante.
 */
export const updateAnnouncement = (
  id: string,
  data: AnnouncementRequest
): Promise<AnnouncementResponse> =>
  apiRequest<AnnouncementResponse>(`/messages/announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

/**
 * Supprimer une annonce (ADMIN uniquement côté serveur).
 */
export const deleteAnnouncement = (id: string): Promise<void> =>
  apiRequest<void>(`/messages/announcements/${id}`, { method: "DELETE" });

// ─── Messages privés ──────────────────────────────────────────

/**
 * Envoyer un message privé via REST.
 * (Pour la messagerie temps réel, utiliser le canal WebSocket /app/chat.send)
 */
export const sendMessage = (
  senderId: string,
  data: MessageRequest
): Promise<MessageResponse> =>
  apiRequest<MessageResponse>(`/messages/send?senderId=${senderId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });

/** Boîte de réception de l'utilisateur connecté. */
export const getInbox = (userId: string): Promise<MessageResponse[]> =>
  apiRequest<MessageResponse[]>(`/messages/inbox?userId=${userId}`);

/** Messages envoyés par l'utilisateur connecté. */
export const getSentMessages = (userId: string): Promise<MessageResponse[]> =>
  apiRequest<MessageResponse[]>(`/messages/sent?userId=${userId}`);

/** Messages non lus de l'utilisateur connecté. */
export const getUnreadMessages = (userId: string): Promise<MessageResponse[]> =>
  apiRequest<MessageResponse[]>(`/messages/unread?userId=${userId}`);

/** Marquer un message comme lu. */
export const markMessageAsRead = (id: string): Promise<MessageResponse> =>
  apiRequest<MessageResponse>(`/messages/${id}/read`, { method: "PATCH" });

/** Supprimer un message (ADMIN / STAFF côté serveur). */
export const deleteMessage = (id: string): Promise<void> =>
  apiRequest<void>(`/messages/${id}`, { method: "DELETE" });

// ─── Forum ────────────────────────────────────────────────────

/**
 * Créer un nouveau sujet de forum.
 * @param authorId UUID de l'utilisateur connecté
 */
export const createForumTopic = (
  authorId: string,
  data: ForumPostRequest
): Promise<ForumPostResponse> =>
  apiRequest<ForumPostResponse>(
    `/messages/forum/topics?authorId=${authorId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

/** Récupérer tous les sujets du forum. */
export const getForumTopics = (): Promise<ForumPostResponse[]> =>
  apiRequest<ForumPostResponse[]>("/messages/forum/topics");

/**
 * Ajouter une réponse à un sujet existant.
 * @param topicId UUID du sujet parent
 * @param authorId UUID de l'utilisateur connecté
 */
export const addForumReply = (
  topicId: string,
  authorId: string,
  data: ForumPostRequest
): Promise<ForumPostResponse> =>
  apiRequest<ForumPostResponse>(
    `/messages/forum/topics/${topicId}/replies?authorId=${authorId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

/** Supprimer un sujet (ADMIN / STAFF côté serveur). */
export const deleteForumTopic = (id: string): Promise<void> =>
  apiRequest<void>(`/messages/forum/topics/${id}`, { method: "DELETE" });

// ─── WebSocket (temps réel) ───────────────────────────────────

/**
 * Utilitaires pour la connexion STOMP/SockJS.
 *
 * Installation : npm install @stomp/stompjs sockjs-client
 * (ou yarn add @stomp/stompjs sockjs-client)
 *
 * Usage dans le composant React :
 *
 *   import { createStompClient } from './communicationApi';
 *   import { getStoredToken } from './apiClient'; // expose le token si nécessaire
 *
 *   const client = createStompClient(token, (message) => {
 *     console.log('Nouveau message :', message);
 *   });
 *   client.activate();
 *   // cleanup : client.deactivate();
 */
export const STOMP_BROKER_URL =
  process.env.REACT_APP_WS_URL || "http://127.0.0.1:8080/ws";

/**
 * Fabrique un client STOMP prêt à l'emploi.
 * Le token JWT est passé dans les headers STOMP CONNECT.
 */
export const createStompClient = (
  token: string,
  onMessage: (msg: MessageResponse) => void
) => {
  // Import dynamique pour éviter une dépendance dure si WebSocket non utilisé
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Client } = require("@stomp/stompjs");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SockJS = require("sockjs-client");

  const client = new Client({
    webSocketFactory: () => new SockJS(STOMP_BROKER_URL),
    connectHeaders: {
      "enfantsfuture-auth-token": `enfantsfuture ${token}`,
    },
    onConnect: () => {
      // S'abonner à la file personnelle de l'utilisateur connecté
      client.subscribe("/user/queue/messages", (frame: any) => {
        try {
          onMessage(JSON.parse(frame.body) as MessageResponse);
        } catch {
          console.error("Erreur parsing message WebSocket", frame.body);
        }
      });
    },
    onStompError: (frame: any) => {
      console.error("Erreur STOMP", frame);
    },
  });

  return client;
};

/**
 * Envoyer un message via WebSocket (nécessite que le client soit connecté).
 * @param stompClient Instance retournée par createStompClient
 * @param request     { recipientId, content }
 */
export const sendMessageWs = (
  stompClient: any,
  request: MessageRequest
): void => {
  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(request),
  });
};
