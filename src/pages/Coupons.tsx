
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Gift, Calendar, Percent } from 'lucide-react';
import { useCoupons } from '@/hooks/useCoupons';

const Coupons = () => {
  const { toast } = useToast();
  const { coupons, loading, addCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    expiry_date: '',
    is_active: true,
    max_discount_limit: '',
    target_type: 'all',
    target_user_id: ''
  });

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: formData.code,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      expiry_date: formData.expiry_date,
      is_active: formData.is_active,
      max_discount_limit: formData.max_discount_limit ? Number(formData.max_discount_limit) : null,
      target_type: formData.target_type,
      target_user_id: formData.target_user_id || null
    };

    let result;
    if (editingCoupon) {
      result = await updateCoupon(editingCoupon.id, couponData);
    } else {
      result = await addCoupon(couponData);
    }

    if (result?.success) {
      toast({
        title: editingCoupon ? "Coupon updated" : "Coupon created",
        description: `Coupon ${couponData.code} has been ${editingCoupon ? 'updated' : 'created'} successfully.`
      });
      handleCloseDialog();
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : '',
      is_active: coupon.is_active,
      max_discount_limit: coupon.max_discount_limit?.toString() || '',
      target_type: coupon.target_type,
      target_user_id: coupon.target_user_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      expiry_date: '',
      is_active: true,
      max_discount_limit: '',
      target_type: 'all',
      target_user_id: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      const result = await deleteCoupon(id);
      if (result?.success) {
        toast({
          title: "Coupon deleted",
          description: "Coupon has been deleted successfully."
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex-none flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Coupons Management</h1>
          <p className="text-muted-foreground">Manage discount coupons and promotions</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-agri-primary hover:bg-agri-secondary">
                <Plus className="mr-2 h-4 w-4" /> Add Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="SAVE20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_type">Discount Type</Label>
                    <select
                      id="discount_type"
                      className="w-full p-2 border rounded-md"
                      value={formData.discount_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount_value">
                      Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                      placeholder="20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_discount_limit">Max Discount Amount (₹)</Label>
                    <Input
                      id="max_discount_limit"
                      type="number"
                      value={formData.max_discount_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_discount_limit: e.target.value }))}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_type">Target Type</Label>
                    <select
                      id="target_type"
                      className="w-full p-2 border rounded-md"
                      value={formData.target_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_type: e.target.value }))}
                    >
                      <option value="all">All Users</option>
                      <option value="customer">Customer</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="target_user_id">Target User ID (Optional)</Label>
                    <Input
                      id="target_user_id"
                      value={formData.target_user_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_user_id: e.target.value }))}
                      placeholder="User ID"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCoupon ? 'Update' : 'Create'} Coupon
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Gift className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No coupons found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'No coupons match your search criteria.' : 'Get started by creating your first coupon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoupons.map((coupon) => (
              <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-primary">
                      {coupon.code}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Badge variant={coupon.is_active ? "default" : "secondary"}>
                        {coupon.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Percent className="h-4 w-4 text-green-600" />
                    <span>
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}% off`
                        : `₹${coupon.discount_value} off`
                      }
                    </span>
                  </div>

                  {coupon.max_discount_limit && (
                    <div className="text-sm text-muted-foreground">
                      Max discount: ₹{coupon.max_discount_limit}
                    </div>
                  )}

                  {coupon.expiry_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Expires: {new Date(coupon.expiry_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(coupon)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
