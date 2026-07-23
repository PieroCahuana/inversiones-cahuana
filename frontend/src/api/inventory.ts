import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api";
import type { InventoryMovement, InventoryMovementPayload } from "../types/inventory";

export async function getInventoryMovements(params: { search?: string; movement_type?: string; page?: number } = {}): Promise<PaginatedResponse<InventoryMovement>> {
  const response = await apiClient.get<InventoryMovement[] | PaginatedResponse<InventoryMovement>>("/inventory/movements/", { params });
  return Array.isArray(response.data)
    ? { count: response.data.length, next: null, previous: null, results: response.data }
    : response.data;
}

export async function createInventoryMovement(data: InventoryMovementPayload): Promise<InventoryMovement> {
  const response = await apiClient.post<{ movement: InventoryMovement }>("/inventory/movements/", data);
  return response.data.movement;
}
