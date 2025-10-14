-- Create booking_receipts table for storing receipt details
CREATE TABLE public.booking_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  jewelry_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.booking_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_receipts
CREATE POLICY "Anyone can view booking receipts"
ON public.booking_receipts
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert booking receipts"
ON public.booking_receipts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update booking receipts"
ON public.booking_receipts
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete booking receipts"
ON public.booking_receipts
FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_booking_receipts_updated_at
BEFORE UPDATE ON public.booking_receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();