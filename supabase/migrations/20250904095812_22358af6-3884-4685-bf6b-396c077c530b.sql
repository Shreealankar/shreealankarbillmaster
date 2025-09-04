-- Create email_otps table for the new OTP system
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no authentication required for OTP verification)
CREATE POLICY "Allow public access to email_otps" 
ON public.email_otps 
FOR ALL 
USING (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_email_otps_email_otp ON public.email_otps(email, otp_code);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON public.email_otps(expires_at);

-- Create function to cleanup expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_email_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.email_otps 
  WHERE expires_at < now();
END;
$function$

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_otps_updated_at
BEFORE UPDATE ON public.email_otps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();