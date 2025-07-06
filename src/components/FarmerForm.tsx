
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/context/AuthContext';
import { canAccessBranch } from '@/utils/employeeData';
import { useFarmers } from '@/hooks/useFarmers';

interface FarmerFormProps {
  onClose: () => void;
  farmer?: any;
}

const FarmerForm: React.FC<FarmerFormProps> = ({ onClose, farmer }) => {
  const { branches } = useBranches();
  const { currentUser } = useAuth();
  const { addFarmer, updateFarmer } = useFarmers();
  
  const [formData, setFormData] = useState({
    id: farmer?.id || '',
    name: farmer?.name || '',
    email: farmer?.email || '',
    phone: farmer?.phone || '',
    password: farmer?.password || '',
    address: farmer?.address || '',
    state: farmer?.state || '',
    district: farmer?.district || '',
    village: farmer?.village || '',
    bank_name: farmer?.bank_name || '',
    account_number: farmer?.account_number || '',
    ifsc_code: farmer?.ifsc_code || '',
    profile_photo: farmer?.profile_photo || '',
    date_joined: farmer?.date_joined || new Date().toISOString(),
    branch_id: farmer?.branch_id || '',
    products: farmer?.products || [],
    transactions: farmer?.transactions || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter branches based on user permissions
  const accessibleBranches = branches.filter(branch => 
    canAccessBranch(currentUser?.role || '', currentUser?.branch_id || null, branch.id)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (farmer) {
        await updateFarmer(farmer.id, formData);
      } else {
        await addFarmer(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting farmer form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{farmer ? 'Edit Farmer' : 'Add New Farmer'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter farmer name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Enter district"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                  placeholder="Enter village"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch_id">Branch</Label>
              <select
                id="branch_id"
                name="branch_id"
                value={formData.branch_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                disabled={isSubmitting}
              >
                <option value="">Select Branch</option>
                {accessibleBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                <Input
                  id="ifsc_code"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : farmer ? 'Update Farmer' : 'Add Farmer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerForm;
