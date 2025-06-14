
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { useCoupons } from '@/hooks/useCoupons';
import { ArrowLeft, CreditCard, ShoppingCart, Tag, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { coupons, loading: couponsLoading } = useCoupons();
  
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('none');
  const [showUPIScanner, setShowUPIScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get cart data from navigation state
  const cartItems: CartItem[] = location.state?.cartItems || [];
  const originalSubtotal: number = location.state?.subtotal || 0;

  // Filter active coupons
  const activeCoupons = coupons.filter(coupon => 
    coupon.is_active && new Date(coupon.expiry_date) > new Date()
  );

  useEffect(() => {
    // Show UPI scanner when UPI is selected
    setShowUPIScanner(paymentMethod === 'upi');
  }, [paymentMethod]);

  const calculateDiscount = () => {
    if (!selectedCoupon || selectedCoupon === 'none') return 0;
    
    const coupon = activeCoupons.find(c => c.id === selectedCoupon);
    if (!coupon) return 0;
    
    let discount = 0;
    
    if (coupon.discount_type === 'percentage') {
      discount = (originalSubtotal * coupon.discount_value) / 100;
    } else if (coupon.discount_type === 'flat') {
      discount = coupon.discount_value;
    }
    
    // Apply max discount limit if set
    if (coupon.max_discount_limit && discount > coupon.max_discount_limit) {
      discount = coupon.max_discount_limit;
    }
    
    return Math.min(discount, originalSubtotal); // Don't let discount exceed subtotal
  };

  const finalTotal = originalSubtotal - calculateDiscount();

  const handlePayment = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter customer name",
        variant: "destructive"
      });
      return;
    }

    if (!customerMobile.trim()) {
      toast({
        title: "Mobile number required",
        description: "Please enter customer mobile number",
        variant: "destructive"
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const selectedCouponData = selectedCoupon && selectedCoupon !== 'none' ? 
        activeCoupons.find(c => c.id === selectedCoupon) : null;

      // Create transaction data for Supabase
      const transactionData = {
        customer_name: customerName,
        customer_mobile: customerMobile,
        items: cartItems,
        subtotal: originalSubtotal,
        discount: calculateDiscount(),
        total: finalTotal,
        coupon_used: selectedCouponData?.code || null,
        payment_method: paymentMethod,
        status: 'completed'
      };

      console.log('Saving transaction to Supabase:', transactionData);

      // Save transaction to Supabase
      const result = await addTransaction(transactionData);

      if (result.success) {
        console.log('Transaction saved successfully to Supabase');
        
        // Also save to localStorage for backward compatibility
        const localTransaction = {
          id: result.data.id,
          customerName,
          customerMobile,
          items: cartItems,
          subtotal: originalSubtotal,
          discount: calculateDiscount(),
          total: finalTotal,
          couponUsed: selectedCouponData?.code || null,
          paymentMethod,
          timestamp: new Date().toISOString(),
          status: 'completed'
        };

        const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        existingTransactions.push(localTransaction);
        localStorage.setItem('transactions', JSON.stringify(existingTransactions));

        toast({
          title: "Payment successful",
          description: "Transaction completed and saved successfully",
        });

        // Navigate to receipt page
        navigate('/order-receipt', {
          state: { transaction: localTransaction }
        });
      } else {
        console.error('Failed to save transaction:', result.error);
        toast({
          title: "Error saving transaction",
          description: result.error || "Failed to save transaction. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Items Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">No items were found for checkout.</p>
            <Button onClick={() => navigate('/sales')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/sales')}
            disabled={isProcessing}
            className="shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Payment</h1>
            <p className="text-gray-600">Complete your transaction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Details & Payment */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    disabled={isProcessing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerMobile" className="text-sm font-medium text-gray-700">Mobile Number</Label>
                  <Input
                    id="customerMobile"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    disabled={isProcessing}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="card">💳 Card</SelectItem>
                    <SelectItem value="upi">📱 UPI</SelectItem>
                  </SelectContent>
                </Select>

                {/* UPI Scanner */}
                {showUPIScanner && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-600">Scan QR Code to Pay</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                      <QRCode
                        value={`upi://pay?pa=merchant@upi&pn=${customerName}&am=${finalTotal}&cu=INR&tn=Payment for Order ${Date.now()}`}
                        size={200}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Amount: ₹{finalTotal.toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Apply Coupon
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
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
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCoupon && selectedCoupon !== 'none' && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            Coupon Applied: {activeCoupons.find(c => c.id === selectedCoupon)?.code}
                          </span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          You saved ₹{calculateDiscount().toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active coupons available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">₹{item.price} × {item.quantity}</p>
                      </div>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{originalSubtotal.toFixed(2)}</span>
                  </div>
                  
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg py-6 shadow-lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Complete Payment'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
