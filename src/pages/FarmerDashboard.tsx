
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, User, LogOut, BarChart3, Settings, Ticket } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFarmerProducts } from '@/hooks/useFarmerProducts';
import { useTransactions } from '@/hooks/useTransactions';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showTicketsDialog, setShowTicketsDialog] = useState(false);
  const { products, loading: productsLoading, fetchFarmerProducts } = useFarmerProducts();
  const { transactions, loading: transactionsLoading } = useTransactions();

  useEffect(() => {
    const currentFarmer = localStorage.getItem('currentFarmer');
    if (!currentFarmer) {
      navigate('/farmer-login');
      return;
    }
    
    try {
      const farmerData = JSON.parse(currentFarmer);
      if (!farmerData || !farmerData.id) {
        navigate('/farmer-login');
        return;
      }
      
      setFarmer(farmerData);
      
      // Fetch farmer products
      fetchFarmerProducts(farmerData.id);
    } catch (error) {
      console.error('Error parsing farmer data:', error);
      navigate('/farmer-login');
    }
  }, [navigate, fetchFarmerProducts]);

  const handleLogout = () => {
    localStorage.removeItem('currentFarmer');
    navigate('/farmer-login');
  };

  const handleProfileClick = () => {
    setShowProfileDialog(true);
  };

  const handleTicketsClick = () => {
    setShowTicketsDialog(true);
  };

  // Calculate sales report data
  const farmerSalesData = React.useMemo(() => {
    if (!farmer || !transactions) return { totalSales: 0, totalRevenue: 0, transactions: [] };
    
    const farmerTransactions = transactions.filter(transaction => 
      transaction.items.some(item => 
        products.some(product => product.name === item.name)
      )
    );
    
    const totalRevenue = farmerTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
    
    return {
      totalSales: farmerTransactions.length,
      totalRevenue,
      transactions: farmerTransactions
    };
  }, [farmer, transactions, products]);

  if (!farmer) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">DostanFarms</span>
          </div>
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={farmer.profile_photo} alt={farmer.name} />
                  <AvatarFallback>
                    {farmer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTicketsClick}>
                <Ticket className="mr-2 h-4 w-4" />
                <span>Tickets</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Welcome Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {farmer.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{farmer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{farmer.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="font-medium">{products?.length || 0} items</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="font-medium">₹{farmerSalesData.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Report Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading sales data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{farmerSalesData.totalSales}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{farmerSalesData.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
                
                {farmerSalesData.transactions.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Transactions</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {farmerSalesData.transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center p-3 bg-muted/30 rounded">
                          <div>
                            <p className="font-medium">{transaction.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-bold">₹{transaction.total.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No sales transactions yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Products Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              My Products ({products?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products added yet</p>
                <p className="text-sm">Contact admin to add products</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><span className="font-medium">Quantity:</span> {product.quantity} {product.unit}</p>
                        <p className="text-sm"><span className="font-medium">Price:</span> ₹{product.price_per_unit}/{product.unit}</p>
                        <p className="text-sm"><span className="font-medium">Total:</span> ₹{(product.quantity * product.price_per_unit).toFixed(2)}</p>
                      </div>
                      {product.barcode && (
                        <p className="text-xs text-muted-foreground mt-2">Barcode: {product.barcode}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Dialog */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Farmer Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={farmer.profile_photo} alt={farmer.name} />
                  <AvatarFallback className="text-lg">
                    {farmer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{farmer.name}</h3>
                  <p className="text-muted-foreground">Farmer</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{farmer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{farmer.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{farmer.address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{farmer.state || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="font-medium">{farmer.district || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Village</p>
                  <p className="font-medium">{farmer.village || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tickets Dialog */}
        <Dialog open={showTicketsDialog} onOpenChange={setShowTicketsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Support Tickets</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => navigate('/farmer-tickets')}
                  className="bg-agri-primary hover:bg-agri-secondary"
                >
                  View Ticket History
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setShowTicketsDialog(false);
                    navigate('/farmer-tickets');
                  }}
                >
                  Raise New Ticket
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click the buttons above to manage your support tickets</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FarmerDashboard;
