import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCustomerCoupons } from '@/hooks/useCustomerCoupons';
import { ArrowLeft, CreditCard, ShoppingCart, Tag, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import PaymentMethods from '@/components/PaymentMethods';
import { placeOrder } from "@/api/orders";
import CustomerHeader from '@/components/CustomerHeader';
import Cart from '@/components/Cart';

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
    landmark: '',
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
    console.log('Customer data loaded:', customerData);
    setCustomer(customerData);
    
    // Validate customer ID
    if (!customerData.id || customerData.id.trim() === '') {
      console.error('Customer ID is missing or empty');
      toast({
        title: "Error",
        description: "Customer information is incomplete. Please log in again.",
        variant: "destructive"
      });
      navigate('/customer-login');
      return;
    }
    
    // Auto-fill shipping address with customer data including landmark
    setShippingAddress({
      fullName: customerData.name || '',
      mobile: customerData.mobile || '',
      address: customerData.address || '',
      landmark: customerData.landmark || '', // Auto-fill landmark from profile
      city: customerData.city || '',
      state: customerData.state || '',
      pincode: customerData.pincode || ''
    });
  }, [navigate, toast]);

  // Fetch coupons for the customer using their mobile number
  const { coupons: userCoupons, loading: couponsLoading } = useCustomerCoupons(
    customer ? customer.mobile : undefined
  );

  // Filter active coupons for this customer - include 'all' type and customer-specific coupons
  const activeCoupons = userCoupons.filter(coupon => {
    // Check if coupon is active and not expired
    if (!coupon.is_active || new Date(coupon.expiry_date) <= new Date()) {
      return false;
    }
    
    // Show coupons that are for 'all' users
    if (coupon.target_type === 'all') {
      return true;
    }
    
    // Show coupons specifically created for this customer's mobile number
    if (customer && coupon.target_type === 'customer' && coupon.target_user_id === customer.mobile) {
      return true;
    }
    
    // Show coupons for employees if this customer's mobile matches an employee
    if (customer && coupon.target_type === 'employee' && coupon.target_user_id === customer.mobile) {
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

  const handlePaymentMethodSelect = (method: string, appUrl?: string) => {
    setPaymentMethod(method);
    
    if (appUrl && method === 'upi') {
      toast({
        title: "UPI Payment",
        description: "Complete the payment in your UPI app and return here to confirm"
      });
    }
  };

  const handleQRPaymentComplete = async () => {
    // Automatically place order when QR payment is completed
    await handlePlaceOrder();
  };

  const handlePlaceOrder = async () => {
    if (!customer || !customer.id || customer.id.trim() === '') {
      toast({
        title: "Error",
        description: "Customer information is missing. Please log in again.",
        variant: "destructive"
      });
      navigate('/customer-login');
      return;
    }

    if (!shippingAddress.fullName.trim() || !shippingAddress.mobile.trim() || !shippingAddress.address.trim() || !shippingAddress.landmark.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping details including landmark",
        variant: "destructive"
      });
      return;
    }

    if (!shippingAddress.city.trim() || !shippingAddress.state.trim()) {
      toast({
        title: "Missing Location",
        description: "Please enter city and state information",
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

      console.log('Preparing order payload with customer ID:', customer.id);

      const orderPayload = {
        customerId: customer.id, // Ensure this is the UUID from the customer object
        shippingAddress,
        paymentMethod,
        couponCode: selectedCouponData?.code || null,
        subtotal: totalPrice,
        discount: calculateDiscount(),
        total: finalTotal,
        items,
      };

      console.log('Order payload prepared:', orderPayload);

      const result = await placeOrder(orderPayload);

      if (result.success) {
        clearCart();

        toast({
          title: "Order Placed Successfully!",
          description: `Your order has been placed.`
        });

        navigate('/customer-orders', {
          state: { newOrderId: result.id }
        });
      } else {
        console.error('Order placement failed:', result.error);
        toast({
          title: "Order Error",
          description: result.error || "Failed to place order.",
          variant: "destructive"
        });
      }
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
      <>
        <CustomerHeader />
        <div className="min-h-screen flex items-center justify-center p-4 pt-24">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">No Items in Cart</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Button onClick={() => navigate('/customer')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
        <Cart />
      </>
    );
  }

  return (
    <>
      <CustomerHeader />
      <div className="min-h-screen bg-muted/30 pt-20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/customer')}
              disabled={isProcessing}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
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
                    <div key={`${item.productId}-${item.size || 'no-size'}-${index}`} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        {item.size && <p className="text-xs text-blue-600">Size: {item.size}</p>}
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
                      <span>Coupon Discount:</span>
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
                    <p className="text-sm text-muted-foreground">Loading available coupons...</p>
                  </div>
                ) : activeCoupons.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-green-600 font-medium">
                      🎉 You have {activeCoupons.length} coupon{activeCoupons.length > 1 ? 's' : ''} available! 
                      {activeCoupons.length > 1 && ' (Select one to apply)'}
                    </p>
                    
                    {/* Show all available coupons */}
                    <div className="space-y-3">
                      <div className="grid gap-3">
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedCoupon === 'none' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedCoupon('none')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">No Coupon</span>
                            <div className="flex items-center gap-2">
                              {selectedCoupon === 'none' && (
                                <Badge variant="default" className="bg-blue-500">Selected</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {activeCoupons.map((coupon) => (
                          <div 
                            key={coupon.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedCoupon === coupon.id 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedCoupon(coupon.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-lg text-green-700">{coupon.code}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {coupon.discount_type === 'percentage' 
                                    ? `${coupon.discount_value}% OFF` 
                                    : `₹${coupon.discount_value} OFF`
                                  }
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {coupon.target_type}
                                </Badge>
                                {selectedCoupon === coupon.id && (
                                  <Badge variant="default" className="bg-green-500">Selected</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {coupon.discount_type === 'percentage' 
                                ? `Get ${coupon.discount_value}% discount on your order`
                                : `Get ₹${coupon.discount_value} off your order`
                              }
                              {coupon.max_discount_limit && coupon.discount_type === 'percentage' && 
                                ` (Max ₹${coupon.max_discount_limit})`
                              }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Valid until {new Date(coupon.expiry_date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {selectedCoupon && selectedCoupon !== 'none' && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              Coupon Applied: {activeCoupons.find(c => c.id === selectedCoupon)?.code}
                            </span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            You save ₹{calculateDiscount().toFixed(2)} on this order!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No active coupons available for your mobile number ({customer.mobile})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

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
                <div>
                  <Label htmlFor="landmark">Landmark *</Label>
                  <Input
                    id="landmark"
                    value={shippingAddress.landmark}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, landmark: e.target.value }))}
                    placeholder="Enter landmark (e.g., Near City Mall)"
                    disabled={isProcessing}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Enter pincode"
                      disabled={isProcessing}
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Enter state"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethods
                  total={finalTotal}
                  onPaymentMethodSelect={handlePaymentMethodSelect}
                  onQRPaymentComplete={handleQRPaymentComplete}
                  disabled={isProcessing}
                />
                {paymentMethod && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Payment method selected: {paymentMethod.toUpperCase()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Component */}
      <Cart />
    </>
  );
};

export default CustomerPayment;
