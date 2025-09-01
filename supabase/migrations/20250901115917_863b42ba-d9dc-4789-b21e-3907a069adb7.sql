-- Fix the ambiguous column reference in the trigger function
CREATE OR REPLACE FUNCTION public.auto_generate_bill_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  generated_bill_number TEXT;
BEGIN
  IF NEW.bill_number IS NULL OR NEW.bill_number = '' THEN
    generated_bill_number := public.generate_bill_number();
    NEW.bill_number := generated_bill_number;
  END IF;
  RETURN NEW;
END;
$function$;