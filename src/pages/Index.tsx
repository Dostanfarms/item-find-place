
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useFashionProducts } from '@/hooks/useFashionProducts';
import { useBanners } from '@/hooks/useBanners';
import { useAuth } from '@/context/AuthContext';
import { useCartContext } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import ProductDescriptionModal from '@/components/ProductDescriptionModal';
import LoginPopup from '@/components/LoginPopup';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, User, UserPlus, Package, Shirt, Apple, Wheat, Milk, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { products } = useProducts();
  const { fashionProducts } = useFashionProducts();
  const { banners } = useBanners();
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCartContext();
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Get all active banners
  const activeBanners = banners.filter(banner => banner.is_active);

  // Combine all products
  const getAllProducts = () => {
    if (selectedCategory === 'Fashion') {
      return fashionProducts.filter(p => 
        p.is_active && p.sizes && p.sizes.some(s => s.pieces > 0)
      ).map(p => ({ ...p, type: 'fashion' }));
    } else if (selectedCategory === 'all') {
      const activeGeneralProducts = products.filter(p => 
        p.is_active !== false && p.quantity > 0
      ).map(p => ({ ...p, type: 'general' }));
      
      const activeFashionProducts = fashionProducts.filter(p => 
        p.is_active && p.sizes && p.sizes.some(s => s.pieces > 0)
      ).map(p => ({ ...p, type: 'fashion' }));
      
      return [...activeGeneralProducts, ...activeFashionProducts];
    } else {
      return products.filter(p => 
        p.category === selectedCategory && 
        p.is_active !== false && 
        p.quantity > 0
      ).map(p => ({ ...p, type: 'general' }));
    }
  };

  const displayProducts = getAllProducts();

  const categories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'Fashion', name: 'Fashion', icon: Shirt },
    { id: 'Vegetables', name: 'Vegetables', icon: Leaf },
    { id: 'Fruits', name: 'Fruits', icon: Apple },
    { id: 'Grains', name: 'Grains', icon: Wheat },
    { id: 'Dairy', name: 'Dairy', icon: Milk },
  ];

  const handleProductView = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Auth Buttons */}
            <div className="flex items-center space-x-6">
              <div 
                className="text-2xl font-bold text-green-600 cursor-pointer"
                onClick={() => navigate('/')}
              >
                Dostan Mart
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/farmer-login')}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Farmer Login
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/employee-login')}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Employee Login
                </Button>
              </div>
            </div>

            {/* Right: Customer Auth and Cart */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/customer/profile')}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowLoginPopup(true)}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/customer-register')}
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Register</span>
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate('/cart')}
                className="relative flex items-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
                <span className="hidden sm:inline">Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding */}
      <div className="pt-16">
        {/* Banners Section */}
        {activeBanners.length > 0 && (
          <section className="mb-8">
            <div className="relative w-full h-[500px] overflow-hidden">
              {activeBanners.map((banner) => (
                <div 
                  key={banner.id} 
                  className="w-full h-full"
                >
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : banner.video_url ? (
                    <video
                      src={banner.video_url}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                      <h2 className="text-4xl font-bold text-white">{banner.name}</h2>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="mb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card 
                    key={category.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedCategory === category.id 
                        ? 'ring-2 ring-green-500 bg-green-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <IconComponent className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Products' : `${selectedCategory} Products`}
              </h2>
              <p className="text-sm text-gray-600">
                {displayProducts.length} products found
              </p>
            </div>

            {displayProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600">
                  {selectedCategory === 'all' 
                    ? 'No products are currently available.' 
                    : `No products are currently available in the ${selectedCategory} category.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProducts.map((product) => (
                  <ProductCard 
                    key={`${product.type}-${product.id}`} 
                    product={product}
                    onViewClick={() => handleProductView(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Login Popup */}
      {showLoginPopup && (
        <LoginPopup onClose={() => setShowLoginPopup(false)} />
      )}

      {/* Product Description Modal */}
      {selectedProduct && (
        <ProductDescriptionModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          product={selectedProduct}
          images={selectedProduct.image_url ? [selectedProduct.image_url] : []}
        />
      )}
    </div>
  );
};

export default Index;
