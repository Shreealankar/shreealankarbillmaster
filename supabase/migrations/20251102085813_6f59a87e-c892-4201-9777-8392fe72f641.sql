-- Remove the old conflicting trigger
DROP TRIGGER IF EXISTS auto_generate_booking_code_trigger ON bookings;
DROP FUNCTION IF EXISTS auto_generate_booking_code() CASCADE;