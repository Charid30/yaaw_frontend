// src/app/dashboard/customers/customer.model.ts

export interface Customer {
  id:         string;
  shop_id:    string;
  nom:        string;
  telephone:  string | null;
  email:      string | null;
  note:       string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  nom:       string;
  telephone: string;
  email:     string;
  note:      string;
}

export interface CustomerListResponse {
  success: boolean;
  data: {
    customers:  Customer[];
    pagination: {
      total:      number;
      page:       number;
      limit:      number;
      totalPages: number;
    };
  };
}

export interface CustomerResponse {
  success: boolean;
  data: { customer: Customer };
  message: string;
}
