import { apiClient } from "./client";
import type { Cart, CartItem } from "../types/cart";

interface AddCartItemResponse {
  message: string;
  item: CartItem;
}

interface UpdateCartItemResponse {
  message: string;
  item: CartItem;
}

export async function getCart(): Promise<Cart> {
  const response = await apiClient.get<Cart>("/cart/");
  return response.data;
}

export async function addCartItem(productId: number, quantity: number): Promise<AddCartItemResponse> {
  const response = await apiClient.post<AddCartItemResponse>("/cart/items/", {
    product_id: productId,
    quantity,
  });
  return response.data;
}

export async function updateCartItem(itemId: number, quantity: number): Promise<UpdateCartItemResponse> {
  const response = await apiClient.patch<UpdateCartItemResponse>(`/cart/items/${itemId}/`, { quantity });
  return response.data;
}

export async function removeCartItem(itemId: number): Promise<void> {
  await apiClient.delete(`/cart/items/${itemId}/`);
}

export async function clearCart(): Promise<void> {
  await apiClient.delete("/cart/clear/");
}
