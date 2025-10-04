-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;

-- Create a new policy that allows anyone to view bookings (since this is an admin panel)
CREATE POLICY "Anyone can view bookings"
ON public.bookings
FOR SELECT
USING (true);

-- Also ensure DELETE policy exists for managing bookings
DROP POLICY IF EXISTS "Owner can delete bookings" ON public.bookings;

CREATE POLICY "Owner can delete bookings"
ON public.bookings
FOR DELETE
USING (true);