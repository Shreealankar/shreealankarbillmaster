
-- Purchase vouchers table
CREATE TABLE public.purchase_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number TEXT NOT NULL UNIQUE,
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
CREATE TABLE public.purchase_voucher_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES public.purchase_vouchers(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  net_weight NUMERIC NOT NULL,
  purity TEXT NOT NULL,
  rate_per_gram NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  metal_type TEXT DEFAULT 'gold',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate voucher number function
CREATE OR REPLACE FUNCTION public.generate_voucher_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_year TEXT;
  next_num INTEGER;
  voucher_num TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SPLIT_PART(voucher_number, '-', 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.purchase_vouchers
  WHERE voucher_number LIKE 'PV-' || current_year || '-%';
  voucher_num := 'PV-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN voucher_num;
END;
$$;

-- Auto-generate voucher number trigger
CREATE OR REPLACE FUNCTION public.auto_generate_voucher_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.voucher_number IS NULL OR NEW.voucher_number = '' THEN
    NEW.voucher_number := public.generate_voucher_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_voucher_number
  BEFORE INSERT ON public.purchase_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_voucher_number();

-- RLS policies
ALTER TABLE public.purchase_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_voucher_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on purchase_vouchers" ON public.purchase_vouchers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on purchase_voucher_items" ON public.purchase_voucher_items
  FOR ALL USING (true) WITH CHECK (true);
