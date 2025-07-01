import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowLeft, User, Home, MapPin, Mail, Phone, Navigation } from 'lucide-react';
import PhotoUploadField from '@/components/PhotoUploadField';
import CustomerHeader from '@/components/CustomerHeader';
import { useCustomers } from '@/hooks/useCustomers';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateCustomer } = useCustomers();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get customer data from localStorage
  const customerString = localStorage.getItem('currentCustomer');
  const initialCustomer = customerString ? JSON.parse(customerString) : null;
  
  const [customer, setCustomer] = useState(initialCustomer || {
    name: '',
    mobile: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    profile_photo: ''
  });

  // Parse address to extract components if it's stored as a combined string
  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { street: '', landmark: '', city: '', state: '' };
    
    // If address is stored as "street, landmark, city, state" format
    const parts = fullAddress.split(', ');
    if (parts.length >= 4) {
      return {
        street: parts[0] || '',
        landmark: parts[1] || '',
        city: parts[2] || '',
        state: parts[3] || ''
      };
    }
    return { street: fullAddress, landmark: '', city: '', state: '' };
  };

  // Initialize address components from stored address
  useEffect(() => {
    if (initialCustomer && initialCustomer.address && !customer.landmark && !customer.city && !customer.state) {
      const addressComponents = parseAddress(initialCustomer.address);
      setCustomer(prev => ({
        ...prev,
        address: addressComponents.street,
        landmark: addressComponents.landmark,
        city: addressComponents.city,
        state: addressComponents.state
      }));
    }
  }, []);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!initialCustomer) {
      navigate('/customer-login');
    }
  }, [initialCustomer, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePhotoChange = (photoUrl: string) => {
    setCustomer(prev => ({ ...prev, profile_photo: photoUrl }));
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Combine address components into full address
      const fullAddress = [customer.address, customer.landmark, customer.city, customer.state]
        .filter(Boolean)
        .join(', ');
      
      const updatedCustomer = {
        ...customer,
        address: fullAddress
      };
      
      // Update customer in Supabase if customer has an ID
      if (customer.id) {
        const result = await updateCustomer(customer.id, updatedCustomer);
        if (!result.success) {
          throw new Error('Failed to update profile in database');
        }
      }
      
      // Update customer in localStorage
      localStorage.setItem('currentCustomer', JSON.stringify(updatedCustomer));
      
      // Update customer in customers array
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const updatedCustomers = customers.map((c: any) => 
        c.id === customer.id ? updatedCustomer : c
      );
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      
      setCustomer(updatedCustomer);
      setIsLoading(false);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsLoading(false);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (!initialCustomer) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <div className="min-h-screen bg-muted/30">
      <CustomerHeader />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-20 p-4">
        <div className="container mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>My Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <PhotoUploadField
                      value={customer.profile_photo}
                      onChange={handleProfilePhotoChange}
                      name="customer-profile-photo"
                      className="w-24 h-24 mb-4"
                    />
                    <h2 className="text-xl font-bold">{customer.name}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Mobile</p>
                        <p>{customer.mobile}</p>
                      </div>
                    </div>
                    
                    {customer.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p>{customer.email}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-sm leading-relaxed">{customer.address}</p>
                      </div>
                    </div>

                    {customer.landmark && (
                      <div className="flex items-center gap-3">
                        <Navigation className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Landmark</p>
                          <p>{customer.landmark}</p>
                        </div>
                      </div>
                    )}
                    
                    {customer.city && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">City</p>
                          <p>{customer.city}</p>
                        </div>
                      </div>
                    )}

                    {customer.state && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">State</p>
                          <p>{customer.state}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pincode</p>
                        <p>{customer.pincode}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-6"
                  >
                    Edit Profile
                  </Button>
                </>
              ) : (
                <form className="space-y-4">
                  <div className="flex flex-col items-center mb-6">
                    <PhotoUploadField
                      value={customer.profile_photo}
                      onChange={handleProfilePhotoChange}
                      name="customer-profile-photo"
                      className="w-24 h-24"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Tap to update profile photo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={customer.name}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={customer.mobile}
                      onChange={handleInputChange}
                      disabled={true} // Cannot change mobile as it's the primary identifier
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={customer.email || ''}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={customer.address}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      name="landmark"
                      value={customer.landmark || ''}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Nearby landmark"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={customer.city || ''}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={customer.state || ''}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="State"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={customer.pincode}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-agri-primary hover:bg-agri-secondary"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
