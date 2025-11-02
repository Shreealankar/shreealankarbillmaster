-- Set default empty string for booking_code so it's optional in inserts
-- The trigger will override this with the actual generated code
ALTER TABLE bookings 
ALTER COLUMN booking_code SET DEFAULT '';