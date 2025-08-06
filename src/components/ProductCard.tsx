
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartContext } from '@/contexts/CartContext';
import { Package, Plus, Eye, ShoppingCart } from 'lucide-react';
import SizeSelector from './SizeSelector';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: any;
  onViewClick?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewClick }) => {
  const { addItem } = useCartContext();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const isFashionProduct = product.type === 'fashion' || product.category === 'Fashion';

  const handleAddToCart = () => {
    if (isFashionProduct && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart",
        variant: "destructive"
      });
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price_per_unit),
      quantity: quantity,
      unit: product.unit || 'piece',
      category: product.category,
      image_url: product.image_url,
      type: product.type || 'general',
      ...(isFashionProduct && selectedSize && { size: selectedSize })
    };

    addItem(cartItem);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const getAvailableQuantity = () => {
    if (isFashionProduct) {
      if (!selectedSize) return 0;
      const sizeData = product.sizes?.find((s: any) => s.size === selectedSize);
      return sizeData?.pieces || 0;
    }
    return product.quantity || 0;
  };

  const availableQuantity = getAvailableQuantity();

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-4">
        <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden mb-3">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {product.category === 'Vegetables' && '🥬'}
              {product.category === 'Fruits' && '🍎'}
              {product.category === 'Grains' && '🌾'}
              {product.category === 'Dairy' && '🥛'}
              {product.category === 'Fashion' && '👕'}
              {!['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Fashion'].includes(product.category) && 
                <Package className="h-20 w-20 text-green-600" />
              }
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {product.name}
            </h3>
            <Badge variant="secondary" className="ml-2 shrink-0">
              {product.category}
            </Badge>
          </div>
          
          {product.description && product.description.length > 100 && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description.substring(0, 100)}...
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-green-600">
            ₹{parseFloat(product.price_per_unit).toFixed(2)}
            <span className="text-sm font-normal text-gray-500">
              /{product.unit || 'piece'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {availableQuantity > 0 ? (
              <span className="text-green-600">In Stock ({availableQuantity})</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        </div>

        {isFashionProduct && product.sizes && (
          <div className="mb-4">
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />
          </div>
        )}

        <div className="mt-auto space-y-3">
          {/* View Product Button */}
          {onViewClick && (
            <Button
              onClick={() => onViewClick(product)}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>View Product</span>
            </Button>
          )}

          {/* Add to Cart Section */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="px-3 py-1 text-sm font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => quantity < availableQuantity && setQuantity(quantity + 1)}
                disabled={quantity >= availableQuantity}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={availableQuantity === 0 || (isFashionProduct && !selectedSize)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
