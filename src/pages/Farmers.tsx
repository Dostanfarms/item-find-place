
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useFarmers } from '@/hooks/useFarmers';
import { Search, Plus, Users, Eye, Edit2, Trash2, Menu } from 'lucide-react';
import FarmerForm from '@/components/FarmerForm';
import { useToast } from '@/hooks/use-toast';
import ProtectedAction from '@/components/ProtectedAction';
import BranchFilter from '@/components/BranchFilter';
import { format } from 'date-fns';
import FixedHeader from '@/components/layout/FixedHeader';

const Farmers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  
  const { currentUser } = useAuth();
  const { farmers, loading, addFarmer, updateFarmer, deleteFarmer } = useFarmers();
  const { toast } = useToast();
  
  const itemsPerPage = 10;

  // Filter farmers based on search query and branch filter
  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = 
      farmer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.district?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranchFilter === 'all' || farmer.branch_id === selectedBranchFilter;

    return matchesSearch && matchesBranch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFarmers = filteredFarmers.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateFarmer = async (farmerData: any) => {
    const result = await addFarmer(farmerData);
    if (result.success) {
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Farmer created successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create farmer",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFarmer = async (farmerData: any) => {
    if (!selectedFarmer) return;
    
    const result = await updateFarmer(selectedFarmer.id, farmerData);
    if (result.success) {
      setIsEditDialogOpen(false);
      setSelectedFarmer(null);
      toast({
        title: "Success",
        description: "Farmer updated successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update farmer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFarmer = async (farmerId: string) => {
    if (!confirm('Are you sure you want to delete this farmer? This action cannot be undone.')) {
      return;
    }

    const result = await deleteFarmer(farmerId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Farmer deleted successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete farmer",
        variant: "destructive",
      });
    }
  };

  const handleChangePhoto = () => {
    console.log('Change photo clicked');
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
  };

  return (
    <div className="flex-1 flex flex-col">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="flex-1 p-6 pt-20">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Farmers</h1>
            <p className="text-muted-foreground">Manage farmer accounts and information</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredFarmers.length}</div>
              <p className="text-xs text-muted-foreground">
                Active farmer accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Badge variant="outline" className="h-4 w-4 text-muted-foreground">0</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Farmers awaiting verification
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {farmers.filter(f => {
                  const joinDate = new Date(f.date_joined);
                  const now = new Date();
                  return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                New farmers this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search farmers by name, phone, email, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <BranchFilter
            selectedBranch={selectedBranchFilter}
            onBranchChange={setSelectedBranchFilter}
          />

          <ProtectedAction resource="farmers" action="create">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Farmer
            </Button>
          </ProtectedAction>
        </div>

        {/* Farmers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Farmers Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading farmers...</div>
            ) : filteredFarmers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No farmers found matching your search criteria.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedFarmers.map((farmer) => (
                        <TableRow key={farmer.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{farmer.name}</div>
                              {farmer.email && (
                                <div className="text-sm text-muted-foreground">{farmer.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{farmer.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {farmer.village && <div>{farmer.village}</div>}
                              {farmer.district && <div className="text-muted-foreground">{farmer.district}, {farmer.state}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {farmer.date_joined ? format(new Date(farmer.date_joined), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <ProtectedAction resource="farmers" action="edit">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedFarmer(farmer);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </ProtectedAction>
                              <ProtectedAction resource="farmers" action="delete">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteFarmer(farmer.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </ProtectedAction>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFarmers.length)} of {filteredFarmers.length} farmers
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Farmer Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Farmer</DialogTitle>
            </DialogHeader>
            <FarmerForm
              onSubmit={handleCreateFarmer}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Farmer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Farmer</DialogTitle>
            </DialogHeader>
            <FarmerForm
              farmer={selectedFarmer}
              onSubmit={handleUpdateFarmer}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedFarmer(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Farmers;
