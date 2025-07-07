
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, DollarSign, Package, Calendar, MapPin, Phone, Mail, User, Building2 } from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useFarmerProducts } from '@/hooks/useFarmerProducts';
import FarmerProductsTable from '@/components/FarmerProductsTable';
import TransactionHistory from '@/components/TransactionHistory';
import EditProfileDialog from '@/components/farmer/EditProfileDialog';
import FarmerSettlements from '@/components/farmer/FarmerSettlements';
import { format } from 'date-fns';

const FarmerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmers, loading } = useFarmers();
  const { products, dailyEarnings, monthlyEarnings } = useFarmerProducts(id || '');
  const [showEditDialog, setShowEditDialog] = useState(false);

  const farmer = farmers.find(f => f.id === id);

  useEffect(() => {
    if (!loading && !farmer && id) {
      // Farmer not found, redirect back to farmers list
      console.error('Farmer not found with ID:', id);
      navigate('/farmers');
    }
  }, [farmer, loading, id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading farmer details...</div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Farmer Not Found</h2>
          <p className="text-muted-foreground mb-4">The farmer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/farmers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </Button>
        </div>
      </div>
    );
  }

  // Calculate farmer statistics
  const totalProducts = products.length;
  const totalEarnings = products.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const settledAmount = products
    .filter(product => product.payment_status === 'settled')
    .reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const unsettledAmount = products
    .filter(product => product.payment_status === 'unsettled')
    .reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/farmers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{farmer.name}</h1>
            <p className="text-muted-foreground">Farmer Profile & Activity</p>
          </div>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Settled Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{settledAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{unsettledAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Farmer Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Farmer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="font-medium">{farmer.email}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <div className="font-medium">{farmer.phone}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Join Date
              </div>
              <div className="font-medium">
                {format(new Date(farmer.date_joined), 'MMM dd, yyyy')}
              </div>
            </div>
            
            {farmer.address && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
                <div className="font-medium">{farmer.address}</div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Location
              </div>
              <div className="font-medium space-y-1">
                {farmer.village && <div>Village: {farmer.village}</div>}
                {farmer.district && <div>District: {farmer.district}</div>}
                {farmer.state && <div>State: {farmer.state}</div>}
              </div>
            </div>
          </div>
          
          {/* Bank Details */}
          {(farmer.bank_name || farmer.account_number || farmer.ifsc_code) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {farmer.bank_name && (
                  <div>
                    <div className="text-sm text-muted-foreground">Bank Name</div>
                    <div className="font-medium">{farmer.bank_name}</div>
                  </div>
                )}
                {farmer.account_number && (
                  <div>
                    <div className="text-sm text-muted-foreground">Account Number</div>
                    <div className="font-medium">{farmer.account_number}</div>
                  </div>
                )}
                {farmer.ifsc_code && (
                  <div>
                    <div className="text-sm text-muted-foreground">IFSC Code</div>
                    <div className="font-medium">{farmer.ifsc_code}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <FarmerProductsTable farmerId={farmer.id} />
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionHistory 
            transactions={[]}
            dailyEarnings={dailyEarnings}
            monthlyEarnings={monthlyEarnings}
            products={products}
          />
        </TabsContent>
        
        <TabsContent value="settlements">
          <FarmerSettlements farmerId={farmer.id} />
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        farmer={farmer}
      />
    </div>
  );
};

export default FarmerDetails;
