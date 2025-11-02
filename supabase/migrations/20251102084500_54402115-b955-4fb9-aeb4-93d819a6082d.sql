-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_booking_code() CASCADE;

-- Create function to generate booking code
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate booking_code before insert
CREATE TRIGGER set_booking_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_code IS NULL)
  EXECUTE FUNCTION generate_booking_code();