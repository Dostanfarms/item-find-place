import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Ticket, TrendingUp, Calendar } from 'lucide-react';
import { useCoupons } from '@/hooks/useCoupons';
import { useBranches } from '@/hooks/useBranches';
import BranchFilter from '@/components/BranchFilter';
import { format, isAfter } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Coupons = () => {
  const { coupons, loading, addCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const { branches } = useBranches();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  // Filter coupons based on search term and branch
  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           coupon.discount_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = !selectedBranch || coupon.branch_id === selectedBranch;

      // Also search by branch name if search term is provided
      const matchesBranchName = !searchTerm || (coupon.branch_id && branches.some(branch => 
        branch.id === coupon.branch_id && 
        (branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         branch.branch_owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
      ));

      return matchesSearch && matchesBranch && matchesBranchName;
    });
  }, [coupons, searchTerm, selectedBranch, branches]);

  const getActiveCoupons = () => {
    return filteredCoupons.filter(coupon => 
      coupon.is_active && isAfter(new Date(coupon.expiry_date), new Date())
    ).length;
  };

  const getExpiredCoupons = () => {
    return filteredCoupons.filter(coupon => 
      !isAfter(new Date(coupon.expiry_date), new Date())
    ).length;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      await deleteCoupon(id);
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
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button 
          className="bg-agri-primary hover:bg-agri-secondary"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      {/* Branch Filter */}
      <div className="flex-none mb-6">
        <BranchFilter
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by coupon code, type, branch name or owner..."
        />
      </div>

      {/* Stats Cards */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCoupons.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedBranch ? 'In selected branch' : 'All coupons'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveCoupons()}</div>
            <p className="text-xs text-green-600">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Coupons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getExpiredCoupons()}</div>
            <p className="text-xs text-red-600">Past expiry</p>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <div className="flex-1 overflow-auto">
        {filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No coupons found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedBranch ? 
                'No coupons match your search criteria.' : 
                'Get started by creating your first coupon.'}
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Code</th>
                      <th className="text-left p-4 font-medium">Discount</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Branch</th>
                      <th className="text-left p-4 font-medium">Expiry</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.map((coupon) => {
                      const branch = branches.find(b => b.id === coupon.branch_id);
                      const isExpired = !isAfter(new Date(coupon.expiry_date), new Date());
                      
                      return (
                        <tr key={coupon.id} className="border-b hover:bg-muted/25">
                          <td className="p-4">
                            <div className="font-medium font-mono">{coupon.code}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {coupon.discount_type === 'percentage' 
                                ? `${coupon.discount_value}%` 
                                : `₹${coupon.discount_value}`}
                            </div>
                            {coupon.max_discount_limit && (
                              <div className="text-sm text-muted-foreground">
                                Max: ₹{coupon.max_discount_limit}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {branch ? (
                                <>
                                  <div className="font-medium">{branch.branch_name}</div>
                                  <div className="text-muted-foreground">{branch.branch_owner_name}</div>
                                </>
                              ) : (
                                <span className="text-muted-foreground">All Branches</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {format(new Date(coupon.expiry_date), 'MMM dd, yyyy')}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant={coupon.is_active && !isExpired ? "default" : "secondary"}
                              className={coupon.is_active && !isExpired ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {isExpired ? "Expired" : coupon.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingCoupon(coupon)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(coupon.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
            <DialogDescription>
              Create a new discount coupon for your customers.
            </DialogDescription>
          </DialogHeader>
          {/* Add coupon form here */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupons;
