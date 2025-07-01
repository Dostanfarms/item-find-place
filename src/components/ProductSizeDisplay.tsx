
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductSize } from '@/hooks/useProductSizes';

interface ProductSizeDisplayProps {
  sizes: ProductSize[];
  selectedSize?: string;
  onSizeSelect?: (size: string) => void;
  readonly?: boolean;
}

const ProductSizeDisplay: React.FC<ProductSizeDisplayProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  readonly = false
}) => {
  if (sizes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No sizes available
      </div>
    );
  }

  const availableSizes = sizes.filter(size => size.quantity > 0);
  const outOfStockSizes = sizes.filter(size => size.quantity === 0);

  if (readonly) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Available Sizes:</div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Badge
              key={size.size}
              variant={size.quantity > 0 ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {size.size}
              <span className="text-xs">({size.quantity})</span>
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Select Size:</div>
      
      {/* Available Sizes */}
      {availableSizes.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Available:</div>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <Button
                key={size.size}
                variant={selectedSize === size.size ? "default" : "outline"}
                size="sm"
                onClick={() => onSizeSelect?.(size.size)}
                className="flex items-center gap-2"
              >
                {size.size}
                <Badge variant="secondary" className="text-xs">
                  {size.quantity}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Out of Stock Sizes */}
      {outOfStockSizes.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Out of Stock:</div>
          <div className="flex flex-wrap gap-2">
            {outOfStockSizes.map((size) => (
              <Button
                key={size.size}
                variant="outline"
                size="sm"
                disabled
                className="opacity-50 cursor-not-allowed"
              >
                {size.size}
                <Badge variant="destructive" className="text-xs ml-2">
                  Out of Stock
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* No Available Sizes */}
      {availableSizes.length === 0 && (
        <div className="text-sm text-red-600 font-medium">
          All sizes are currently out of stock
        </div>
      )}
    </div>
  );
};

export default ProductSizeDisplay;
