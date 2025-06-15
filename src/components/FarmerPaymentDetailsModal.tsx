
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, Receipt, X } from 'lucide-react';
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
  const unsettledProducts = products.filter(p => p.payment_status === 'unsettled');
  const settledProducts = products.filter(p => p.payment_status === 'settled');
  
  const totalAmount = products.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const settledAmount = settledProducts.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const unsettledAmount = unsettledProducts.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  
  const settlementReceipt = settledProducts.find(p => p.transaction_image)?.transaction_image;

  const farmerSummary = {
    farmer,
    totalAmount,
    settledAmount,
    unsettledAmount,
    products,
    unsettledProducts,
    settlementReceipt
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

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {unsettledAmount > 0 && (
              <Button 
                onClick={() => onSettle(farmerSummary)}
                className="bg-green-600 hover:bg-green-700"
              >
                <IndianRupee className="h-4 w-4 mr-2" />
                Settle Payment (₹{unsettledAmount.toFixed(2)})
              </Button>
            )}
            {settlementReceipt && (
              <Button 
                variant="outline"
                onClick={() => onViewReceipt(settlementReceipt)}
              >
                <Receipt className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
            )}
          </div>

          {/* Products Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">All Products</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{format(new Date(product.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">{product.quantity} {product.unit}</TableCell>
                      <TableCell className="text-right">₹{product.price_per_unit.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{(product.quantity * product.price_per_unit).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={product.payment_status === 'settled' ? 'default' : 'destructive'}
                          className={product.payment_status === 'settled' ? 'bg-green-600' : ''}
                        >
                          {product.payment_status === 'settled' ? 'Settled' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
