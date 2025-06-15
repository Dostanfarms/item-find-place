
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Farmer } from '@/utils/types';
import { states, districts, villages, banks } from '@/utils/locationData';
import PhotoUploadField from '@/components/PhotoUploadField';
import { Textarea } from '@/components/ui/textarea';
import { useFarmers } from '@/hooks/useFarmers';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmer: Farmer;
  onProfileUpdate: (updatedFarmer: Farmer) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
  farmer,
  onProfileUpdate
}) => {
  const { toast } = useToast();
  const { updateFarmer } = useFarmers();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    state: '',
    district: '',
    village: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    profile_photo: ''
  });
  
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when farmer data changes
  useEffect(() => {
    if (farmer) {
      setFormData({
        name: farmer.name || '',
        email: farmer.email || '',
        address: farmer.address || '',
        state: farmer.state || '',
        district: farmer.district || '',
        village: farmer.village || '',
        bank_name: farmer.bank_name || '',
        account_number: farmer.account_number || '',
        ifsc_code: farmer.ifsc_code || '',
        profile_photo: farmer.profile_photo || ''
      });
      
      // Set available districts and villages if state and district are available
      if (farmer.state && districts[farmer.state]) {
        setAvailableDistricts(districts[farmer.state]);
        
        if (farmer.district && villages[farmer.district]) {
          setAvailableVillages(villages[farmer.district]);
        }
      }
    }
  }, [farmer]);

  // Update districts when state changes
  useEffect(() => {
    if (formData.state && districts[formData.state]) {
      setAvailableDistricts(districts[formData.state]);
      if (!districts[formData.state].includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: '', village: '' }));
        setAvailableVillages([]);
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.state]);

  // Update villages when district changes
  useEffect(() => {
    if (formData.district && villages[formData.district]) {
      setAvailableVillages(villages[formData.district]);
      if (!villages[formData.district].includes(formData.village)) {
        setFormData(prev => ({ ...prev, village: '' }));
      }
    } else {
      setAvailableVillages([]);
    }
  }, [formData.district]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Email validation function
  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (formData.email && !validateEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Basic validation
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in name and email fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const updatedFarmerData = {
        ...farmer,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        profile_photo: formData.profile_photo
      };

      const result = await updateFarmer(farmer.id, updatedFarmerData);
      
      if (result.success) {
        // Update localStorage with new farmer data
        localStorage.setItem('currentFarmer', JSON.stringify(updatedFarmerData));
        
        // Call the callback to update parent component
        onProfileUpdate(updatedFarmerData);
        
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated."
        });
        
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[65vh]">
            <div className="space-y-4 p-1">
              <div className="flex justify-center mb-4">
                <PhotoUploadField
                  value={formData.profile_photo}
                  onChange={(value) => setFormData(prev => ({ ...prev, profile_photo: value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Enter your name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={farmer.phone}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="Enter email address" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={formData.email && !validateEmail(formData.email) ? "border-red-500" : ""}
                  />
                  {formData.email && !validateEmail(formData.email) && 
                    <p className="text-xs text-red-500">Please enter a valid email address</p>
                  }
                </div>

                {/* Location fields */}
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={(value) => handleSelectChange("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {Object.keys(states).map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select 
                    value={formData.district} 
                    onValueChange={(value) => handleSelectChange("district", value)}
                    disabled={!formData.state || availableDistricts.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {availableDistricts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Select 
                    value={formData.village} 
                    onValueChange={(value) => handleSelectChange("village", value)}
                    disabled={!formData.district || availableVillages.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {availableVillages.map(village => (
                        <SelectItem key={village} value={village}>{village}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    placeholder="Enter address" 
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                {/* Banking Details */}
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Select 
                    value={formData.bank_name} 
                    onValueChange={(value) => handleSelectChange("bank_name", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {banks.map(bank => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input 
                    id="account_number" 
                    name="account_number" 
                    placeholder="Enter account number" 
                    value={formData.account_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifsc_code">IFSC Code</Label>
                  <Input 
                    id="ifsc_code" 
                    name="ifsc_code" 
                    placeholder="Enter IFSC code" 
                    value={formData.ifsc_code}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-agri-primary hover:bg-agri-secondary"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
