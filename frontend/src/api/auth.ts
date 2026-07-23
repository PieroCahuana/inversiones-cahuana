import { apiClient } from "./client";
import { getRefreshToken } from "../lib/auth-storage";
import type { AuthTokens, ProfileData, RegisterData, User } from "../types/user";

export async function loginRequest(email: string, password: string): Promise<AuthTokens> {
  const response = await apiClient.post<AuthTokens>("/auth/token/", { email, password });
  return response.data;
}

export async function registerRequest(data: RegisterData): Promise<User> {
  const response = await apiClient.post<{ message: string; user: User }>("/users/register/", data);
  return response.data.user;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/users/me/");
  return response.data;
}

export async function updateProfileRequest(data: ProfileData): Promise<User> {
  const response = await apiClient.patch<{ message: string; user: User }>("/users/me/", data);
  return response.data.user;
}

export async function logoutRequest(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) await apiClient.post("/users/logout/", { refresh });
}

export async function requestPasswordReset(email: string): Promise<string> {
  const response = await apiClient.post<{ message: string }>("/users/password-reset/", { email });
  return response.data.message;
}

export async function confirmPasswordReset(uid: string, token: string, password: string, password_confirm: string): Promise<string> {
  const response = await apiClient.post<{ message: string }>("/users/password-reset/confirm/", { uid, token, password, password_confirm });
  return response.data.message;
}
