export interface CartProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  current_price: string;
  stock: number;
  primary_image: string | null;
}

export interface CartItem {
  id: number;
  product: CartProduct;
  quantity: number;
  unit_price: string;
  subtotal: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  subtotal: string;
  created_at: string;
  updated_at: string;
}
