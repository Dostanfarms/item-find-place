
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <p className="text-sm text-red-500">All sizes are out of stock</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Select Size</h3>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isOutOfStock = size.pieces === 0;
          const isSelected = selectedSize === size.size;
          
          return (
            <Button
              key={size.size}
              variant={isSelected ? "default" : "outline"}
              size="lg"
              onClick={() => !isOutOfStock && onSizeSelect(size.size)}
              disabled={disabled || isOutOfStock}
              className={`min-w-[80px] h-12 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''} ${
                isSelected ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold text-lg">{size.size}</div>
                {isOutOfStock && <div className="text-xs text-red-500 mt-1">Out of Stock</div>}
              </div>
            </Button>
          );
        })}
      </div>
      
      {selectedSize && (
        <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
          <p className="text-sm text-green-800">
            Selected: Size <strong>{selectedSize}</strong> 
            {' '}({availableSizes.find(s => s.size === selectedSize)?.pieces} available)
          </p>
        </div>
      )}
    </div>
  );
};

export default HorizontalSizeSelector;
