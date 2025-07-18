-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  total_weight NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  balance_amount NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_percentage NUMERIC DEFAULT 3,
  tax_amount NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill items table
CREATE TABLE public.bill_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  metal_type TEXT NOT NULL DEFAULT 'gold',
  purity TEXT NOT NULL DEFAULT '22k',
  weight_grams NUMERIC NOT NULL,
  rate_per_gram NUMERIC NOT NULL,
  making_charges NUMERIC DEFAULT 0,
  stone_charges NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create borrowings table for loan management
CREATE TABLE public.borrowings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  borrowed_amount NUMERIC NOT NULL,
  interest_rate NUMERIC DEFAULT 0,
  borrowed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_amount NUMERIC DEFAULT 0,
  balance_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for customer communications
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  customer_phone TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'reminder',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Anyone can view customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete customers" ON public.customers FOR DELETE USING (true);

-- Create policies for bills
CREATE POLICY "Anyone can view bills" ON public.bills FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bills" ON public.bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bills" ON public.bills FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete bills" ON public.bills FOR DELETE USING (true);

-- Create policies for bill_items
CREATE POLICY "Anyone can view bill_items" ON public.bill_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bill_items" ON public.bill_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bill_items" ON public.bill_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete bill_items" ON public.bill_items FOR DELETE USING (true);

-- Create policies for borrowings
CREATE POLICY "Anyone can view borrowings" ON public.borrowings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert borrowings" ON public.borrowings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update borrowings" ON public.borrowings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete borrowings" ON public.borrowings FOR DELETE USING (true);

-- Create policies for messages
CREATE POLICY "Anyone can view messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update messages" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete messages" ON public.messages FOR DELETE USING (true);

-- Create function to generate unique bill numbers
CREATE OR REPLACE FUNCTION generate_bill_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  bill_count INT;
  bill_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COUNT(*) + 1 INTO bill_count
  FROM public.bills
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  bill_number := 'AL-' || current_year || '-' || LPAD(bill_count::TEXT, 4, '0');
  
  RETURN bill_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate bill numbers
CREATE OR REPLACE FUNCTION auto_generate_bill_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bill_number IS NULL OR NEW.bill_number = '' THEN
    NEW.bill_number := generate_bill_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_bill_number
  BEFORE INSERT ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_bill_number();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrowings_updated_at
  BEFORE UPDATE ON public.borrowings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();