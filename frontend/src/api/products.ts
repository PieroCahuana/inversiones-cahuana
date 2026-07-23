import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api";
import type { ProductDetail, ProductFilters, ProductPayload, ProductSummary } from "../types/product";

function normalizeResponse<T>(data: T[] | PaginatedResponse<T>): PaginatedResponse<T> {
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }

  return data;
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<ProductSummary>> {
  const response = await apiClient.get<ProductSummary[] | PaginatedResponse<ProductSummary>>("/products/", {
    params: filters,
  });

  return normalizeResponse(response.data);
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  const response = await apiClient.get<ProductDetail>(`/products/${slug}/`);
  return response.data;
}

export async function createProduct(data: ProductPayload): Promise<ProductDetail> {
  const response = await apiClient.post<ProductDetail>("/products/", data);
  return response.data;
}

export async function updateProduct(slug: string, data: Partial<ProductPayload>): Promise<ProductDetail> {
  const response = await apiClient.patch<ProductDetail>(`/products/${slug}/`, data);
  return response.data;
}

export async function deleteProduct(slug: string): Promise<void> {
  await apiClient.delete(`/products/${slug}/`);
}

export async function uploadProductImage(slug: string, file: File, isPrimary = false): Promise<void> {
  const data = new FormData();
  data.append("image", file);
  data.append("is_primary", String(isPrimary));
  await apiClient.post(`/products/${slug}/images/`, data, { headers: { "Content-Type": "multipart/form-data" } });
}
