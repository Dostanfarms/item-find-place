
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sidebar } from '@/components/sidebar/Sidebar';
import FarmerForm from '@/components/FarmerForm';
import { useFarmers, Farmer } from '@/hooks/useFarmers';
import { Search, Plus, User, Edit, Eye } from 'lucide-react';

const Farmers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | undefined>(undefined);
  
  const { farmers, loading, addFarmer, updateFarmer } = useFarmers();
  
  // Filter farmers based on search
  const filteredFarmers = farmers.filter(farmer => 
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    farmer.phone.includes(searchTerm)
  );
  
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
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground text-lg">Loading farmers...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Fixed Header */}
          <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Farmers Management</h1>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search farmers..."
                      className="pl-8 w-80"
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
          <div className="flex-1 p-6 overflow-auto">
            {filteredFarmers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] bg-white rounded-lg border">
                <User className="h-16 w-16 text-muted-foreground mb-6" />
                {searchTerm ? (
                  <>
                    <h3 className="text-xl font-medium mb-2">No farmers found</h3>
                    <p className="text-muted-foreground text-center">
                      No farmers match your search criteria. Try with a different name or phone number.
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
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[20%] font-semibold">Name</TableHead>
                          <TableHead className="w-[15%] font-semibold">Phone</TableHead>
                          <TableHead className="w-[20%] font-semibold">Email</TableHead>
                          <TableHead className="w-[20%] font-semibold">Bank Name</TableHead>
                          <TableHead className="w-[15%] font-semibold">Account Number</TableHead>
                          <TableHead className="w-[10%] font-semibold">Products</TableHead>
                          <TableHead className="text-right w-[15%] font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFarmers.map((farmer) => (
                          <TableRow key={farmer.id} className="hover:bg-gray-50 border-b">
                            <TableCell className="font-medium truncate" title={farmer.name}>
                              {farmer.name}
                            </TableCell>
                            <TableCell>{farmer.phone}</TableCell>
                            <TableCell className="truncate" title={farmer.email}>
                              {farmer.email}
                            </TableCell>
                            <TableCell className="truncate" title={farmer.bank_name || 'Not provided'}>
                              {farmer.bank_name || 'Not provided'}
                            </TableCell>
                            <TableCell className="truncate" title={farmer.account_number || 'Not provided'}>
                              {farmer.account_number || 'Not provided'}
                            </TableCell>
                            <TableCell>
                              {farmer.products?.length || 0}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/farmer/${farmer.id}`)}
                                  title="View Details"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditFarmer(farmer)}
                                  title="Edit Farmer"
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
      </div>
    </SidebarProvider>
  );
};

export default Farmers;
