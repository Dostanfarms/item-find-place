import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginFormData {
  mobile: string;
}

interface OTPFormData {
  otp: string;
}

const DeliveryPartnerLogin = () => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register: registerMobile, handleSubmit: handleMobileSubmit, formState: { errors: mobileErrors } } = useForm<LoginFormData>();
  const { register: registerOTP, handleSubmit: handleOTPSubmit, formState: { errors: otpErrors } } = useForm<OTPFormData>();

  const sendOTP = async (data: LoginFormData) => {
    try {
      setLoading(true);
      
      // Check if delivery partner exists
      const { data: partner, error: partnerError } = await supabase
        .from('delivery_partners')
        .select('id, name')
        .eq('mobile', data.mobile)
        .single();

      if (partnerError || !partner) {
        toast({
          title: "Account Not Found",
          description: "No delivery partner account found with this mobile number",
          variant: "destructive",
        });
        return;
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database
      const { error: otpError } = await supabase
        .from('delivery_partner_otp')
        .insert({
          mobile: data.mobile,
          otp_code: otp,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        });

      if (otpError) {
        console.error('OTP error:', otpError);
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // In a real app, you would send the OTP via SMS
      // For demo purposes, we'll show it in the console
      console.log(`OTP for ${data.mobile}: ${otp}`);
      
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${data.mobile}. Check console for demo OTP.`,
      });

      setMobile(data.mobile);
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (data: OTPFormData) => {
    try {
      setLoading(true);
      
      // Verify OTP
      const { data: otpRecord, error: otpError } = await supabase
        .from('delivery_partner_otp')
        .select('*')
        .eq('mobile', mobile)
        .eq('otp_code', data.otp)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpRecord) {
        toast({
          title: "Invalid OTP",
          description: "Please enter a valid OTP",
          variant: "destructive",
        });
        return;
      }

      // Mark OTP as used
      await supabase
        .from('delivery_partner_otp')
        .update({ is_used: true })
        .eq('id', otpRecord.id);

      // Get delivery partner details
      const { data: partner } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('mobile', mobile)
        .single();

      // Store partner info in localStorage (in a real app, use proper session management)
      localStorage.setItem('delivery_partner', JSON.stringify(partner));

      toast({
        title: "Login Successful",
        description: "Welcome to delivery partner dashboard",
      });

      navigate('/delivery-dashboard');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Delivery Partner Login</CardTitle>
          <CardDescription>
            {step === 'mobile' 
              ? 'Enter your registered mobile number' 
              : 'Enter the OTP sent to your mobile'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'mobile' ? (
            <form onSubmit={handleMobileSubmit(sendOTP)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  {...registerMobile("mobile", { 
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit mobile number"
                    }
                  })}
                  placeholder="Enter your mobile number"
                  maxLength={10}
                />
                {mobileErrors.mobile && (
                  <p className="text-sm text-destructive">{mobileErrors.mobile.message}</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit(verifyOTP)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  {...registerOTP("otp", { 
                    required: "OTP is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Please enter a valid 6-digit OTP"
                    }
                  })}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                {otpErrors.otp && (
                  <p className="text-sm text-destructive">{otpErrors.otp.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('mobile')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryPartnerLogin;