-- Update RLS policies for bookings to allow proper status updates
-- Drop the restrictive UPDATE policy
DROP POLICY IF EXISTS "Owner can update bookings" ON public.bookings;

-- Create new policy that allows anyone to update bookings (for admin panel)
CREATE POLICY "Anyone can update bookings"
ON public.bookings
FOR UPDATE
USING (true)
WITH CHECK (true);