
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { 
    items, 
    totalPrice, 
    totalItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    
    // Convert cart items to format expected by payment page
    const cartItems = items.map(item => ({
      id: item.productId,
      name: item.name,
      price: item.pricePerUnit,
      quantity: item.quantity
    }));

    // Navigate to payment page with cart data
    navigate('/payment', {
      state: {
        cartItems,
        subtotal: totalPrice
      }
    });
    
    // Close cart after navigation
    setIsCartOpen(false);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart
            <Badge variant="secondary">{totalItems} items</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <Card key={item.productId} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.pricePerUnit * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">₹{item.pricePerUnit.toFixed(2)} per {item.unit}</p>
                    </div>
                  </div>
                </Card>
              ))}
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">₹{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleProceedToCheckout}
                    disabled={items.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
