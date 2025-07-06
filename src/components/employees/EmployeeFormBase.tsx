
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhotoUploadField from '@/components/PhotoUploadField';
import { Employee } from '@/utils/types';
import { useBranches } from '@/hooks/useBranches';
import { useRoles } from '@/hooks/useRoles';
import { useAuth } from '@/context/AuthContext';
import { canAccessBranch } from '@/utils/employeeData';

interface EmployeeFormBaseProps {
  employee?: Employee;
  onSubmit: (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'date_joined'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EmployeeFormBase: React.FC<EmployeeFormBaseProps> = ({
  employee,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { branches, loading: branchesLoading } = useBranches();
  const { roles } = useRoles();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    password: employee?.password || '',
    role: employee?.role || 'sales',
    profile_photo: employee?.profile_photo || '',
    state: employee?.state || '',
    district: employee?.district || '',
    village: employee?.village || '',
    account_holder_name: employee?.account_holder_name || '',
    account_number: employee?.account_number || '',
    bank_name: employee?.bank_name || '',
    ifsc_code: employee?.ifsc_code || '',
    branch_id: employee?.branch_id || '',
    is_active: employee?.is_active !== false
  });

  // Debug logging to understand branch access
  console.log('Current user:', currentUser);
  console.log('All branches:', branches);
  console.log('Branches loading:', branchesLoading);

  // Filter branches based on user permissions with enhanced logging
  const accessibleBranches = branches.filter(branch => {
    const hasAccess = canAccessBranch(
      currentUser?.role || '', 
      currentUser?.branch_id || null, 
      branch.id
    );
    console.log(`Branch ${branch.branch_name} (${branch.id}): Access = ${hasAccess}`);
    return hasAccess;
  });

  console.log('Accessible branches:', accessibleBranches);

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`Field ${field} changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Submitting form data:', formData);

    const submissionData: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'date_joined'> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role as any,
      profile_photo: formData.profile_photo,
      state: formData.state,
      district: formData.district,
      village: formData.village,
      account_holder_name: formData.account_holder_name,
      account_number: formData.account_number,
      bank_name: formData.bank_name,
      ifsc_code: formData.ifsc_code,
      branch_id: formData.branch_id || null,
      is_active: formData.is_active
    };

    console.log('Final submission data:', submissionData);
    onSubmit(submissionData);
  };

  if (branchesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading branches...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Photo Upload */}
      <div className="md:col-span-2 flex justify-center">
        <PhotoUploadField
          value={formData.profile_photo}
          onChange={(photoUrl) => handleInputChange('profile_photo', photoUrl)}
          name="employee-profile-photo"
        />
      </div>

      {/* Basic Information */}
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
          required
          disabled={isLoading}
        />
      </div>

      {/* Role and Branch */}
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

      <div className="space-y-2">
        <Label htmlFor="branch">Branch</Label>
        <Select 
          value={formData.branch_id || ''} 
          onValueChange={(value) => handleInputChange('branch_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Branch</SelectItem>
            {accessibleBranches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.branch_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {accessibleBranches.length === 0 && !branchesLoading && (
          <p className="text-sm text-muted-foreground">
            No accessible branches found. Contact an administrator.
          </p>
        )}
      </div>

      {/* Location Information */}
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

      {/* Bank Information */}
      <div className="space-y-2">
        <Label htmlFor="account_holder_name">Account Holder Name</Label>
        <Input
          id="account_holder_name"
          value={formData.account_holder_name}
          onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
          placeholder="Enter account holder name"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account_number">Account Number</Label>
        <Input
          id="account_number"
          value={formData.account_number}
          onChange={(e) => handleInputChange('account_number', e.target.value)}
          placeholder="Enter account number"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank_name">Bank Name</Label>
        <Input
          id="bank_name"
          value={formData.bank_name}
          onChange={(e) => handleInputChange('bank_name', e.target.value)}
          placeholder="Enter bank name"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ifsc_code">IFSC Code</Label>
        <Input
          id="ifsc_code"
          value={formData.ifsc_code}
          onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
          placeholder="Enter IFSC code"
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="md:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeFormBase;
