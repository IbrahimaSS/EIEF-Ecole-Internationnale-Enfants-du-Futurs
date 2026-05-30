const API_BASE = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080/api/v1';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatRequest {
  messages: ChatMessage[];
  studentName?: string;
  className?: string;
}

export interface AiChatResponse {
  reply: string;
}

export const aiService = {
  chat: async (payload: AiChatRequest, token: string): Promise<AiChatResponse> => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'enfantsfuture-auth-token': `enfantsfuture ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`AI chat error: ${res.status}`);
    const json = await res.json();
    return json.data as AiChatResponse;
  },
};
