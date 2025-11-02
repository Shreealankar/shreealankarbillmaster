-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS set_booking_code ON bookings;
DROP FUNCTION IF EXISTS generate_booking_code() CASCADE;

-- Create the proper trigger function that generates booking codes like SA-2025-0012
CREATE OR REPLACE FUNCTION public.generate_booking_code()
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
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER set_booking_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_code IS NULL OR NEW.booking_code = '')
  EXECUTE FUNCTION public.generate_booking_code();