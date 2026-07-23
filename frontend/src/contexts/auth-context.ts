import { createContext } from "react";

import type { ProfileData, RegisterData, User } from "../types/user";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<User>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
