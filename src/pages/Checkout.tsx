import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check, ShoppingCart } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCoupons } from '@/hooks/useCoupons';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import TransactionReceipt from '@/components/TransactionReceipt';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isVerified, setIsVerified] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  
  const { customers } = useCustomers();
  const { coupons } = useCoupons();
  const { addTransaction } = useTransactions();

  useEffect(() => {
    // Load cart items from localStorage
    const storedItems = localStorage.getItem('checkoutItems');
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      // If no items, redirect back to sales
      navigate('/sales');
    }
  }, [navigate]);

  // Load all active coupons
  useEffect(() => {
    const activeCoupons = coupons.filter(coupon => 
      coupon.is_active && 
      new Date(coupon.expiry_date) > new Date()
    );
    setAvailableCoupons(activeCoupons);
  }, [coupons]);

  const handleVerifyCustomer = () => {
    if (!customerMobile.trim()) {
      toast({
        title: "Missing Mobile Number",
        description: "Please enter a mobile number to verify",
        variant: "destructive",
      });
      return;
    }

    const customer = customers.find(c => c.mobile === customerMobile);
    
    if (customer) {
      setCustomerName(customer.name);
      setIsVerified(true);
      
      // Filter coupons for this customer (including 'all' target type and specific customer coupons)
      const customerCoupons = coupons.filter(coupon => 
        coupon.is_active && 
        new Date(coupon.expiry_date) > new Date() &&
        (coupon.target_type === 'all' || 
         (coupon.target_type === 'customer' && coupon.target_user_id === customer.mobile))
      );
      
      setAvailableCoupons(customerCoupons);
      
      toast({
        title: "Customer Verified",
        description: `Welcome ${customer.name}!`,
      });
    } else {
      toast({
        title: "Customer Not Found",
        description: "No customer found with this mobile number",
        variant: "destructive",
      });
    }
  };

  const handleCouponChange = (couponCode: string) => {
    setSelectedCoupon(couponCode);
    
    if (couponCode) {
      const coupon = availableCoupons.find(c => c.code === couponCode);
      if (coupon) {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountAmount = 0;
        
        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * coupon.discount_value) / 100;
        } else {
          discountAmount = coupon.discount_value;
        }
        
        // Apply max discount limit if set
        if (coupon.max_discount_limit && discountAmount > coupon.max_discount_limit) {
          discountAmount = coupon.max_discount_limit;
        }
        
        setDiscount(discountAmount);
      }
    } else {
      setDiscount(0);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - discount;

  const handleCompleteTransaction = async () => {
    if (!customerName.trim() || !customerMobile.trim()) {
      toast({
        title: "Missing Information",
        description: "Please verify customer details",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      customer_name: customerName,
      customer_mobile: customerMobile,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      discount,
      total,
      coupon_used: selectedCoupon || null,
      payment_method: paymentMethod,
      status: 'completed'
    };

    const result = await addTransaction(transactionData);
    
    if (result.success) {
      // Create transaction object for receipt
      const transaction = {
        id: result.data.id,
        customerName,
        customerMobile,
        items,
        subtotal,
        discount,
        total,
        couponUsed: selectedCoupon,
        paymentMethod,
        timestamp: new Date().toISOString()
      };
      
      setCompletedTransaction(transaction);
      setShowReceipt(true);
      
      // Clear checkout items
      localStorage.removeItem('checkoutItems');
      
      toast({
        title: "Transaction Completed",
        description: `Sale completed successfully. Total: ₹${total.toFixed(2)}`,
      });
    } else {
      toast({
        title: "Transaction Failed",
        description: result.error || "Failed to complete transaction",
        variant: "destructive",
      });
    }
  };

  const handleBackToSales = () => {
    // Keep items in localStorage when going back to sales
    navigate('/sales', { state: { fromCheckout: true } });
  };

  // Show receipt if transaction is completed
  if (showReceipt && completedTransaction) {
    return (
      <TransactionReceipt 
        transaction={completedTransaction}
        onNewSale={() => {
          setShowReceipt(false);
          setCompletedTransaction(null);
          navigate('/sales');
        }}
        onBackToSales={() => navigate('/sales')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToSales}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete the transaction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer & Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="Enter mobile number"
                      disabled={isVerified}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleVerifyCustomer}
                      disabled={isVerified}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isVerified ? <Check className="h-4 w-4" /> : 'Verify'}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name"
                    disabled={isVerified}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Coupon Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Apply Coupon</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCoupon} onValueChange={handleCouponChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coupon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No coupon</SelectItem>
                    {availableCoupons.map((coupon) => (
                      <SelectItem key={coupon.id} value={coupon.code}>
                        {coupon.code} - {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}% off` 
                          : `₹${coupon.discount_value} off`}
                        {coupon.target_type === 'customer' && ' (Personal)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableCoupons.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No active coupons available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items with Scroll */}
              <div className="max-h-80 overflow-y-auto">
                <ScrollArea className="h-full">
                  <div className="space-y-2 pr-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">
                            {item.quantity} × ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handleCompleteTransaction}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!customerName.trim() || !customerMobile.trim()}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Complete Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
