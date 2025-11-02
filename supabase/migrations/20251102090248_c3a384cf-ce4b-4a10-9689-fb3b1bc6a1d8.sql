-- Drop everything related to booking code generation
DROP TRIGGER IF EXISTS set_booking_code ON bookings;
DROP TRIGGER IF EXISTS auto_generate_booking_code_trigger ON bookings;
DROP FUNCTION IF EXISTS generate_booking_code() CASCADE;
DROP FUNCTION IF EXISTS auto_generate_booking_code() CASCADE;

-- Create a fresh trigger function with a different approach
CREATE OR REPLACE FUNCTION public.set_booking_code_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
  current_year TEXT;
BEGIN
  -- Only generate if booking_code is NULL or empty
  IF NEW.booking_code IS NULL OR NEW.booking_code = '' THEN
    -- Get current year
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next number by finding the highest existing number for current year
    SELECT COALESCE(MAX(
      CASE 
        WHEN booking_code ~ '^SA-[0-9]{4}-[0-9]{4}$' 
        THEN SUBSTRING(booking_code FROM 10)::INTEGER 
        ELSE 0 
      END
    ), 0) + 1 
    INTO next_number 
    FROM bookings
    WHERE booking_code LIKE 'SA-' || current_year || '-%';
    
    -- Generate code like SA-2025-0001, SA-2025-0002, etc.
    new_code := 'SA-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
    
    -- Set the booking_code
    NEW.booking_code := new_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER set_booking_code_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_booking_code_on_insert();