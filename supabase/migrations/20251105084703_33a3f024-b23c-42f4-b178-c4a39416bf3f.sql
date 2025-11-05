-- Create app_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create security definer function to check if user is authenticated staff
CREATE OR REPLACE FUNCTION public.is_authenticated_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
$$;

-- RLS policy for user_roles (only admins can manage roles)
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Drop existing permissive policies and create secure ones for customers table
DROP POLICY IF EXISTS "Anyone can view customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can update customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can delete customers" ON public.customers;

CREATE POLICY "Authenticated staff can view customers"
ON public.customers FOR SELECT
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can insert customers"
ON public.customers FOR INSERT
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can update customers"
ON public.customers FOR UPDATE
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can delete customers"
ON public.customers FOR DELETE
USING (public.is_authenticated_staff());

-- Secure bills table
DROP POLICY IF EXISTS "Anyone can view bills" ON public.bills;
DROP POLICY IF EXISTS "Anyone can insert bills" ON public.bills;
DROP POLICY IF EXISTS "Anyone can update bills" ON public.bills;
DROP POLICY IF EXISTS "Anyone can delete bills" ON public.bills;

CREATE POLICY "Authenticated staff can view bills"
ON public.bills FOR SELECT
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can insert bills"
ON public.bills FOR INSERT
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can update bills"
ON public.bills FOR UPDATE
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can delete bills"
ON public.bills FOR DELETE
USING (public.is_authenticated_staff());

-- Secure bill_items table
DROP POLICY IF EXISTS "Anyone can view bill_items" ON public.bill_items;
DROP POLICY IF EXISTS "Anyone can insert bill_items" ON public.bill_items;
DROP POLICY IF EXISTS "Anyone can update bill_items" ON public.bill_items;
DROP POLICY IF EXISTS "Anyone can delete bill_items" ON public.bill_items;

CREATE POLICY "Authenticated staff can view bill_items"
ON public.bill_items FOR SELECT
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can insert bill_items"
ON public.bill_items FOR INSERT
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can update bill_items"
ON public.bill_items FOR UPDATE
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can delete bill_items"
ON public.bill_items FOR DELETE
USING (public.is_authenticated_staff());

-- Secure bookings table
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owner can delete bookings" ON public.bookings;

CREATE POLICY "Authenticated staff can view bookings"
ON public.bookings FOR SELECT
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can insert bookings"
ON public.bookings FOR INSERT
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can update bookings"
ON public.bookings FOR UPDATE
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can delete bookings"
ON public.bookings FOR DELETE
USING (public.is_authenticated_staff());

-- Secure borrowings table
DROP POLICY IF EXISTS "Anyone can view borrowings" ON public.borrowings;
DROP POLICY IF EXISTS "Anyone can insert borrowings" ON public.borrowings;
DROP POLICY IF EXISTS "Anyone can update borrowings" ON public.borrowings;
DROP POLICY IF EXISTS "Anyone can delete borrowings" ON public.borrowings;

CREATE POLICY "Authenticated staff can view borrowings"
ON public.borrowings FOR SELECT
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can insert borrowings"
ON public.borrowings FOR INSERT
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can update borrowings"
ON public.borrowings FOR UPDATE
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can delete borrowings"
ON public.borrowings FOR DELETE
USING (public.is_authenticated_staff());

-- Secure messages table
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can delete messages" ON public.messages;

CREATE POLICY "Authenticated staff can view messages"
ON public.messages FOR SELECT
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can insert messages"
ON public.messages FOR INSERT
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can update messages"
ON public.messages FOR UPDATE
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can delete messages"
ON public.messages FOR DELETE
USING (public.is_authenticated_staff());

-- Secure email_otps table (critical - authentication codes)
DROP POLICY IF EXISTS "Allow public access to email_otps" ON public.email_otps;

CREATE POLICY "No public access to email_otps"
ON public.email_otps FOR SELECT
USING (false);

CREATE POLICY "System can manage email_otps"
ON public.email_otps FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Secure booking_receipts table
DROP POLICY IF EXISTS "Anyone can view booking receipts" ON public.booking_receipts;
DROP POLICY IF EXISTS "Anyone can insert booking receipts" ON public.booking_receipts;
DROP POLICY IF EXISTS "Anyone can update booking receipts" ON public.booking_receipts;
DROP POLICY IF EXISTS "Anyone can delete booking receipts" ON public.booking_receipts;

CREATE POLICY "Authenticated staff can view booking_receipts"
ON public.booking_receipts FOR SELECT
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can insert booking_receipts"
ON public.booking_receipts FOR INSERT
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can update booking_receipts"
ON public.booking_receipts FOR UPDATE
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can delete booking_receipts"
ON public.booking_receipts FOR DELETE
USING (public.is_authenticated_staff());

-- Secure subscribers table
DROP POLICY IF EXISTS "Anyone can view active subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Anyone can create subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Anyone can update subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Anyone can delete subscribers" ON public.subscribers;

CREATE POLICY "Authenticated staff can view subscribers"
ON public.subscribers FOR SELECT
USING (public.is_authenticated_staff());

CREATE POLICY "Authenticated staff can manage subscribers"
ON public.subscribers FOR ALL
USING (public.is_authenticated_staff())
WITH CHECK (public.is_authenticated_staff());