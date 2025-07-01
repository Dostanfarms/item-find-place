
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import LoginPopup from './LoginPopup';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleCheckout = () => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    
    if (!currentCustomer) {
      // Show login popup if not authenticated
      setShowLoginPopup(true);
      return;
    }
    
    // Proceed to checkout if authenticated
    setIsCartOpen(false);
    navigate('/customer-payment');
  };

  const handleLoginSuccess = () => {
    // After successful login, proceed to checkout
    setIsCartOpen(false);
    navigate('/customer-payment');
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="w-full p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Cart ({items.length} items)
              </SheetTitle>
              
              {/* Checkout button at top */}
              {items.length > 0 && (
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add some products to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={`${item.productId}-${item.size || 'no-size'}-${index}`} className="flex items-center gap-4 p-4 border rounded-lg">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            {item.category === 'Vegetables' && '🥬'}
                            {item.category === 'Fruits' && '🍎'}
                            {item.category === 'Grains' && '🌾'}
                            {item.category === 'Dairy' && '🥛'}
                            {item.category === 'Fashion' && '👕'}
                            {!['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Fashion'].includes(item.category) && <Package className="h-6 w-6 text-green-600" />}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.category}</p>
                        {item.size && (
                          <p className="text-xs text-blue-600">Size: {item.size}</p>
                        )}
                        <p className="text-sm font-semibold text-green-600">
                          ₹{item.pricePerUnit.toFixed(2)} / {item.unit}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          Total: ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <Badge variant="secondary" className="min-w-[2rem] text-center">
                            {item.quantity}
                          </Badge>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.productId, item.size)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Cart;
