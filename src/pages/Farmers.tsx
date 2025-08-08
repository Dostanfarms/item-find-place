
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tractor, Search, Plus, Edit, Eye, Phone, MapPin } from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import FarmerForm from '@/components/FarmerForm';
import BranchFilter from '@/components/BranchFilter';
import FixedHeader from '@/components/layout/FixedHeader';
import ProfileChangeDialog from '@/components/profile/ProfileChangeDialog';

const Farmers = () => {
  const { farmers, loading, addFarmer, updateFarmer } = useFarmers();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any>(null);
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

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.phone.includes(searchTerm) ||
    (farmer.village && farmer.village.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddFarmer = () => {
    setEditingFarmer(null);
    setShowDialog(true);
  };

  const handleEditFarmer = (farmer: any) => {
    setEditingFarmer(farmer);
    setShowDialog(true);
  };

  const handleSubmit = async (farmerData: any) => {
    try {
      let result;
      if (editingFarmer) {
        result = await updateFarmer(editingFarmer.id, farmerData);
      } else {
        result = await addFarmer(farmerData);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Farmer ${editingFarmer ? 'updated' : 'added'} successfully`,
        });
        setShowDialog(false);
        setEditingFarmer(null);
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${editingFarmer ? 'update' : 'add'} farmer`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving farmer:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingFarmer ? 'update' : 'add'} farmer`,
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setEditingFarmer(null);
  };

  if (loading) {
    return (
      <div className="pt-20">
        <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading farmers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tractor className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Farmer Management</h1>
          </div>
          {hasPermission('farmers', 'create') && (
            <Button onClick={handleAddFarmer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Farmer
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <BranchFilter />
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Products Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFarmers.map((farmer) => (
                    <TableRow key={farmer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {farmer.profile_photo ? (
                            <img 
                              src={farmer.profile_photo} 
                              alt={farmer.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Tractor className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{farmer.name}</p>
                            <p className="text-sm text-gray-500">{farmer.email || 'No email'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {farmer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <div className="text-sm">
                            {[farmer.village, farmer.district, farmer.state]
                              .filter(Boolean)
                              .join(', ') || 'Not specified'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {farmer.products?.length || 0} products
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ₹{farmer.products?.reduce((sum: number, product: any) => 
                          sum + (product.quantity * product.price_per_unit), 0
                        ).toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={farmer.products?.some((p: any) => p.payment_status === 'unsettled') 
                            ? "destructive" : "default"}
                        >
                          {farmer.products?.some((p: any) => p.payment_status === 'unsettled')
                            ? 'Pending' : 'Settled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(farmer.date_joined), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/farmer-details/${farmer.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('farmers', 'edit') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFarmer(farmer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredFarmers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No farmers found matching your search criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {showDialog && (
          <FarmerForm
            open={showDialog}
            onClose={handleCancel}
            farmer={editingFarmer}
            onSubmit={handleSubmit}
          />
        )}

        <ProfileChangeDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          mode={profileMode}
        />
      </div>
    </div>
  );
};

export default Farmers;
