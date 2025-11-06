-- ============================================
-- SECURITY & ACCESS MODULE
-- ============================================

-- Activity logs table for audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins and staff can view all activity logs
CREATE POLICY "Staff can view activity logs"
ON public.activity_logs
FOR SELECT
USING (is_authenticated_staff());

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (true);

-- ============================================
-- INVENTORY ENHANCEMENTS MODULE
-- ============================================

-- Vendors/Suppliers table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  gstin TEXT,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage vendors"
ON public.vendors FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  status TEXT DEFAULT 'pending',
  total_amount NUMERIC(12, 2) DEFAULT 0,
  paid_amount NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage purchase orders"
ON public.purchase_orders FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage PO items"
ON public.purchase_order_items FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Product Transfers table (for multiple branches)
CREATE TABLE IF NOT EXISTS public.product_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  received_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage transfers"
ON public.product_transfers FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Wastage/Scrap tracking table
CREATE TABLE IF NOT EXISTS public.wastage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number TEXT UNIQUE NOT NULL,
  metal_type TEXT NOT NULL,
  weight_grams NUMERIC(10, 3) NOT NULL,
  purity TEXT NOT NULL,
  reason TEXT NOT NULL,
  value_estimate NUMERIC(12, 2),
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  disposed BOOLEAN DEFAULT false,
  disposal_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wastage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage wastage records"
ON public.wastage_records FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Purity Testing Records table
CREATE TABLE IF NOT EXISTS public.purity_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_number TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  customer_name TEXT,
  metal_type TEXT NOT NULL,
  claimed_purity TEXT NOT NULL,
  tested_purity TEXT NOT NULL,
  weight_grams NUMERIC(10, 3) NOT NULL,
  test_method TEXT,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  test_result TEXT NOT NULL,
  notes TEXT,
  tested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purity_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage purity tests"
ON public.purity_tests FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Stock Alerts configuration table
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  threshold_quantity INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, alert_type)
);

ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage stock alerts"
ON public.stock_alerts FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- ============================================
-- ADDITIONAL TOOLS MODULE
-- ============================================

-- Schemes/Installment Plans table
CREATE TABLE IF NOT EXISTS public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  scheme_name TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  installment_amount NUMERIC(12, 2) NOT NULL,
  total_installments INTEGER NOT NULL,
  paid_installments INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  bonus_percentage NUMERIC(5, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage schemes"
ON public.schemes FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Scheme Payments table
CREATE TABLE IF NOT EXISTS public.scheme_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  receipt_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scheme_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage scheme payments"
ON public.scheme_payments FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Repair/Job Work tracking table
CREATE TABLE IF NOT EXISTS public.repair_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  item_description TEXT NOT NULL,
  metal_type TEXT NOT NULL,
  weight_grams NUMERIC(10, 3),
  job_type TEXT NOT NULL,
  estimated_cost NUMERIC(12, 2),
  actual_cost NUMERIC(12, 2),
  advance_paid NUMERIC(12, 2) DEFAULT 0,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  promised_date DATE,
  completion_date DATE,
  delivery_date DATE,
  status TEXT DEFAULT 'received',
  notes TEXT,
  photos JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.repair_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage repair jobs"
ON public.repair_jobs FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Old Gold Exchange table
CREATE TABLE IF NOT EXISTS public.old_gold_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,
  old_item_description TEXT NOT NULL,
  old_metal_type TEXT NOT NULL,
  old_purity TEXT NOT NULL,
  gross_weight NUMERIC(10, 3) NOT NULL,
  stone_weight NUMERIC(10, 3) DEFAULT 0,
  net_weight NUMERIC(10, 3) NOT NULL,
  rate_per_gram NUMERIC(12, 2) NOT NULL,
  exchange_value NUMERIC(12, 2) NOT NULL,
  exchange_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.old_gold_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage gold exchanges"
ON public.old_gold_exchanges FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- Stone/Diamond Inventory table
CREATE TABLE IF NOT EXISTS public.stone_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stone_code TEXT UNIQUE NOT NULL,
  stone_type TEXT NOT NULL,
  shape TEXT,
  size_mm TEXT,
  carat_weight NUMERIC(10, 3),
  color TEXT,
  clarity TEXT,
  cut_grade TEXT,
  quantity INTEGER DEFAULT 1,
  cost_per_piece NUMERIC(12, 2),
  total_value NUMERIC(12, 2),
  vendor_id UUID REFERENCES public.vendors(id),
  certificate_number TEXT,
  location TEXT,
  status TEXT DEFAULT 'in_stock',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stone_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage stone inventory"
ON public.stone_inventory FOR ALL
USING (is_authenticated_staff())
WITH CHECK (is_authenticated_staff());

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_transfers_updated_at BEFORE UPDATE ON public.product_transfers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wastage_records_updated_at BEFORE UPDATE ON public.wastage_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_alerts_updated_at BEFORE UPDATE ON public.stock_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON public.schemes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repair_jobs_updated_at BEFORE UPDATE ON public.repair_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stone_inventory_updated_at BEFORE UPDATE ON public.stone_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-INCREMENT FUNCTIONS
-- ============================================

-- Generate PO Number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  current_year TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SPLIT_PART(po_number, '-', 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.purchase_orders
  WHERE po_number LIKE 'PO-' || current_year || '-%';
  RETURN 'PO-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate Transfer Number
CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(transfer_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.product_transfers;
  RETURN 'TRF' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate Wastage Number
CREATE OR REPLACE FUNCTION generate_wastage_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(record_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.wastage_records;
  RETURN 'WST' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate Test Number
CREATE OR REPLACE FUNCTION generate_test_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(test_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.purity_tests;
  RETURN 'TST' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate Scheme Code
CREATE OR REPLACE FUNCTION generate_scheme_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(scheme_code FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.schemes;
  RETURN 'SCH' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate Job Number
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.repair_jobs;
  RETURN 'JOB' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate Exchange Number
CREATE OR REPLACE FUNCTION generate_exchange_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(exchange_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.old_gold_exchanges;
  RETURN 'EXC' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON public.purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);

CREATE INDEX IF NOT EXISTS idx_schemes_customer ON public.schemes(customer_id);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON public.schemes(status);

CREATE INDEX IF NOT EXISTS idx_repair_jobs_customer ON public.repair_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_status ON public.repair_jobs(status);