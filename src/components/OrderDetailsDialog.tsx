
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  Package,
  X,
  Printer
} from 'lucide-react';

interface OrderDetailsDialogProps {
  order: any;
  items: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  items,
  open,
  onOpenChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handlePrintInvoice = () => {
    const printContent = `
      <html>
        <head>
          <title>Invoice - Order #${order.id.slice(-8)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .invoice-title { font-size: 18px; color: #666; }
            .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .order-info div { flex: 1; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-amount { font-size: 18px; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">DostanFarms</div>
            <div class="invoice-title">Order Invoice</div>
          </div>
          
          <div class="order-info">
            <div>
              <strong>Order ID:</strong> #${order.id.slice(-8)}<br>
              <strong>Date:</strong> ${formatDate(order.created_at)}<br>
              <strong>Status:</strong> ${order.status || 'pending'}
            </div>
            <div>
              <strong>Payment Method:</strong> ${order.payment_method === 'upi' || order.payment_method === 'card' ? 'Online' : 'Cash'}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price_per_unit}</td>
                  <td>₹${(item.price_per_unit * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-amount">Total: ₹${Number(order.total).toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>Thank you for your order!</p>
            <p>DostanFarms - Fresh from Farm to You</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details - #{order.id.slice(-8)}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order ID:</span>
                <span className="font-mono text-sm">#{order.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(order.created_at)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(order.status || 'pending')}>
                  {order.status || 'pending'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <Badge variant="outline">
                  {order.payment_method === 'upi' || order.payment_method === 'card' ? 'Online' : 'Cash'}
                </Badge>
              </div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span>₹{Number(order.total).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} • Unit Price: ₹{item.price_per_unit}
                        </p>
                      </div>
                      <span className="font-medium">₹{(item.price_per_unit * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No items found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Print Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handlePrintInvoice}
              className="flex items-center gap-2 bg-agri-primary hover:bg-agri-secondary"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
