import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Use database types directly to avoid type mismatches
type DatabaseCoupon = Database['public']['Tables']['coupons']['Row'];
type DatabaseCouponInsert = Database['public']['Tables']['coupons']['Insert'];

interface Coupon {
  id?: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_discount_limit?: number;
  expiry_date: string;
  is_active: boolean;
  target_type: 'all' | 'customer' | 'employee';
  target_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

const Coupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      console.log('Fetching coupons from Supabase...');
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        toast({
          title: "Error loading coupons",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Coupons fetched successfully:', data);
      
      // Transform database data to match our interface
      const transformedCoupons: Coupon[] = (data || []).map((dbCoupon: DatabaseCoupon) => ({
        id: dbCoupon.id,
        code: dbCoupon.code,
        discount_type: dbCoupon.discount_type as 'percentage' | 'flat',
        discount_value: Number(dbCoupon.discount_value),
        max_discount_limit: dbCoupon.max_discount_limit ? Number(dbCoupon.max_discount_limit) : undefined,
        expiry_date: dbCoupon.expiry_date,
        is_active: dbCoupon.is_active,
        target_type: dbCoupon.target_type as 'all' | 'customer' | 'employee',
        target_user_id: dbCoupon.target_user_id || undefined,
        created_at: dbCoupon.created_at,
        updated_at: dbCoupon.updated_at,
      }));
      
      setCoupons(transformedCoupons);
    } catch (error) {
      console.error('Error in fetchCoupons:', error);
      toast({
        title: "Error loading coupons",
        description: "Failed to load coupons from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCouponId, setEditCouponId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [maxDiscountLimit, setMaxDiscountLimit] = useState<number | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [targetType, setTargetType] = useState<'all' | 'customer' | 'employee'>('all');
  const [targetUserId, setTargetUserId] = useState('');
  
  const resetForm = () => {
    setCouponCode('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setMaxDiscountLimit(undefined);
    setExpiryDate(undefined);
    setTargetType('all');
    setTargetUserId('');
    setIsEditMode(false);
    setEditCouponId(null);
  };
  
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (coupon: Coupon) => {
    setCouponCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value);
    setMaxDiscountLimit(coupon.max_discount_limit || undefined);
    setExpiryDate(new Date(coupon.expiry_date));
    setTargetType(coupon.target_type);
    setTargetUserId(coupon.target_user_id || '');
    setIsEditMode(true);
    setEditCouponId(coupon.id || null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (couponId: string) => {
    try {
      console.log('Deleting coupon:', couponId);
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) {
        console.error('Error deleting coupon:', error);
        toast({
          title: "Error deleting coupon",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Coupon deleted successfully');
      toast({
        title: "Coupon deleted",
        description: "The coupon has been successfully removed.",
      });
      
      // Refresh the list
      await fetchCoupons();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "Error deleting coupon",
        description: "Failed to delete coupon",
        variant: "destructive"
      });
    }
  };
  
  const validateForm = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Missing coupon code",
        description: "Please enter a coupon code.",
        variant: "destructive"
      });
      return false;
    }
    
    if (discountValue <= 0) {
      toast({
        title: "Invalid discount value",
        description: "Discount value must be greater than zero.",
        variant: "destructive"
      });
      return false;
    }
    
    if (discountType === 'percentage' && discountValue > 100) {
      toast({
        title: "Invalid percentage",
        description: "Percentage discount cannot exceed 100%.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!expiryDate) {
      toast({
        title: "Missing expiry date",
        description: "Please select an expiry date.",
        variant: "destructive"
      });
      return false;
    }
    
    if ((targetType === 'customer' || targetType === 'employee') && !targetUserId.trim()) {
      toast({
        title: "Missing target user",
        description: "Please enter a target user ID for user-specific coupons.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      const couponData: DatabaseCouponInsert = {
        code: couponCode,
        discount_type: discountType,
        discount_value: discountValue,
        max_discount_limit: discountType === 'percentage' ? maxDiscountLimit : null,
        expiry_date: expiryDate!.toISOString(),
        target_type: targetType,
        target_user_id: (targetType === 'customer' || targetType === 'employee') ? targetUserId : null,
        is_active: true
      };

      if (isEditMode && editCouponId) {
        console.log('Updating coupon:', editCouponId, couponData);
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editCouponId);

        if (error) {
          console.error('Error updating coupon:', error);
          toast({
            title: "Error updating coupon",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Coupon updated",
          description: "The coupon has been successfully updated.",
        });
      } else {
        console.log('Creating new coupon:', couponData);
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);

        if (error) {
          console.error('Error creating coupon:', error);
          if (error.code === '23505') {
            toast({
              title: "Duplicate coupon code",
              description: "This coupon code already exists. Please use a different code.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Error creating coupon",
              description: error.message,
              variant: "destructive"
            });
          }
          return;
        }

        toast({
          title: "Coupon created",
          description: "New coupon has been successfully created.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      await fetchCoupons();
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error saving coupon",
        description: "Failed to save coupon",
        variant: "destructive"
      });
    }
  };

  const getTargetTypeLabel = (coupon: Coupon) => {
    switch (coupon.target_type) {
      case 'customer':
        return `Customer: ${coupon.target_user_id}`;
      case 'employee':
        return `Employee: ${coupon.target_user_id}`;
      default:
        return 'All Users';
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading coupons...</div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Coupon Management</h1>
            <Button onClick={openAddDialog} className="bg-agri-primary hover:bg-agri-secondary">
              <Plus className="h-4 w-4 mr-2" /> Create Coupon
            </Button>
          </div>
          
          {coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 bg-muted rounded-lg">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No coupons available</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create coupons to offer discounts to your customers.
              </p>
              <Button onClick={openAddDialog} className="bg-agri-primary hover:bg-agri-secondary">
                <Plus className="h-4 w-4 mr-2" /> Create First Coupon
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Discount Type</TableHead>
                    <TableHead>Discount Value</TableHead>
                    <TableHead>Max Limit</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell className="capitalize">
                        {coupon.discount_type}
                      </TableCell>
                      <TableCell>
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `₹${coupon.discount_value}`}
                      </TableCell>
                      <TableCell>
                        {coupon.max_discount_limit ? `₹${coupon.max_discount_limit}` : '-'}
                      </TableCell>
                      <TableCell>
                        {getTargetTypeLabel(coupon)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(coupon.expiry_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        {new Date(coupon.expiry_date) > new Date() && coupon.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {new Date(coupon.expiry_date) <= new Date() ? 'Expired' : 'Inactive'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coupon.id!)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? 'Update the coupon details below.'
                    : 'Fill in the coupon details to create a new discount coupon.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="couponCode" className="text-right">
                    Coupon Code
                  </Label>
                  <Input
                    id="couponCode"
                    placeholder="e.g., SUMMER10"
                    className="col-span-3"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discountType" className="text-right">
                    Discount Type
                  </Label>
                  <Select
                    value={discountType}
                    onValueChange={(value: any) => setDiscountType(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discountValue" className="text-right">
                    Discount Value
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 500'}
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                    />
                    <span className="ml-2">{discountType === 'percentage' ? '%' : '₹'}</span>
                  </div>
                </div>
                
                {discountType === 'percentage' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maxDiscountLimit" className="text-right">
                      Max Discount Limit
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Input
                        id="maxDiscountLimit"
                        type="number"
                        min="0"
                        placeholder="e.g., 1000"
                        value={maxDiscountLimit || ''}
                        onChange={(e) => setMaxDiscountLimit(Number(e.target.value) || undefined)}
                      />
                      <span className="ml-2">₹</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetType" className="text-right">
                    Target Type
                  </Label>
                  <Select
                    value={targetType}
                    onValueChange={(value: any) => setTargetType(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="customer">Specific Customer</SelectItem>
                      <SelectItem value="employee">Specific Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(targetType === 'customer' || targetType === 'employee') && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="targetUserId" className="text-right">
                      {targetType === 'customer' ? 'Customer ID' : 'Employee ID'}
                    </Label>
                    <Input
                      id="targetUserId"
                      placeholder={`Enter ${targetType} ID`}
                      className="col-span-3"
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiryDate" className="text-right">
                    Expiry Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="expiryDate"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={expiryDate}
                          onSelect={setExpiryDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-agri-primary hover:bg-agri-secondary">
                  {isEditMode ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Coupons;
