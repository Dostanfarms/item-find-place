
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductSize } from '@/hooks/useProductSizes';

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

  if (availableSizes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Size Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sizes available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Select Size</CardTitle>
      </CardHeader>
      <CardContent>
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
        
        {selectedSize && (
          <div className="mt-3 p-2 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
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
