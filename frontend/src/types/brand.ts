export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}