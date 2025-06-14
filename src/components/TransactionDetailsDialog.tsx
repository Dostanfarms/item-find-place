
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, User, Calendar, CreditCard, Package } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Transaction {
  id: string;
  customer_name: string;
  customer_mobile: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_used: string | null;
  payment_method: string;
  status: string;
  created_at: string;
}

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransactionDetailsDialog: React.FC<TransactionDetailsDialogProps> = ({
  transaction,
  open,
  onOpenChange,
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Transaction Receipt - ${transaction.id}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: white;
              }
              .receipt-container { 
                max-width: 600px; 
                margin: 0 auto; 
                border: 1px solid #ddd; 
                padding: 20px;
                background: white;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #000; 
                padding-bottom: 15px; 
                margin-bottom: 20px; 
              }
              .store-name { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 5px; 
              }
              .store-info { 
                font-size: 14px; 
                color: #666; 
              }
              .section { 
                margin-bottom: 20px; 
              }
              .section-title { 
                font-weight: bold; 
                font-size: 16px; 
                margin-bottom: 10px; 
                border-bottom: 1px solid #eee; 
                padding-bottom: 5px; 
              }
              .customer-details { 
                background: #f9f9f9; 
                padding: 10px; 
                border-radius: 5px; 
              }
              .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 15px; 
              }
              .items-table th, .items-table td { 
                padding: 8px; 
                text-align: left; 
                border-bottom: 1px solid #ddd; 
              }
              .items-table th { 
                background: #f5f5f5; 
                font-weight: bold; 
              }
              .total-section { 
                border-top: 2px solid #000; 
                padding-top: 10px; 
              }
              .total-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 5px; 
              }
              .final-total { 
                font-weight: bold; 
                font-size: 18px; 
                border-top: 1px solid #000; 
                padding-top: 10px; 
                margin-top: 10px; 
              }
              .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 15px; 
                border-top: 1px solid #ddd; 
                font-size: 12px; 
                color: #666; 
              }
              @media print {
                body { margin: 0; padding: 10px; }
                .receipt-container { border: none; padding: 0; max-width: none; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="store-name">Dostan Farms</div>
                <div class="store-info">Fresh Farm Products</div>
                <div class="store-info">Phone: +91 12345 67890</div>
              </div>

              <div class="section">
                <div class="section-title">Transaction Details</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span><strong>Transaction ID:</strong></span>
                  <span>${transaction.id.slice(0, 8)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span><strong>Date & Time:</strong></span>
                  <span>${format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span><strong>Status:</strong></span>
                  <span>${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Customer Details</div>
                <div class="customer-details">
                  <div style="margin-bottom: 5px;"><strong>Name:</strong> ${transaction.customer_name}</div>
                  <div style="margin-bottom: 5px;"><strong>Mobile:</strong> ${transaction.customer_mobile}</div>
                  <div><strong>Payment Method:</strong> ${transaction.payment_method.toUpperCase()}</div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Items Purchased</div>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Array.isArray(transaction.items) ? transaction.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                        <td style="text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    `).join('') : '<tr><td colspan="4">No items found</td></tr>'}
                  </tbody>
                </table>
              </div>

              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>₹${Number(transaction.subtotal).toFixed(2)}</span>
                </div>
                ${Number(transaction.discount) > 0 ? `
                <div class="total-row" style="color: green;">
                  <span>Discount ${transaction.coupon_used ? `(${transaction.coupon_used})` : ''}:</span>
                  <span>-₹${Number(transaction.discount).toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="total-row final-total">
                  <span>Total Paid:</span>
                  <span>₹${Number(transaction.total).toFixed(2)}</span>
                </div>
              </div>

              <div class="footer">
                <p>Thank you for shopping with us!</p>
                <p>Visit again for fresh farm products</p>
              </div>
            </div>
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert('Unable to open print window. Please check your browser settings.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Transaction Details - #{transaction.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Transaction ID</span>
                <p className="font-mono text-sm">{transaction.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Date & Time</span>
                <p>{format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <p className="capitalize">{transaction.status}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Customer Name</span>
                <p>{transaction.customer_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Mobile Number</span>
                <p>{transaction.customer_mobile}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                <p className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  {transaction.payment_method.toUpperCase()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Items Purchased */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Item Name</th>
                      <th className="text-center p-2">Quantity</th>
                      <th className="text-right p-2">Unit Price</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(transaction.items) && transaction.items.length > 0 ? (
                      transaction.items.map((item: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{item.name}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
                          <td className="p-2 text-right">₹{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{Number(transaction.subtotal).toFixed(2)}</span>
                </div>
                {Number(transaction.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {transaction.coupon_used ? `(${transaction.coupon_used})` : ''}:</span>
                    <span>-₹{Number(transaction.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Paid:</span>
                  <span>₹{Number(transaction.total).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsDialog;
