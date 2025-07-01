
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';

interface CustomerHeaderProps {
  customer?: any;
  onLogout?: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customer, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();
  const { logout } = useAuth();
  const { toast } = useToast();
  const { categories } = useCategories();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/customer/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleCategoryClick = (categoryName: string) => {
    navigate('/customer/products', {
      state: { selectedCategory: categoryName }
    });
  };

  const activeCategories = categories.filter(cat => cat.is_active);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/customer" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">AgriPay</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/customer" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/customer') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/customer/products" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/customer/products') 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </Link>

            {/* Category Dropdown */}
            {activeCategories.length > 0 && (
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  Categories
                </Button>
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[150px] z-50">
                  {activeCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.name)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/customer/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Profile Menu */}
            <div className="flex items-center space-x-2">
              <Link to="/customer/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
