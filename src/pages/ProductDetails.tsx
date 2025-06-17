
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  Package 
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import CustomerHeader from '@/components/CustomerHeader';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart, items } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [customer, setCustomer] = useState<any>(null);

  const product = products.find(p => p.id === productId);
  
  // Get similar products (same category, excluding current product)
  const similarProducts = products.filter(p => 
    p.category === product?.category && 
    p.id !== productId && 
    p.is_active !== false &&
    p.quantity > 0
  ).slice(0, 8);

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (currentCustomer) {
      setCustomer(JSON.parse(currentCustomer));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <CustomerHeader customer={customer} onLogout={() => setCustomer(null)} />
        <div className="pt-20 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg">Loading product...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-muted/30">
        <CustomerHeader customer={customer} onLogout={() => setCustomer(null)} />
        <div className="pt-20 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/customer-products')}>
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse images
  const getProductImages = (): string[] => {
    if (!product.image_url) return [];
    
    try {
      const parsed = JSON.parse(product.image_url);
      return Array.isArray(parsed) ? parsed : [product.image_url];
    } catch {
      return [product.image_url];
    }
  };

  const images = getProductImages();
  const hasMultipleImages = images.length > 1;

  const handleAddToCart = () => {
    try {
      addToCart({
        productId: product.id,
        name: product.name,
        quantity: 1,
        pricePerUnit: Number(product.price_per_unit),
        unit: product.unit,
        category: product.category,
        farmerId: '',
        imageUrl: images[0] // Add image URL to cart item
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = () => {
    // Add to cart first
    handleAddToCart();
    
    // Navigate to payment page
    setTimeout(() => {
      navigate('/customer-payment');
    }, 100);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <CustomerHeader customer={customer} onLogout={() => setCustomer(null)} />

      <div className="pt-20 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden relative">
                {images.length > 0 ? (
                  <>
                    <img 
                      src={images[currentImageIndex]} 
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {hasMultipleImages && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-white/80 hover:bg-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-white/80 hover:bg-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {product.category === 'Vegetables' && '🥬'}
                    {product.category === 'Fruits' && '🍎'}
                    {product.category === 'Grains' && '🌾'}
                    {product.category === 'Dairy' && '🥛'}
                    {!['Vegetables', 'Fruits', 'Grains', 'Dairy'].includes(product.category) && <Package className="h-20 w-20 text-green-600" />}
                  </div>
                )}
              </div>

              {/* Thumbnail images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  <Badge variant="secondary" className="text-sm">
                    {product.category}
                  </Badge>
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-green-600">
                    ₹{Number(product.price_per_unit).toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500">per {product.unit}</span>
                </div>

                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.quantity > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.quantity > 0 ? `${product.quantity} ${product.unit}` : 'Out of stock'}
                  </span>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button 
                  onClick={handleBuyNow}
                  disabled={product.quantity === 0}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 h-12 text-lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
              <ProductGrid products={similarProducts} />
            </div>
          )}
        </div>
      </div>

      <Cart />
    </div>
  );
};

export default ProductDetails;
