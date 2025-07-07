
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, DollarSign, Package, Calendar, MapPin, Phone, Mail, User, Building2, Plus } from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useFarmerProducts } from '@/hooks/useFarmerProducts';
import FarmerProductsTable from '@/components/FarmerProductsTable';
import TransactionHistory from '@/components/TransactionHistory';
import FarmerSettlements from '@/components/farmer/FarmerSettlements';
import { format } from 'date-fns';
import { Farmer } from '@/utils/types';

const FarmerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmers, loading } = useFarmers();
  const { farmerProducts, loading: productsLoading } = useFarmerProducts(id || '');
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);

  const farmer = farmers.find(f => f.id === id);

  useEffect(() => {
    if (farmer) {
      setCurrentFarmer(farmer);
    }
  }, [farmer]);

  useEffect(() => {
    if (!loading && !farmer && id) {
      console.error('Farmer not found with ID:', id);
      navigate('/farmers');
    }
  }, [farmer, loading, id, navigate]);

  const handleAddProducts = () => {
    // TODO: Implement add products functionality
    console.log('Add products clicked for farmer:', id);
  };

  const handleSettlePayment = () => {
    // TODO: Implement settle payment functionality
    console.log('Settle payment clicked for farmer:', id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading farmer details...</div>
      </div>
    );
  }

  if (!currentFarmer) {
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
  const totalProducts = farmerProducts.length;
  const totalEarnings = farmerProducts.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const settledAmount = farmerProducts
    .filter(product => product.payment_status === 'settled')
    .reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const unsettledAmount = farmerProducts
    .filter(product => product.payment_status === 'unsettled')
    .reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);

  // Filter transactions to show only farmer products (not sales transactions)
  const farmerTransactions = farmerProducts.map(product => ({
    id: product.id,
    customer_name: currentFarmer.name,
    customer_mobile: currentFarmer.phone,
    items: [{
      id: product.id,
      name: product.name,
      price: product.price_per_unit,
      quantity: product.quantity
    }],
    subtotal: product.quantity * product.price_per_unit,
    discount: 0,
    total: product.quantity * product.price_per_unit,
    payment_method: 'farmer_product',
    status: product.payment_status === 'settled' ? 'completed' : 'pending',
    created_at: product.created_at,
    updated_at: product.updated_at,
    created_by: 'farmer',
    branch_id: null
  }));

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
            <h1 className="text-2xl font-bold">{currentFarmer.name}</h1>
            <p className="text-muted-foreground">Farmer Profile & Activity</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddProducts} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Products
          </Button>
          <Button onClick={handleSettlePayment} variant="outline">
            <DollarSign className="h-4 w-4 mr-2" />
            Settle Payment
          </Button>
        </div>
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
              <div className="font-medium">{currentFarmer.email}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <div className="font-medium">{currentFarmer.phone}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Join Date
              </div>
              <div className="font-medium">
                {format(new Date(currentFarmer.date_joined), 'MMM dd, yyyy')}
              </div>
            </div>
            
            {currentFarmer.address && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
                <div className="font-medium">{currentFarmer.address}</div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Location
              </div>
              <div className="font-medium space-y-1">
                {currentFarmer.village && <div>Village: {currentFarmer.village}</div>}
                {currentFarmer.district && <div>District: {currentFarmer.district}</div>}
                {currentFarmer.state && <div>State: {currentFarmer.state}</div>}
              </div>
            </div>
          </div>
          
          {/* Bank Details */}
          {(currentFarmer.bank_name || currentFarmer.account_number || currentFarmer.ifsc_code) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentFarmer.bank_name && (
                  <div>
                    <div className="text-sm text-muted-foreground">Bank Name</div>
                    <div className="font-medium">{currentFarmer.bank_name}</div>
                  </div>
                )}
                {currentFarmer.account_number && (
                  <div>
                    <div className="text-sm text-muted-foreground">Account Number</div>
                    <div className="font-medium">{currentFarmer.account_number}</div>
                  </div>
                )}
                {currentFarmer.ifsc_code && (
                  <div>
                    <div className="text-sm text-muted-foreground">IFSC Code</div>
                    <div className="font-medium">{currentFarmer.ifsc_code}</div>
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
          <FarmerProductsTable products={farmerProducts} loading={productsLoading} />
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionHistory 
            transactions={farmerTransactions}
            dailyEarnings={[]}
            monthlyEarnings={[]}
            products={farmerProducts}
          />
        </TabsContent>
        
        <TabsContent value="settlements">
          <FarmerSettlements products={farmerProducts} loading={productsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FarmerDetails;
