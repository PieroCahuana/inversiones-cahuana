import { apiClient } from "./client";
import type { NotificationResponse, StoreSettings } from "../types/store";

export async function getStoreSettings(): Promise<StoreSettings> {
  return (await apiClient.get<StoreSettings>("/store/settings/")).data;
}

export async function updateStoreSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
  return (await apiClient.patch<{ settings: StoreSettings }>("/store/settings/admin/", data)).data.settings;
}

export async function getNotifications(): Promise<NotificationResponse> {
  return (await apiClient.get<NotificationResponse>("/store/notifications/")).data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.patch(`/store/notifications/${id}/read/`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/store/notifications/read-all/");
}
