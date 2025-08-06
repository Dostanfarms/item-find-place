import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useActiveBanners } from '@/hooks/useBanners';
import { useProducts } from '@/hooks/useProducts';
import { useFashionProducts } from '@/hooks/useFashionProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/contexts/CartContext';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import FixedHeader from '@/components/layout/FixedHeader';
import ProfileChangeDialog from '@/components/profile/ProfileChangeDialog';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileMode, setProfileMode] = useState<'photo' | 'password'>('photo');
  const { items } = useCart();
  
  const {
    data: banners,
    isLoading: bannersLoading
  } = useActiveBanners();
  
  const {
    products,
    loading: productsLoading
  } = useProducts();
  
  const {
    fashionProducts,
    loading: fashionLoading
  } = useFashionProducts();
  
  const {
    categories,
    loading: categoriesLoading
  } = useCategories();

  const loading = productsLoading || fashionLoading;

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (currentCustomer) {
      setCustomer(JSON.parse(currentCustomer));
    }
  }, []);

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

  const handleCategoryClick = (categoryName: string) => {
    navigate('/customer-products', {
      state: {
        selectedCategory: categoryName
      }
    });
  };

  const handleLogout = () => {
    setCustomer(null);
    localStorage.removeItem('currentCustomer');
    navigate('/customer-products');
  };

  const handleChangePhoto = () => {
    setProfileMode('photo');
    setShowProfileDialog(true);
  };

  const handleChangePassword = () => {
    setProfileMode('password');
    setShowProfileDialog(true);
  };

  // Filter active products
  const activeProducts = products.filter(p => p.is_active !== false && p.quantity > 0);
  const activeFashionProducts = fashionProducts.filter(p => p.is_active && p.sizes?.some(s => s.pieces > 0));
  
  // Get featured products (first 8 products)
  const allProducts = [
    ...activeProducts.map(p => ({ ...p, type: 'general' })),
    ...activeFashionProducts.map(p => ({ ...p, type: 'fashion' }))
  ];
  const featuredProducts = allProducts.slice(0, 8);

  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-16">
        {/* Banner Section */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {bannersLoading ? (
            <div className="relative overflow-hidden rounded-lg h-96 bg-gray-200 animate-pulse">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">Loading banners...</span>
              </div>
            </div>
          ) : banners && banners.length > 0 ? (
            <div className="relative overflow-hidden rounded-lg h-96 shadow-lg">
              <div className="flex transition-transform duration-500 ease-in-out" style={{
                transform: `translateX(-${currentBanner * 100}%)`
              }}>
                {banners.map((banner, index) => (
                  <div key={banner.id} className="w-full flex-shrink-0 cursor-pointer relative" onClick={() => handleBannerClick(banner)}>
                    {banner.image_url && (
                      <img 
                        src={banner.image_url} 
                        alt={banner.name} 
                        className="w-full h-96 object-cover rounded-lg" 
                      />
                    )}
                    {banner.video_url && !banner.image_url && (
                      <video 
                        src={banner.video_url} 
                        className="w-full h-96 object-cover rounded-lg" 
                        autoPlay 
                        muted 
                        loop 
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Banner indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button 
                    key={index} 
                    className={`w-3 h-3 rounded-full transition-colors ${index === currentBanner ? 'bg-white' : 'bg-white/50'}`} 
                    onClick={() => setCurrentBanner(index)} 
                  />
                ))}
              </div>
            </div>
          ) : (
            // Default banner when no banners are available
            <div className="relative overflow-hidden rounded-lg h-96 bg-gradient-to-r from-green-400 to-green-600 shadow-lg">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Welcome to Dostan Mart
                  </h1>
                  <p className="text-lg mb-6">Fresh products delivered to your doorstep</p>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3"
                    onClick={() => navigate('/customer-products')}
                  >
                    Start Shopping
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Package className="h-4 w-4" />
                  Available Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allProducts.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <ShoppingBag className="h-4 w-4" />
                  Cart Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalCartItems}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length + (activeFashionProducts.length > 0 ? 1 : 0)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/customer-products')}
              className="flex items-center gap-2"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate('/customer-products')} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              All Products
            </Button>
            
            {!categoriesLoading && categories.map(category => (
              <Button 
                key={category.id} 
                variant="outline" 
                onClick={() => handleCategoryClick(category.name)} 
                className="hover:bg-green-50 hover:border-green-300"
              >
                {category.name}
              </Button>
            ))}
            
            {activeFashionProducts.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => handleCategoryClick('Fashion')} 
                className="hover:bg-green-50 hover:border-green-300"
              >
                Fashion
              </Button>
            )}
          </div>
        </div>

        {/* Featured Products */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/customer-products')}
              className="flex items-center gap-2"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg">Loading products...</div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg">No products available</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProfileChangeDialog
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        mode={profileMode}
      />

      <Cart />
    </div>
  );
};

export default CustomerHome;
