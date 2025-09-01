-- Fix the ambiguous column reference in bill number generation
CREATE OR REPLACE FUNCTION public.generate_bill_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_year TEXT;
  bill_count INT;
  bill_number TEXT;
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
    
    -- Generate the bill number
    bill_number := 'AL-' || current_year || '-' || LPAD(bill_count::TEXT, 4, '0');
    
    -- Check if this bill number already exists
    IF NOT EXISTS (SELECT 1 FROM public.bills b WHERE b.bill_number = bill_number) THEN
      RETURN bill_number;
    END IF;
    
    -- Safety check to prevent infinite loops
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique bill number after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$function$;