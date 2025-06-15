
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductForm from '@/components/ProductForm';
import TransactionHistory from '@/components/TransactionHistory';
import SettlementModal from '@/components/SettlementModal';
import { useFarmers } from '@/hooks/useFarmers';
import { useFarmerProducts, FarmerProduct } from '@/hooks/useFarmerProducts';
import { Transaction, DailyEarning, MonthlyEarning } from '@/utils/types';
import { ArrowLeft, Plus, DollarSign, Edit } from 'lucide-react';
import { format } from 'date-fns';

const FarmerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmers, loading } = useFarmers();
  const { products: farmerProducts, loading: productsLoading, fetchFarmerProducts } = useFarmerProducts(id);
  
  const [farmer, setFarmer] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [settlementTransactions, setSettlementTransactions] = useState<Transaction[]>([]);
  const [unsettledAmount, setUnsettledAmount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<FarmerProduct | undefined>(undefined);

  // Calculate earnings from farmer products (including both settled and unsettled)
  const calculateEarnings = (products: FarmerProduct[]) => {
    // Group by date for daily earnings
    const dailyGroups = new Map<string, { settled: number; unsettled: number }>();
    // Group by month for monthly earnings
    const monthlyGroups = new Map<string, { settled: number; unsettled: number }>();
    
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
      const dailyData = dailyGroups.get(dayKey)!;
      const monthlyData = monthlyGroups.get(monthKey)!;
      
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
  const calculateSettlementTransactions = (products: FarmerProduct[]) => {
    const settledProducts = products.filter(product => product.payment_status === 'settled');
    
    // Group settled products by date to create settlement transactions
    const settlementGroups = new Map<string, FarmerProduct[]>();
    
    settledProducts.forEach(product => {
      const settlementDate = format(new Date(product.updated_at), 'yyyy-MM-dd');
      if (!settlementGroups.has(settlementDate)) {
        settlementGroups.set(settlementDate, []);
      }
      settlementGroups.get(settlementDate)!.push(product);
    });
    
    // Create transactions from groups
    const transactions = Array.from(settlementGroups.entries()).map(([date, products]) => {
      const totalAmount = products.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
      return {
        id: `settlement_${date}_${id}`,
        amount: totalAmount,
        date: new Date(date),
        type: 'debit' as const,
        description: `Payment settled for ${products.length} product(s)`,
        farmerId: id || '',
        settled: true
      };
    });
    
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Calculate unsettled amount from farmer products
  useEffect(() => {
    if (farmerProducts) {
      const unsettled = farmerProducts
        .filter(product => product.payment_status === 'unsettled')
        .reduce((total, product) => total + (product.quantity * product.price_per_unit), 0);
      setUnsettledAmount(unsettled);
      
      // Calculate earnings and transactions
      const { dailyEarningsData, monthlyEarningsData } = calculateEarnings(farmerProducts);
      setDailyEarnings(dailyEarningsData);
      setMonthlyEarnings(monthlyEarningsData);
      
      // Calculate settlement transactions
      const transactions = calculateSettlementTransactions(farmerProducts);
      setSettlementTransactions(transactions);
    }
  }, [farmerProducts, id]);

  useEffect(() => {
    if (id && farmers.length > 0) {
      const foundFarmer = farmers.find(farmer => farmer.id === id);
      if (foundFarmer) {
        // Add products and transactions arrays if they don't exist
        const farmerWithDefaults = {
          ...foundFarmer,
          products: farmerProducts || [],
          transactions: settlementTransactions || []
        };
        setFarmer(farmerWithDefaults);
      } else {
        console.error('Farmer not found with ID:', id);
        navigate('/farmers');
      }
    }
  }, [id, farmers, farmerProducts, settlementTransactions, navigate]);
  
  const handleEditProduct = (product: FarmerProduct) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };
  
  const handleSettlePayment = async () => {
    if (!farmer || !id) return;
    
    // Refresh farmer products to get updated data
    await fetchFarmerProducts(id);
  };
  
  if (loading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading farmer details...</p>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg mb-4">Farmer not found</p>
          <Button onClick={() => navigate('/farmers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/farmers')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Farmer Details</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">{farmer.name}</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-agri-primary text-agri-primary hover:bg-agri-muted"
                  onClick={() => {
                    setSelectedProduct(undefined);
                    setIsProductDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                <Button 
                  className="bg-agri-primary hover:bg-agri-secondary"
                  onClick={() => setIsSettlementOpen(true)}
                  disabled={unsettledAmount <= 0}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Settle Payment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span>{farmer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span>{farmer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <span className="text-right">{farmer.address || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Joined:</span>
                    <span>{format(new Date(farmer.date_joined), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Bank:</span>
                    <span>{farmer.bank_name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account:</span>
                    <span>{farmer.account_number || 'Not provided'}</span>
                  </div>
                  {farmer.ifsc_code && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">IFSC:</span>
                      <span>{farmer.ifsc_code}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Unsettled Amount</p>
              <p className="text-3xl font-bold text-agri-primary">₹{unsettledAmount.toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-xl font-semibold">{farmerProducts?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Settlements</p>
                <p className="text-xl font-semibold">{settlementTransactions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="transactions">Settlement Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                {farmerProducts.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No products added yet.</p>
                    <Button 
                      className="mt-2 bg-agri-primary hover:bg-agri-secondary"
                      onClick={() => setIsProductDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Product</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-right p-2">Quantity</th>
                          <th className="text-right p-2">Unit Price (₹)</th>
                          <th className="text-right p-2">Total (₹)</th>
                          <th className="text-center p-2">Payment Status</th>
                          <th className="text-center p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farmerProducts.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">{product.category || 'N/A'}</td>
                            <td className="p-2">{format(new Date(product.created_at), 'MMM dd, yyyy')}</td>
                            <td className="text-right p-2">{product.quantity} {product.unit}</td>
                            <td className="text-right p-2">₹{product.price_per_unit.toFixed(2)}</td>
                            <td className="text-right p-2 font-medium">
                              ₹{(product.quantity * product.price_per_unit).toFixed(2)}
                            </td>
                            <td className="text-center p-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                product.payment_status === 'settled' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {product.payment_status === 'settled' ? 'Settled' : 'Unsettled'}
                              </span>
                            </td>
                            <td className="text-center p-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Settlement Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {settlementTransactions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No settlement transactions yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-center p-2">Type</th>
                          <th className="text-center p-2">Status</th>
                          <th className="text-right p-2">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settlementTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b">
                            <td className="p-2">{format(transaction.date, 'MMM dd, yyyy')}</td>
                            <td className="p-2">{transaction.description}</td>
                            <td className="text-center p-2">
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                Payment
                              </span>
                            </td>
                            <td className="text-center p-2">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                Settled
                              </span>
                            </td>
                            <td className="text-right p-2 font-medium text-red-600">
                              -₹{transaction.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <TransactionHistory 
        transactions={settlementTransactions} 
        dailyEarnings={dailyEarnings} 
        monthlyEarnings={monthlyEarnings}
        products={farmerProducts}
      />
      
      <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
        setIsProductDialogOpen(open);
        if (!open) setSelectedProduct(undefined);
      }}>
        <DialogContent>
          <ProductForm 
            onCancel={() => {
              setIsProductDialogOpen(false);
              setSelectedProduct(undefined);
            }}
            editProduct={selectedProduct}
            farmerId={farmer.id}
          />
        </DialogContent>
      </Dialog>
      
      <SettlementModal 
        farmer={farmer}
        unsettledAmount={unsettledAmount}
        unsettledProducts={farmerProducts.filter(p => p.payment_status === 'unsettled')}
        open={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        onSettle={handleSettlePayment}
        farmerId={id}
      />
    </div>
  );
};

export default FarmerDetails;
