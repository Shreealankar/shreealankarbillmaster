

# GST/GSTIN Compliance for Jewelry Billing

## What This Means
As per Indian Government GST rules, your jewelry invoices need to include specific tax details. Here's what we'll add:

## Changes Overview

### 1. Shop GSTIN on Bill/Invoice
- Display your shop's GSTIN number prominently on the bill header
- Add a settings/config option to store your shop GSTIN and State Code

### 2. Customer GSTIN Field
- Add optional GSTIN field in the billing form for B2B sales
- Validate GSTIN format (15-character alphanumeric: e.g., 27AABCU9603R1ZM)
- Show on printed invoice when provided

### 3. GST Tax Breakup (CGST + SGST / IGST)
- **Intra-state sale** (same state): Split tax into CGST (1.5%) + SGST (1.5%) = 3% total
- **Inter-state sale** (different state): Show as IGST (3%)
- Auto-detect based on customer GSTIN state code vs shop state code
- HSN Code column for jewelry: **7113** (Gold/Silver ornaments)

### 4. Updated Invoice Format
- Add "Tax Invoice" label (mandatory for GST)
- Show HSN code per item
- Show CGST/SGST or IGST breakup in totals
- Display shop and customer GSTIN
- Add "State" and "State Code" fields
- Show amount in words

### 5. Database Changes
- Add `gstin` field to `customers` table
- Add `shop_gstin`, `customer_gstin`, `cgst_amount`, `sgst_amount`, `igst_amount`, `is_igst`, `hsn_code` fields to `bills` table
- Add `hsn_code` field to `bill_items` table

## Technical Details

### Database Migration
```text
ALTER TABLE customers ADD COLUMN gstin TEXT;
ALTER TABLE bills ADD COLUMN customer_gstin TEXT;
ALTER TABLE bills ADD COLUMN cgst_amount NUMERIC DEFAULT 0;
ALTER TABLE bills ADD COLUMN sgst_amount NUMERIC DEFAULT 0;
ALTER TABLE bills ADD COLUMN igst_amount NUMERIC DEFAULT 0;
ALTER TABLE bills ADD COLUMN is_igst BOOLEAN DEFAULT false;
ALTER TABLE bill_items ADD COLUMN hsn_code TEXT DEFAULT '7113';
```

### Files to Modify
1. **src/pages/Billing.tsx** - Add customer GSTIN input, CGST/SGST/IGST toggle and calculation, HSN code per item
2. **src/components/BillPrint.tsx** - Update invoice layout with "Tax Invoice" header, GSTIN display, HSN column, CGST/SGST/IGST breakup, amount in words
3. **src/pages/Customers.tsx** - Add GSTIN field to customer form

### GST Rules Applied
- Jewelry HSN Code: 7113 (Articles of jewelry and parts thereof)
- GST Rate: 3% (1.5% CGST + 1.5% SGST for intra-state, or 3% IGST for inter-state)
- GSTIN format validation: 2-digit state code + 10-char PAN + 1 entity + 1 Z + 1 check digit
- "Tax Invoice" label mandatory when GSTIN is registered

