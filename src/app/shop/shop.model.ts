// src/app/shop/shop.model.ts

export type CommerceType = 'boutique' | 'restaurant' | 'pharmacie' | 'cave';

export interface ShopModules {
  stock:     boolean;
  commandes: boolean;
  rapports:  boolean;
}

export interface Shop {
  id:            string;
  nom:           string;
  type_commerce: CommerceType;
  devise:        string;
  tva_enabled:   boolean;
  tva_rate:      number;
  modules:       ShopModules;
  owner_id:      string;
  is_configured: boolean;
  created_at:    string;
  updated_at:    string;
}

export interface ShopResponse {
  success: boolean;
  message: string;
  data: { shop: Shop };
}

export interface CreateShopPayload {
  nom:           string;
  type_commerce: CommerceType;
  devise:        string;
  tva_enabled:   boolean;
  tva_rate:      number;
  modules:       ShopModules;
}
