// src/app/dashboard/reports/report.model.ts

export interface ReportKpis {
  caAujourdhui:     number;
  caMois:           number;
  caTotal:          number;
  ventesAujourdhui: number;
  ventesMois:       number;
  ventesTotal:      number;
  ticketMoyen:      number;
}

export interface CaDay {
  date:      string; // 'YYYY-MM-DD'
  ca:        number;
  nb_ventes: number;
}

export interface CaMonth {
  mois:      string; // 'YYYY-MM'
  ca:        number;
  nb_ventes: number;
}

export interface TopProduct {
  product_id: string | null;
  nom:        string;
  total_qte:  number;
  total_ca:   number;
  nb_ventes:  number;
}

export interface PaymentBreakdown {
  mode:        string;
  nb:          number;
  ca:          number;
  pourcentage: number;
}

export interface RecentSale {
  id:            string;
  montant_total: number;
  mode_paiement: string;
  nb_articles:   number;
  created_at:    string;
}

export type ReportPeriod = 'day' | 'month' | 'year' | 'all';
