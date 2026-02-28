

# Purchase Voucher (जुने सोने/चांदी खरेदी पावती) Feature

## Overview
Add a separate "Purchase Voucher" option in the Billing section for buying old gold/silver jewelry from customers. This is a **No GST** transaction with a Marathi-language receipt, integrated into Dashboard and Reports.

## What You'll Get

### 1. New Database Table: `purchase_vouchers`
Stores all purchase transactions separately from sales bills:
- Voucher number (auto-generated like PV-2026-0001)
- Customer details (name, phone, address, PAN/Aadhaar)
- Payment method (Cash / Bank Transfer with UTR number)
- Total amount (no GST)
- Items purchased (stored in a separate `purchase_voucher_items` table with: item description, net weight, purity, rate per gram, amount)

### 2. Billing Page - New "Purchase Voucher" Tab
A toggle/tab at the top of the Billing page to switch between:
- **Sales Bill (Tax Invoice)** - existing functionality
- **Purchase Voucher (खरेदी पावती)** - new form

The Purchase Voucher form will include:
- Customer name, address, mobile, PAN/Aadhaar number
- Items table: description, net weight (grams), purity (22K/18K etc.), rate per gram, total amount
- Payment method: Cash or Bank Transfer (with UTR field)
- No GST/tax fields at all
- "Print Voucher" button

### 3. Purchase Voucher Print (Marathi Format)
A new `PurchaseVoucherPrint` component matching your exact format:
- Header: श्री अलंकार with address and mobile
- Title: "जुने सोने/चांदी खरेदी पावती (Purchase Voucher)"
- Customer details with PAN/Aadhaar field
- Items table in Marathi (अ. क्र., दागिन्यांचा तपशील, निव्वळ वजन, शुद्धता, दर प्रति ग्रॅम, एकूण रक्कम)
- Amount in words (Marathi)
- Payment method section with UTR field
- Customer declaration (प्रतिज्ञापत्र) - the exact legal text you provided
- Signature lines for customer and shop

### 4. Dashboard Updates
Add a new card showing:
- **Daily/Monthly Purchase Amount** - total amount spent on purchasing old jewelry
- This will be a separate card alongside existing turnover cards

### 5. Reports Integration
- Add a "Purchases" tab in Reports showing all purchase vouchers
- Summary cards: total purchase amount, total weight purchased, number of transactions
- This data is kept separate from GSTR-1 since no GST applies

## Technical Details

### Database Migration
```text
-- Purchase vouchers table
CREATE TABLE purchase_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  pan_aadhaar TEXT,
  total_weight NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  utr_number TEXT,
  notes TEXT,
  voucher_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchase voucher items table
CREATE TABLE purchase_voucher_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES purchase_vouchers(id),
  item_description TEXT NOT NULL,
  net_weight NUMERIC NOT NULL,
  purity TEXT NOT NULL,
  rate_per_gram NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  metal_type TEXT DEFAULT 'gold'
);

-- Auto-generate voucher number function
-- Format: PV-2026-0001
```

### Files to Create
1. **src/components/PurchaseVoucherPrint.tsx** - Marathi purchase receipt print layout with declaration text

### Files to Modify
1. **src/pages/Billing.tsx** - Add tabs to switch between "Sales Bill" and "Purchase Voucher", add purchase voucher form
2. **src/pages/Dashboard.tsx** - Add "Total Purchases" card fetching from `purchase_vouchers`
3. **src/pages/Reports.tsx** - Add "Purchases" tab with purchase voucher listing and summary
4. **src/contexts/LanguageContext.tsx** - Add Marathi translations for purchase voucher fields
