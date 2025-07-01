
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductSize } from '@/hooks/useProductSizes';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize?: string;
  onSizeSelect: (size: string) => void;
  disabled?: boolean;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  disabled = false
}) => {
  // Filter out sizes with 0 quantity
  const availableSizes = sizes.filter(size => size.quantity > 0);
  const outOfStockSizes = sizes.filter(size => size.quantity === 0);

  if (sizes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Size Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>No sizes configured for this product</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Select Size</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Sizes */}
        {availableSizes.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Available Sizes:</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <Button
                  key={size.size}
                  variant={selectedSize === size.size ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSizeSelect(size.size)}
                  disabled={disabled}
                  className="flex items-center gap-2"
                >
                  <span>{size.size}</span>
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
          <div>
            <p className="text-xs text-muted-foreground mb-2">Out of Stock:</p>
            <div className="flex flex-wrap gap-2">
              {outOfStockSizes.map((size) => (
                <Button
                  key={size.size}
                  variant="outline"
                  size="sm"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  <span>{size.size}</span>
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
          <Alert>
            <AlertDescription>
              All sizes are currently out of stock. Please check back later.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Selected Size Info */}
        {selectedSize && availableSizes.find(s => s.size === selectedSize) && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Selected: Size {selectedSize} 
              {' '}({availableSizes.find(s => s.size === selectedSize)?.quantity} available)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SizeSelector;
