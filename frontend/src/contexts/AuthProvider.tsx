import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";

import { getCurrentUser, loginRequest, logoutRequest, registerRequest, updateProfileRequest } from "../api/auth";
import { clearAuthTokens, getRefreshToken, setAuthTokens } from "../lib/auth-storage";
import type { ProfileData, RegisterData } from "../types/user";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [sessionVersion, setSessionVersion] = useState(() => getRefreshToken() ? 1 : 0);
  const hasSession = sessionVersion > 0 && Boolean(getRefreshToken());
  const userQuery = useQuery({ queryKey: ["current-user"], queryFn: getCurrentUser, enabled: hasSession, retry: false, staleTime: 60_000 });

  useEffect(() => {
    function endSession() {
      queryClient.removeQueries({ queryKey: ["current-user"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      setSessionVersion(0);
    }
    window.addEventListener("auth:session-ended", endSession);
    return () => window.removeEventListener("auth:session-ended", endSession);
  }, [queryClient]);

  async function establishSession(email: string, password: string) {
    const tokens = await loginRequest(email, password);
    setAuthTokens(tokens);
    try {
      const user = await getCurrentUser();
      queryClient.setQueryData(["current-user"], user);
      setSessionVersion((current) => current + 1);
    } catch (error) {
      clearAuthTokens();
      throw error;
    }
  }

  async function register(data: RegisterData) {
    await registerRequest(data);
    await establishSession(data.email, data.password);
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // La sesión local debe cerrarse incluso si el token ya expiró.
    } finally {
      clearAuthTokens();
      queryClient.removeQueries({ queryKey: ["current-user"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      setSessionVersion(0);
    }
  }

  async function updateProfile(data: ProfileData) {
    const user = await updateProfileRequest(data);
    queryClient.setQueryData(["current-user"], user);
    return user;
  }

  const value: AuthContextValue = {
    user: userQuery.data ?? null,
    isAuthenticated: hasSession,
    isLoading: hasSession && userQuery.isPending,
    login: establishSession,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
