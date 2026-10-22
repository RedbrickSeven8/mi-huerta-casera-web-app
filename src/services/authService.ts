export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google' | 'demo';
  loginTimestamp: string;
}

const AUTH_STORAGE_KEY = 'huerta_casera_auth_user';
const CLIENT_ID_STORAGE_KEY = 'huerta_casera_google_client_id';

export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getUser(): UserProfile | null {
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as UserProfile;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function saveCustomClientId(clientId: string): void {
  localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
}

export function getCustomClientId(): string | null {
  return localStorage.getItem(CLIENT_ID_STORAGE_KEY);
}
