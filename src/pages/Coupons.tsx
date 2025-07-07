
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Search, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useCoupons } from '@/hooks/useCoupons';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import CouponEditDialog from '@/components/coupons/CouponEditDialog';
import CouponCreateDialog from '@/components/coupons/CouponCreateDialog';
import BranchFilter from '@/components/BranchFilter';
import { useAuth } from '@/context/AuthContext';
import FixedHeader from '@/components/layout/FixedHeader';
import ProfileChangeDialog from '@/components/profile/ProfileChangeDialog';

const Coupons = () => {
  const { coupons, loading, deleteCoupon } = useCoupons();
  const { toast } = useToast();
  const { hasPermission, currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileMode, setProfileMode] = useState<'photo' | 'password'>('photo');

  const handleChangePhoto = () => {
    setProfileMode('photo');
    setShowProfileDialog(true);
  };

  const handleChangePassword = () => {
    setProfileMode('password');
    setShowProfileDialog(true);
  };

  // Filter coupons by branch for non-admin users
  const branchFilteredCoupons = currentUser?.role?.toLowerCase() === 'admin' 
    ? coupons 
    : coupons.filter(coupon => 
        !coupon.branch_id || coupon.branch_id === currentUser?.branch_id
      );

  const getStatusColor = (isActive: boolean, expiryDate: string) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (new Date(expiryDate) <= new Date()) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, expiryDate: string) => {
    if (!isActive) return 'INACTIVE';
    if (new Date(expiryDate) <= new Date()) return 'EXPIRED';
    return 'ACTIVE';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-800';
      case 'fixed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'all':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCoupons = branchFilteredCoupons.filter(coupon => {
    if (searchTerm && !coupon.code.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (statusFilter !== 'all') {
      const isExpired = new Date(coupon.expiry_date) <= new Date();
      if (statusFilter === 'active' && (!coupon.is_active || isExpired)) return false;
      if (statusFilter === 'inactive' && coupon.is_active && !isExpired) return false;
      if (statusFilter === 'expired' && !isExpired) return false;
    }
    
    if (typeFilter !== 'all' && coupon.discount_type !== typeFilter) {
      return false;
    }
    
    return true;
  });

  const handleEdit = (coupon: any) => {
    setSelectedCoupon(coupon);
    setShowEditDialog(true);
  };

  const handleDelete = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      const result = await deleteCoupon(couponId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Coupon deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete coupon",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="pt-16">
        <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading coupons...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Coupon Management</h1>
          </div>
          {hasPermission('coupons', 'create') && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Coupon
            </Button>
          )}
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <CardTitle>Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <BranchFilter />
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by coupon code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Max Limit</TableHead>
                    <TableHead>Min Purchase</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">
                        {coupon.code}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(coupon.discount_type)}>
                          {coupon.discount_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}%` 
                          : `₹${coupon.discount_value}`
                        }
                      </TableCell>
                      <TableCell>
                        {coupon.max_discount_limit ? `₹${coupon.max_discount_limit}` : '-'}
                      </TableCell>
                      <TableCell>
                        {(coupon as any).min_purchase_amount ? `₹${(coupon as any).min_purchase_amount}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTargetColor(coupon.target_type)}>
                          {coupon.target_type.toUpperCase()}
                        </Badge>
                        {coupon.target_user_id && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {coupon.target_user_id}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(coupon.expiry_date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(coupon.is_active, coupon.expiry_date)}>
                          {getStatusText(coupon.is_active, coupon.expiry_date)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {hasPermission('coupons', 'edit') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('coupons', 'delete') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(coupon.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCoupons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No coupons found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>

        <CouponCreateDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />

        <CouponEditDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          coupon={selectedCoupon}
        />

        <ProfileChangeDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          mode={profileMode}
        />
      </div>
    </div>
  );
};

export default Coupons;
