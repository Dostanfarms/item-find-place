
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Shirt, AlertTriangle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log('ProductCard received product:', product);

  const isFashionProduct = product.category === 'Fashion' || product.type === 'fashion';
  const isOutOfStock = isFashionProduct 
    ? !product.sizes || product.sizes.every((s: any) => s.pieces === 0)
    : product.quantity === 0;

  const isLowStock = isFashionProduct
    ? product.sizes && product.sizes.some((s: any) => s.pieces > 0 && s.pieces < 10)
    : product.quantity > 0 && product.quantity < 10;

  const handleAddToCart = () => {
    if (isFashionProduct) {
      if (!selectedSize) {
        toast({
          title: "Size Required",
          description: "Please select a size before adding to cart",
          variant: "destructive"
        });
        return;
      }

      const selectedSizeData = product.sizes?.find((s: any) => s.size === selectedSize);
      if (!selectedSizeData || selectedSizeData.pieces === 0) {
        toast({
          title: "Out of Stock",
          description: `Size ${selectedSize} is out of stock`,
          variant: "destructive"
        });
        return;
      }

      if (selectedSizeData.pieces < 10) {
        toast({
          title: "Low Stock Alert",
          description: `Only ${selectedSizeData.pieces} pieces left for size ${selectedSize}!`,
          variant: "destructive"
        });
      }
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      pricePerUnit: product.price_per_unit,
      quantity: 1,
      unit: isFashionProduct ? 'piece' : product.unit,
      category: product.category,
      type: isFashionProduct ? 'fashion' as const : 'general' as const,
      ...(isFashionProduct && { size: selectedSize })
    };

    console.log('Adding to cart:', cartItem);

    addItem(cartItem);
    
    toast({
      title: "Added to Cart",
      description: `${product.name}${isFashionProduct ? ` (Size: ${selectedSize})` : ''} has been added to your cart`,
    });

    // Reset selections
    setSelectedSize('');
  };

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  const getProductImages = (): string[] => {
    if (!product.image_url) return [];
    
    try {
      const parsed = JSON.parse(product.image_url);
      return Array.isArray(parsed) ? parsed.filter(url => url && url.trim() !== '') : [product.image_url];
    } catch {
      return [product.image_url];
    }
  };

  const images = getProductImages();
  const hasMultipleImages = images.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleIndicatorClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const getSizeButtonColor = (size: any) => {
    if (size.pieces === 0) return 'bg-red-500 text-white';
    if (size.pieces < 5) return 'bg-orange-500 text-white';
    return 'bg-gray-200 text-gray-800';
  };

  return (
    <Card className="h-[400px] flex flex-col transition-all duration-200 hover:shadow-lg">
      <div className="relative">
        <div className="w-full h-48 overflow-hidden rounded-t-lg bg-gray-100">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain transition-transform duration-200 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
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
                  
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={(e) => handleIndicatorClick(e, index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📦</div>
                <div className="text-sm">No Image</div>
              </div>
            </div>
          )}
        </div>
        
        {isFashionProduct && (
          <Badge className="absolute top-2 left-2 bg-purple-600">
            <Shirt className="h-3 w-3 mr-1" />
            Fashion
          </Badge>
        )}
        {isLowStock && !isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2 bg-yellow-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Low Stock
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Out of Stock
          </Badge>
        )}
      </div>
      
      <CardContent className="flex-1 flex flex-col p-4">
        <h3 className="font-semibold text-base mb-2 line-clamp-2 h-12 overflow-hidden">{product.name}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-agri-primary">
            ₹{product.price_per_unit}
          </span>
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>

        {isFashionProduct && product.sizes && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size: any) => (
                <button
                  key={size.size}
                  onClick={() => size.pieces > 0 && setSelectedSize(size.size)}
                  disabled={size.pieces === 0}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    selectedSize === size.size 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  } ${getSizeButtonColor(size)} ${
                    size.pieces === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'
                  }`}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleViewDetails}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || (isFashionProduct && !selectedSize)}
              size="sm"
              className="flex-1 bg-agri-primary hover:bg-agri-secondary"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              {isOutOfStock ? 'Out of Stock' : 'Add'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
