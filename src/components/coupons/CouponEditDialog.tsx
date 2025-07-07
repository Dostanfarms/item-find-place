
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCoupons } from '@/hooks/useCoupons';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CouponEditDialogProps {
  open: boolean;
  onClose: () => void;
  coupon: any;
}

const CouponEditDialog: React.FC<CouponEditDialogProps> = ({
  open,
  onClose,
  coupon
}) => {
  const { updateCoupon } = useCoupons();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_discount_limit: '',
    expiry_date: new Date(),
    target_type: 'all' as 'all' | 'customer' | 'employee',
    target_user_id: '',
    is_active: true
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        discount_type: coupon.discount_type || 'percentage',
        discount_value: coupon.discount_value?.toString() || '',
        max_discount_limit: coupon.max_discount_limit?.toString() || '',
        expiry_date: new Date(coupon.expiry_date),
        target_type: coupon.target_type || 'all',
        target_user_id: coupon.target_user_id || '',
        is_active: coupon.is_active ?? true
      });
    }
  }, [coupon]);

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

    setLoading(true);

    try {
      const updateData = {
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        max_discount_limit: formData.max_discount_limit ? parseFloat(formData.max_discount_limit) : null,
        expiry_date: formData.expiry_date.toISOString(),
        target_type: formData.target_type,
        target_user_id: formData.target_user_id || null,
        is_active: formData.is_active
      };

      const result = await updateCoupon(coupon.id, updateData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Coupon updated successfully",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update coupon",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Enter coupon code"
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
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">Discount Value *</Label>
              <Input
                id="discount_value"
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_discount_limit">Max Discount Limit (₹)</Label>
            <Input
              id="max_discount_limit"
              type="number"
              value={formData.max_discount_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, max_discount_limit: e.target.value }))}
              placeholder="Optional"
            />
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
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_type">Target Type</Label>
            <Select
              value={formData.target_type}
              onValueChange={(value: 'all' | 'customer' | 'employee') => setFormData(prev => ({ ...prev, target_type: value }))}
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

          {formData.target_type !== 'all' && (
            <div className="space-y-2">
              <Label htmlFor="target_user_id">Target User ID</Label>
              <Input
                id="target_user_id"
                value={formData.target_user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, target_user_id: e.target.value }))}
                placeholder="Enter user ID"
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CouponEditDialog;
