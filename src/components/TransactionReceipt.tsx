
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
    // Create a new window for printing with proper styling
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 400px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .store-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .store-info {
              font-size: 12px;
              color: #666;
            }
            .transaction-details {
              margin-bottom: 20px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 14px;
            }
            .items-section {
              border-top: 1px solid #ccc;
              padding-top: 15px;
              margin-bottom: 20px;
            }
            .items-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
            .item {
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px dotted #ccc;
            }
            .item-name {
              font-weight: bold;
            }
            .item-details {
              font-size: 12px;
              color: #666;
              display: flex;
              justify-content: space-between;
            }
            .totals-section {
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
              padding-top: 5px;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            .discount {
              color: #008000;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">AgriPay Store</div>
            <div class="store-info">Fresh Products & More</div>
            <div class="store-info">Phone: +91 9876543210</div>
          </div>
          
          <div class="transaction-details">
            <div class="detail-row">
              <span><strong>Receipt #:</strong></span>
              <span>${transaction.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Date & Time:</strong></span>
              <span>${new Date(transaction.timestamp).toLocaleString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</span>
            </div>
            <div class="detail-row">
              <span><strong>Customer:</strong></span>
              <span>${transaction.customerName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Mobile:</strong></span>
              <span>${transaction.customerMobile}</span>
            </div>
            <div class="detail-row">
              <span><strong>Payment Method:</strong></span>
              <span style="text-transform: capitalize">${transaction.paymentMethod}</span>
            </div>
          </div>

          <div class="items-section">
            <div class="items-title">Items Purchased</div>
            ${transaction.items.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                  <span>${item.quantity} × ₹${item.price.toFixed(2)} per ${item.unit}</span>
                  <span><strong>₹${(item.price * item.quantity).toFixed(2)}</strong></span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${transaction.subtotal.toFixed(2)}</span>
            </div>
            ${transaction.discount > 0 ? `
              <div class="total-row discount">
                <span>Discount ${transaction.couponUsed ? `(${transaction.couponUsed})` : ''}:</span>
                <span>-₹${transaction.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row final-total">
              <span>Total Amount:</span>
              <span>₹${transaction.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>Please visit again</p>
            <p style="margin-top: 15px;">*** This is a computer generated receipt ***</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
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
        <div className="flex gap-4 mt-6">
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
    </div>
  );
};

export default TransactionReceipt;
