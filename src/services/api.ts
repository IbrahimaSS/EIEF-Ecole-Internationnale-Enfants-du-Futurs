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

  if (!headers.has("Content-Type") && options.body) {
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

  return JSON.parse(rawBody) as T;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

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

  if (!payload || !("data" in payload)) {
    throw new ApiError("Reponse API invalide.", response.status);
  }

  return payload.data;
};

export const getApiBaseUrl = (): string => API_BASE_URL;
