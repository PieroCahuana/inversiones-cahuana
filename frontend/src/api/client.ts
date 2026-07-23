import axios, { type InternalAxiosRequestConfig } from "axios";

import { clearAuthTokens, getAccessToken, getRefreshToken, notifySessionEnded, setAuthTokens } from "../lib/auth-storage";
import type { AuthTokens } from "../types/user";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("La variable VITE_API_URL no está configurada.");
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshRequest: Promise<AuthTokens> | null = null;

async function refreshTokens(refresh: string): Promise<AuthTokens> {
  const response = await axios.post<AuthTokens>(`${API_URL}/auth/token/refresh/`, { refresh });
  const tokens = { access: response.data.access, refresh: response.data.refresh || refresh };
  setAuthTokens(tokens);
  return tokens;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as RetryableRequest | undefined;
    const refreshToken = getRefreshToken();
    const isRefreshRequest = request?.url?.includes("/auth/token/refresh/");

    if (error.response?.status !== 401 || !request || request._retry || !refreshToken || isRefreshRequest) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      refreshRequest ??= refreshTokens(refreshToken).finally(() => { refreshRequest = null; });
      const tokens = await refreshRequest;
      request.headers.Authorization = `Bearer ${tokens.access}`;
      return apiClient(request);
    } catch (refreshError) {
      clearAuthTokens();
      notifySessionEnded();
      return Promise.reject(refreshError);
    }
  },
);
