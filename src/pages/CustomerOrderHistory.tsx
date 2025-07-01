
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  ChevronLeft, 
  Eye
} from 'lucide-react';
import { fetchCustomerOrders } from '@/api/orders';
import CustomerHeader from '@/components/CustomerHeader';
import OrderSummaryDialog from '@/components/OrderSummaryDialog';
import { useToast } from '@/hooks/use-toast';

const CustomerOrderHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (currentCustomer) {
      setCustomer(JSON.parse(currentCustomer));
    } else {
      navigate('/customer-login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!customer) return;

    const loadOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching orders for customer:', customer.id);
        
        const { orders, error } = await fetchCustomerOrders(customer.id);
        
        if (error) {
          console.error('Error fetching orders:', error);
          return;
        }

        console.log('Orders fetched:', orders);
        setOrders(orders || []);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [customer]);

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
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <CustomerHeader />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-20 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/customer')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-agri-primary" />
              <span className="text-lg font-bold">My Orders</span>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="text-muted-foreground">Loading your orders...</div>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  You haven't placed any orders yet
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/customer/products')}
                >
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">
                          #{order.id.slice(-8)}
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status || 'pending')}>
                            {order.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {order.payment_method === 'upi' || order.payment_method === 'card' ? 'Online' : 'Cash'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{Number(order.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Order Summary Dialog */}
      <OrderSummaryDialog
        order={selectedOrder}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default CustomerOrderHistory;
