-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated staff can insert bills" ON public.bills;
DROP POLICY IF EXISTS "Authenticated staff can update bills" ON public.bills;
DROP POLICY IF EXISTS "Authenticated staff can delete bills" ON public.bills;
DROP POLICY IF EXISTS "Authenticated staff can view bills" ON public.bills;

DROP POLICY IF EXISTS "Authenticated staff can insert bill_items" ON public.bill_items;
DROP POLICY IF EXISTS "Authenticated staff can update bill_items" ON public.bill_items;
DROP POLICY IF EXISTS "Authenticated staff can delete bill_items" ON public.bill_items;
DROP POLICY IF EXISTS "Authenticated staff can view bill_items" ON public.bill_items;

DROP POLICY IF EXISTS "Authenticated staff can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated staff can update customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated staff can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated staff can view customers" ON public.customers;

-- Create new permissive policies that allow all operations
CREATE POLICY "Allow all operations on bills" 
ON public.bills 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on bill_items" 
ON public.bill_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on customers" 
ON public.customers 
FOR ALL 
USING (true) 
WITH CHECK (true);