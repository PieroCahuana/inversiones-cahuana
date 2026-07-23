export interface Coupon {
  id: number; code: string; description: string; discount_type: "percentage" | "fixed"; discount_type_display: string; value: string; minimum_purchase: string; maximum_discount: string | null; starts_at: string; ends_at: string; usage_limit: number | null; usage_limit_per_user: number; usage_count: number; is_active: boolean;
}
export interface Promotion {
  id: number; name: string; scope: "all" | "category" | "brand" | "product"; scope_display: string; category: number | null; brand: number | null; product: number | null; discount_percentage: string; starts_at: string; ends_at: string; priority: number; is_active: boolean;
}
export interface Banner {
  id: number; title: string; subtitle: string; image_url: string; button_text: string; link: string; starts_at: string; ends_at: string; order: number; is_active: boolean;
}
export interface CouponValidation { code: string; description: string; discount_amount: string; subtotal_after_discount: string; }
export interface CommercialMetrics { revenue: string; average_ticket: string; paid_orders: number; orders_total: number; last_30_days_revenue: string; daily_sales: Array<{ day: string; total: string; orders: number }>; top_products: Array<{ product_name: string; product_sku: string; quantity: number; revenue: string }>; top_coupons: Array<{ coupon__code: string; uses: number; discount: string }> }
