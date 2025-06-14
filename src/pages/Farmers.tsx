
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import FarmerForm from '@/components/FarmerForm';
import { useFarmers, Farmer } from '@/hooks/useFarmers';
import { useFarmerProducts } from '@/hooks/useFarmerProducts';
import { Search, Plus, User, Edit, Eye } from 'lucide-react';

const Farmers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | undefined>(undefined);
  
  const { farmers, loading, addFarmer, updateFarmer } = useFarmers();
  const { products: allProducts } = useFarmerProducts();
  
  // Filter farmers based on search - now includes mobile number
  const filteredFarmers = farmers.filter(farmer => 
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    farmer.phone.includes(searchTerm) ||
    farmer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get product count for each farmer
  const getProductCount = (farmerId: string) => {
    return allProducts.filter(product => product.farmer_id === farmerId).length;
  };
  
  const handleAddFarmer = async (farmerData: Farmer) => {
    let result;
    
    if (selectedFarmer) {
      // Update existing farmer
      result = await updateFarmer(farmerData.id, farmerData);
    } else {
      // Add new farmer
      result = await addFarmer(farmerData);
    }
    
    if (result.success) {
      setIsDialogOpen(false);
      setSelectedFarmer(undefined);
    }
  };

  const handleEditFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-lg">Loading farmers...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Farmers Management</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  className="pl-8 w-full sm:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setSelectedFarmer(undefined);
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-agri-primary hover:bg-agri-secondary">
                    <Plus className="mr-2 h-4 w-4" /> Add Farmer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <FarmerForm 
                    onSubmit={handleAddFarmer} 
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setSelectedFarmer(undefined);
                    }}
                    editFarmer={selectedFarmer}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {filteredFarmers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] bg-white rounded-lg border">
            <User className="h-16 w-16 text-muted-foreground mb-6" />
            {searchTerm ? (
              <>
                <h3 className="text-xl font-medium mb-2">No farmers found</h3>
                <p className="text-muted-foreground text-center">
                  No farmers match your search criteria. Try with a different name, phone number, or email.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium mb-2">No farmers added yet</h3>
                <p className="text-muted-foreground text-center">
                  Get started by adding your first farmer using the "Add Farmer" button.
                </p>
              </>
            )}
          </div>
        ) : (
          <Card className="border shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">Registered Farmers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[120px] font-semibold">Name</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Phone</TableHead>
                      <TableHead className="min-w-[150px] font-semibold">Email</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Bank Name</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Account Number</TableHead>
                      <TableHead className="min-w-[80px] font-semibold">Products</TableHead>
                      <TableHead className="min-w-[100px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFarmers.map((farmer) => (
                      <TableRow key={farmer.id} className="hover:bg-gray-50 border-b">
                        <TableCell className="font-medium">
                          <div className="max-w-[120px] truncate" title={farmer.name}>
                            {farmer.name}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{farmer.phone}</TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={farmer.email}>
                            {farmer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[120px] truncate" title={farmer.bank_name || 'Not provided'}>
                            {farmer.bank_name || 'Not provided'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[100px] truncate" title={farmer.account_number || 'Not provided'}>
                            {farmer.account_number || 'Not provided'}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getProductCount(farmer.id)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/farmer/${farmer.id}`)}
                              title="View Details"
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditFarmer(farmer)}
                              title="Edit Farmer"
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Farmers;
