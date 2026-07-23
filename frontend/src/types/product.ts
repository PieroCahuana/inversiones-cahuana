export interface ProductSummary {
  id: number;
  sku: string;
  name: string;
  slug: string;
  short_description: string;
  brand: string;
  category: string;
  price: string;
  discount_price: string | null;
  current_price: string;
  has_discount: boolean;
  stock: number;
  is_in_stock: boolean;
  condition: "new" | "refurbished" | "used";
  is_featured: boolean;
  is_active: boolean;
  primary_image: string | null;
}

export interface ProductPayload {
  sku: string;
  name: string;
  short_description: string;
  description: string;
  brand_id: number;
  category_id: number;
  price: string;
  discount_price: string | null;
  condition: ProductSummary["condition"];
  specifications: Record<string, unknown>;
  is_featured: boolean;
  is_active: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  condition?: ProductSummary["condition"];
  in_stock?: boolean;
  featured?: boolean;
  min_price?: string;
  max_price?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ProductImage {
  id: number;
  image: string;
  image_url: string | null;
  alt_text: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

export interface ProductReference {
  id: number;
  name: string;
  slug: string;
}

export interface ProductDetail {
  id: number;
  sku: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  brand: ProductReference;
  category: ProductReference;
  price: string;
  discount_price: string | null;
  current_price: string;
  has_discount: boolean;
  stock: number;
  is_in_stock: boolean;
  condition: ProductSummary["condition"];
  specifications: Record<string, unknown>;
  is_featured: boolean;
  is_active: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}
