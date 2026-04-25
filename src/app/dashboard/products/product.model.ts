// src/app/dashboard/products/product.model.ts

export interface Category {
  id:      string;
  nom:     string;
  couleur: string;
  icone:   string;
  shop_id: string;
}

export interface Product {
  id:           string;
  nom:          string;
  description:  string | null;
  prix:         number;
  prix_achat:   number | null;
  categorie_id: string | null;
  categorie:    Pick<Category, 'id' | 'nom' | 'couleur' | 'icone'> | null;
  shop_id:      string;
  stock_qty:    number;
  unite:        string;
  code_barre:   string | null;
  is_active:    boolean;
  created_at:   string;
  updated_at:   string;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data:    Product[];
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data:    { categories: Category[] };
}

export type ProductFormData = {
  nom:          string;
  description:  string | null;
  prix:         number | null;
  prix_achat:   number | null;
  categorie_id: string | null;
  stock_qty:    number;
  unite:        string;
  code_barre:   string | null;
  is_active:    boolean;
};

export const UNITES = ['pièce', 'kg', 'g', 'L', 'cl', 'boîte', 'sachet', 'carton', 'lot'] as const;
