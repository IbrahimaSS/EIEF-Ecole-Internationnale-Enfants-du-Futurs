import { ApiErrorResponse, ApiResponse } from "../types/auth";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8080/api/v1";

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

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

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


export const getApiBaseUrl = (): string => API_BASE_URL;
