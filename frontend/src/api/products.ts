import { apiClient } from "./client";
import type { ProductSummary } from "../types/product";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getProducts(): Promise<ProductSummary[]> {
  const response = await apiClient.get<
    ProductSummary[] | PaginatedResponse<ProductSummary>
  >("/products/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results;
}