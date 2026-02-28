

# GSTR-1 Return Report Tab

## Overview
Add a new "GSTR-1" tab to the existing Reports page that shows GST return data split into B2B invoices (with customer GSTIN), B2C invoices (without GSTIN), and a monthly tax breakup summary.

## What You'll See

### Summary Cards
- Total Taxable Value, Total CGST, Total SGST, Total IGST collected in the selected period

### B2B Invoice Table (Section 4A)
- Lists all invoices where customer has a GSTIN
- Columns: Invoice No, Date, Customer Name, GSTIN, Taxable Value, CGST, SGST, IGST, Total

### B2C Invoice Summary (Section 7)
- Lists all invoices where customer does NOT have a GSTIN
- Columns: Invoice No, Date, Customer Name, Taxable Value, CGST, SGST, Total

### Monthly Tax Breakup
- Bar chart showing CGST, SGST, IGST collected per month
- Table below with monthly totals

### Export Button
- CSV export for B2B and B2C sections

## Technical Details

### File Modified
- **src/pages/Reports.tsx** - Add a new `TabsTrigger` ("GSTR-1") and `TabsContent` with:
  - New state: `gstr1Data` containing `b2b`, `b2c`, and `monthlyBreakup` arrays
  - New fetch function `fetchGSTR1Report()` that queries `bills` table, separates invoices by whether `customer_gstin` is present
  - Groups monthly data using `date-fns` `format` for month grouping
  - Uses existing `Table` components for B2B and B2C tables
  - Uses existing `BarChart` from recharts for monthly tax chart
  - CSV export function that converts table data to downloadable CSV

### No Database Changes Required
All data already exists in the `bills` table (`customer_gstin`, `cgst_amount`, `sgst_amount`, `igst_amount`, `is_igst`, `final_amount`, `total_amount`, `tax_amount`).

