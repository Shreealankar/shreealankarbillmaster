import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewEmailOTPProps {
  email: string;
  onEmailChange: (email: string) => void;
  onVerificationComplete: (isVerified: boolean, email: string) => void;
  isRequired?: boolean;
}

export const NewEmailOTP: React.FC<NewEmailOTPProps> = ({
  email,
  onEmailChange,
  onVerificationComplete,
  isRequired = false
}) => {
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const sendOTP = async () => {
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSendingOtp(true);
    setError('');
    
    try {
      const { data, error: funcError } = await supabase.functions.invoke('email-otp', {
        body: { 
          email: email.toLowerCase().trim(),
          action: 'send'
        }
      });

      console.log('Send OTP response:', { data, funcError });

      if (funcError) {
        console.error('Function error:', funcError);
        throw new Error(funcError.message || 'Failed to call function');
      }

      if (!data?.success) {
        console.error('API error:', data?.error);
        
        if (data?.testMode) {
          toast({
            title: "Testing Mode",
            description: data.error,
            variant: "default"
          });
          return;
        }
        
        throw new Error(data?.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${email}. Check your inbox and spam folder.`,
      });
      
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setError(error.message || 'Failed to send OTP');
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const { data, error: funcError } = await supabase.functions.invoke('email-otp', {
        body: { 
          email: email.toLowerCase().trim(),
          action: 'verify',
          otp: otp
        }
      });

      console.log('Verify OTP response:', { data, funcError });

      if (funcError) {
        console.error('Function error:', funcError);
        throw new Error(funcError.message || 'Failed to call function');
      }

      if (!data?.success) {
        console.error('Verification failed:', data?.error);
        throw new Error(data?.error || 'Verification failed');
      }

      if (data.verified) {
        setIsVerified(true);
        onVerificationComplete(true, email);
        toast({
          title: "Email Verified! ✓",
          description: "Your email has been successfully verified.",
        });
      } else {
        throw new Error('Verification failed');
      }
      
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setError(error.message || 'Invalid OTP');
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setOtpSent(false);
    setOtp('');
    setIsVerified(false);
    setError('');
    onVerificationComplete(false, '');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Verification {!isRequired && '(Optional)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Email Input Section */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                onEmailChange(e.target.value);
                setError('');
              }}
              disabled={isVerified}
              className={isVerified ? "bg-green-50 border-green-200" : ""}
            />
            
            {!isVerified && (
              <Button
                onClick={sendOTP}
                disabled={isSendingOtp || !email || !isValidEmail(email)}
                variant="outline"
                className="whitespace-nowrap min-w-[100px]"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : otpSent ? "Resend OTP" : "Send OTP"}
              </Button>
            )}
            
            {isVerified && (
              <Button
                onClick={resetVerification}
                variant="outline"
                className="whitespace-nowrap"
              >
                Change Email
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* OTP Input Section */}
        {otpSent && !isVerified && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <div className="space-y-2">
              <Label>Enter 6-digit verification code</Label>
              <div className="flex items-center gap-4">
                <InputOTP
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setError('');
                  }}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                
                <Button
                  onClick={verifyOTP}
                  disabled={isVerifying || otp.length !== 6}
                  className="whitespace-nowrap min-w-[100px]"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : "Verify"}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-blue-600">
              📧 Check your email inbox for the verification code. It may take a few minutes to arrive. 
              Don't forget to check your spam/promotions folder.
            </p>
          </div>
        )}

        {/* Success State */}
        {isVerified && (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">✅ Email verified successfully!</span>
          </div>
        )}

        {/* Information Box */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
          <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Why verify your email?</p>
            <p>Email verification ensures accurate bill delivery and helps prevent fraud. Your email will only be used for billing and order confirmations.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};