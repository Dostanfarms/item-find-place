
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Shirt, AlertTriangle } from 'lucide-react';
import SizeSelector from './SizeSelector';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

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

    addItem(cartItem);
    
    toast({
      title: "Added to Cart",
      description: `${product.name}${isFashionProduct ? ` (Size: ${selectedSize})` : ''} has been added to your cart`,
    });

    // Reset selections
    setSelectedSize('');
    setQuantity(1);
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

  return (
    <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-lg">
      <div className="relative">
        <img
          src={getImageUrl()}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
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
        
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
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

        {!isFashionProduct && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Available Stock:</span>
              <span className={product.quantity < 10 ? "text-red-500 font-medium" : ""}>
                {product.quantity} {product.unit}
              </span>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
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
