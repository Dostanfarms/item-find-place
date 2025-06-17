
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/hooks/useProducts';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Parse images from image_url - assume it's stored as JSON array string or single URL
  const getProductImages = (): string[] => {
    if (!product.image_url) return [];
    
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(product.image_url);
      return Array.isArray(parsed) ? parsed : [product.image_url];
    } catch {
      // If parsing fails, treat as single URL
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
        farmerId: ''
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

  const handleViewProduct = () => {
    navigate(`/product-details/${product.id}`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image or Fallback */}
      <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative overflow-hidden">
        {images.length > 0 ? (
          <>
            <img 
              src={images[currentImageIndex]} 
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation arrows for multiple images */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Image indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
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
          <div className="text-4xl">
            {product.category === 'Vegetables' && '🥬'}
            {product.category === 'Fruits' && '🍎'}
            {product.category === 'Grains' && '🌾'}
            {product.category === 'Dairy' && '🥛'}
            {!['Vegetables', 'Fruits', 'Grains', 'Dairy'].includes(product.category) && <Package className="h-12 w-12 text-green-600" />}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight">
            {product.name}
          </h3>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {product.category}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <p className="text-2xl font-bold text-green-600">
            ₹{Number(product.price_per_unit).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            per {product.unit}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <Button 
          onClick={handleViewProduct}
          variant="outline"
          className="w-full"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        <Button 
          onClick={handleAddToCart}
          disabled={product.quantity === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
