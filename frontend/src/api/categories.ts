import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api";
import type { Category } from "../types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[] | PaginatedResponse<Category>>("/categories/", {
    params: { page_size: 100, ordering: "name" },
  });

  return Array.isArray(response.data) ? response.data : response.data.results;
}

export async function createCategory(data: Pick<Category, "name" | "description" | "is_active">): Promise<Category> {
  return (await apiClient.post<Category>("/categories/", data)).data;
}

export async function updateCategory(slug: string, data: Partial<Pick<Category, "name" | "description" | "is_active">>): Promise<Category> {
  return (await apiClient.patch<Category>(`/categories/${slug}/`, data)).data;
}

export async function deleteCategory(slug: string): Promise<void> {
  await apiClient.delete(`/categories/${slug}/`);
}
