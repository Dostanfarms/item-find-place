
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Package, ShoppingCart, User, LogOut, UserCircle, History, Ticket } from 'lucide-react';
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

  const handleProfileClick = () => {
    navigate('/customer-profile');
  };

  const handleOrdersClick = () => {
    navigate('/customer-orders');
  };

  const handleTicketsClick = () => {
    navigate('/customer-tickets');
  };

  const handleCartClick = () => {
    // Toggle cart or navigate to cart page
    const cartEvent = new CustomEvent('toggleCart');
    window.dispatchEvent(cartEvent);
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
          
          {/* Login buttons beside logo - only show when not logged in */}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCartClick}
            className="relative p-2"
          >
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
          
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {customer.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleProfileClick}>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOrdersClick}>
                  <History className="h-4 w-4 mr-2" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTicketsClick}>
                  <Ticket className="h-4 w-4 mr-2" />
                  Support Tickets
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
