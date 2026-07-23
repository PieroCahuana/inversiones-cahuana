import { apiClient } from "./client";
import type { AdminUser, User } from "../types/user";

export async function getAdminUsers(params: { search?: string; role?: User["role"] | ""; is_active?: string } = {}): Promise<AdminUser[]> {
  return (await apiClient.get<AdminUser[]>("/users/admin/", { params })).data;
}

export async function updateAdminUser(userId: number, data: Partial<Pick<AdminUser, "role" | "is_active" | "is_verified">>): Promise<AdminUser> {
  return (await apiClient.patch<{ user: AdminUser }>(`/users/admin/${userId}/`, data)).data.user;
}
