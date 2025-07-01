
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Package, User, LogOut, Ticket, ShoppingCart, UserPlus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CustomerHeaderProps {
  customer?: any;
  onLogout?: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customer,
  onLogout
}) => {
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('currentCustomer');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/customer-home')}>
          <Package className="h-6 w-6 text-agri-primary" />
          <span className="text-lg font-bold">Dostan Mart</span>
        </div>
        
        <div className="flex items-center gap-3">
          {customer && <span className="text-sm font-medium">{customer.name}</span>}
          
          {/* Cart Icon */}
          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[1.25rem] h-5 flex items-center justify-center text-xs rounded-full px-1">
                {totalItems}
              </Badge>
            )}
          </Button>

          {/* Conditional rendering based on authentication */}
          {customer ? (
            /* Profile Dropdown for authenticated users */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={customer.profile_photo} alt={customer.name} />
                    <AvatarFallback>
                      {customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate('/customer-profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/customer-tickets')}>
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>Support Tickets</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/customer-orders')}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Login/Register buttons for non-authenticated users */
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/customer-login')} className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Login
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/customer-register')} className="flex items-center gap-1 bg-agri-primary hover:bg-agri-secondary">
                <UserPlus className="h-4 w-4" />
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHeader;
