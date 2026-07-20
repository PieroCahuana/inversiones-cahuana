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
  primary_image: string | null;
}