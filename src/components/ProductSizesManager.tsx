
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

export interface ProductSize {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
}

interface ProductSizesManagerProps {
  sizes: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
  disabled?: boolean;
}

const ProductSizesManager = ({ sizes, onChange, disabled }: ProductSizesManagerProps) => {
  const [localSizes, setLocalSizes] = useState<ProductSize[]>(sizes);

  useEffect(() => {
    setLocalSizes(sizes);
  }, [sizes]);

  const availableSizes: ProductSize['size'][] = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleQuantityChange = (size: ProductSize['size'], quantity: number) => {
    const updatedSizes = localSizes.filter(s => s.size !== size);
    if (quantity > 0) {
      updatedSizes.push({ size, quantity });
    }
    updatedSizes.sort((a, b) => availableSizes.indexOf(a.size) - availableSizes.indexOf(b.size));
    setLocalSizes(updatedSizes);
    onChange(updatedSizes);
  };

  const getSizeQuantity = (size: ProductSize['size']) => {
    return localSizes.find(s => s.size === size)?.quantity || 0;
  };

  const removeSize = (size: ProductSize['size']) => {
    const updatedSizes = localSizes.filter(s => s.size !== size);
    setLocalSizes(updatedSizes);
    onChange(updatedSizes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Size Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableSizes.map((size) => (
            <div key={size} className="space-y-2">
              <Label htmlFor={`size-${size}`}>Size {size}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`size-${size}`}
                  type="number"
                  min="0"
                  step="1"
                  value={getSizeQuantity(size)}
                  onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 0)}
                  placeholder="Quantity"
                  disabled={disabled}
                  className="flex-1"
                />
                {getSizeQuantity(size) > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSize(size)}
                    disabled={disabled}
                    className="p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {localSizes.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm font-medium">Available Sizes:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {localSizes.map(({ size, quantity }) => (
                <Badge key={size} variant="secondary" className="text-sm">
                  {size}: {quantity} pcs
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSizesManager;
