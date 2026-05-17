// src/pages/manager/scolarite/api.ts
// Helper API local au module Scolarité (gère les réponses vides 204 No Content)

const API_BASE =
  (process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');

const AUTH_HEADER = 'enfantsfuture-auth-token';
const AUTH_PREFIX = 'enfantsfuture';

export const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers[AUTH_HEADER] = `${AUTH_PREFIX} ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Reponse vide (204 No Content typique des DELETE, ou body vide)
  const isNoContent =
    res.status === 204 ||
    res.headers.get('content-length') === '0' ||
    !res.headers.get('content-type')?.includes('application/json');

  if (isNoContent) {
    if (!res.ok) {
      throw new Error(`Erreur API (${res.status})`);
    }
    // Pas de body : on retourne undefined caste en T
    return undefined as unknown as T;
  }

  // Lecture en texte d'abord, puis parse - evite "Unexpected end of JSON" si body vide malgre tout
  const text = await res.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      // Body non-JSON : on garde le texte brut comme message
      if (!res.ok) throw new Error(text || `Erreur API (${res.status})`);
      return text as unknown as T;
    }
  }

  if (!res.ok) {
    throw new Error(payload?.message ?? `Erreur API (${res.status})`);
  }

  // L'API renvoie typiquement { success, message, data, timestamp } - on extrait data
  // Sinon on renvoie le payload entier (compatibilite endpoints non-standard)
  return (payload?.data !== undefined ? payload.data : payload) as T;
}
