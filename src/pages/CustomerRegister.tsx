import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { fetchLocationFromPincode, debounce } from '@/utils/pincodeUtils';

interface CustomerForm {
  name: string;
  mobile: string;
  email?: string;
}

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerCustomer } = useCustomers();
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  
  const [customer, setCustomer] = useState<CustomerForm>({
    name: '',
    mobile: '',
    email: ''
  });
  
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  // Debounced function to fetch location data
  const debouncedFetchLocation = useCallback(
    debounce(async (pincodeValue: string) => {
      if (pincodeValue.length === 6) {
        setIsPincodeLoading(true);
        const locationData = await fetchLocationFromPincode(pincodeValue);
        
        if (locationData) {
          setCity(locationData.city);
          setState(locationData.state);
          toast({
            title: "Location Found",
            description: `${locationData.city}, ${locationData.state}`
          });
        } else {
          toast({
            title: "Invalid Pincode",
            description: "Could not find location for this pincode",
            variant: "destructive"
          });
        }
        setIsPincodeLoading(false);
      }
    }, 500),
    []
  );

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);
    
    // Clear previous city and state when pincode changes
    if (value.length < 6) {
      setCity('');
      setState('');
    }
    
    // Fetch location data when pincode is 6 digits
    debouncedFetchLocation(value);
  };
  
  const handleSendOtp = () => {
    if (!customer.mobile || customer.mobile.length < 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid mobile number",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your mobile number"
      });
    }, 1500);
  };
  
  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      setOtpVerified(true);
      toast({
        title: "OTP Verified",
        description: "Your mobile number has been verified"
      });
    }, 1500);
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer.name || !address || !landmark || !pincode || !city || !state) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!otpVerified) {
      toast({
        title: "Mobile Not Verified",
        description: "Please verify your mobile number",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const registrationData = {
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        address: `${address}, ${landmark}, ${city}, ${state}`,
        pincode
      };

      console.log('Submitting registration data:', registrationData);
      const result = await registerCustomer(registrationData);
      
      if (result.success) {
        // Store customer data in localStorage for immediate access
        localStorage.setItem('currentCustomer', JSON.stringify(result.customer));
        
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully"
        });
        
        // Redirect to customer home
        navigate('/customer-home');
      } else {
        console.error('Registration failed:', result.error);
        toast({
          title: "Registration Failed",
          description: "Failed to create account. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-4 top-4" 
              onClick={() => navigate('/app-landing')}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div className="mx-auto flex items-center gap-2">
              <Package className="h-6 w-6 text-agri-primary" />
              <span className="text-lg font-bold">DostanFarms</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Customer Registration</CardTitle>
          <CardDescription className="text-center">Create your account to start shopping</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your full name"
                value={customer.name}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="mobile"
                  name="mobile"
                  placeholder="Your mobile number"
                  value={customer.mobile}
                  onChange={handleInputChange}
                  disabled={otpSent || isLoading}
                  required
                />
                {!otpVerified && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleSendOtp}
                    disabled={otpSent || isLoading}
                  >
                    {otpSent ? "Resend" : "Send OTP"}
                  </Button>
                )}
              </div>
            </div>
            
            {otpSent && !otpVerified && (
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Verification *</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                value={customer.email || ''}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Your full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark *</Label>
              <Input
                id="landmark"
                placeholder="Nearby landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={handlePincodeChange}
                disabled={isLoading}
                maxLength={6}
                required
              />
              {isPincodeLoading && (
                <p className="text-sm text-blue-600">Fetching location...</p>
              )}
            </div>

            {/* Auto-filled City and State */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading}
                  className={city ? "bg-green-50 border-green-300" : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={isLoading}
                  className={state ? "bg-green-50 border-green-300" : ""}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-agri-primary hover:bg-agri-secondary"
              disabled={isLoading || !otpVerified}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/customer-login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegister;
