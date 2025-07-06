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
import { Search, Plus, User, Edit, Eye, FileDown } from 'lucide-react';
import ProtectedAction from '@/components/ProtectedAction';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
const Farmers = () => {
  const navigate = useNavigate();
  const {
    hasPermission
  } = useAuth();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const {
    farmers,
    loading,
    addFarmer,
    updateFarmer
  } = useFarmers();
  const {
    farmerProducts: allProducts
  } = useFarmerProducts();

  // Filter farmers based on search - now includes mobile number
  const filteredFarmers = farmers.filter(farmer => farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) || farmer.phone.includes(searchTerm) || farmer.email.toLowerCase().includes(searchTerm.toLowerCase()));

  // Get product count for each farmer
  const getProductCount = (farmerId: string) => {
    return allProducts.filter(product => product.farmer_id === farmerId).length;
  };
  const exportToCSV = () => {
    if (!hasPermission('farmers', 'view')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to export farmers",
        variant: "destructive"
      });
      return;
    }
    setIsExporting(true);
    try {
      // Prepare CSV headers
      const headers = ['Farmer ID', 'Name', 'Phone', 'Email', 'Address', 'State', 'District', 'Village', 'Bank Name', 'Account Number', 'IFSC Code', 'Products Count', 'Date Joined', 'Status'];

      // Prepare CSV data
      const csvData = filteredFarmers.map(farmer => {
        const productCount = getProductCount(farmer.id);
        return [farmer.id, farmer.name, farmer.phone, farmer.email, farmer.address || 'Not provided', farmer.state || 'Not provided', farmer.district || 'Not provided', farmer.village || 'Not provided', farmer.bank_name || 'Not provided', farmer.account_number || 'Not provided', farmer.ifsc_code || 'Not provided', productCount.toString(), format(new Date(farmer.date_joined), 'yyyy-MM-dd HH:mm:ss'), 'Active' // Could be enhanced with actual status field
        ];
      });

      // Create CSV content
      const csvContent = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      // Generate filename with timestamp
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const filename = `farmers_export_${timestamp}.csv`;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Export Successful",
        description: `Exported ${filteredFarmers.length} farmers to ${filename}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export farmers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  const handleAddFarmer = async (farmerData: Farmer) => {
    let result;
    if (selectedFarmer) {
      // Update existing farmer
      if (!hasPermission('farmers', 'edit')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to edit farmers",
          variant: "destructive"
        });
        return;
      }
      result = await updateFarmer(farmerData.id, farmerData);
    } else {
      // Add new farmer
      if (!hasPermission('farmers', 'create')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to create farmers",
          variant: "destructive"
        });
        return;
      }
      result = await addFarmer(farmerData);
    }
    if (result.success) {
      setIsDialogOpen(false);
      setSelectedFarmer(undefined);
    }
  };
  const handleEditFarmer = (farmer: Farmer) => {
    if (!hasPermission('farmers', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit farmers",
        variant: "destructive"
      });
      return;
    }
    setSelectedFarmer(farmer);
    setIsDialogOpen(true);
  };
  const handleViewFarmer = (farmer: Farmer) => {
    if (!hasPermission('farmers', 'view')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view farmer details",
        variant: "destructive"
      });
      return;
    }
    navigate(`/farmer/${farmer.id}`);
  };
  const handleCreateFarmer = () => {
    if (!hasPermission('farmers', 'create')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create farmers",
        variant: "destructive"
      });
      return;
    }
    setIsDialogOpen(true);
  };

  // Check if user has permission to view farmers
  if (!hasPermission('farmers', 'view')) {
    return <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view farmers.</p>
        </div>
      </div>;
  }
  if (loading) {
    return <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-lg">Loading farmers...</div>
      </div>;
  }
  return <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Farmers Management</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, phone, or email..." className="pl-8 w-full sm:w-80" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <ProtectedAction resource="farmers" action="view">
                <Button onClick={exportToCSV} disabled={isExporting || filteredFarmers.length === 0} className="bg-cyan-600 hover:bg-cyan-500">
                  <FileDown className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : `Export (${filteredFarmers.length})`}
                </Button>
              </ProtectedAction>
              <Dialog open={isDialogOpen} onOpenChange={open => {
              if (!open) {
                setIsDialogOpen(false);
                setSelectedFarmer(undefined);
              }
            }}>
                <DialogTrigger asChild>
                  <ProtectedAction resource="farmers" action="create">
                    <Button className="bg-agri-primary hover:bg-agri-secondary" onClick={handleCreateFarmer}>
                      <Plus className="mr-2 h-4 w-4" /> Add Farmer
                    </Button>
                  </ProtectedAction>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <FarmerForm onSubmit={handleAddFarmer} onCancel={() => {
                  setIsDialogOpen(false);
                  setSelectedFarmer(undefined);
                }} editFarmer={selectedFarmer} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {filteredFarmers.length === 0 ? <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] bg-white rounded-lg border">
            <User className="h-16 w-16 text-muted-foreground mb-6" />
            {searchTerm ? <>
                <h3 className="text-xl font-medium mb-2">No farmers found</h3>
                <p className="text-muted-foreground text-center">
                  No farmers match your search criteria. Try with a different name, phone number, or email.
                </p>
              </> : <>
                <h3 className="text-xl font-medium mb-2">No farmers added yet</h3>
                <p className="text-muted-foreground text-center">
                  Get started by adding your first farmer using the "Add Farmer" button.
                </p>
              </>}
          </div> : <Card className="border shadow-sm">
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
                    {filteredFarmers.map(farmer => <TableRow key={farmer.id} className="hover:bg-gray-50 border-b">
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
                            <ProtectedAction resource="farmers" action="view">
                              <Button variant="outline" size="sm" onClick={() => handleViewFarmer(farmer)} title="View Details" className="h-7 w-7 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </ProtectedAction>
                            <ProtectedAction resource="farmers" action="edit">
                              <Button variant="outline" size="sm" onClick={() => handleEditFarmer(farmer)} title="Edit Farmer" className="h-7 w-7 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </ProtectedAction>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
};
export default Farmers;