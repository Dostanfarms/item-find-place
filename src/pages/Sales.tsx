
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ShoppingCart, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import ProtectedAction from '@/components/ProtectedAction';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Sales = () => {
  const { products } = useProducts();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter out inactive products
  const activeProducts = products.filter(product => product.is_active !== false);

  const filteredProducts = activeProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
    if (!hasPermission('sales', 'create')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create sales",
        variant: "destructive"
      });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    if (!hasPermission('sales', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit sales",
        variant: "destructive"
      });
      return;
    }

    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!hasPermission('sales', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit sales",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price_per_unit * item.quantity), 0);
  };

  const handleProceedToPayment = () => {
    if (!hasPermission('sales', 'create')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create sales",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      return;
    }

    // Prepare cart items for payment page
    const cartItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price_per_unit,
      quantity: item.quantity
    }));

    // Navigate to payment page with cart data
    navigate('/payment', {
      state: {
        cartItems,
        subtotal: getTotalAmount()
      }
    });
  };

  // Check if user has permission to view sales
  if (!hasPermission('sales', 'view')) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view the sales dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 h-full overflow-hidden">
      <div className="flex-none mb-6">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <p className="text-muted-foreground">Process sales transactions</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="flex-none">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
              <div className="relative">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            {/* Make only this part scrollable */}
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Unit: {product.unit}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">₹{product.price_per_unit}</span>
                          <ProtectedAction resource="sales" action="create">
                            <Button 
                              size="sm" 
                              onClick={() => addToCart(product)}
                              className="h-7 px-2"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </ProtectedAction>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="flex flex-col h-full">
          <Card className="flex flex-col h-full sticky top-6">
            {/* .sticky ensures cart is always visible */}
            <CardHeader className="flex-none">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              {/* Cart Items (scroll here if cart is *very* long) */}
              <div className="flex-1 overflow-auto mb-4 max-h-72">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Cart is empty</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">₹{item.price_per_unit} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ProtectedAction resource="sales" action="edit">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              -
                            </Button>
                          </ProtectedAction>
                          <span className="text-xs w-8 text-center">{item.quantity}</span>
                          <ProtectedAction resource="sales" action="edit">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              +
                            </Button>
                          </ProtectedAction>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Total and Proceed to Payment */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span>₹{getTotalAmount().toFixed(2)}</span>
                </div>
                <ProtectedAction resource="sales" action="create">
                  <Button 
                    onClick={handleProceedToPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={cart.length === 0}
                  >
                    Proceed to Payment
                  </Button>
                </ProtectedAction>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sales;

