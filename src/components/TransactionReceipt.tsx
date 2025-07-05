
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, ShoppingBag } from 'lucide-react';

interface TransactionReceiptProps {
  transaction: {
    id: string;
    customerName: string;
    customerMobile: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      unit: string;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    couponUsed?: string;
    paymentMethod: string;
    timestamp: string;
  };
  onNewSale: () => void;
  onBackToSales: () => void;
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  transaction,
  onNewSale,
  onBackToSales
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Print-friendly receipt */}
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl font-bold">AgriPay Store</CardTitle>
            <p className="text-sm text-muted-foreground">Fresh Products & More</p>
            <p className="text-xs text-muted-foreground">Phone: +91 9876543210</p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Transaction Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Receipt #:</span>
                <span className="font-mono">{transaction.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Date & Time:</span>
                <span>{formatDateTime(transaction.timestamp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Customer:</span>
                <span>{transaction.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Mobile:</span>
                <span>{transaction.customerMobile}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Payment Method:</span>
                <span className="capitalize">{transaction.paymentMethod}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Items Purchased</h3>
              <div className="space-y-2">
                {transaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.quantity} × ₹{item.price.toFixed(2)} per {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{transaction.subtotal.toFixed(2)}</span>
              </div>
              
              {transaction.discount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {transaction.couponUsed ? `(${transaction.couponUsed})` : ''}:</span>
                    <span>-₹{transaction.discount.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{transaction.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
              <p>Thank you for shopping with us!</p>
              <p>Please visit again</p>
              <p className="mt-2">*** This is a computer generated receipt ***</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          
          <Button
            onClick={onNewSale}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionReceipt;
