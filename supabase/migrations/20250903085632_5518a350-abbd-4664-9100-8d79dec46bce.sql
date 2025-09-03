-- Create table for OTP verification
CREATE TABLE public.email_otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_email_otp_email_code ON public.email_otp_verifications (email, otp_code);
CREATE INDEX idx_email_otp_expires ON public.email_otp_verifications (expires_at);

-- Clean up expired OTPs function
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.email_otp_verifications 
  WHERE expires_at < now();
END;
$$;