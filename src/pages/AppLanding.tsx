
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, User, UserCog } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useActiveBanners } from '@/hooks/useBanners';
import { useProducts } from '@/hooks/useProducts';
import { useFashionProducts } from '@/hooks/useFashionProducts';
import { useCategories } from '@/hooks/useCategories';
import ProductGrid from '@/components/ProductGrid';
import CustomerHeader from '@/components/CustomerHeader';

const AppLanding = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  
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

  // Combine all products for display
  const allProducts = [
    ...products.filter(p => p.quantity > 0).map(p => ({ ...p, type: 'general' })),
    ...fashionProducts.filter(p => p.is_active && p.sizes?.some(s => s.pieces > 0)).map(p => ({ ...p, type: 'fashion' }))
  ];

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
    navigate('/shop', {
      state: {
        selectedCategory: categoryName
      }
    });
  };

  const handleLogout = () => {
    setCustomer(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <CustomerHeader customer={customer} onLogout={handleLogout} />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-20">
        {/* Shopping Section */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button onClick={() => navigate('/shop')} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
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
            
            {/* Fashion category button */}
            {fashionProducts.filter(p => p.is_active && p.sizes?.some(s => s.pieces > 0)).length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCategoryClick('Fashion')} 
                className="text-xs hover:bg-green-50 hover:border-green-300"
              >
                Fashion
              </Button>
            )}
          </div>
        </div>

        {/* Banner Section - Fashion Hero */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="relative overflow-hidden rounded-lg h-96 bg-gradient-to-r from-amber-100 to-amber-200">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                  Explore the New
                  <br />
                  Fashion Styles
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3" onClick={() => navigate('/shop')}>
                    Shop Now
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3" onClick={() => handleCategoryClick('Fashion')}>
                    Explore Fashion
                  </Button>
                </div>
              </div>
            </div>
            {/* Fashion models image overlay */}
            <div className="absolute bottom-0 right-0 w-full h-full opacity-30">
              <img 
                src="/lovable-uploads/7acba752-f632-43c1-9c01-bbbcb5d41c04.png" 
                alt="Fashion Models" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Get Started</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate('/farmer-login')}>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <User className="h-12 w-12 mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">Farmer Portal</h3>
                  <p className="text-gray-600 mb-4">Manage your products and track earnings</p>
                  <Button className="mt-auto bg-green-600 hover:bg-green-700">
                    Access Portal
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate('/employee-login')}>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <UserCog className="h-12 w-12 mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold mb-2">Employee Access</h3>
                  <p className="text-gray-600 mb-4">Admin dashboard and management tools</p>
                  <Button className="mt-auto bg-blue-600 hover:bg-blue-700">
                    Employee Login
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate('/shop')}>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <ShoppingBag className="h-12 w-12 mb-4 text-purple-600" />
                  <h3 className="text-xl font-semibold mb-2">Shop Products</h3>
                  <p className="text-gray-600 mb-4">Browse and purchase fresh products</p>
                  <Button className="mt-auto bg-purple-600 hover:bg-purple-700">
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600">Fresh products available for you</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg">Loading products...</div>
            </div>
          ) : (
            <ProductGrid products={allProducts.slice(0, 8)} />
          )}
        </div>

        {/* Customer Registration CTA */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">New Customer?</h2>
            <p className="text-xl text-gray-600 mb-8">Join thousands of satisfied customers</p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg" onClick={() => navigate('/customer-register')}>
              Register Now
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AppLanding;
