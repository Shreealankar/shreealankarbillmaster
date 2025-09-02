-- Add missing columns to bill_items table
ALTER TABLE public.bill_items 
ADD COLUMN IF NOT EXISTS making_charges_type TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS making_charges_percentage NUMERIC DEFAULT 0;