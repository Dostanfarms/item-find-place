
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCoupons } from '@/hooks/useCoupons';
import { useToast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface CouponCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

const CouponCreateDialog: React.FC<CouponCreateDialogProps> = ({
  open,
  onClose
}) => {
  const { addCoupon } = useCoupons();
  const { toast } = useToast();
  const { branches } = useBranches();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [customerVerified, setCustomerVerified] = useState<{ name: string; mobile: string } | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_discount_limit: '',
    min_purchase_amount: '',
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    target_type: 'all' as 'all' | 'customer' | 'employee',
    target_user_id: '',
    branch_id: '',
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      max_discount_limit: '',
      min_purchase_amount: '',
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      target_type: 'all',
      target_user_id: '',
      branch_id: '',
      is_active: true
    });
    setCustomerVerified(null);
  };

  const verifyMobileNumber = async (mobile: string) => {
    if (!mobile || mobile.length !== 10) return;
    
    setVerifyingMobile(true);
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('name, mobile')
        .eq('mobile', mobile)
        .single();

      if (error || !customer) {
        setCustomerVerified(null);
        toast({
          title: "Customer not found",
          description: "No customer found with this mobile number",
          variant: "destructive"
        });
      } else {
        setCustomerVerified({ name: customer.name, mobile: customer.mobile });
        toast({
          title: "Customer verified",
          description: `Customer found: ${customer.name}`
        });
      }
    } catch (error) {
      console.error('Error verifying mobile:', error);
      setCustomerVerified(null);
    } finally {
      setVerifyingMobile(false);
    }
  };

  const handleMobileChange = (mobile: string) => {
    setFormData(prev => ({ ...prev, target_user_id: mobile }));
    setCustomerVerified(null);
    
    if (mobile.length === 10) {
      verifyMobileNumber(mobile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discount_value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate discount value
    const discountValue = parseFloat(formData.discount_value);
    if (isNaN(discountValue) || discountValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid discount value",
        variant: "destructive"
      });
      return;
    }

    // Validate percentage discount
    if (formData.discount_type === 'percentage' && discountValue > 100) {
      toast({
        title: "Error",
        description: "Percentage discount cannot exceed 100%",
        variant: "destructive"
      });
      return;
    }

    // Validate target user for customer type
    if (formData.target_type === 'customer' && (!formData.target_user_id || !customerVerified)) {
      toast({
        title: "Error",
        description: "Please verify the customer mobile number",
        variant: "destructive"
      });
      return;
    }

    // Validate target user ID if specific target type is selected
    if (formData.target_type !== 'all' && !formData.target_user_id) {
      toast({
        title: "Error",
        description: "Please specify the target user ID for specific coupon types",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: discountValue,
        max_discount_limit: formData.max_discount_limit ? parseFloat(formData.max_discount_limit) : null,
        min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : null,
        expiry_date: formData.expiry_date.toISOString(),
        target_type: formData.target_type,
        target_user_id: formData.target_user_id || null,
        branch_id: formData.branch_id || null,
        is_active: formData.is_active
      };

      const result = await addCoupon(couponData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Coupon created successfully",
        });
        resetForm();
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create coupon",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Filter branches based on user role
  const availableBranches = currentUser?.role?.toLowerCase() === 'admin' 
    ? branches 
    : branches.filter(branch => branch.id === currentUser?.branch_id);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="Enter coupon code (e.g., SAVE20)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_type">Discount Type *</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, discount_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">
                Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                step="0.01"
                min="0"
                max={formData.discount_type === 'percentage' ? "100" : undefined}
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_discount_limit">Max Discount Limit (₹)</Label>
              <Input
                id="max_discount_limit"
                type="number"
                step="0.01"
                min="0"
                value={formData.max_discount_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, max_discount_limit: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_purchase_amount">Min Purchase (₹)</Label>
              <Input
                id="min_purchase_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, min_purchase_amount: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expiry Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expiry_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expiry_date ? format(formData.expiry_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expiry_date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, expiry_date: date }))}
                  disabled={(date) => date < new Date(Date.now() - 24 * 60 * 60 * 1000)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch_id">Select Branch</Label>
            <Select
              value={formData.branch_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Branches</SelectItem>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_type">Target Type *</Label>
            <Select
              value={formData.target_type}
              onValueChange={(value: 'all' | 'customer' | 'employee') => {
                setFormData(prev => ({ 
                  ...prev, 
                  target_type: value,
                  target_user_id: value === 'all' ? '' : prev.target_user_id
                }));
                setCustomerVerified(null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="customer">Specific Customer</SelectItem>
                <SelectItem value="employee">Specific Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.target_type === 'customer' && (
            <div className="space-y-2">
              <Label htmlFor="target_user_id">Customer Mobile Number *</Label>
              <div className="relative">
                <Input
                  id="target_user_id"
                  value={formData.target_user_id}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  required
                />
                {verifyingMobile && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
                {formData.target_user_id.length === 10 && !verifyingMobile && (
                  <div className="absolute right-3 top-2.5">
                    {customerVerified ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              {customerVerified && (
                <div className="text-sm text-green-600">
                  ✓ Customer verified: {customerVerified.name}
                </div>
              )}
            </div>
          )}

          {formData.target_type === 'employee' && (
            <div className="space-y-2">
              <Label htmlFor="target_user_id">Employee Email *</Label>
              <Input
                id="target_user_id"
                value={formData.target_user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, target_user_id: e.target.value }))}
                placeholder="Enter employee email address"
                required
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CouponCreateDialog;
