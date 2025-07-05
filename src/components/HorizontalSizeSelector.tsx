
import React from 'react';
import { Button } from '@/components/ui/button';

interface HorizontalSizeSelectorProps {
  sizes: Array<{ size: string; pieces: number }>;
  selectedSize?: string;
  onSizeSelect: (size: string) => void;
  disabled?: boolean;
}

const HorizontalSizeSelector: React.FC<HorizontalSizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  disabled = false
}) => {
  // Filter out sizes with 0 pieces
  const availableSizes = sizes.filter(size => size.pieces > 0);

  if (availableSizes.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Size</h3>
        <p className="text-sm text-red-500">No sizes available - Out of Stock</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Select Size</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isOutOfStock = size.pieces === 0;
          
          return (
            <Button
              key={size.size}
              variant={selectedSize === size.size ? "default" : "outline"}
              size="sm"
              onClick={() => !isOutOfStock && onSizeSelect(size.size)}
              disabled={disabled || isOutOfStock}
              className={`px-4 py-2 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {size.size}
              {isOutOfStock && <span className="ml-1 text-xs text-red-500">(Out of Stock)</span>}
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
    </div>
  );
};

export default HorizontalSizeSelector;
