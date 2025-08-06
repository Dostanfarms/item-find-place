
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Package, User, LogOut } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useBanners } from '@/hooks/useBanners';
import { useCategories } from '@/hooks/useCategories';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import LoginPopup from '@/components/LoginPopup';
import { useNavigate } from 'react-router-dom';

const CustomerHome = () => {
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();
  const { products } = useProducts();
  const { banners } = useBanners();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('currentCustomer');
    navigate('/');
  };

  const allProducts = products || [];
  const availableBanners = banners || [];
  const categoryNames = ['All', ...(categories?.map(cat => cat.name) || [])];

  const filteredProducts = selectedCategory === 'All' 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Login Buttons */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-agri-primary" />
                <span className="text-xl font-bold text-gray-900">Dostan Mart</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/farmer-login')}
                >
                  Farmer Login
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/employee-login')}
                >
                  Employee Login
                </Button>
              </div>
            </div>

            {/* Right side - Customer actions */}
            <div className="flex items-center space-x-3">
              {/* Check if customer is logged in */}
              {localStorage.getItem('currentCustomer') ? (
                <>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Customer Profile</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <Button 
                          onClick={() => navigate('/customer-profile')}
                          className="w-full justify-start"
                          variant="ghost"
                        >
                          View Profile
                        </Button>
                        <Button 
                          onClick={() => navigate('/customer-order-history')}
                          className="w-full justify-start"
                          variant="ghost"
                        >
                          Order History
                        </Button>
                        <Button 
                          onClick={() => navigate('/customer-ticket-history')}
                          className="w-full justify-start"
                          variant="ghost"
                        >
                          Support Tickets
                        </Button>
                        <Button 
                          onClick={handleLogout}
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          variant="ghost"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowLoginPopup(true)}
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/customer-register')}
                    className="bg-agri-primary hover:bg-agri-secondary text-white"
                  >
                    Register
                  </Button>
                </>
              )}
              
              {/* Cart Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {totalItems}
                  </Badge>
                )}
                <span className="hidden sm:inline ml-2">Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-16">
        {/* Hero Banner Section */}
        <div className="h-[500px] bg-gradient-to-r from-green-600 to-blue-600 relative overflow-hidden">
          {availableBanners.length > 0 ? (
            <div className="relative h-full">
              {availableBanners[0].image_url && (
                <img 
                  src={availableBanners[0].image_url} 
                  alt={availableBanners[0].name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {availableBanners[0].name}
                  </h1>
                  <p className="text-xl md:text-2xl opacity-90">
                    Fresh products from local farmers
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-white">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Welcome to Dostan Mart
                </h1>
                <p className="text-xl md:text-2xl opacity-90">
                  Fresh products from local farmers
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {categoryNames.map((category) => (
              <Card
                key={category}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedCategory === category ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">
                    {category === 'Vegetables' && '🥬'}
                    {category === 'Fruits' && '🍎'}
                    {category === 'Grains' && '🌾'}
                    {category === 'Dairy' && '🥛'}
                    {category === 'Fashion' && '👕'}
                    {category === 'All' && '🛒'}
                    {!['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Fashion', 'All'].includes(category) && '📦'}
                  </div>
                  <p className="text-sm font-medium">{category}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Products Grid */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h2>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No products available in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Component */}
      <Cart />

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={() => setShowLoginPopup(false)}
      />
    </div>
  );
};

export default CustomerHome;
