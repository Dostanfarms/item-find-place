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
import { useCustomers } from '@/hooks/useCustomers';
import { useEmployees } from '@/hooks/useEmployees';
import { useCustomerCoupons } from '@/hooks/useCustomerCoupons';
import { ArrowLeft, CreditCard, ShoppingCart, Tag, Smartphone, Search, Plus } from 'lucide-react';
import QRCode from 'react-qr-code';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface VerifiedUser {
  id: string;
  name: string;
  mobile: string;
  type: 'customer' | 'employee';
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { validateCouponForUser } = useCoupons();
  const { customers, addCustomer } = useCustomers();
  const { employees } = useEmployees();
  
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('none');
  const [showUPIScanner, setShowUPIScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Get cart data from navigation state
  const cartItems: CartItem[] = location.state?.cartItems || [];
  const originalSubtotal: number = location.state?.subtotal || 0;

  // Fetch coupons for the verified user (works for both customers and employees)
  const { coupons: userCoupons, loading: couponsLoading } = useCustomerCoupons(
    verifiedUser ? verifiedUser.mobile : undefined
  );

  // Filter active coupons for the specific user type
  const activeCoupons = userCoupons.filter(coupon => {
    if (!coupon.is_active || new Date(coupon.expiry_date) <= new Date()) {
      return false;
    }
    
    // Show coupons that are either for 'all' users OR specifically for this user type and mobile
    if (coupon.target_type === 'all') {
      return true;
    }
    
    if (verifiedUser && coupon.target_type === verifiedUser.type && coupon.target_user_id === verifiedUser.mobile) {
      return true;
    }
    
    return false;
  });

  useEffect(() => {
    // Show UPI scanner when UPI is selected
    setShowUPIScanner(paymentMethod === 'upi');
  }, [paymentMethod]);

  const handleVerifyMobile = async () => {
    if (!customerMobile.trim()) {
      toast({
        title: "Mobile number required",
        description: "Please enter a mobile number to verify",
        variant: "destructive"
      });
      return;
    }

    if (customerMobile.length !== 10) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      console.log('Verifying mobile number:', customerMobile);
      
      // First search in customers table
      const customer = customers.find(c => c.mobile === customerMobile);
      
      if (customer) {
        console.log('Customer found:', customer);
        setCustomerName(customer.name);
        setVerifiedUser({
          id: customer.id,
          name: customer.name,
          mobile: customer.mobile,
          type: 'customer'
        });
        toast({
          title: "Customer verified",
          description: `Welcome back, ${customer.name}! Loading your available coupons...`,
        });
        return;
      }

      // If not found in customers, search in employees table
      const employee = employees.find(e => e.phone === customerMobile);
      
      if (employee) {
        console.log('Employee found:', employee);
        setCustomerName(employee.name);
        setVerifiedUser({
          id: employee.id,
          name: employee.name,
          mobile: customerMobile,
          type: 'employee'
        });
        toast({
          title: "Employee verified",
          description: `Welcome, ${employee.name}! Loading your available coupons...`,
        });
        return;
      }

      // If not found in either table, offer to create new customer
      console.log('Mobile number not found in any table');
      setCustomerName('');
      setVerifiedUser(null);
      toast({
        title: "Mobile number not found",
        description: "This mobile number is not registered. You can create a new customer account.",
        variant: "destructive"
      });
      
    } catch (error) {
      console.error('Error verifying mobile:', error);
      setCustomerName('');
      setVerifiedUser(null);
      toast({
        title: "Verification failed",
        description: "Failed to verify mobile number. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter customer name to create account",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingCustomer(true);

    try {
      console.log('Creating new customer:', { name: customerName, mobile: customerMobile });
      
      const result = await addCustomer({
        name: customerName,
        mobile: customerMobile,
        email: null,
        address: null,
        pincode: null,
        password: 'defaultPassword123',
        profile_photo: null
      });

      if (result.success) {
        console.log('Customer created successfully:', result.data);
        setVerifiedUser({
          id: result.data.id,
          name: result.data.name,
          mobile: result.data.mobile,
          type: 'customer'
        });
        toast({
          title: "Customer created",
          description: `Customer account created for ${customerName}`,
        });
      } else {
        console.error('Failed to create customer:', result.error);
        toast({
          title: "Failed to create customer",
          description: "Could not create customer account. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer account.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleMobileChange = (value: string) => {
    // Only allow numeric input and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setCustomerMobile(numericValue);
    
    // Reset verification status when mobile number changes
    if (verifiedUser) {
      setVerifiedUser(null);
      setCustomerName('');
    }
  };

  const calculateDiscount = () => {
    if (!selectedCoupon || selectedCoupon === 'none') return 0;
    
    const coupon = activeCoupons.find(c => c.id === selectedCoupon);
    if (!coupon) return 0;
    
    let discount = 0;
    
    if (coupon.discount_type === 'percentage') {
      discount = (originalSubtotal * coupon.discount_value) / 100;
    } else if (coupon.discount_type === 'fixed') {
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

    // Validate coupon if one is selected
    if (selectedCoupon && selectedCoupon !== 'none' && verifiedUser) {
      const selectedCouponData = activeCoupons.find(c => c.id === selectedCoupon);
      if (selectedCouponData) {
        const validation = await validateCouponForUser(
          selectedCouponData.code,
          verifiedUser.mobile,
          verifiedUser.type
        );

        if (!validation.success) {
          toast({
            title: "Invalid coupon",
            description: validation.error,
            variant: "destructive"
          });
          return;
        }
      }
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
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/sales')}
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Details & Payment */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerMobile">Mobile Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="customerMobile"
                      value={customerMobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      disabled={isProcessing}
                      maxLength={10}
                      className={verifiedUser ? "border-green-500" : ""}
                    />
                    <Button
                      onClick={handleVerifyMobile}
                      disabled={isVerifying || isProcessing || customerMobile.length !== 10}
                      variant="outline"
                      className="shrink-0"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                  {verifiedUser && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {verifiedUser.type === 'customer' ? 'Customer' : 'Employee'} verified
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={verifiedUser ? "Auto-filled from database" : "Enter customer name"}
                      disabled={isProcessing || !!verifiedUser}
                      className={verifiedUser ? "border-green-500 bg-green-50" : ""}
                    />
                    {!verifiedUser && customerMobile.length === 10 && customerName.trim() && (
                      <Button
                        onClick={handleCreateCustomer}
                        disabled={isCreatingCustomer || isProcessing}
                        variant="outline"
                        className="shrink-0"
                      >
                        {isCreatingCustomer ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {!verifiedUser && customerMobile.length === 10 && (
                    <p className="text-sm text-blue-600 mt-1">
                      Enter name and click Create to add new customer
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

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
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>

                {/* UPI Scanner */}
                {showUPIScanner && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-600">Scan QR Code to Pay</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg inline-block">
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
                    {verifiedUser ? `No coupons available for your ${verifiedUser.type} account` : 'Verify mobile number to see available coupons'}
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
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex justify-between items-center p-3 bg-muted rounded-lg">
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
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
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
