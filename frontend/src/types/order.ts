export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "bank_transfer" | "yape" | "plin" | "cash_on_delivery";
export type ReceiptStatus = "pending" | "approved" | "rejected";

export interface PaymentReceipt {
  id: number;
  file_url: string;
  status: ReceiptStatus;
  status_display: string;
  customer_note: string;
  review_note: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  product_sku: string;
  product_slug: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface OrderSummary {
  id: number;
  order_number: string;
  status: OrderStatus;
  status_display: string;
  payment_status: PaymentStatus;
  payment_status_display: string;
  total_items: number;
  total: string;
  created_at: string;
  customer: { id: number; email: string; full_name: string };
  receipt_status: ReceiptStatus | null;
}

export interface Order extends OrderSummary {
  payment_method: PaymentMethod;
  payment_method_display: string;
  subtotal: string;
  shipping_cost: string;
  discount_amount: string;
  coupon_code: string;
  recipient_name: string;
  recipient_phone: string;
  department: string;
  province: string;
  district: string;
  address: string;
  address_reference: string;
  notes: string;
  items: OrderItem[];
  updated_at: string;
  payment_receipt: PaymentReceipt | null;
}

export interface CheckoutData {
  payment_method: PaymentMethod;
  recipient_name: string;
  recipient_phone: string;
  department: string;
  province: string;
  district: string;
  address: string;
  address_reference: string;
  notes: string;
  coupon_code?: string;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  ordering?: "created_at" | "-created_at" | "total" | "-total";
}
