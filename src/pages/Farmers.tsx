
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, UserCheck, MapPin } from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useBranches } from '@/hooks/useBranches';
import FarmerForm from '@/components/FarmerForm';
import BranchFilter from '@/components/BranchFilter';
import { format } from 'date-fns';

const Farmers = () => {
  const { farmers, loading, deleteFarmer } = useFarmers();
  const { branches } = useBranches();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any>(null);

  // Filter farmers based on search term and branch
  const filteredFarmers = useMemo(() => {
    return farmers.filter(farmer => {
      const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farmer.phone.includes(searchTerm) ||
                           (farmer.village && farmer.village.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesBranch = !selectedBranch || farmer.branch_id === selectedBranch;

      // Also search by branch name if search term is provided
      const matchesBranchName = !searchTerm || (farmer.branch_id && branches.some(branch => 
        branch.id === farmer.branch_id && 
        (branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         branch.branch_owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
      ));

      return matchesSearch && matchesBranch && matchesBranchName;
    });
  }, [farmers, searchTerm, selectedBranch, branches]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this farmer?')) {
      await deleteFarmer(id);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading farmers...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex-none flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Farmer Management</h1>
          <p className="text-muted-foreground">Manage farmer accounts and information</p>
        </div>
        <Button 
          className="bg-agri-primary hover:bg-agri-secondary"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Farmer
        </Button>
      </div>

      {/* Branch Filter */}
      <div className="flex-none mb-6">
        <BranchFilter
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by name, email, phone, village, branch name or owner..."
        />
      </div>

      {/* Stats Cards */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredFarmers.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedBranch ? 'In selected branch' : 'All farmers'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredFarmers.filter(f => 
                new Date(f.date_joined).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <p className="text-xs text-green-600">New joiners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredFarmers.map(f => f.district).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique districts</p>
          </CardContent>
        </Card>
      </div>

      {/* Farmers Table */}
      <div className="flex-1 overflow-auto">
        {filteredFarmers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No farmers found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedBranch ? 
                'No farmers match your search criteria.' : 
                'Get started by adding your first farmer.'}
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Farmer</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Location</th>
                      <th className="text-left p-4 font-medium">Branch</th>
                      <th className="text-left p-4 font-medium">Bank Details</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFarmers.map((farmer) => {
                      const branch = branches.find(b => b.id === farmer.branch_id);
                      
                      return (
                        <tr key={farmer.id} className="border-b hover:bg-muted/25">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {farmer.profile_photo ? (
                                <img 
                                  src={farmer.profile_photo} 
                                  alt={farmer.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{farmer.name}</div>
                                <div className="text-sm text-muted-foreground">{farmer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="font-medium">{farmer.phone}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {farmer.village && <div className="font-medium">{farmer.village}</div>}
                              <div className="text-muted-foreground">
                                {farmer.district && farmer.state ? 
                                  `${farmer.district}, ${farmer.state}` : 
                                  "Location not specified"}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {branch ? (
                                <>
                                  <div className="font-medium">{branch.branch_name}</div>
                                  <div className="text-muted-foreground">{branch.branch_owner_name}</div>
                                </>
                              ) : (
                                <span className="text-muted-foreground">No Branch</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {farmer.bank_name ? (
                                <>
                                  <div className="font-medium">{farmer.bank_name}</div>
                                  <div className="text-muted-foreground">
                                    {farmer.account_number ? `****${farmer.account_number.slice(-4)}` : 'No account'}
                                  </div>
                                </>
                              ) : (
                                <span className="text-muted-foreground">No bank details</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {format(new Date(farmer.date_joined), 'MMM dd, yyyy')}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingFarmer(farmer)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(farmer.id)}
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

      {/* Add/Edit Farmer Dialogs */}
      {isAddDialogOpen && (
        <FarmerForm
          onClose={() => setIsAddDialogOpen(false)}
        />
      )}

      {editingFarmer && (
        <FarmerForm
          onClose={() => setEditingFarmer(null)}
          farmer={editingFarmer}
        />
      )}
    </div>
  );
};

export default Farmers;
