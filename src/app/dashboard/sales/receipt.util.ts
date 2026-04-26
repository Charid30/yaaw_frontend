// src/app/dashboard/sales/receipt.util.ts

import { Sale, PaymentMethod, PAYMENT_METHODS } from './sale.model';

export interface ReceiptData {
  sale:       Sale;
  shopNom:    string;
  shopType:   string;
  devise:     string;
  customerNom?: string | null;
}

function fmt(n: number, devise: string): string {
  return n.toLocaleString('fr-FR') + ' ' + devise;
}

function paymentLabel(method: PaymentMethod | string): string {
  return PAYMENT_METHODS.find(m => m.key === method)?.label ?? method;
}

/**
 * Génère le HTML complet du ticket de caisse (format thermique 80mm).
 */
export function buildReceiptHtml(d: ReceiptData): string {
  const { sale, shopNom, shopType, devise } = d;
  const customerNom = d.customerNom ?? sale.customer?.nom ?? sale.customer_nom ?? null;

  const date = new Date(sale.created_at).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const itemRows = sale.items.map(i =>
    `<tr>
      <td>${i.nom_produit} &times;${i.quantite}</td>
      <td class="r">${fmt(i.montant, devise)}</td>
    </tr>`
  ).join('');

  const remise   = sale.remise_montant  > 0
    ? `<tr><td>Remise</td><td class="r">&minus;${fmt(sale.remise_montant, devise)}</td></tr>` : '';
  const tva      = sale.tva_montant     > 0
    ? `<tr><td>TVA</td><td class="r">${fmt(sale.tva_montant, devise)}</td></tr>` : '';
  const monnaie  = sale.monnaie_rendue  > 0
    ? `<tr><td>Monnaie rendue</td><td class="r">${fmt(sale.monnaie_rendue, devise)}</td></tr>` : '';
  const clientRow = customerNom
    ? `<tr><td>Client</td><td class="r"><strong>${customerNom}</strong></td></tr>` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Ticket</title>
  <style>
    /* ── Taille papier thermique ── */
    @page {
      size: 80mm auto;
      margin: 3mm 4mm;
    }

    /* ── Reset & base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 72mm;
      max-width: 72mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      color: #000;
      background: #fff;
    }

    /* ── En-tête boutique ── */
    .header {
      text-align: center;
      padding: 4px 0 8px;
      border-bottom: 1px dashed #000;
      margin-bottom: 6px;
    }
    .shop-name {
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.2;
    }
    .shop-type { font-size: 10px; margin-top: 2px; }
    .date      { font-size: 9px;  color: #444; margin-top: 3px; }

    /* ── Tableau articles ── */
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 2px 0;
      vertical-align: top;
      font-size: 11px;
      line-height: 1.35;
    }
    td.r {
      text-align: right;
      white-space: nowrap;
      padding-left: 4px;
    }

    /* ── Séparateur ── */
    .sep td { border-top: 1px dashed #000; padding-top: 4px; padding-bottom: 2px; }

    /* ── Ligne total ── */
    .total td {
      font-size: 13px;
      font-weight: 700;
      border-top: 1px solid #000;
      padding-top: 4px;
    }

    /* ── Pied de page ── */
    .footer {
      text-align: center;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #000;
      font-size: 10px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop-name">${shopNom}</div>
    ${shopType ? `<div class="shop-type">${shopType}</div>` : ''}
    <div class="date">${date}</div>
  </div>

  <table>
    ${itemRows}
    <tr class="sep"><td colspan="2"></td></tr>
    ${remise}
    ${tva}
    <tr class="total">
      <td>TOTAL</td>
      <td class="r">${fmt(sale.montant_total, devise)}</td>
    </tr>
    <tr>
      <td>${paymentLabel(sale.mode_paiement)}</td>
      <td class="r">${fmt(sale.montant_recu, devise)}</td>
    </tr>
    ${monnaie}
    ${clientRow}
  </table>

  <div class="footer">Merci pour votre achat&nbsp;!</div>
</body>
</html>`;
}

/**
 * Imprime un HTML dans une iframe invisible (sans popup visible).
 */
export function printInFrame(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:320px;height:600px;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 1000);
  }, 250);
}
