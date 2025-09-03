import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, Shield, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailOTPVerificationProps {
  email: string;
  onEmailChange: (email: string) => void;
  onVerificationComplete: (isVerified: boolean, email: string) => void;
  isRequired?: boolean;
}

export const EmailOTPVerification: React.FC<EmailOTPVerificationProps> = ({
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
  const [verificationError, setVerificationError] = useState('');

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isGmailAddress = (email: string) => {
    return email.toLowerCase().includes('@gmail.com');
  };

  const sendOTP = async () => {
    if (!email || !isValidEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!isGmailAddress(email)) {
      toast({
        title: "Error", 
        description: "Only Gmail addresses are supported for OTP verification",
        variant: "destructive"
      });
      return;
    }

    setIsSendingOtp(true);
    setVerificationError('');

    try {
      const { data, error } = await supabase.functions.invoke('send-otp-email', {
        body: { 
          email: email.toLowerCase(),
          type: 'send'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${email}. Check your inbox and spam folder.`,
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
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
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      const { data, error } = await supabase.functions.invoke('send-otp-email', {
        body: { 
          email: email.toLowerCase(),
          type: 'verify',
          otpCode: otp
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.verified) {
        setIsVerified(true);
        onVerificationComplete(true, email);
        toast({
          title: "Email Verified",
          description: "Gmail address has been successfully verified!",
        });
      } else {
        throw new Error("Verification failed");
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setVerificationError(error.message || "Invalid OTP. Please try again.");
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
    setVerificationError('');
    onVerificationComplete(false, email);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gmail Verification {isRequired && <span className="text-destructive">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">Gmail Address</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="Enter Gmail address"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={isVerified}
              className={isVerified ? "bg-green-50 border-green-200" : ""}
            />
            {!isVerified && (
              <Button
                onClick={sendOTP}
                disabled={isSendingOtp || !email || !isGmailAddress(email)}
                variant="outline"
                className="whitespace-nowrap"
              >
                {isSendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
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
          {email && !isGmailAddress(email) && (
            <p className="text-sm text-orange-600">
              Only Gmail addresses are supported for verification
            </p>
          )}
        </div>

        {/* OTP Input */}
        {otpSent && !isVerified && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter 6-digit OTP</Label>
              <div className="flex items-center gap-4">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
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
                  className="whitespace-nowrap"
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </div>
              {verificationError && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {verificationError}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Check your Gmail inbox for the verification code. It may take a few minutes to arrive. Don't forget to check your spam/promotions folder.
            </p>
          </div>
        )}

        {/* Verification Status */}
        {isVerified && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Gmail address verified successfully!</span>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
          <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Why verify Gmail?</p>
            <p>We verify Gmail addresses to ensure accurate bill delivery and prevent fraud.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};