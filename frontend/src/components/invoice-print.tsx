"use client";

import type { Invoice } from "@/types/invoice";
import type { Company } from "@/types/company";

interface InvoicePrintProps {
  invoice: Invoice;
  company: Company;
  customerName?: string;
}

/**
 * Opens a new browser window with a styled, print-ready invoice and
 * immediately triggers the browser's Print / Save as PDF dialog.
 */
export function printInvoice({ invoice, company, customerName }: InvoicePrintProps) {
  const subtotal = invoice.items.reduce((s, i) => s + Number(i.quantity) * Number(i.rate), 0);
  const totalTax = invoice.items.reduce((s, i) => s + Number(i.tax_amount), 0);
  const totalDisc = invoice.items.reduce((s, i) => s + Number(i.discount_amount), 0);
  const grandTotal = Number(invoice.total_amount);

  const statusColor: Record<string, string> = {
    Paid: "#16a34a",
    Unpaid: "#dc2626",
    Cancelled: "#6b7280",
  };

  const itemRows = invoice.items
    .map((item, idx) => {
      const lineSubtotal = Number(item.quantity) * Number(item.rate);
      const taxAmt = Number(item.tax_amount);
      const discAmt = Number(item.discount_amount);
      const taxPct = lineSubtotal > 0 ? ((taxAmt / lineSubtotal) * 100).toFixed(1) : "0.0";
      const discPct = lineSubtotal > 0 ? ((discAmt / lineSubtotal) * 100).toFixed(1) : "0.0";
      return `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 10px;">${idx + 1}</td>
          <td style="padding:8px 10px;">Item #${item.stock_item_id}</td>
          <td style="padding:8px 10px;text-align:right;">${Number(item.quantity).toFixed(2)}</td>
          <td style="padding:8px 10px;text-align:right;">₹${Number(item.rate).toFixed(2)}</td>
          <td style="padding:8px 10px;text-align:right;">${taxPct}%</td>
          <td style="padding:8px 10px;text-align:right;">${discPct}%</td>
          <td style="padding:8px 10px;text-align:right;font-weight:600;">₹${Number(item.line_total).toFixed(2)}</td>
        </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #111827;
      background: #fff;
      padding: 32px 40px;
    }
    /* ── Header ─────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 2px solid #6366f1;
      margin-bottom: 28px;
    }
    .company-name {
      font-size: 22px;
      font-weight: 700;
      color: #4f46e5;
      letter-spacing: -0.3px;
    }
    .company-meta {
      margin-top: 4px;
      color: #6b7280;
      font-size: 12px;
      line-height: 1.6;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 28px;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .invoice-title .inv-number {
      font-size: 14px;
      color: #374151;
      margin-top: 4px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 3px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #fff;
    }
    /* ── Meta grid ───────────────────────────── */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .meta-box h3 {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      margin-bottom: 6px;
    }
    .meta-box p {
      font-size: 13px;
      color: #111827;
      line-height: 1.6;
    }
    /* ── Table ───────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    thead tr {
      background: #4f46e5;
      color: #fff;
    }
    thead th {
      padding: 10px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th:not(:first-child) { text-align: right; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    /* ── Totals ──────────────────────────────── */
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .totals-box {
      width: 280px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 14px;
      font-size: 13px;
      border-bottom: 1px solid #e5e7eb;
    }
    .totals-row:last-child { border-bottom: none; }
    .totals-row.grand {
      background: #4f46e5;
      color: #fff;
      font-weight: 700;
      font-size: 15px;
    }
    .totals-row .label { color: inherit; opacity: 0.85; }
    /* ── Footer ──────────────────────────────── */
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 11px;
    }
    @media print {
      body { padding: 20px 24px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">${company.name}</div>
      <div class="company-meta">
        ${company.address ? company.address + "<br/>" : ""}
        ${company.contact_number ? "📞 " + company.contact_number + "<br/>" : ""}
        ${company.gst_number ? "GST: " + company.gst_number : ""}
      </div>
    </div>
    <div class="invoice-title">
      <h1>Invoice</h1>
      <div class="inv-number">${invoice.invoice_number}</div>
      <span class="status-badge" style="background:${statusColor[invoice.status] ?? "#6b7280"}">
        ${invoice.status}
      </span>
    </div>
  </div>

  <!-- Meta -->
  <div class="meta-grid">
    <div class="meta-box">
      <h3>Bill To</h3>
      <p><strong>${customerName || "Customer #" + invoice.customer_id}</strong></p>
    </div>
    <div class="meta-box" style="text-align:right;">
      <h3>Invoice Details</h3>
      <p>
        <strong>Date:</strong> ${invoice.invoice_date}<br/>
        ${invoice.due_date ? "<strong>Due Date:</strong> " + invoice.due_date + "<br/>" : ""}
      </p>
    </div>
  </div>

  <!-- Line items -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Tax %</th>
        <th>Disc %</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row">
        <span class="label">Subtotal</span>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span class="label">Tax</span>
        <span>+ ₹${totalTax.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span class="label">Discount</span>
        <span>− ₹${totalDisc.toFixed(2)}</span>
      </div>
      <div class="totals-row grand">
        <span class="label">Grand Total</span>
        <span>₹${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  </div>

  ${invoice.notes ? `<div style="margin-top:24px;padding:12px 16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;"><strong style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Notes</strong><p style="margin-top:4px;color:#374151;">${invoice.notes}</p></div>` : ""}

  <div class="footer">
    Thank you for your business! · Generated by SmartERP
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
