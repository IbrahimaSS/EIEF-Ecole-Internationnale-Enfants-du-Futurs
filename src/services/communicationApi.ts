// ============================================================
// services/communicationApi.ts
// Couche d'accès API pour le module Communication
// ============================================================

import { apiRequest } from "./api"; // adapte le chemin si nécessaire

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnnouncementRequest {
  title: string;
  content: string;
  targetRole?: string; // "PARENT" | "TEACHER" | "STUDENT" | undefined = tous
}

export interface AnnouncementResponse {
  id: string;
  authorName: string;
  title: string;
  content: string;
  targetRole: string | null; // null quand l'annonce cible tout le monde
  publishedAt: string; // ISO 8601
}

export interface MessageRequest {
  recipientId: string; // UUID
  content: string;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  sentAt: string; // ISO 8601
  readAt: string | null; // null si non lu
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

// ─── Announcements ────────────────────────────────────────────────────────────

/**
 * Récupérer toutes les annonces, avec filtre optionnel sur le rôle cible.
 * GET /messages/announcements?targetRole=PARENT
 */
export const getAnnouncements = (
  targetRole?: string,
): Promise<AnnouncementResponse[]> => {
  const qs = targetRole ? `?targetRole=${encodeURIComponent(targetRole)}` : "";
  return apiRequest<AnnouncementResponse[]>(`/messages/announcements${qs}`);
};

/**
 * Créer une annonce (ADMIN / STAFF uniquement côté serveur).
 * POST /messages/announcements?authorId={authorId}
 */
export const createAnnouncement = (
  authorIdOrData: string | AnnouncementRequest,
  dataMaybe?: AnnouncementRequest,
): Promise<AnnouncementResponse> =>
  apiRequest<AnnouncementResponse>(`/messages/announcements`, {
    method: "POST",
    body: JSON.stringify(
      typeof authorIdOrData === "string" ? dataMaybe : authorIdOrData,
    ),
  });

/**
 * Mettre à jour une annonce existante.
 * PUT /messages/announcements/{id}
 */
export const updateAnnouncement = (
  id: string,
  data: AnnouncementRequest,
): Promise<AnnouncementResponse> =>
  apiRequest<AnnouncementResponse>(`/messages/announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

/**
 * Supprimer une annonce (ADMIN uniquement côté serveur).
 * DELETE /messages/announcements/{id}
 */
export const deleteAnnouncement = (id: string): Promise<void> =>
  apiRequest<void>(`/messages/announcements/${id}`, { method: "DELETE" });

// ─── Messages privés ──────────────────────────────────────────────────────────

/**
 * Envoyer un message privé via REST.
 * POST /messages/send?senderId={senderId}
 */
export const sendMessage = (
  senderIdOrData: string | MessageRequest,
  dataMaybe?: MessageRequest,
): Promise<MessageResponse> =>
  apiRequest<MessageResponse>(`/messages/send`, {
    method: "POST",
    body: JSON.stringify(
      typeof senderIdOrData === "string" ? dataMaybe : senderIdOrData,
    ),
  });

/**
 * Boîte de réception de l'utilisateur connecté.
 * GET /messages/inbox?userId={userId}
 */
export const getInbox = (userId: string): Promise<MessageResponse[]> =>
  apiRequest<MessageResponse[]>(`/messages/inbox?userId=${userId}`);

/**
 * Messages envoyés par l'utilisateur connecté.
 * GET /messages/sent?userId={userId}
 */
export const getSentMessages = (userId: string): Promise<MessageResponse[]> =>
  apiRequest<MessageResponse[]>(`/messages/sent?userId=${userId}`);

/**
 * Messages non lus de l'utilisateur connecté.
 * GET /messages/unread?userId={userId}
 */
export const getUnreadMessages = (userId: string): Promise<MessageResponse[]> =>
  apiRequest<MessageResponse[]>(`/messages/unread?userId=${userId}`);

/**
 * Marquer un message comme lu.
 * PATCH /messages/{id}/read
 */
export const markMessageAsRead = (id: string): Promise<MessageResponse> =>
  apiRequest<MessageResponse>(`/messages/${id}/read`, { method: "PATCH" });

/**
 * Supprimer un message (ADMIN / STAFF côté serveur).
 * DELETE /messages/{id}
 */
export const deleteMessage = (id: string): Promise<void> =>
  apiRequest<void>(`/messages/${id}`, { method: "DELETE" });

// ─── Forum ────────────────────────────────────────────────────────────────────

/**
 * Récupérer tous les sujets du forum avec leurs réponses imbriquées.
 * GET /messages/forum/topics
 */
export const getForumTopics = (): Promise<ForumPostResponse[]> =>
  apiRequest<ForumPostResponse[]>("/messages/forum/topics");

/**
 * Créer un nouveau sujet de forum.
 * POST /messages/forum/topics?authorId={authorId}
 */
export const createForumTopic = (
  authorIdOrData: string | ForumPostRequest,
  dataMaybe?: ForumPostRequest,
): Promise<ForumPostResponse> =>
  apiRequest<ForumPostResponse>(`/messages/forum/topics`, {
    method: "POST",
    body: JSON.stringify(
      typeof authorIdOrData === "string" ? dataMaybe : authorIdOrData,
    ),
  });

/**
 * Ajouter une réponse à un sujet existant.
 * POST /messages/forum/topics/{topicId}/replies?authorId={authorId}
 */
export const addForumReply = (
  topicId: string,
  authorIdOrData: string | ForumPostRequest,
  dataMaybe?: ForumPostRequest,
): Promise<ForumPostResponse> =>
  apiRequest<ForumPostResponse>(`/messages/forum/topics/${topicId}/replies`, {
    method: "POST",
    body: JSON.stringify(
      typeof authorIdOrData === "string" ? dataMaybe : authorIdOrData,
    ),
  });

/**
 * Supprimer un sujet (ADMIN / STAFF côté serveur).
 * DELETE /messages/forum/topics/{id}
 */
export const deleteForumTopic = (id: string): Promise<void> =>
  apiRequest<void>(`/messages/forum/topics/${id}`, { method: "DELETE" });

// ─── WebSocket (temps réel) ───────────────────────────────────────────────────

/**
 * URL du broker WebSocket.
 * Définis REACT_APP_WS_URL dans ton .env si besoin.
 */
export const STOMP_BROKER_URL =
  process.env.REACT_APP_WS_URL || "http://127.0.0.1:8080/ws";

/**
 * Fabrique un client STOMP prêt à l'emploi.
 *
 * Installation : npm install @stomp/stompjs sockjs-client
 *
 * Usage :
 *   const client = createStompClient(token, (msg) => console.log(msg));
 *   client.activate();
 *   // nettoyage : client.deactivate();
 */
export const createStompClient = (
  token: string,
  onMessage: (msg: MessageResponse) => void,
) => {
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
 * Envoyer un message via WebSocket (client doit être connecté).
 * Le backend reçoit sur : /app/chat.send
 */
export const sendMessageWs = (
  stompClient: any,
  request: MessageRequest,
): void => {
  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(request),
  });
};
