-- Update function to set search_path for security
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
BEGIN
  -- Get the next number by counting existing bookings + 1
  SELECT COUNT(*) + 1 INTO next_number FROM bookings;
  
  -- Generate code like BK001, BK002, etc.
  new_code := 'BK' || LPAD(next_number::TEXT, 3, '0');
  
  -- Set the booking_code
  NEW.booking_code := new_code;
  
  RETURN NEW;
END;
$$;