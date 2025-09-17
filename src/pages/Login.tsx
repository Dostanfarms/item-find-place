import { useState, useEffect } from "react";
import { ArrowLeft, Smartphone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "@/contexts/UserAuthContext";

export const Login = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUserAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // OTP timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === 'otp') {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer, step]);

  const handleSendOtp = async () => {
    if (!mobile.trim()) {
      toast({
        title: "Error",
        description: "Please enter your mobile number",
        variant: "destructive",
      });
      return;
    }

    if (mobile.length !== 10) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('mobile', mobile)
        .maybeSingle();

      if (!existingUser) {
        toast({
          title: "User not found",
          description: "This mobile number is not registered. Please register first.",
          variant: "destructive",
        });
        setIsLoading(false);
        navigate('/register');
        return;
      }

      // Generate OTP and save to database
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const { error } = await supabase
        .from('user_otp')
        .insert({
          mobile: mobile,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      // In a real app, you would send SMS here
      // For demo purposes, we'll show the OTP in a toast
      toast({
        title: "OTP Sent",
        description: `Your OTP is: ${otpCode} (Valid for 5 minutes)`,
      });

      setStep('otp');
      setOtpTimer(30); // 30 seconds before resend is allowed
      setCanResendOtp(false);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    
    setCanResendOtp(false);
    setOtpTimer(30);
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP
      const { data: otpData, error: otpError } = await supabase
        .from('user_otp')
        .select('*')
        .eq('mobile', mobile)
        .eq('otp_code', otp)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (otpError || !otpData) {
        toast({
          title: "Error",
          description: "Invalid or expired OTP",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Mark OTP as used
      await supabase
        .from('user_otp')
        .update({ is_used: true })
        .eq('id', otpData.id);

      // Get user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('mobile', mobile)
        .single();

      if (userError) throw userError;

      toast({
        title: "Success",
        description: "Login successful!",
      });

      login(user);
      navigate('/checkout'); // Navigate to checkout after successful login
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-full">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-foreground">Door Delivery</span>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === 'phone' ? 'Welcome Back!' : 'Verify OTP'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {step === 'phone' 
                ? 'Enter your mobile number to continue' 
                : `We've sent a 6-digit OTP to +91 ${mobile}`
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'phone' ? (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-orange-100 rounded-full">
                    <Smartphone className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      +91
                    </span>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="pl-12 h-12 text-lg"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSendOtp}
                  disabled={isLoading || mobile.length !== 10}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                >
                  {isLoading ? "Sending OTP..." : "Continue"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-orange-600 font-medium"
                      onClick={() => navigate('/register')}
                    >
                      Register here
                    </Button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="h-12 text-lg text-center tracking-widest"
                  />
                </div>

                <Button 
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the OTP?
                  </p>
                  
                  {canResendOtp ? (
                    <Button 
                      variant="link" 
                      onClick={handleResendOtp}
                      className="p-0 h-auto text-orange-600 font-medium"
                    >
                      Resend OTP
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Resend OTP in {formatTime(otpTimer)}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                      setOtpTimer(0);
                      setCanResendOtp(false);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Change mobile number
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};