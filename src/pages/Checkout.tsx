
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, User, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import PaymentMethods from '@/components/PaymentMethods';
import TransactionReceipt from '@/components/TransactionReceipt';
import { useCustomers } from '@/hooks/useCustomers';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import FixedHeader from '@/components/layout/FixedHeader';
import ProfileChangeDialog from '@/components/profile/ProfileChangeDialog';

interface Customer {
  id: string;
  name: string;
  mobile_number: string;
  email?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { customers, addCustomer } = useCustomers();
  const { addTransaction } = useTransactions();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [mobile, setMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileMode, setProfileMode] = useState<'photo' | 'password'>('photo');

  const handleChangePhoto = () => {
    setProfileMode('photo');
    setShowProfileDialog(true);
  };

  const handleChangePassword = () => {
    setProfileMode('password');
    setShowProfileDialog(true);
  };

  const searchCustomer = () => {
    if (!mobile.trim()) {
      toast({
        title: "Error",
        description: "Please enter a mobile number",
        variant: "destructive"
      });
      return;
    }

    const foundCustomer = customers.find(c => c.mobile_number === mobile);
    if (foundCustomer) {
      setCustomer(foundCustomer);
      setShowCreateCustomer(false);
      toast({
        title: "Customer Found",
        description: `Welcome back, ${foundCustomer.name}!`,
      });
    } else {
      setCustomer(null);
      setShowCreateCustomer(true);
      toast({
        title: "Customer Not Found",
        description: "Please create a new customer account",
        variant: "destructive"
      });
    }
  };

  const createCustomer = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter customer name",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingCustomer(true);
    try {
      const customerData = {
        name: customerName,
        mobile_number: mobile,
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        date_of_birth: null,
        gender: 'other',
        branch_id: currentUser?.branch_id || null,
        is_active: true
      };

      const result = await addCustomer(customerData);
      if (result.success && result.data) {
        const newCustomer = {
          id: result.data.id,
          name: result.data.name,
          mobile_number: result.data.mobile_number,
          email: result.data.email
        };
        
        setCustomer(newCustomer);
        setShowCreateCustomer(false);
        setCustomerName('');
        
        toast({
          title: "Success",
          description: "Customer created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create customer",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive"
      });
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleCheckout = async () => {
    if (!customer) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive"
      });
      return;
    }

    try {
      const transactionData = {
        customer_id: customer.id,
        employee_id: currentUser?.id || '',
        branch_id: currentUser?.branch_id || '',
        transaction_type: 'sale' as const,
        total_amount: getTotalPrice(),
        payment_method: paymentMethod,
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          category: item.category || '',
          sub_category: item.subCategory || ''
        })),
        status: 'completed',
        payment_status: 'paid'
      };

      const result = await addTransaction(transactionData);
      
      if (result.success && result.data) {
        setTransactionId(result.data.id);
        setShowReceipt(true);
        clearCart();
        
        toast({
          title: "Success",
          description: "Transaction completed successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to complete transaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to complete checkout",
        variant: "destructive"
      });
    }
  };

  if (items.length === 0 && !showReceipt) {
    return (
      <div className="pt-20">
        <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items in cart</h3>
            <p className="mt-1 text-sm text-gray-500">Add some products to get started.</p>
            <Button onClick={() => navigate('/products')} className="mt-4">
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                  />
                </div>
                <Button onClick={searchCustomer} className="mt-6">
                  Search
                </Button>
              </div>

              {customer && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.mobile_number}</p>
                  {customer.email && (
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  )}
                </div>
              )}

              {showCreateCustomer && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-3">
                  <h4 className="font-medium">Create New Customer</h4>
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <Button 
                    onClick={createCustomer}
                    disabled={isCreatingCustomer}
                    className="w-full"
                  >
                    {isCreatingCustomer ? 'Creating...' : 'Create Customer'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize || 'no-size'}`} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ₹{item.price}
                        {item.selectedSize && ` (${item.selectedSize})`}
                      </p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
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

        {/* Checkout Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleCheckout}
            disabled={!customer || items.length === 0}
            size="lg"
            className="min-w-40"
          >
            Complete Order
          </Button>
        </div>

        <TransactionReceipt
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            navigate('/sales');
          }}
          transactionId={transactionId}
          customer={customer!}
          items={items}
          total={getTotalPrice()}
          paymentMethod={paymentMethod}
        />

        <ProfileChangeDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          mode={profileMode}
        />
      </div>
    </div>
  );
};

export default Checkout;
