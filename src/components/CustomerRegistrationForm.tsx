
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { states, districts, villages } from '@/utils/locationData';

interface CustomerRegistrationFormProps {
  onRegistrationSuccess: (customer: any) => void;
  onSwitchToLogin: () => void;
}

const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({
  onRegistrationSuccess,
  onSwitchToLogin
}) => {
  const { toast } = useToast();
  const { registerCustomer } = useCustomers();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedDistrict('');
    setFormData(prev => ({ 
      ...prev, 
      state: value,
      city: ''
    }));
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setFormData(prev => ({ ...prev, city: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobile || !formData.address || !formData.pincode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.mobile.length < 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerCustomer(formData);
      
      if (result.success && result.customer) {
        localStorage.setItem('currentCustomer', JSON.stringify(result.customer));
        
        toast({
          title: "Registration Successful",
          description: `Welcome, ${result.customer.name}!`
        });
        
        onRegistrationSuccess(result.customer);
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register. Please try again.",
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

  const availableDistricts = selectedState ? districts[selectedState] || [] : [];

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Customer Registration</CardTitle>
        <CardDescription className="text-center">Create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              name="address"
              placeholder="Enter your street address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark</Label>
            <Input
              id="landmark"
              name="landmark"
              placeholder="Nearby landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={selectedState} onValueChange={handleStateChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(states).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City/District</Label>
            <Select 
              value={selectedDistrict} 
              onValueChange={handleDistrictChange} 
              disabled={isLoading || !selectedState}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city/district" />
              </SelectTrigger>
              <SelectContent>
                {availableDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              name="pincode"
              placeholder="Enter pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-agri-primary hover:bg-agri-secondary"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button 
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerRegistrationForm;
