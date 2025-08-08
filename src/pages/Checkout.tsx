
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCart } from '@/contexts/CartContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Phone, User, CreditCard, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PaymentMethods from '@/components/PaymentMethods';
import TransactionReceipt from '@/components/TransactionReceipt';
import FixedHeader from '@/components/layout/FixedHeader';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  pincode?: string;
}

const Checkout = () => {
  const { items, clearCart, getTotalPrice } = useCart();
  const { customers, addCustomer } = useCustomers();
  const { addTransaction } = useTransactions();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customerMobile, setCustomerMobile] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/pos');
    }
  }, [items, navigate]);

  const verifyCustomer = async () => {
    if (!customerMobile || customerMobile.length < 10) {
      toast({
        title: "Invalid Mobile",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const foundCustomer = customers.find(c => c.mobile === customerMobile);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setShowCreateCustomer(false);
        toast({
          title: "Customer Found",
          description: `Welcome back, ${foundCustomer.name}!`
        });
      } else {
        setCustomer(null);
        setShowCreateCustomer(true);
        toast({
          title: "Customer Not Found",
          description: "Would you like to create a new customer account?",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error verifying customer:', error);
      toast({
        title: "Error",
        description: "Failed to verify customer",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const createNewCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the customer name",
        variant: "destructive"
      });
      return;
    }

    try {
      const customerData = {
        name: newCustomerName.trim(),
        mobile: customerMobile,
        email: '',
        address: '',
        pincode: '',
        password: Math.random().toString(36).substring(7), // Generate temporary password
        profile_photo: ''
      };

      const result = await addCustomer(customerData);
      if (result.success) {
        setCustomer({
          id: result.data.id,
          name: newCustomerName.trim(),
          mobile: customerMobile
        });
        setShowCreateCustomer(false);
        setNewCustomerName('');
        toast({
          title: "Customer Created",
          description: "New customer account created successfully!"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create customer account",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer account",
        variant: "destructive"
      });
    }
  };

  const processPayment = async () => {
    if (!customer) {
      toast({
        title: "Customer Required",
        description: "Please verify or create a customer account first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const transactionData = {
        customer_name: customer.name,
        customer_mobile: customer.mobile,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.pricePerUnit,
          quantity: item.quantity
        })),
        subtotal: getTotalPrice(),
        discount: 0,
        total: getTotalPrice(),
        coupon_used: null,
        payment_method: paymentMethod,
        status: 'completed'
      };

      const result = await addTransaction(transactionData);
      if (result.success) {
        setTransactionId(result.data.id);
        setShowReceipt(true);
        clearCart();
        toast({
          title: "Payment Successful",
          description: "Transaction completed successfully!"
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Transaction failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangePhoto = () => {
    // Implement photo change logic
    console.log('Change photo clicked');
  };

  const handleChangePassword = () => {
    // Implement password change logic
    console.log('Change password clicked');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="flex-1 p-6 pt-20">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your transaction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      maxLength={10}
                      disabled={!!customer}
                    />
                  </div>
                  <Button 
                    onClick={verifyCustomer}
                    disabled={!customerMobile || customerMobile.length < 10 || isVerifying || !!customer}
                    className="mt-6"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>

                {customer && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Mobile: {customer.mobile}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setCustomer(null);
                        setCustomerMobile('');
                        setShowCreateCustomer(false);
                      }}
                    >
                      Change Customer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create New Customer Dialog */}
            <Dialog open={showCreateCustomer} onOpenChange={setShowCreateCustomer}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <Input value={customerMobile} disabled />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateCustomer(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={createNewCustomer}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Create Customer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethods
                  total={getTotalPrice()}
                  onPaymentMethodSelect={(method) => setPaymentMethod(method)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.pricePerUnit} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">₹{(item.pricePerUnit * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={processPayment}
                  disabled={!customer || isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${getTotalPrice().toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Receipt Dialog */}
        <TransactionReceipt
          open={showReceipt}
          onOpenChange={(open) => {
            setShowReceipt(open);
            if (!open) {
              navigate('/pos');
            }
          }}
          transactionId={transactionId}
          customer={customer}
          items={items}
          total={getTotalPrice()}
          paymentMethod={paymentMethod}
        />
      </div>
    </div>
  );
};

export default Checkout;
