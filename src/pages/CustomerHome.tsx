
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, ShoppingBag } from 'lucide-react';
import { useActiveBanners } from '@/hooks/useBanners';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/contexts/CartContext';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import CustomerHeader from '@/components/CustomerHeader';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: banners,
    isLoading: bannersLoading
  } = useActiveBanners();
  const {
    products,
    loading: productsLoading
  } = useProducts();
  const {
    categories,
    loading: categoriesLoading
  } = useCategories();

  // Filter products based on search term and availability
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && product.quantity > 0;
  });

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (currentCustomer) {
      setCustomer(JSON.parse(currentCustomer));
    }
    // Don't redirect to login if not authenticated - allow browsing
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
    navigate('/customer/products', {
      state: {
        selectedCategory: categoryName
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <CustomerHeader />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-20">
        {/* Shopping Section */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button onClick={() => navigate('/customer/products')} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Shop All Products
            </Button>
            
            {/* Category Buttons */}
            {!categoriesLoading && categories.length > 0 && (
              <>
                {categories.map(category => (
                  <Button 
                    key={category.id} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCategoryClick(category.name)} 
                    className="text-xs hover:bg-green-50 hover:border-green-300"
                  >
                    {category.name}
                  </Button>
                ))}
              </>
            )}
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
                    {banner.image_url && (
                      <img src={banner.image_url} alt={banner.name} className="w-full h-55 object-cover rounded-lg" />
                    )}
                    {banner.video_url && !banner.image_url && (
                      <video src={banner.video_url} className="w-full h-55 object-cover rounded-lg" autoPlay muted loop />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Banner indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button 
                    key={index} 
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentBanner ? 'bg-white' : 'bg-white/50'
                    }`} 
                    onClick={() => setCurrentBanner(index)} 
                  />
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
