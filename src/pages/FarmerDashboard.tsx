import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, User, LogOut, BarChart3, Ticket, Edit, IndianRupee } from 'lucide-react';
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
import EditProfileDialog from '@/components/farmer/EditProfileDialog';
import FarmerSettlements from '@/components/farmer/FarmerSettlements';
import { format } from 'date-fns';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showSettlementsDialog, setShowSettlementsDialog] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [settlementTransactions, setSettlementTransactions] = useState([]);

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
      
      console.log('Setting farmer data:', farmerData);
      setFarmer(farmerData);
    } catch (error) {
      console.error('Error parsing farmer data:', error);
      navigate('/farmer-login');
    }
  }, [navigate]);

  // Fetch products ONLY for the logged-in farmer
  const { farmerProducts, loading: productsLoading } = useFarmerProducts(farmer?.id);

  // Calculate earnings from farmer products (only for this specific farmer)
  const calculateEarnings = (products) => {
    // Ensure we're only calculating for the current farmer's products
    const farmerSpecificProducts = products.filter(product => product.farmer_id === farmer?.id);
    
    // Group by date for daily earnings
    const dailyGroups = new Map();
    // Group by month for monthly earnings
    const monthlyGroups = new Map();
    
    farmerSpecificProducts.forEach(product => {
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

  // Calculate settlement transactions from farmer products (only for this specific farmer)
  const calculateSettlementTransactions = (products) => {
    // Ensure we're only calculating for the current farmer's products
    const farmerSpecificProducts = products.filter(product => product.farmer_id === farmer?.id);
    const settledProducts = farmerSpecificProducts.filter(product => product.payment_status === 'settled');
    
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

  // Calculate totals for the specific farmer only
  const farmerSpecificProducts = farmerProducts.filter(product => product.farmer_id === farmer?.id);
  const totalEarnings = farmerSpecificProducts.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const settledAmount = farmerSpecificProducts.filter(p => p.payment_status === 'settled').reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const unsettledAmount = farmerSpecificProducts.filter(p => p.payment_status === 'unsettled').reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);

  // Update earnings when products change
  useEffect(() => {
    if (farmerProducts && farmerProducts.length > 0 && farmer?.id) {
      console.log('Calculating earnings for farmer:', farmer.id, 'with products:', farmerProducts.length);
      const { dailyEarningsData, monthlyEarningsData } = calculateEarnings(farmerProducts);
      setDailyEarnings(dailyEarningsData);
      setMonthlyEarnings(monthlyEarningsData);
      
      const transactions = calculateSettlementTransactions(farmerProducts);
      setSettlementTransactions(transactions);
    } else {
      // Reset to empty arrays when no products
      setDailyEarnings([]);
      setMonthlyEarnings([]);
      setSettlementTransactions([]);
    }
  }, [farmerProducts, farmer]);

  const handleLogout = () => {
    localStorage.removeItem('currentFarmer');
    navigate('/farmer-login');
  };

  const handleProfileClick = () => {
    setShowProfileDialog(true);
  };

  const handleEditProfileClick = () => {
    setShowProfileDialog(false); // Close view profile dialog
    setShowEditProfileDialog(true); // Open edit profile dialog
  };

  const handleTicketsClick = () => {
    // Navigate to farmer ticket history page with farmer ID
    navigate(`/farmer-tickets/${farmer.id}`);
  };

  const handleSettlementsClick = () => {
    setShowSettlementsDialog(true);
  };

  const handleProfileUpdate = (updatedFarmer: any) => {
    setFarmer(updatedFarmer);
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
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettlementsClick}>
                <IndianRupee className="mr-2 h-4 w-4" />
                <span>My Settlements</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTicketsClick}>
                <Ticket className="mr-2 h-4 w-4" />
                <span>Support Tickets</span>
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
                <p className="font-medium">{farmerSpecificProducts?.length || 0} items</p>
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
        <div className="mt-6">
          <TransactionHistory 
            transactions={settlementTransactions} 
            dailyEarnings={dailyEarnings} 
            monthlyEarnings={monthlyEarnings}
            products={farmerSpecificProducts}
          />
        </div>

        {/* Profile Dialog with Edit Button */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Farmer Profile
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditProfileClick}
                  className="ml-4"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTitle>
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

        {/* Edit Profile Dialog */}
        <EditProfileDialog
          open={showEditProfileDialog}
          onOpenChange={setShowEditProfileDialog}
          farmer={farmer}
          onProfileUpdate={handleProfileUpdate}
        />

        {/* Settlements Dialog */}
        <Dialog open={showSettlementsDialog} onOpenChange={setShowSettlementsDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                My Settlements
              </DialogTitle>
            </DialogHeader>
            <FarmerSettlements 
              products={farmerSpecificProducts} 
              loading={productsLoading} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FarmerDashboard;
