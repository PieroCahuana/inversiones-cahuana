import { apiClient } from "./client";
import type { CheckoutData, Order, OrderFilters, OrderSummary, PaymentReceipt, ReceiptStatus } from "../types/order";

export async function checkout(data: CheckoutData): Promise<Order> {
  const response = await apiClient.post<{ message: string; order: Order }>("/orders/checkout/", data);
  return response.data.order;
}

export async function getOrders(filters: OrderFilters = {}): Promise<OrderSummary[]> {
  const response = await apiClient.get<OrderSummary[]>("/orders/", { params: filters });
  return response.data;
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${orderNumber}/`);
  return response.data;
}

export async function getAdminOrders(filters: OrderFilters = {}): Promise<OrderSummary[]> {
  return (await apiClient.get<OrderSummary[]>("/orders/admin/", { params: filters })).data;
}

export async function getAdminOrder(orderNumber: string): Promise<Order> {
  return (await apiClient.get<Order>(`/orders/admin/${orderNumber}/`)).data;
}

export async function updateAdminOrderStatus(orderNumber: string, status: Order["status"]): Promise<Order> {
  const response = await apiClient.patch<{ order: Order }>(`/orders/admin/${orderNumber}/status/`, { status });
  return response.data.order;
}

export async function updateAdminPaymentStatus(orderNumber: string, payment_status: Order["payment_status"]): Promise<Order> {
  const response = await apiClient.patch<{ order: Order }>(`/orders/admin/${orderNumber}/payment/`, { payment_status });
  return response.data.order;
}

export async function uploadPaymentReceipt(orderNumber: string, file: File, customerNote: string): Promise<PaymentReceipt> {
  const data = new FormData();
  data.append("file", file);
  data.append("customer_note", customerNote);
  const response = await apiClient.post<{ receipt: PaymentReceipt }>(`/orders/${orderNumber}/receipt/`, data, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data.receipt;
}

export async function reviewPaymentReceipt(orderNumber: string, status: Exclude<ReceiptStatus, "pending">, review_note: string): Promise<PaymentReceipt> {
  const response = await apiClient.patch<{ receipt: PaymentReceipt }>(`/orders/admin/${orderNumber}/receipt/`, { status, review_note });
  return response.data.receipt;
}
