
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
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/67ff7785-0e07-470a-a478-3e19a67e7253.png" 
              alt="Dostan Mart" 
              className="h-8 w-auto"
            />
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
