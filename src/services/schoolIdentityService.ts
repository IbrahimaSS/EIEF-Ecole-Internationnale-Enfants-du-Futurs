import { getApiBaseUrl, AUTH_HEADER_NAME, AUTH_HEADER_PREFIX } from './api';
import { SchoolIdentity } from '../store/schoolIdentityStore';

/**
 * Envoi du logo en multipart : apiRequest impose un corps JSON, ce cas passe
 * donc directement par fetch, comme les autres téléversements du projet.
 */
export const uploadSchoolLogo = async (token: string, file: File): Promise<SchoolIdentity> => {
  const body = new FormData();
  body.append('file', file);

  const response = await fetch(`${getApiBaseUrl()}/school/identity/logo`, {
    method: 'POST',
    headers: { [AUTH_HEADER_NAME]: `${AUTH_HEADER_PREFIX} ${token}` },
    body,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || "L'envoi du logo a échoué.");
  }
  return payload.data as SchoolIdentity;
};
