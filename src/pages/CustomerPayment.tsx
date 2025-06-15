
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCustomerCoupons } from '@/hooks/useCustomerCoupons';
import { ArrowLeft, CreditCard, ShoppingCart, Tag, MapPin, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CustomerPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  
  const [customer, setCustomer] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get customer data from localStorage
  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (!currentCustomer) {
      navigate('/customer-login');
      return;
    }
    const customerData = JSON.parse(currentCustomer);
    setCustomer(customerData);
    
    // Pre-fill shipping address with customer data
    setShippingAddress({
      fullName: customerData.name || '',
      mobile: customerData.mobile || '',
      address: customerData.address || '',
      city: '',
      state: '',
      pincode: customerData.pincode || ''
    });
  }, [navigate]);

  // Fetch coupons for the customer
  const { coupons: userCoupons, loading: couponsLoading } = useCustomerCoupons(
    customer ? customer.mobile : undefined
  );

  // Filter active coupons for this customer
  const activeCoupons = userCoupons.filter(coupon => {
    if (!coupon.is_active || new Date(coupon.expiry_date) <= new Date()) {
      return false;
    }
    
    // Show coupons that are either for 'all' users OR specifically for this customer's mobile
    if (coupon.target_type === 'all') {
      return true;
    }
    
    if (customer && coupon.target_type === 'customer' && coupon.target_user_id === customer.mobile) {
      return true;
    }
    
    return false;
  });

  const calculateDiscount = () => {
    if (!selectedCoupon || selectedCoupon === 'none') return 0;
    
    const coupon = activeCoupons.find(c => c.id === selectedCoupon);
    if (!coupon) return 0;
    
    let discount = 0;
    
    if (coupon.discount_type === 'percentage') {
      discount = (totalPrice * coupon.discount_value) / 100;
    } else if (coupon.discount_type === 'fixed') {
      discount = coupon.discount_value;
    }
    
    // Apply max discount limit if set
    if (coupon.max_discount_limit && discount > coupon.max_discount_limit) {
      discount = coupon.max_discount_limit;
    }
    
    return Math.min(discount, totalPrice); // Don't let discount exceed subtotal
  };

  const finalTotal = totalPrice - calculateDiscount();

  const handlePlaceOrder = async () => {
    if (!shippingAddress.fullName.trim() || !shippingAddress.mobile.trim() || !shippingAddress.address.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping details",
        variant: "destructive"
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const selectedCouponData = selectedCoupon && selectedCoupon !== 'none' ? 
        activeCoupons.find(c => c.id === selectedCoupon) : null;

      // Create order data
      const orderData = {
        id: Date.now().toString(),
        customerId: customer.id,
        customerName: customer.name,
        customerMobile: customer.mobile,
        items: items,
        subtotal: totalPrice,
        discount: calculateDiscount(),
        total: finalTotal,
        couponUsed: selectedCouponData?.code || null,
        paymentMethod,
        shippingAddress,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      console.log('Creating order:', orderData);

      // Save order to localStorage (in a real app, this would go to a backend)
      const existingOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('customerOrders', JSON.stringify(existingOrders));

      // Clear cart
      clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${orderData.id} has been placed.`
      });

      // Navigate to order confirmation or order history
      navigate('/customer-orders', {
        state: { newOrder: orderData }
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!customer) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Items in Cart</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Button onClick={() => navigate('/customer-home')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/customer-home')}
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipping & Payment Details */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter full name"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                      id="mobile"
                      value={shippingAddress.mobile}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, mobile: e.target.value }))}
                      placeholder="Enter mobile number"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter complete address"
                    disabled={isProcessing}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Enter state"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Enter pincode"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Coupons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Apply Coupon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {couponsLoading ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Loading coupons...</p>
                  </div>
                ) : activeCoupons.length > 0 ? (
                  <div className="space-y-3">
                    <Select value={selectedCoupon} onValueChange={setSelectedCoupon} disabled={isProcessing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a coupon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No coupon</SelectItem>
                        {activeCoupons.map((coupon) => (
                          <SelectItem key={coupon.id} value={coupon.id}>
                            <div className="flex items-center gap-2">
                              <span>{coupon.code}</span>
                              <Badge variant="secondary" className="text-xs">
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                              </Badge>
                              {coupon.target_type !== 'all' && (
                                <Badge variant="outline" className="text-xs">
                                  {coupon.target_type}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCoupon && selectedCoupon !== 'none' && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            Coupon Applied: {activeCoupons.find(c => c.id === selectedCoupon)?.code}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No coupons available for your account
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">₹{item.pricePerUnit} × {item.quantity}</p>
                      </div>
                      <span className="font-medium">₹{(item.pricePerUnit * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayment;
