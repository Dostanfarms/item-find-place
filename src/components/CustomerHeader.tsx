
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, User, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CustomerHeaderProps {
  customer: any;
  onLogout: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customer, onLogout }) => {
  const { items } = useCart();
  const navigate = useNavigate();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('currentCustomer');
    onLogout();
    navigate('/app');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Logo and login buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-green-600" />
            <span className="text-lg font-bold text-gray-900">Dostan Mart</span>
          </div>
          
          {/* Login buttons beside logo */}
          {!customer && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/farmer-login')}
                className="text-xs"
              >
                Farmer Login
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/employee-login')}
                className="text-xs"
              >
                Employee Login
              </Button>
            </div>
          )}
        </div>

        {/* Right side - Cart and customer auth */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <div className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          
          {/* Customer auth buttons or user menu */}
          {!customer ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/customer-login')}
                className="text-xs"
              >
                Login
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/customer-register')}
                className="text-xs bg-green-600 hover:bg-green-700"
              >
                Register
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {customer.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
