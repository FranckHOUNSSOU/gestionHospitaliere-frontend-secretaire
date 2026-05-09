import axios from 'axios';

const ACCESS_TOKEN_KEY  = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

function saveTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const baseURL = import.meta.env.VITE_API_URL ?? '/api';
  try {
    const res = await fetch(`${baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    if (!res.ok) {
      clearTokens();
      window.location.href = '/login';
      return null;
    }
    const data: { accessToken: string; refreshToken: string } = await res.json();
    saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    window.location.href = '/login';
    return null;
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      }
    }

    const message =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      'Erreur réseau';
    return Promise.reject(new Error(message));
  },
);

export default client;
