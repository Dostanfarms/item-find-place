
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      quantity: 1,
      pricePerUnit: Number(product.price_per_unit),
      unit: product.unit,
      category: product.category,
      farmerId: '' // Remove farmer_id reference, use empty string as default
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image or Fallback */}
      <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
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
        
        <p className="text-sm text-gray-600 mb-3">
          {product.quantity > 0 ? (
            <span className="text-green-600">
              {product.quantity} {product.unit}s available
            </span>
          ) : (
            <span className="text-red-600">Out of stock</span>
          )}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
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
