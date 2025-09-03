-- Enable RLS on email_otp_verifications table
ALTER TABLE public.email_otp_verifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert OTP records (for sending OTPs)
CREATE POLICY "Anyone can create OTP records" 
ON public.email_otp_verifications 
FOR INSERT 
WITH CHECK (true);

-- Allow reading OTP records for verification (by email and code)
CREATE POLICY "Allow OTP verification by email and code" 
ON public.email_otp_verifications 
FOR SELECT 
USING (true);

-- Allow updating OTP records for verification status
CREATE POLICY "Allow updating verification status" 
ON public.email_otp_verifications 
FOR UPDATE 
USING (true);

-- Update cleanup function with proper search_path
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_otp_verifications 
  WHERE expires_at < now();
END;
$$;