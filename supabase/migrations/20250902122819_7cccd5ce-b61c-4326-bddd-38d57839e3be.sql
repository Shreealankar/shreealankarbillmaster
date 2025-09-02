-- Fix the ambiguous column reference by renaming the variable
CREATE OR REPLACE FUNCTION public.generate_bill_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_year TEXT;
  bill_count INT;
  generated_bill_number TEXT;  -- Renamed to avoid conflict
  max_attempts INT := 100;
  attempt_count INT := 0;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  LOOP
    -- Get the next bill count based on existing bills for this year
    SELECT COALESCE(MAX(CAST(SPLIT_PART(b.bill_number, '-', 3) AS INT)), 0) + 1 
    INTO bill_count
    FROM public.bills b
    WHERE b.bill_number LIKE 'AL-' || current_year || '-%'
    AND b.bill_number ~ '^AL-[0-9]{4}-[0-9]+$';
    
    -- Generate the bill number using the renamed variable
    generated_bill_number := 'AL-' || current_year || '-' || LPAD(bill_count::TEXT, 4, '0');
    
    -- Check if this bill number already exists
    IF NOT EXISTS (SELECT 1 FROM public.bills b WHERE b.bill_number = generated_bill_number) THEN
      RETURN generated_bill_number;
    END IF;
    
    -- Safety check to prevent infinite loops
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique bill number after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$function$;

-- Recreate the trigger function (no changes needed here)
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

-- Ensure trigger is properly created
DROP TRIGGER IF EXISTS auto_generate_bill_number_trigger ON public.bills;
CREATE TRIGGER auto_generate_bill_number_trigger
BEFORE INSERT ON public.bills
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_bill_number();