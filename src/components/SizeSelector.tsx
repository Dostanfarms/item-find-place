
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductSize } from '@/components/ProductSizesManager';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize?: string;
  onSizeSelect: (size: string) => void;
  disabled?: boolean;
}

const SizeSelector = ({ sizes, selectedSize, onSizeSelect, disabled }: SizeSelectorProps) => {
  const availableSizes = sizes.filter(size => size.quantity > 0);

  if (availableSizes.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Size</Label>
        <p className="text-sm text-muted-foreground">No sizes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select Size</Label>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map(({ size, quantity }) => (
          <Button
            key={size}
            variant={selectedSize === size ? "default" : "outline"}
            size="sm"
            onClick={() => onSizeSelect(size)}
            disabled={disabled || quantity === 0}
            className="relative"
          >
            {size}
            <Badge 
              variant="secondary" 
              className="ml-2 text-xs bg-muted text-muted-foreground"
            >
              {quantity}
            </Badge>
          </Button>
        ))}
      </div>
      {selectedSize && (
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium">{selectedSize}</span>
        </p>
      )}
    </div>
  );
};

export default SizeSelector;
