

# Professional Features Upgrade for Shree Alankar Software

## Overview
Adding 6 new professional features to make your jewelry shop software complete and industry-standard.

---

## Feature 1: Daily Cash Book / Ledger (रोजचे खातेवही)

**What it does:** Track every rupee coming in and going out of your shop daily.

- Opening balance each day (auto-carried from previous day's closing)
- All cash inflows: Sales bills, scheme payments, booking advances
- All cash outflows: Purchases from customers, expenses, wages
- Closing balance calculated automatically
- Daily summary with print option

**Technical:**
- New `cash_book_entries` table (date, type, reference_id, description, cash_in, cash_out, balance, payment_mode)
- New page `src/pages/CashBook.tsx` with date picker, entries table, and running balance
- Auto-entries created when bills/purchases/expenses are saved
- New sidebar menu item

---

## Feature 2: Estimate / Quotation System (अंदाजपत्रक)

**What it does:** Create professional price estimates to show customers before they decide to buy. Can be converted to a bill later.

- Create estimate with customer details and items (same as billing)
- Auto-number: EST-2026-0001
- Print / WhatsApp share the estimate
- "Convert to Bill" button to turn estimate into actual sales bill
- Track estimate status: Draft, Sent, Converted, Expired

**Technical:**
- New `estimates` and `estimate_items` tables (similar to bills/bill_items but without payment fields)
- New tab in Billing page or separate page
- `EstimatePrint` component for professional print layout
- Convert-to-bill function copies items to billing form

---

## Feature 3: Old Gold Exchange in Bill (जुने सोने बदली)

**What it does:** When a customer brings old gold jewelry and wants to exchange it for new jewelry, deduct the old gold value directly from the bill.

- In the Sales Bill form, add "Old Gold Exchange" section
- Enter: old item description, weight, purity, rate per gram
- Exchange value auto-calculated and deducted from bill total
- Shows clearly on printed bill: "Less: Old Gold Exchange Value"
- Old gold details stored separately for records

**Technical:**
- Use existing `old_gold_exchanges` table (already exists in database)
- Fix RLS policy (currently requires `is_authenticated_staff()`)
- Add exchange form section in Billing page's sales bill tab
- Update `BillPrint` component to show old gold deduction
- Link exchange to bill via `bill_id` foreign key

---

## Feature 4: Expense Tracker (खर्च व्यवस्थापन)

**What it does:** Record all shop expenses like rent, electricity, wages, polishing costs, transport, etc.

- Add expenses with category, amount, date, payment method
- Categories: Rent, Electricity, Wages, Polishing, Transport, Packaging, Misc
- Monthly expense summary with category-wise breakdown
- Integrates with Cash Book for outflow tracking

**Technical:**
- New `expenses` table (date, category, description, amount, payment_method, receipt_number, notes)
- New page `src/pages/Expenses.tsx` with add form, list, and monthly summary
- New sidebar menu item
- Auto-create cash book entry when expense is added

---

## Feature 5: Customer Birthday/Anniversary Reminders (शुभेच्छा स्मरणपत्र)

**What it does:** Store customer birthdays and anniversaries, show reminders on dashboard so you can send wishes and special offers.

- Add birthday and anniversary date fields to customer profile
- Dashboard widget showing "Today's Birthdays" and "Upcoming in 7 days"
- Quick WhatsApp wish button with pre-formatted message
- Helps build customer loyalty

**Technical:**
- Add `date_of_birth` and `anniversary_date` columns to `customers` table
- Update Customers page form to include these fields
- Add reminder widget on Dashboard
- WhatsApp share with pre-formatted greeting message

---

## Feature 6: Hallmarking / HUID Tracker (हॉलमार्किंग)

**What it does:** Track BIS Hallmark and HUID (Hallmark Unique ID) numbers for each product as required by Indian law since 2021.

- Add HUID number field to products
- Record hallmarking date and center name
- Show HUID on product tag and bill
- Search products by HUID number
- Hallmarking status tracking: Pending, Sent for Hallmarking, Hallmarked

**Technical:**
- Add `huid_number`, `hallmark_date`, `hallmark_center`, `hallmark_status` columns to `products` table
- Update Product form to include HUID fields
- Update `ProductTag` component to show HUID
- Update `BillPrint` to show HUID in items table
- Add HUID search in Products page

---

## Implementation Order
1. **Expense Tracker** (simple, standalone)
2. **Customer Birthday/Anniversary** (small change to existing table)
3. **Hallmarking / HUID** (small change to products)
4. **Old Gold Exchange in Bill** (uses existing table, modifies billing)
5. **Estimate / Quotation System** (new tables + UI)
6. **Daily Cash Book** (depends on expenses and other features being ready)

## Database Changes Summary
- New tables: `cash_book_entries`, `expenses`, `estimates`, `estimate_items`
- Modified tables: `customers` (add DOB, anniversary), `products` (add HUID fields)
- Fix RLS on `old_gold_exchanges` table
- All new tables get open RLS policies (matching your existing pattern)

## New Pages/Components
- `src/pages/Expenses.tsx`
- `src/pages/CashBook.tsx`
- `src/components/EstimatePrint.tsx`
- Sidebar updated with new menu items

## Modified Files
- `src/pages/Billing.tsx` - Old gold exchange + estimates
- `src/pages/Dashboard.tsx` - Birthday reminders widget
- `src/pages/Customers.tsx` - DOB/anniversary fields
- `src/pages/Products.tsx` - HUID fields
- `src/components/BillPrint.tsx` - Old gold deduction + HUID
- `src/components/ProductTag.tsx` - HUID display
- `src/components/ProductForm.tsx` - HUID input fields
- `src/components/AppSidebar.tsx` - New menu items

