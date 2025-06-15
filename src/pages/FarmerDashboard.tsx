
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, User, LogOut, BarChart3, Ticket } from 'lucide-react';
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
import TransactionHistory from '@/components/TransactionHistory';
import { format } from 'date-fns';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showTicketsDialog, setShowTicketsDialog] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [settlementTransactions, setSettlementTransactions] = useState([]);
  const { products, loading: productsLoading, fetchFarmerProducts } = useFarmerProducts();

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

  // Calculate earnings from farmer products
  const calculateEarnings = (products) => {
    // Group by date for daily earnings
    const dailyGroups = new Map();
    // Group by month for monthly earnings
    const monthlyGroups = new Map();
    
    products.forEach(product => {
      const productDate = new Date(product.created_at);
      const dayKey = format(productDate, 'yyyy-MM-dd');
      const monthKey = format(productDate, 'yyyy-MM');
      const amount = product.quantity * product.price_per_unit;
      
      // Initialize if not exists
      if (!dailyGroups.has(dayKey)) {
        dailyGroups.set(dayKey, { settled: 0, unsettled: 0 });
      }
      if (!monthlyGroups.has(monthKey)) {
        monthlyGroups.set(monthKey, { settled: 0, unsettled: 0 });
      }
      
      // Add to appropriate category
      const dailyData = dailyGroups.get(dayKey);
      const monthlyData = monthlyGroups.get(monthKey);
      
      if (product.payment_status === 'settled') {
        dailyData.settled += amount;
        monthlyData.settled += amount;
      } else {
        dailyData.unsettled += amount;
        monthlyData.unsettled += amount;
      }
    });
    
    // Convert to arrays and sort
    const dailyEarningsData = Array.from(dailyGroups.entries())
      .map(([date, amounts]) => ({ 
        date, 
        amount: amounts.settled + amounts.unsettled,
        settledAmount: amounts.settled,
        unsettledAmount: amounts.unsettled
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const monthlyEarningsData = Array.from(monthlyGroups.entries())
      .map(([month, amounts]) => ({ 
        month, 
        amount: amounts.settled + amounts.unsettled,
        settledAmount: amounts.settled,
        unsettledAmount: amounts.unsettled
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
    
    return { dailyEarningsData, monthlyEarningsData };
  };

  // Calculate settlement transactions from farmer products
  const calculateSettlementTransactions = (products) => {
    const settledProducts = products.filter(product => product.payment_status === 'settled');
    
    // Group settled products by date to create settlement transactions
    const settlementGroups = new Map();
    
    settledProducts.forEach(product => {
      const settlementDate = format(new Date(product.updated_at), 'yyyy-MM-dd');
      if (!settlementGroups.has(settlementDate)) {
        settlementGroups.set(settlementDate, []);
      }
      settlementGroups.get(settlementDate).push(product);
    });
    
    // Create transactions from groups
    const transactions = Array.from(settlementGroups.entries()).map(([date, products]) => {
      const totalAmount = products.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
      return {
        id: `settlement_${date}_${farmer?.id}`,
        amount: totalAmount,
        date: new Date(date),
        type: 'debit',
        description: `Payment settled for ${products.length} product(s)`,
        farmerId: farmer?.id || '',
        settled: true
      };
    });
    
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Calculate totals
  const totalEarnings = products.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const settledAmount = products.filter(p => p.payment_status === 'settled').reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const unsettledAmount = products.filter(p => p.payment_status === 'unsettled').reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);

  // Update earnings when products change
  useEffect(() => {
    if (products && products.length > 0) {
      const { dailyEarningsData, monthlyEarningsData } = calculateEarnings(products);
      setDailyEarnings(dailyEarningsData);
      setMonthlyEarnings(monthlyEarningsData);
      
      const transactions = calculateSettlementTransactions(products);
      setSettlementTransactions(transactions);
    }
  }, [products, farmer]);

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

  if (!farmer) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-6xl mx-auto">
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
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="font-medium">₹{totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-blue-600">₹{totalEarnings.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Settled Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{settledAmount.toFixed(2)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Unsettled Amount</p>
                <p className="text-2xl font-bold text-orange-600">₹{unsettledAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings History */}
        <TransactionHistory 
          transactions={settlementTransactions} 
          dailyEarnings={dailyEarnings} 
          monthlyEarnings={monthlyEarnings} 
        />

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
