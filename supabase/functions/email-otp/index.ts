import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

// Initialize services
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

// Request interface
interface OTPRequest {
  email: string;
  action: 'send' | 'verify';
  otp?: string;
}

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email template
const createOTPEmail = (otp: string, email: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Shree Alankar</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 20px; 
            background-color: #f5f5f5; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #FFD700, #FFA500); 
            padding: 30px; 
            text-align: center; 
            color: #333; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: bold; 
        }
        .content { 
            padding: 30px; 
        }
        .otp-box { 
            background: #f8f9fa; 
            border: 2px solid #FFD700; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0; 
        }
        .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            letter-spacing: 6px; 
            color: #333; 
            margin: 10px 0; 
        }
        .shop-info { 
            background: #f0f9ff; 
            border-left: 4px solid #FFD700; 
            padding: 15px; 
            margin: 20px 0; 
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 Shree Alankar</h1>
            <p>Gold & Silver Ornaments</p>
        </div>
        
        <div class="content">
            <h2>Email Verification Required</h2>
            
            <p>Dear Valued Customer,</p>
            
            <p>Please use the following verification code to confirm your email address:</p>
            
            <div class="otp-box">
                <div>Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div style="color: #666; font-size: 14px;">Valid for 10 minutes</div>
            </div>
            
            <div class="shop-info">
                <h3>About Shree Alankar</h3>
                <p><strong>Owner:</strong> Kiran Raghunath Jadhav</p>
                <p><strong>Contact:</strong> +91 9921612155</p>
                <p><strong>Email:</strong> kiranjadhav3230@gmail.com</p>
                <p><strong>Location:</strong> Near Bank Of Maharashtra, Lohoner</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                If you didn't request this code, please ignore this email.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Shree Alankar</strong> - Your Trusted Jewelry Partner</p>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Main handler function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }), 
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const { email, action, otp }: OTPRequest = await req.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid email required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`OTP ${action} request for email: ${normalizedEmail}`);

    if (action === 'send') {
      // Clean expired OTPs first
      await supabase.rpc('cleanup_expired_email_otps');
      console.log('Cleaned up expired OTPs');

      // Generate new OTP
      const newOTP = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      console.log(`Generated OTP: ${newOTP} for ${normalizedEmail}`);

      // Store OTP in database
      const { data: insertData, error: dbError } = await supabase
        .from('email_otps')
        .insert({
          email: normalizedEmail,
          otp_code: newOTP,
          expires_at: expiresAt.toISOString(),
          is_verified: false
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to store OTP" }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log('OTP stored in database:', insertData?.id);

      // Send email
      try {
        const emailResult = await resend.emails.send({
          from: "Shree Alankar <noreply@resend.dev>",
          to: [normalizedEmail],
          subject: "Email Verification Code - Shree Alankar",
          html: createOTPEmail(newOTP, normalizedEmail)
        });

        console.log('Email sent result:', emailResult);

        if (emailResult.error) {
          console.error('Resend error:', emailResult.error);
          
          // Handle testing mode limitation
          if (emailResult.error.message?.includes('testing emails')) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: "Email service is in testing mode. Please contact kiranjadhav3230@gmail.com",
                testMode: true 
              }),
              { status: 400, headers: corsHeaders }
            );
          }
          
          return new Response(
            JSON.stringify({ success: false, error: "Failed to send email" }),
            { status: 500, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "OTP sent successfully",
            emailId: emailResult.data?.id
          }),
          { status: 200, headers: corsHeaders }
        );

      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to send email" }),
          { status: 500, headers: corsHeaders }
        );
      }

    } else if (action === 'verify') {
      if (!otp || otp.length !== 6) {
        return new Response(
          JSON.stringify({ success: false, error: "6-digit OTP required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      console.log(`Verifying OTP: ${otp} for email: ${normalizedEmail}`);

      // Find valid OTP
      const { data: otpRecord, error: fetchError } = await supabase
        .from('email_otps')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('otp_code', otp)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpRecord) {
        console.log('OTP verification failed:', fetchError);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid or expired OTP" }),
          { status: 400, headers: corsHeaders }
        );
      }

      console.log('Found valid OTP record:', otpRecord.id);

      // Mark as verified
      const { error: updateError } = await supabase
        .from('email_otps')
        .update({ is_verified: true })
        .eq('id', otpRecord.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to verify OTP" }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log('OTP verified successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email verified successfully",
          verified: true
        }),
        { status: 200, headers: corsHeaders }
      );

    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid action" }),
        { status: 400, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
};

serve(handler);