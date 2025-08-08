
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useFarmers } from '@/hooks/useFarmers';
import { Search, Plus, Users, UserCheck, UserPlus, Menu, Phone, Mail, MapPin } from 'lucide-react';
import FarmerForm from '@/components/FarmerForm';
import ProtectedAction from '@/components/ProtectedAction';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import FixedHeader from '@/components/layout/FixedHeader';

const Farmers = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { farmers, loading, addFarmer, updateFarmer, deleteFarmer } = useFarmers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.phone.includes(searchTerm) ||
    (farmer.village && farmer.village.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddFarmer = async (farmerData: any) => {
    const result = await addFarmer(farmerData);
    if (result.success) {
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateFarmer = async (farmerData: any) => {
    if (editingFarmer) {
      const result = await updateFarmer(editingFarmer.id, farmerData);
      if (result.success) {
        setEditingFarmer(null);
      }
    }
  };

  const handleDeleteFarmer = async (id: string) => {
    if (!hasPermission('farmers', 'delete')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete farmers",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this farmer?')) {
      await deleteFarmer(id);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading farmers...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <FixedHeader />
      <div className="flex-1 p-6 pt-20"> {/* Added pt-20 for header space */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div>
              <h1 className="text-3xl font-bold">Farmers</h1>
              <p className="text-muted-foreground">Manage your farmer network</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ProtectedAction resource="farmers" action="create">
              <Button 
                className="bg-agri-primary hover:bg-agri-secondary"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Farmer
              </Button>
            </ProtectedAction>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmers.length}</div>
              <p className="text-xs text-green-600">Active farmers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-green-600">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Farmers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(farmers.length * 0.85)}</div>
              <p className="text-xs text-blue-600">85% verification rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-auto">
          {filteredFarmers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No farmers found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? 'No farmers match your search criteria.' : 'Get started by adding your first farmer.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFarmers.map((farmer) => (
                <Card key={farmer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={farmer.profile_photo || undefined} />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {getInitials(farmer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{farmer.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          Joined {new Date(farmer.date_joined).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{farmer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{farmer.phone}</span>
                      </div>
                      {(farmer.village || farmer.district) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">
                            {[farmer.village, farmer.district].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <ProtectedAction resource="farmers" action="edit">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingFarmer(farmer)}
                        >
                          Edit
                        </Button>
                      </ProtectedAction>
                      <ProtectedAction resource="farmers" action="delete">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteFarmer(farmer.id)}
                        >
                          Delete
                        </Button>
                      </ProtectedAction>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {hasPermission('farmers', 'create') && (
          <FarmerForm 
            onSubmit={handleAddFarmer}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        )}

        {editingFarmer && hasPermission('farmers', 'edit') && (
          <FarmerForm 
            editFarmer={editingFarmer}
            onSubmit={handleUpdateFarmer}
            onCancel={() => setEditingFarmer(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Farmers;
