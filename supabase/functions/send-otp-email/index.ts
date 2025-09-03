import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl!, supabaseKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  type: 'send' | 'verify';
  otpCode?: string;
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createEmailTemplate = (otp: string, email: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Shree Alankar</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; color: #333; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .content { padding: 40px 30px; }
        .otp-code { background: #f8f9fa; border: 2px solid #FFD700; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; }
        .shop-info { background: #f8f9fa; border-left: 4px solid #FFD700; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .btn { display: inline-block; background: #FFD700; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
        .security-notice { background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span style="font-size: 24px; color: #FFD700;">💍</span>
            </div>
            <h1 style="margin: 0; font-size: 28px;">Shree Alankar</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Gold & Silver Ornaments</p>
        </div>
        
        <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification Required</h2>
            
            <p>Dear Valued Customer,</p>
            
            <p>Thank you for choosing <strong>Shree Alankar</strong> for your precious jewelry needs. To ensure secure billing and delivery, please verify your email address using the code below:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p><strong>This verification code will expire in 10 minutes.</strong></p>
            
            <div class="shop-info">
                <h3 style="color: #333; margin-top: 0;">About Shree Alankar</h3>
                <p><strong>Owner:</strong> Kiran Raghunath Jadhav</p>
                <p><strong>Specialization:</strong> Gold & Silver Ornaments</p>
                <p><strong>Location:</strong> Near Bank Of Maharashtra, Lohoner</p>
                <p><strong>Contact:</strong> +91 9921612155</p>
                <p><strong>Email:</strong> kiranjadhav3230@gmail.com</p>
                <p style="margin-bottom: 0;"><em>Trusted jewelry craftsmanship with traditional values</em></p>
            </div>
            
            <div class="security-notice">
                <p style="margin: 0;"><strong>🔒 Security Notice:</strong> We verify email addresses to ensure accurate bill delivery and prevent fraud. Your email will only be used for billing purposes and order confirmations.</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you didn't request this verification, please ignore this email. The code will expire automatically.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Shree Alankar</strong> - Your Trusted Jewelry Partner</p>
            <p>Near Bank Of Maharashtra, Lohoner | +91 9921612155</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, otpCode }: SendOTPRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "Valid email address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === 'send') {
      // Clean up expired OTPs first
      await supabase.rpc('cleanup_expired_otps');

      // Generate new OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      const { error: dbError } = await supabase
        .from('email_otp_verifications')
        .insert({
          email: email.toLowerCase(),
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          is_verified: false
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to store OTP');
      }

      // Send email using Resend
      const emailResponse = await resend.emails.send({
        from: "Shree Alankar <noreply@resend.dev>",
        to: [email],
        subject: "Email Verification - Shree Alankar Jewelry",
        html: createEmailTemplate(otp, email),
      });

      if (emailResponse.error) {
        console.error('Resend error:', emailResponse.error);
        throw new Error('Failed to send email');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully",
          emailId: emailResponse.data?.id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );

    } else if (type === 'verify') {
      if (!otpCode || otpCode.length !== 6) {
        return new Response(
          JSON.stringify({ error: "Valid 6-digit OTP code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify OTP
      const { data: otpRecord, error: fetchError } = await supabase
        .from('email_otp_verifications')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('otp_code', otpCode)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpRecord) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired OTP" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark OTP as verified
      const { error: updateError } = await supabase
        .from('email_otp_verifications')
        .update({ is_verified: true })
        .eq('id', otpRecord.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to verify OTP');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email verified successfully",
          verified: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);