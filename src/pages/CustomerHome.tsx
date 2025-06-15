
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, User, LogOut, Ticket, Search, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useActiveBanners } from '@/hooks/useBanners';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { totalItems, setIsCartOpen } = useCart();
  
  const {
    data: banners,
    isLoading: bannersLoading
  } = useActiveBanners();
  const {
    products,
    loading: productsLoading
  } = useProducts();

  // Filter products based on search term and availability
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && product.quantity > 0;
  });

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (!currentCustomer) {
      navigate('/customer-login');
      return;
    }
    setCustomer(JSON.parse(currentCustomer));
  }, [navigate]);

  useEffect(() => {
    if (banners && banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const handleBannerClick = (banner: any) => {
    if (banner.redirect_url) {
      window.open(banner.redirect_url, '_blank');
    }
  };

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">DostanFarms</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{customer.name}</span>
            
            {/* Cart Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[1.25rem] h-5 flex items-center justify-center text-xs rounded-full px-1">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Profile Dropdown */}
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
                <DropdownMenuItem onClick={() => navigate('/customer-order-history')}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  localStorage.removeItem('currentCustomer');
                  navigate('/customer-login');
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content with top padding to account for fixed header */}
      <div className="pt-20">
        {/* Shopping Section */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button onClick={() => navigate('/customer-products')} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Shop All Products
              </Button>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Banner Slider */}
        <div className="max-w-7xl mx-auto px-4">
          {bannersLoading ? (
            <div className="relative overflow-hidden rounded-lg h-55 bg-gray-200 animate-pulse">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">Loading banners...</span>
              </div>
            </div>
          ) : banners && banners.length > 0 ? (
            <div className="relative overflow-hidden rounded-lg">
              <div className="flex transition-transform duration-500 ease-in-out" style={{
                transform: `translateX(-${currentBanner * 100}%)`
              }}>
                {banners.map((banner, index) => (
                  <div key={banner.id} className="w-full flex-shrink-0 cursor-pointer" onClick={() => handleBannerClick(banner)}>
                    {banner.image_url && <img src={banner.image_url} alt={banner.name} className="w-full h-55 object-cover rounded-lg" />}
                    {banner.video_url && !banner.image_url && <video src={banner.video_url} className="w-full h-55 object-cover rounded-lg" autoPlay muted loop />}
                  </div>
                ))}
              </div>
              
              {/* Banner indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button key={index} className={`w-3 h-3 rounded-full transition-colors ${index === currentBanner ? 'bg-white' : 'bg-white/50'}`} onClick={() => setCurrentBanner(index)} />
                ))}
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-lg h-55 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500">No banners available</span>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Products'}
            </h2>
            <p className="text-gray-600">
              {searchTerm ? `${filteredProducts.length} products found` : 'Fresh products available for you'}
            </p>
          </div>

          {productsLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg">Loading products...</div>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>

      {/* Cart Component */}
      <Cart />
    </div>
  );
};

export default CustomerHome;
