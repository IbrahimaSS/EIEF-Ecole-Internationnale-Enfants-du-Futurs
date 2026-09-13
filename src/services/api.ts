import { ApiErrorResponse, ApiResponse } from "../types/auth";

const API_PATH = "/api/v1";

// L'ecole est identifiee par le sous-domaine de la page : l'origine de l'API doit donc
// etre deduite de window.location a l'execution, et surtout pas figee a la compilation,
// sinon une seule construction ne peut pas servir plusieurs ecoles.
const apiOrigin = (): string => {
  const { protocol, hostname, host } = window.location;
  const devPort = process.env.REACT_APP_API_PORT;
  return devPort ? `${protocol}//${hostname}:${devPort}` : `${protocol}//${host}`;
};

export const getApiBaseUrl = (): string => `${apiOrigin()}${API_PATH}`;

export const getWebSocketUrl = (): string => `${apiOrigin()}${API_PATH}/ws`;

export const AUTH_HEADER_NAME = "enfantsfuture-auth-token";
export const AUTH_HEADER_PREFIX = "enfantsfuture";


export class ApiError extends Error {
  status: number;
  details?: ApiErrorResponse;

  constructor(message: string, status: number, details?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("auth-storage");

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
};

const buildHeaders = (options: ApiRequestOptions): Headers => {
  const headers = new Headers(options.headers);
  const token = options.token ?? getStoredToken();
  const isFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body && !isFormDataBody) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set(AUTH_HEADER_NAME, `${AUTH_HEADER_PREFIX} ${token}`);
  }

  return headers;
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    return null;
  }
};

let onUnauthorized: (() => void) | null = null;
let onPasswordChangeRequired: (() => void) | null = null;

export const PASSWORD_CHANGE_REQUIRED = "PASSWORD_CHANGE_REQUIRED";

/**
 * Branche la reaction a un jeton refuse. Passe par un rappel plutot qu'un import
 * direct du magasin d'authentification, qui creerait un cycle avec ce module.
 */
export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  onUnauthorized = handler;
};

export const setPasswordChangeRequiredHandler = (handler: (() => void) | null): void => {
  onPasswordChangeRequired = handler;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const token = options.token ?? getStoredToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: buildHeaders({ ...options, token }),
  });

  // Un 401 alors qu'un jeton etait presente signifie que la session n'est plus
  // valable : expiree, revoquee, ou emise pour une autre ecole.
  if (response.status === 401 && token) {
    onUnauthorized?.();
  }

  // Cas particulier : 204 No Content ou body vide (typique des DELETE)
  // Si la requete a reussi, on retourne undefined caste en T sans tenter de parse.
  const isNoContent =
    response.status === 204 ||
    response.headers.get("content-length") === "0";

  
  if (isNoContent) {
    if (!response.ok) {
      throw new ApiError(
        `Erreur API (${response.status})`,
        response.status,
      );
    }
    return undefined as unknown as T;
  }

  const payload = await parseJsonSafely<ApiResponse<T> | ApiErrorResponse>(
    response,
  );

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null;
    if (response.status === 403 && errorPayload?.error === PASSWORD_CHANGE_REQUIRED) {
      onPasswordChangeRequired?.();
    }
    throw new ApiError(
      errorPayload?.message || "Une erreur est survenue lors de la requete.",
      response.status,
      errorPayload || undefined,
    );
  }

  // Reponse OK mais body vide (peut arriver sur certains endpoints)
  if (!payload) {
    return undefined as unknown as T;
  }

  // Si l'API renvoie l'enveloppe { success, message, data, ... } on extrait data.
  // Sinon on retourne le payload tel quel (compatibilite endpoints non-standard).
  if ("data" in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as unknown as T;
};
