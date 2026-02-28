
-- ============================================
-- Feature 1: Expenses table
-- ============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'misc',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Feature 2: Estimates & Estimate Items tables
-- ============================================
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  customer_email TEXT,
  customer_gstin TEXT,
  total_weight NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_percentage NUMERIC DEFAULT 3,
  tax_amount NUMERIC DEFAULT 0,
  cgst_amount NUMERIC DEFAULT 0,
  sgst_amount NUMERIC DEFAULT 0,
  igst_amount NUMERIC DEFAULT 0,
  is_igst BOOLEAN DEFAULT false,
  final_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on estimates" ON public.estimates FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.estimate_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID REFERENCES public.estimates(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  metal_type TEXT NOT NULL DEFAULT 'gold',
  purity TEXT NOT NULL DEFAULT '22k',
  weight_grams NUMERIC NOT NULL,
  rate_per_gram NUMERIC NOT NULL,
  making_charges NUMERIC DEFAULT 0,
  making_charges_type TEXT DEFAULT 'manual',
  making_charges_percentage NUMERIC DEFAULT 0,
  stone_charges NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  hsn_code TEXT DEFAULT '7113',
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on estimate_items" ON public.estimate_items FOR ALL USING (true) WITH CHECK (true);

-- Generate estimate number function
CREATE OR REPLACE FUNCTION public.generate_estimate_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
  current_year TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SPLIT_PART(estimate_number, '-', 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.estimates
  WHERE estimate_number LIKE 'EST-' || current_year || '-%';
  RETURN 'EST-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

-- ============================================
-- Feature 3: Cash Book Entries table
-- ============================================
CREATE TABLE IF NOT EXISTS public.cash_book_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL DEFAULT 'cash_in',
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  cash_in NUMERIC DEFAULT 0,
  cash_out NUMERIC DEFAULT 0,
  payment_mode TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cash_book_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on cash_book_entries" ON public.cash_book_entries FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Feature 4: Add DOB & Anniversary to customers
-- ============================================
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS anniversary_date DATE;

-- ============================================
-- Feature 5: Add HUID fields to products
-- ============================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS huid_number TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hallmark_date DATE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hallmark_center TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hallmark_status TEXT DEFAULT 'pending';

-- ============================================
-- Feature 6: Fix old_gold_exchanges RLS
-- ============================================
DROP POLICY IF EXISTS "Staff can manage gold exchanges" ON public.old_gold_exchanges;
CREATE POLICY "Allow all operations on old_gold_exchanges" ON public.old_gold_exchanges FOR ALL USING (true) WITH CHECK (true);
