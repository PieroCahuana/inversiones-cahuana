export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: "admin" | "customer" | "seller";
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser extends User {
  is_active: boolean;
  orders_count: number;
  last_login: string | null;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  password_confirm: string;
}

export interface ProfileData {
  first_name: string;
  last_name: string;
  phone: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
