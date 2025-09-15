import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  item_name: string;
  seller_price: number;
  item_photo_url: string | null;
  quantity: number;
  seller_id: string;
  seller_name: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartRestaurant: string | null;
  cartRestaurantName: string | null;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartRestaurant, setCartRestaurant] = useState<string | null>(null);
  const [cartRestaurantName, setCartRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    const storedRestaurant = localStorage.getItem('cartRestaurant');
    const storedRestaurantName = localStorage.getItem('cartRestaurantName');
    
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing stored cart:', error);
      }
    }
    
    if (storedRestaurant) {
      setCartRestaurant(storedRestaurant);
    }
    
    if (storedRestaurantName) {
      setCartRestaurantName(storedRestaurantName);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cartItems));
    if (cartRestaurant) {
      localStorage.setItem('cartRestaurant', cartRestaurant);
    } else {
      localStorage.removeItem('cartRestaurant');
    }
    if (cartRestaurantName) {
      localStorage.setItem('cartRestaurantName', cartRestaurantName);
    } else {
      localStorage.removeItem('cartRestaurantName');
    }
  }, [cartItems, cartRestaurant, cartRestaurantName]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    // Check if cart is empty or item is from same restaurant
    if (cartRestaurant && cartRestaurant !== item.seller_id) {
      toast({
        title: "Different Restaurant",
        description: `You can only order from one restaurant at a time. Your cart contains items from ${cartRestaurantName}. Clear your cart to add items from ${item.seller_name}.`,
        variant: "destructive",
      });
      return;
    }

    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });

    // Set restaurant if this is the first item
    if (!cartRestaurant) {
      setCartRestaurant(item.seller_id);
      setCartRestaurantName(item.seller_name);
    }

    toast({
      title: "Added to Cart",
      description: `${item.item_name} has been added to your cart.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => {
      const newItems = prev.filter(item => item.id !== itemId);
      
      // Clear restaurant if cart becomes empty
      if (newItems.length === 0) {
        setCartRestaurant(null);
        setCartRestaurantName(null);
      }
      
      return newItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartRestaurant(null);
    setCartRestaurantName(null);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.seller_price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    cartRestaurant,
    cartRestaurantName,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};