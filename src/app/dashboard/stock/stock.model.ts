// src/app/dashboard/stock/stock.model.ts

export type MovementType = 'entree' | 'sortie' | 'ajustement' | 'vente';

export interface StockMovement {
  id:          string;
  shop_id:     string;
  product_id:  string;
  type:        MovementType;
  quantite:    number;
  stock_avant: number;
  stock_apres: number;
  motif:       string | null;
  user_id:     string | null;
  sale_id:     string | null;
  created_at:  string;
  product?: {
    id:    string;
    nom:   string;
    unite: string;
    categorie?: { id: string; nom: string; couleur: string; icone: string } | null;
  };
  user?: { id: string; prenom: string; nom: string } | null;
}

export interface StockProduct {
  id:          string;
  nom:         string;
  stock_qty:   number;
  prix:        number;
  prix_achat:  number | null;
  unite:       string;
  categorie?:  { id: string; nom: string; couleur: string; icone: string } | null;
}

export interface StockSummary {
  totalProducts: number;
  outOfStock:    number;
  lowStock:      number;
  stockValue:    number;
  saleValue:     number;
  products:      StockProduct[];
}

export interface MovementForm {
  product_id: string;
  quantite:   number | null;
  new_qty:    number | null;
  motif:      string;
}

export const MOVEMENT_TYPES: { key: MovementType; label: string; color: string }[] = [
  { key: 'entree',     label: 'Entrée',       color: 'emerald' },
  { key: 'sortie',     label: 'Sortie',       color: 'red'     },
  { key: 'ajustement', label: 'Ajustement',   color: 'amber'   },
  { key: 'vente',      label: 'Vente caisse', color: 'blue'    },
];
