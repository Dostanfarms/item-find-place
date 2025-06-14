
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, ShoppingCart, User, Package, CreditCard } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';

const Sales = () => {
  const { toast } = useToast();
  const { products } = useProducts();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
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
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
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
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before proceeding to payment",
        variant: "destructive"
      });
      return;
    }

    // Navigate to payment page with cart data
    navigate('/payment', {
      state: {
        cartItems: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price_per_unit,
          quantity: item.quantity
        })),
        subtotal: getTotalAmount()
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'vegetables': return '🥬';
      case 'fruits': return '🍎';
      case 'grains': return '🌾';
      case 'dairy': return '🥛';
      case 'grocery': return '🛒';
      case 'fashion': return '👕';
      default: return '🌱';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'vegetables': return 'from-green-100 to-green-200';
      case 'fruits': return 'from-orange-100 to-orange-200';
      case 'grains': return 'from-yellow-100 to-yellow-200';
      case 'dairy': return 'from-blue-100 to-blue-200';
      case 'grocery': return 'from-purple-100 to-purple-200';
      case 'fashion': return 'from-pink-100 to-pink-200';
      default: return 'from-gray-100 to-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex-none mb-6">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <p className="text-muted-foreground">Process sales transactions</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col">
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
            <CardContent className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className={`aspect-square bg-gradient-to-br ${getCategoryColor(product.category)} p-6 flex items-center justify-center relative overflow-hidden`}>
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {getCategoryIcon(product.category)}
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-white/90 text-xs font-medium px-2 py-1 rounded-full text-gray-700">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Stock: {product.quantity} {product.unit}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600">
                            ₹{product.price_per_unit}
                          </span>
                          <p className="text-xs text-muted-foreground">per {product.unit}</p>
                        </div>
                      </div>

                      <Button 
                        onClick={() => addToCart(product)}
                        disabled={product.quantity === 0}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-none">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Cart Items */}
              <div className="flex-1 overflow-auto mb-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">Cart is empty</p>
                    <p className="text-sm text-muted-foreground">Add products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <Card key={item.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">₹{item.price_per_unit} each</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                            >
                              -
                            </Button>
                            <span className="text-sm w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 p-0"
                            >
                              +
                            </Button>
                            <div className="ml-auto">
                              <span className="font-bold">₹{(item.price_per_unit * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Total and Checkout */}
              <div className="flex-none space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Subtotal:</span>
                  <span className="text-xl font-bold text-green-600">₹{getTotalAmount().toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleProceedToPayment}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg py-6"
                  disabled={cart.length === 0}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sales;
