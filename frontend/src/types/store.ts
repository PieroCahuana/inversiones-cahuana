export interface StoreSettings {
  business_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  opening_hours: string;
  support_text: string;
  facebook_url: string;
  yape_number: string;
  yape_holder: string;
  plin_number: string;
  plin_holder: string;
  bank_details: string;
  shipping_cost: string;
  free_shipping_minimum: string | null;
  low_stock_threshold: number;
  checkout_message: string;
  updated_at: string;
}

export interface AppNotification {
  id: number;
  notification_type: "order" | "payment" | "inventory" | "system";
  notification_type_display: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  unread_count: number;
  results: AppNotification[];
}
