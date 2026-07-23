import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api";
import type { Brand } from "../types/brand";

export async function getBrands(): Promise<Brand[]> {
  const response = await apiClient.get<Brand[] | PaginatedResponse<Brand>>("/brands/", {
    params: { page_size: 100, ordering: "name" },
  });

  return Array.isArray(response.data) ? response.data : response.data.results;
}

export async function createBrand(data: Pick<Brand, "name" | "description" | "is_active">): Promise<Brand> {
  return (await apiClient.post<Brand>("/brands/", data)).data;
}

export async function updateBrand(slug: string, data: Partial<Pick<Brand, "name" | "description" | "is_active">>): Promise<Brand> {
  return (await apiClient.patch<Brand>(`/brands/${slug}/`, data)).data;
}

export async function deleteBrand(slug: string): Promise<void> {
  await apiClient.delete(`/brands/${slug}/`);
}
