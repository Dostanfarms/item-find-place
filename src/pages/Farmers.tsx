
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Users, Eye, Edit } from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { format } from 'date-fns';
import FarmerForm from '@/components/FarmerForm';
import BranchFilter from '@/components/BranchFilter';
import { useAuth } from '@/context/AuthContext';

const Farmers = () => {
  const { farmers, loading, fetchFarmers } = useFarmers();
  const { currentUser, selectedBranch } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleEditFarmer = (farmer: any) => {
    setSelectedFarmer(farmer);
    setShowForm(true);
  };

  const handleCreateFarmer = () => {
    setSelectedFarmer(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedFarmer(null);
    fetchFarmers();
  };

  // Apply branch filtering
  const filteredFarmers = farmers.filter(farmer => {
    // Branch filter for admin users
    if (currentUser?.role?.toLowerCase() === 'admin' && selectedBranch) {
      if (farmer.branch_id !== selectedBranch) return false;
    }
    
    // Search filter
    if (searchTerm && 
        !farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !farmer.phone.includes(searchTerm)) {
      return false;
    }
    
    // State filter
    if (stateFilter !== 'all' && farmer.state !== stateFilter) {
      return false;
    }
    
    return true;
  });

  // Get unique states for filter
  const uniqueStates = [...new Set(farmers.map(farmer => farmer.state).filter(Boolean))];

  if (showForm) {
    return (
      <FarmerForm
        farmer={selectedFarmer}
        onClose={handleCloseForm}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading farmers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Farmer Management</h1>
        </div>
        <Button onClick={handleCreateFarmer}>
          <Plus className="mr-2 h-4 w-4" />
          Add Farmer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farmers ({filteredFarmers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <BranchFilter />
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers.map((farmer) => (
                  <TableRow key={farmer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {farmer.profile_photo && (
                          <img 
                            src={farmer.profile_photo} 
                            alt={farmer.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{farmer.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {farmer.id.slice(-8)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{farmer.email}</TableCell>
                    <TableCell>{farmer.phone}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {farmer.village && <div>{farmer.village}</div>}
                        {farmer.district && <div>{farmer.district}</div>}
                        {farmer.state && <div>{farmer.state}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {farmer.bank_name ? (
                        <div className="text-sm">
                          <div>{farmer.bank_name}</div>
                          <div className="text-muted-foreground">
                            {farmer.account_number && `****${farmer.account_number.slice(-4)}`}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">Not provided</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(farmer.date_joined), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditFarmer(farmer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFarmers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No farmers found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Farmers;
