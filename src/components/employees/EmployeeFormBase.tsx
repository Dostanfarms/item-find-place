
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhotoUploadField from '@/components/PhotoUploadField';
import { Employee } from '@/utils/types';
import { useRoles } from '@/hooks/useRoles';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/context/AuthContext';

interface EmployeeFormBaseProps {
  employee?: Employee;
  onSubmit: (employee: Omit<Employee, 'id' | 'dateJoined'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EmployeeFormBase: React.FC<EmployeeFormBaseProps> = ({
  employee,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { roles } = useRoles();
  const { branches } = useBranches();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    password: employee?.password || '',
    role: employee?.role || 'sales',
    profilePhoto: employee?.profilePhoto || '',
    state: employee?.state || '',
    district: employee?.district || '',
    village: employee?.village || '',
    accountHolderName: employee?.accountHolderName || '',
    accountNumber: employee?.accountNumber || '',
    bankName: employee?.bankName || '',
    ifscCode: employee?.ifscCode || '',
    branchId: employee?.branchId || employee?.branch_id || ''
  });

  // Filter branches based on user role
  const availableBranches = currentUser?.role?.toLowerCase() === 'admin' 
    ? branches 
    : branches.filter(branch => branch.id === currentUser?.branch_id);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    // If not admin, auto-assign current user's branch
    let finalBranchId = formData.branchId;
    if (currentUser?.role?.toLowerCase() !== 'admin' && currentUser?.branch_id) {
      finalBranchId = currentUser.branch_id;
    }

    const submissionData: Omit<Employee, 'id' | 'dateJoined'> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role as any,
      profilePhoto: formData.profilePhoto,
      state: formData.state,
      district: formData.district,
      village: formData.village,
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      ifscCode: formData.ifscCode,
      branchId: finalBranchId,
      branch_id: finalBranchId,
      branchIds: finalBranchId ? [finalBranchId] : [],
      isActive: true,
      createdAt: employee?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(submissionData);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* Photo Upload */}
        <div className="flex justify-center">
          <PhotoUploadField
            value={formData.profilePhoto}
            onChange={(photoUrl) => handleInputChange('profilePhoto', photoUrl)}
            name="employee-profile-photo"
          />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              required={!employee}
              disabled={isLoading}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name.toLowerCase()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch Assignment */}
          <div className="space-y-2">
            <Label htmlFor="branchId">Branch *</Label>
            <Select 
              value={formData.branchId} 
              onValueChange={(value) => handleInputChange('branchId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.branch_name} - {branch.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Enter state"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              placeholder="Enter district"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="village">Village</Label>
            <Input
              id="village"
              value={formData.village}
              onChange={(e) => handleInputChange('village', e.target.value)}
              placeholder="Enter village"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Bank Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              value={formData.accountHolderName}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              placeholder="Enter account holder name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              placeholder="Enter account number"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              placeholder="Enter bank name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              value={formData.ifscCode}
              onChange={(e) => handleInputChange('ifscCode', e.target.value)}
              placeholder="Enter IFSC code"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeFormBase;
