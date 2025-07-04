
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Shirt, AlertTriangle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SizeSelector from './SizeSelector';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

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

      if (selectedSizeData.pieces < quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${selectedSizeData.pieces} pieces available for size ${selectedSize}`,
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
      quantity,
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
    setQuantity(1);
  };

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  const getImageUrl = () => {
    if (!product.image_url) return '/placeholder.svg';
    
    try {
      const parsed = JSON.parse(product.image_url);
      return Array.isArray(parsed) ? parsed[0] : product.image_url;
    } catch {
      return product.image_url;
    }
  };

  const shouldShowStockInfo = () => {
    if (isFashionProduct) {
      return isOutOfStock || isLowStock;
    } else {
      return product.quantity === 0 || product.quantity < 10;
    }
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-lg">
      <div className="relative">
        <div className="w-full h-48 overflow-hidden rounded-t-lg bg-gray-100">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
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
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-agri-primary">
            ₹{product.price_per_unit}
          </span>
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>

        {isFashionProduct && product.sizes && (
          <div className="mb-4">
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeSelect={setSelectedSize}
              disabled={isOutOfStock}
            />
          </div>
        )}

        {shouldShowStockInfo() && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Available Stock:</span>
              <span className={isOutOfStock ? "text-red-500 font-medium" : isLowStock ? "text-yellow-600 font-medium" : ""}>
                {isFashionProduct 
                  ? (isOutOfStock ? "Out of Stock" : `Low Stock`)
                  : `${product.quantity} ${product.unit}${isOutOfStock ? " (Out of Stock)" : isLowStock ? " (Low Stock)" : ""}`
                }
              </span>
            </div>
          </div>
        )}

        <div className="mt-auto space-y-3">
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="px-3 py-1 border rounded text-center min-w-[50px]">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              disabled={isOutOfStock}
            >
              +
            </Button>
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || (isFashionProduct && !selectedSize)}
            className="w-full bg-agri-primary hover:bg-agri-secondary"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
