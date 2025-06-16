
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useFarmers } from '@/hooks/useFarmers';
import { useToast } from '@/hooks/use-toast';

const FarmerLogin = () => {
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [foundFarmer, setFoundFarmer] = useState<any>(null);
  const navigate = useNavigate();
  const { farmers } = useFarmers();
  const { toast } = useToast();

  // Validate phone number (10 digits, starts with 6-9)
  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number starting with 6-9",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Check if farmer exists with this phone number
    const farmer = farmers.find(f => f.phone === phone);
    
    if (!farmer) {
      setIsLoading(false);
      navigate('/access-denied');
      return;
    }
    
    setFoundFarmer(farmer);
    
    // Generate a 6-digit OTP
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    
    console.log('Generated OTP for testing:', randomOtp); // For testing purposes
    
    // Simulate API delay for sending OTP
    setTimeout(() => {
      setIsOtpSent(true);
      setIsLoading(false);
      toast({
        title: "OTP Sent",
        description: `OTP sent to ${phone}`,
      });
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay for verifying OTP
    setTimeout(() => {
      if (otp === generatedOtp && foundFarmer) {
        // Store farmer login info
        localStorage.setItem('currentFarmer', JSON.stringify({
          id: foundFarmer.id,
          name: foundFarmer.name,
          phone: foundFarmer.phone,
          email: foundFarmer.email,
          address: foundFarmer.address,
          state: foundFarmer.state,
          district: foundFarmer.district,
          village: foundFarmer.village,
          profile_photo: foundFarmer.profile_photo,
          isLoggedIn: true
        }));
        
        toast({
          title: "Login Successful",
          description: `Welcome ${foundFarmer.name}!`,
        });
        
        navigate('/farmer-dashboard');
      } else {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-4 transition-transform duration-200 hover:scale-110" 
            onClick={() => navigate('/app')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">DostanFarms</span>
          </div>
          <CardTitle className="text-2xl font-bold">Farmer Login</CardTitle>
        </CardHeader>
        <CardContent>
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter your registered 10-digit mobile number
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-agri-primary hover:bg-agri-secondary"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to {phone}
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-agri-primary hover:bg-agri-secondary"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
              <div className="text-center">
                <Button 
                  variant="link" 
                  type="button" 
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtp('');
                    setGeneratedOtp('');
                    setFoundFarmer(null);
                  }}
                  className="text-sm p-0"
                >
                  Change phone number
                </Button>
              </div>
              <div className="text-center">
                <Button 
                  variant="link" 
                  type="button"
                  className="text-sm p-0"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        
        {/* Show OTP at bottom for testing */}
        {isOtpSent && generatedOtp && (
          <CardFooter className="border-t pt-4">
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground mb-2">For testing purposes:</p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm font-medium text-blue-800">OTP: {generatedOtp}</p>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default FarmerLogin;
