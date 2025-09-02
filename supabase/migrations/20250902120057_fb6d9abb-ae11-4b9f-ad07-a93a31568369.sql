-- Ensure the trigger exists for auto-generating bill numbers
CREATE OR REPLACE FUNCTION public.auto_generate_bill_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  generated_number TEXT;
BEGIN
  IF NEW.bill_number IS NULL OR NEW.bill_number = '' THEN
    generated_number := public.generate_bill_number();
    NEW.bill_number := generated_number;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger on bills table
DROP TRIGGER IF EXISTS auto_generate_bill_number_trigger ON public.bills;
CREATE TRIGGER auto_generate_bill_number_trigger
BEFORE INSERT ON public.bills
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_bill_number();