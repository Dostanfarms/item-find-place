
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useProductSizes } from '@/hooks/useProductSizes';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { fetchProductSizes } = useProductSizes();
  const [productSizes, setProductSizes] = useState<any[]>([]);

  useEffect(() => {
    if (product.category === 'Fashion') {
      fetchProductSizes(product.id).then(sizes => {
        setProductSizes(sizes);
      });
    }
  }, [product.id, product.category, fetchProductSizes]);

  const isFashionProduct = product.category === 'Fashion';
  const totalQuantity = isFashionProduct 
    ? productSizes.reduce((sum, size) => sum + size.quantity, 0)
    : product.quantity;
  
  const isOutOfStock = totalQuantity === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFashionProduct) {
      // For fashion products, redirect to details page for size selection
      navigate(`/customer/products/${product.id}`);
      return;
    }

    if (isOutOfStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      pricePerUnit: product.price_per_unit,
      quantity: 1,
      unit: product.unit,
      category: product.category,
      farmerId: null
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleViewDetails = () => {
    navigate(`/customer/products/${product.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
      <CardHeader className="pb-2">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Package className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <CardTitle className="text-lg truncate" title={product.name}>
          {product.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              ₹{product.price_per_unit}
            </span>
            <span className="text-sm text-muted-foreground">
              per {product.unit}
            </span>
          </div>

          {/* Stock Info */}
          <div className="text-sm text-muted-foreground">
            {isFashionProduct ? (
              <div>
                <span>Total Stock: {totalQuantity} pieces</span>
                {productSizes.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {productSizes.map(size => (
                      <Badge 
                        key={size.size} 
                        variant={size.quantity > 0 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {size.size}: {size.quantity}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span>Stock: {product.quantity} {product.unit}</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleQuickAdd}
              disabled={!isFashionProduct && isOutOfStock}
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              {isFashionProduct ? "Select Size" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
