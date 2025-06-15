
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Package, User, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginCustomer } = useCustomers();
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid mobile number",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await loginCustomer(mobile);
      
      if (!result.success) {
        toast({
          title: "Account Not Found",
          description: "No account found with this mobile number",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      setTimeout(() => {
        setIsLoading(false);
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "An OTP has been sent to your mobile number"
        });
      }, 500);
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await loginCustomer(mobile);
      
      if (result.success && result.customer) {
        localStorage.setItem('currentCustomer', JSON.stringify(result.customer));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.customer.name}!`
        });
        
        onLoginSuccess();
        onClose();
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    onClose();
    navigate('/customer-register');
  };

  const resetForm = () => {
    setMobile('');
    setOtp('');
    setOtpSent(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">DostanFarms</span>
          </div>
          <DialogTitle className="text-center">Login Required</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            Please login to proceed with checkout
          </p>
          
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="popup-mobile">Mobile Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="popup-mobile"
                      placeholder="Your mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      disabled={otpSent || isLoading}
                      required
                    />
                    {!otpSent && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send OTP"}
                      </Button>
                    )}
                  </div>
                </div>
                
                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="popup-otp">OTP</Label>
                    <Input
                      id="popup-otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                )}
                
                {otpSent && (
                  <Button 
                    type="submit" 
                    className="w-full bg-agri-primary hover:bg-agri-secondary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Don't have an account?</p>
            <Button 
              variant="outline" 
              onClick={handleRegisterClick}
              className="w-full flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Register New Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopup;
