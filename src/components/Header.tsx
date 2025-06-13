
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Header: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🌱</div>
            <h1 className="text-2xl font-bold text-green-600">DostanFarms</h1>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
