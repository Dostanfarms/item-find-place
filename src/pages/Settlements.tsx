
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, IndianRupee, Receipt, Eye } from 'lucide-react';
import { useFarmerProducts } from '@/hooks/useFarmerProducts';
import { useFarmers } from '@/hooks/useFarmers';
import SettlementModal from '@/components/SettlementModal';
import FarmerPaymentDetailsModal from '@/components/FarmerPaymentDetailsModal';

const Settlements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [selectedFarmerDetails, setSelectedFarmerDetails] = useState(null);
  const [isFarmerDetailsOpen, setIsFarmerDetailsOpen] = useState(false);
  
  // Fetch all products (no farmerId provided to get all farmer products)
  const { products: allProducts, loading: productsLoading, fetchFarmerProducts } = useFarmerProducts();
  const { farmers, loading: farmersLoading } = useFarmers();

  console.log('Settlements page data:', { 
    allProducts: allProducts.length, 
    farmers: farmers.length, 
    productsLoading, 
    farmersLoading 
  });

  // Create a map for quick farmer lookup
  const farmerMap = useMemo(() => {
    const map = new Map();
    farmers.forEach(farmer => {
      map.set(farmer.id, farmer);
    });
    return map;
  }, [farmers]);

  // Filter products based on search term (farmer name or mobile)
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts;
    
    return allProducts.filter(product => {
      const farmer = farmerMap.get(product.farmer_id);
      if (!farmer) return false;
      
      return farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             farmer.phone.includes(searchTerm);
    });
  }, [allProducts, farmerMap, searchTerm]);

  // Group products by farmer and calculate totals
  const farmerSummaries = useMemo(() => {
    const summaries = new Map();
    
    filteredProducts.forEach(product => {
      const farmer = farmerMap.get(product.farmer_id);
      if (!farmer) return;
      
      const amount = product.quantity * product.price_per_unit;
      
      if (!summaries.has(product.farmer_id)) {
        summaries.set(product.farmer_id, {
          farmer,
          totalAmount: 0,
          settledAmount: 0,
          unsettledAmount: 0,
          products: [],
          unsettledProducts: [],
          settlementReceipt: null
        });
      }
      
      const summary = summaries.get(product.farmer_id);
      summary.totalAmount += amount;
      summary.products.push(product);
      
      if (product.payment_status === 'settled') {
        summary.settledAmount += amount;
        // Get the first transaction image from settled products as receipt
        if (!summary.settlementReceipt && product.transaction_image) {
          summary.settlementReceipt = product.transaction_image;
        }
      } else {
        summary.unsettledAmount += amount;
        summary.unsettledProducts.push(product);
      }
    });
    
    return Array.from(summaries.values()).sort((a, b) => b.unsettledAmount - a.unsettledAmount);
  }, [filteredProducts, farmerMap]);

  const handleViewFarmerDetails = (farmerSummary) => {
    console.log('Opening farmer details for:', farmerSummary.farmer.name);
    setSelectedFarmerDetails(farmerSummary);
    setIsFarmerDetailsOpen(true);
  };

  const handleSettlePayment = (farmerSummary) => {
    console.log('Opening settlement modal for:', farmerSummary.farmer.name);
    setSelectedFarmer(farmerSummary);
    setIsSettlementModalOpen(true);
    setIsFarmerDetailsOpen(false);
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptImage(receiptUrl);
  };

  const handleSettlementComplete = async () => {
    console.log('Settlement completed, refreshing data');
    await fetchFarmerProducts(); // Fetch all products again
    setIsSettlementModalOpen(false);
    setSelectedFarmer(null);
  };

  // Show loading state while either farmers or products are loading
  if (productsLoading || farmersLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-muted-foreground text-lg">Loading settlements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Settlements</h1>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by farmer name or mobile..."
                className="pl-8 w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {farmerSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] bg-white rounded-lg border">
            <IndianRupee className="h-16 w-16 text-muted-foreground mb-6" />
            {searchTerm ? (
              <>
                <h3 className="text-xl font-medium mb-2">No farmers found</h3>
                <p className="text-muted-foreground text-center">
                  No farmers match your search criteria. Try with a different name or mobile number.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium mb-2">No settlement data</h3>
                <p className="text-muted-foreground text-center">
                  No farmer products found for settlement processing.
                </p>
              </>
            )}
          </div>
        ) : (
          <Card className="border shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">Farmer Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[150px] font-semibold">Farmer Name</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Mobile</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Total Products</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Total Amount</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Settled Amount</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Unsettled Amount</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Status</TableHead>
                      <TableHead className="min-w-[120px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmerSummaries.map((summary) => (
                      <TableRow key={summary.farmer.id} className="hover:bg-gray-50 border-b">
                        <TableCell className="font-medium">
                          <div className="max-w-[150px] truncate" title={summary.farmer.name}>
                            {summary.farmer.name}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{summary.farmer.phone}</TableCell>
                        <TableCell className="whitespace-nowrap">{summary.products.length}</TableCell>
                        <TableCell className="whitespace-nowrap">₹{summary.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap text-green-600">₹{summary.settledAmount.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap text-red-600">₹{summary.unsettledAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {summary.unsettledAmount > 0 ? (
                            <Badge variant="destructive">Pending</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-600">Settled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewFarmerDetails(summary)}
                            className="h-7 px-2"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Farmer Details Modal */}
      {selectedFarmerDetails && (
        <FarmerPaymentDetailsModal
          farmer={selectedFarmerDetails.farmer}
          products={selectedFarmerDetails.products}
          open={isFarmerDetailsOpen}
          onClose={() => {
            setIsFarmerDetailsOpen(false);
            setSelectedFarmerDetails(null);
          }}
          onSettle={handleSettlePayment}
          onViewReceipt={handleViewReceipt}
        />
      )}

      {/* Settlement Modal */}
      {selectedFarmer && (
        <SettlementModal
          farmer={selectedFarmer.farmer}
          unsettledAmount={selectedFarmer.unsettledAmount}
          unsettledProducts={selectedFarmer.unsettledProducts}
          open={isSettlementModalOpen}
          onClose={() => {
            setIsSettlementModalOpen(false);
            setSelectedFarmer(null);
          }}
          onSettle={handleSettlementComplete}
          farmerId={selectedFarmer.farmer.id}
        />
      )}

      {/* Receipt Image Dialog */}
      <Dialog open={!!selectedReceiptImage} onOpenChange={() => setSelectedReceiptImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Receipt
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedReceiptImage && (
              <img
                src={selectedReceiptImage}
                alt="Payment receipt"
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settlements;
