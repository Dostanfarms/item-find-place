
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
import { getDailyEarnings, getMonthlyEarnings, getUnsettledAmount } from '@/utils/mockData';
import { Transaction } from '@/utils/types';
import { ArrowLeft, Plus, DollarSign, Edit } from 'lucide-react';
import { format } from 'date-fns';

const FarmerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmers, loading } = useFarmers();
  const { products: farmerProducts, loading: productsLoading } = useFarmerProducts(id);
  
  const [farmer, setFarmer] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [unsettledAmount, setUnsettledAmount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<FarmerProduct | undefined>(undefined);

  useEffect(() => {
    if (id && farmers.length > 0) {
      const foundFarmer = farmers.find(farmer => farmer.id === id);
      if (foundFarmer) {
        // Add products and transactions arrays if they don't exist
        const farmerWithDefaults = {
          ...foundFarmer,
          products: farmerProducts || [],
          transactions: foundFarmer.transactions || []
        };
        setFarmer(farmerWithDefaults);
        setDailyEarnings(getDailyEarnings(id));
        setMonthlyEarnings(getMonthlyEarnings(id));
        setUnsettledAmount(getUnsettledAmount(id));
      } else {
        console.error('Farmer not found with ID:', id);
        navigate('/farmers');
      }
    }
  }, [id, farmers, farmerProducts, navigate]);
  
  const handleEditProduct = (product: FarmerProduct) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };
  
  const handleSettlePayment = () => {
    if (!farmer) return;
    
    // Create a settlement transaction
    const settlementTransaction: Transaction = {
      id: `tr_${Date.now()}`,
      amount: unsettledAmount,
      date: new Date(),
      type: 'debit',
      description: 'Payment settled',
      farmerId: farmer.id,
      settled: true
    };
    
    // Mark all unsettled transactions as settled
    const updatedTransactions = farmer.transactions.map(t => 
      t.type === 'credit' && !t.settled ? { ...t, settled: true } : t
    );
    
    // Update farmer with new transaction and settled status
    const updatedFarmer = {
      ...farmer,
      transactions: [...updatedTransactions, settlementTransaction]
    };
    
    setFarmer(updatedFarmer);
    setUnsettledAmount(0);
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
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-xl font-semibold">{farmer.transactions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {farmer.transactions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No transactions yet.</p>
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
                        {[...farmer.transactions]
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map((transaction) => (
                            <tr key={transaction.id} className="border-b">
                              <td className="p-2">{format(transaction.date, 'MMM dd, yyyy')}</td>
                              <td className="p-2">{transaction.description}</td>
                              <td className="text-center p-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.type === 'credit' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                                </span>
                              </td>
                              <td className="text-center p-2">
                                {transaction.type === 'credit' && (
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    transaction.settled 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {transaction.settled ? 'Settled' : 'Pending'}
                                  </span>
                                )}
                              </td>
                              <td className={`text-right p-2 font-medium ${
                                transaction.type === 'credit' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {transaction.type === 'credit' ? '+' : '-'}
                                ₹{transaction.amount.toFixed(2)}
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
        transactions={farmer.transactions} 
        dailyEarnings={dailyEarnings} 
        monthlyEarnings={monthlyEarnings} 
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
        open={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        onSettle={handleSettlePayment}
      />
    </div>
  );
};

export default FarmerDetails;
