
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SizeSelectorProps {
  sizes: Array<{ size: string; pieces: number }>;
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
  // Filter out sizes with 0 pieces
  const availableSizes = sizes.filter(size => size.pieces > 0);

  if (availableSizes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Size Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sizes available - Out of Stock</p>
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
          {sizes.map((size) => {
            const isOutOfStock = size.pieces === 0;
            const isLowStock = size.pieces < 10 && size.pieces > 0;
            
            return (
              <Button
                key={size.size}
                variant={selectedSize === size.size ? "default" : "outline"}
                size="sm"
                onClick={() => !isOutOfStock && onSizeSelect(size.size)}
                disabled={disabled || isOutOfStock}
                className={`flex items-center gap-2 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{size.size}</span>
                <Badge 
                  variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}
                  className={`text-xs ${isLowStock ? "bg-yellow-500 text-white" : ""}`}
                >
                  {isOutOfStock ? "0" : size.pieces}
                </Badge>
                {isOutOfStock && <span className="text-xs text-red-500 ml-1">(Out of Stock)</span>}
              </Button>
            );
          })}
        </div>
        
        {selectedSize && (
          <div className="mt-3 p-2 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Selected: Size {selectedSize} 
              {' '}({availableSizes.find(s => s.size === selectedSize)?.pieces} available)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SizeSelector;
