import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import ProductGrid from '@/components/ProductGrid';
import { useCart } from '@/contexts/CartContext';
import { useBanners } from '@/hooks/useBanners';
import LoginPopup from '@/components/LoginPopup';
import { CartItem } from '@/utils/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CustomerHome: React.FC = () => {
  const { items, getTotalItemCount } = useCart();
  const { data: banners } = useBanners();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);

  useEffect(() => {
    // Check if customer is already logged in (e.g., from localStorage)
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      try {
        const customer = JSON.parse(storedCustomer);
        setCurrentCustomer(customer);
      } catch (error) {
        console.error('Error parsing stored customer:', error);
        localStorage.removeItem('customer');
      }
    }
  }, []);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleLoginSuccess = (customer: any) => {
    setCurrentCustomer(customer);
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      
      {/* Banners Section */}
      {banners && banners.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="relative overflow-hidden rounded-lg">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold">{banner.title}</h3>
                    {banner.description && (
                      <p className="mt-2">{banner.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <ProductGrid onProductClick={handleProductClick} />
      </div>

      {/* Cart Floating Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
        onClick={() => window.location.href = '/customer/cart'}
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {getTotalItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center">
              {getTotalItemCount()}
            </span>
          )}
        </div>
      </Button>

      {/* Product Details Modal */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Product details and information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              <div>
                <p className="text-lg font-semibold text-green-600">
                  ₹{selectedProduct.price_per_unit}/{selectedProduct.unit}
                </p>
                {selectedProduct.description && (
                  <p className="text-gray-600 mt-2">{selectedProduct.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Category: {selectedProduct.category}
                </p>
                {selectedProduct.quantity > 0 ? (
                  <p className="text-sm text-green-600 mt-1">
                    In Stock ({selectedProduct.quantity} {selectedProduct.unit} available)
                  </p>
                ) : (
                  <p className="text-sm text-red-600 mt-1">Out of Stock</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <LoginPopup 
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default CustomerHome;
