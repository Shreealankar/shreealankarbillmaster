-- Create rate_history table to track rate changes
CREATE TABLE IF NOT EXISTS public.rate_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metal_type TEXT NOT NULL,
  rate_per_gram NUMERIC NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_history ENABLE ROW LEVEL SECURITY;

-- Create policies for rate_history
CREATE POLICY "Anyone can view rate history"
ON public.rate_history
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert rate history"
ON public.rate_history
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_rate_history_metal_type_created ON public.rate_history(metal_type, created_at DESC);

-- Create trigger to log rate changes
CREATE OR REPLACE FUNCTION public.log_rate_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.rate_history (metal_type, rate_per_gram, updated_by)
  VALUES (NEW.metal_type, NEW.rate_per_gram, NEW.updated_by);
  RETURN NEW;
END;
$$;

CREATE TRIGGER rate_change_logger
AFTER INSERT OR UPDATE OF rate_per_gram
ON public.rates
FOR EACH ROW
EXECUTE FUNCTION public.log_rate_change();