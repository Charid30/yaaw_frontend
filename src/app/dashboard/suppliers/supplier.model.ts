// src/app/dashboard/suppliers/supplier.model.ts

export interface Supplier {
  id:         string;
  shop_id:    string;
  nom:        string;
  telephone:  string | null;
  email:      string | null;
  adresse:    string | null;
  note:       string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  nom:      string;
  telephone: string;
  email:    string;
  adresse:  string;
  note:     string;
}

export interface SupplierListResponse {
  success: boolean;
  data: {
    fournisseurs: Supplier[];
    pagination: {
      total:      number;
      page:       number;
      limit:      number;
      totalPages: number;
    };
  };
}

export interface SupplierResponse {
  success: boolean;
  data: { fournisseur: Supplier };
  message: string;
}
