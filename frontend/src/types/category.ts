export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}