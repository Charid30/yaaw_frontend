// src/app/dashboard/sales/sale.model.ts
import { Product } from '../products/product.model';

export type PaymentMethod = 'especes' | 'orange_money' | 'moov_money';

export interface SaleItemBackend {
  id:            string;
  sale_id:       string;
  product_id:    string | null;
  nom_produit:   string;
  prix_unitaire: number;
  quantite:      number;
  montant:       number;
}

export interface SaleCustomer { id: string; nom: string; }

export interface Sale {
  id:             string;
  shop_id:        string;
  caissier_id:    string;
  customer_id:    string | null;
  customer:       SaleCustomer | null;
  remise_montant: number;
  montant_total:  number;
  montant_recu:   number;
  monnaie_rendue: number;
  mode_paiement:  PaymentMethod;
  tva_montant:    number;
  note:           string | null;
  items:          SaleItemBackend[];
  created_at:     string;
}

export interface CartItem {
  product:  Product;
  quantity: number;
}

export interface CreateSalePayload {
  items:           { product_id: string; quantite: number }[];
  mode_paiement:   PaymentMethod;
  montant_recu:    number;
  note?:           string;
  customer_id?:    string | null;
  remise_montant?: number;
}

export interface SaleFilters {
  page?:          number;
  limit?:         number;
  date_debut?:    string;
  date_fin?:      string;
  mode_paiement?: string;
  customer_id?:   string;
}

export const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string; color: string }[] = [
  { key: 'especes',      label: 'Espèces',      icon: '💵', color: 'emerald' },
  { key: 'orange_money', label: 'Orange Money', icon: '🟠', color: 'orange'  },
  { key: 'moov_money',   label: 'Moov Money',   icon: '🔵', color: 'blue'    },
];
