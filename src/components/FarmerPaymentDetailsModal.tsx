
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { IndianRupee, Receipt, X, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface FarmerPaymentDetailsModalProps {
  farmer: any;
  products: any[];
  open: boolean;
  onClose: () => void;
  onSettle: (farmerSummary: any) => void;
  onViewReceipt: (receiptUrl: string) => void;
}

const FarmerPaymentDetailsModal = ({ 
  farmer, 
  products, 
  open, 
  onClose, 
  onSettle, 
  onViewReceipt 
}: FarmerPaymentDetailsModalProps) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [expandedSettlements, setExpandedSettlements] = useState<Set<string>>(new Set());
  
  const unsettledProducts = products.filter(p => p.payment_status === 'unsettled');
  const settledProducts = products.filter(p => p.payment_status === 'settled');
  
  // Group settled products by settlement batch (using transaction_image as grouping key)
  const settledGroups: Record<string, any[]> = settledProducts.reduce((groups: Record<string, any[]>, product) => {
    const key = product.transaction_image || 'no-receipt';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(product);
    return groups;
  }, {});
  
  const totalAmount = products.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const settledAmount = settledProducts.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const unsettledAmount = unsettledProducts.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  
  // Calculate selected products total
  const selectedTotal = products
    .filter(p => selectedProducts.includes(p.id) && p.payment_status === 'unsettled')
    .reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  
  const settlementReceipt = settledProducts.find(p => p.transaction_image)?.transaction_image;

  const handleProductSelection = (productId: string, checked: boolean | string) => {
    const isChecked = checked === true;
    setSelectedProducts(prev => 
      isChecked 
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAll = (checked: boolean | string) => {
    const isChecked = checked === true;
    if (isChecked) {
      setSelectedProducts(unsettledProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSettleSelected = () => {
    const selectedUnsettledProducts = products.filter(p => 
      selectedProducts.includes(p.id) && p.payment_status === 'unsettled'
    );
    
    const farmerSummary = {
      farmer,
      totalAmount: selectedTotal,
      settledAmount: 0,
      unsettledAmount: selectedTotal,
      products: selectedUnsettledProducts,
      unsettledProducts: selectedUnsettledProducts,
      settlementReceipt: null
    };
    
    onSettle(farmerSummary);
  };

  const handleSettleSingle = (product: any) => {
    const singleProductAmount = product.quantity * product.price_per_unit;
    const farmerSummary = {
      farmer,
      totalAmount: singleProductAmount,
      settledAmount: 0,
      unsettledAmount: singleProductAmount,
      products: [product],
      unsettledProducts: [product],
      settlementReceipt: null
    };
    
    onSettle(farmerSummary);
  };

  const toggleSettlementExpansion = (key: string) => {
    const newExpanded = new Set(expandedSettlements);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSettlements(newExpanded);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Payment Details - {farmer?.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Farmer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-medium">{farmer?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{farmer?.email}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Settled Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{settledAmount.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Unsettled Amount</p>
              <p className="text-2xl font-bold text-red-600">₹{unsettledAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Selected Products Settlement */}
          {selectedProducts.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Products: {selectedProducts.length}</p>
                  <p className="text-lg font-bold text-blue-600">Total: ₹{selectedTotal.toFixed(2)}</p>
                </div>
                <Button 
                  onClick={handleSettleSelected}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Settle Selected (₹{selectedTotal.toFixed(2)})
                </Button>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Products</h3>
              {unsettledProducts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedProducts.length === unsettledProducts.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All Unsettled</span>
                </div>
              )}
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Unsettled Products */}
                  {unsettledProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => handleProductSelection(product.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{format(new Date(product.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">{product.quantity} {product.unit}</TableCell>
                      <TableCell className="text-right">₹{product.price_per_unit.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{(product.quantity * product.price_per_unit).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSettleSingle(product)}
                          className="bg-green-50 hover:bg-green-100"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Settle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Settled Product Groups */}
                  {Object.entries(settledGroups).map(([key, groupProducts]) => {
                    const isExpanded = expandedSettlements.has(key);
                    const groupTotal = groupProducts.reduce((sum: number, p: any) => sum + (p.quantity * p.price_per_unit), 0);
                    const hasReceipt = key !== 'no-receipt';
                    
                    return (
                      <React.Fragment key={key}>
                        {/* Settlement Group Header - Now clickable entire row */}
                        <TableRow 
                          className="bg-green-50 hover:bg-green-100 cursor-pointer"
                          onClick={() => toggleSettlementExpansion(key)}
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium" colSpan={5}>
                            Settlement Group ({groupProducts.length} products)
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{groupTotal.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {hasReceipt ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click when clicking button
                                  onViewReceipt(key);
                                }}
                              >
                                <Receipt className="h-3 w-3 mr-1" />
                                View Receipt
                              </Button>
                            ) : (
                              <Badge variant="default" className="bg-green-600">
                                Settled
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Settlement Details */}
                        {isExpanded && groupProducts.map((product: any) => (
                          <TableRow key={product.id} className="bg-green-25 hover:bg-green-50 border-l-4 border-l-green-200">
                            <TableCell></TableCell>
                            <TableCell className="font-medium pl-8">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{format(new Date(product.created_at), 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="text-right">{product.quantity} {product.unit}</TableCell>
                            <TableCell className="text-right">₹{product.price_per_unit.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{(product.quantity * product.price_per_unit).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="default" className="bg-green-600">
                                Settled
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FarmerPaymentDetailsModal;
