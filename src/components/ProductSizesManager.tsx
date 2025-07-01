
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductSizes } from '@/hooks/useProductSizes';
import { Shirt, Plus, Minus } from 'lucide-react';

export interface ProductSize {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
}

interface ProductSizesManagerProps {
  productId?: string;
  initialSizes?: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
}

const AVAILABLE_SIZES: Array<'S' | 'M' | 'L' | 'XL' | 'XXL'> = ['S', 'M', 'L', 'XL', 'XXL'];

const ProductSizesManager: React.FC<ProductSizesManagerProps> = ({ 
  productId, 
  initialSizes = [], 
  onChange 
}) => {
  const [sizes, setSizes] = useState<ProductSize[]>(initialSizes);
  const { loading, fetchProductSizes, saveProductSizes } = useProductSizes();

  // Initialize sizes with all available sizes set to 0
  useEffect(() => {
    if (initialSizes.length === 0) {
      const defaultSizes = AVAILABLE_SIZES.map(size => ({ size, quantity: 0 }));
      setSizes(defaultSizes);
      onChange(defaultSizes);
    } else {
      setSizes(initialSizes);
    }
  }, [initialSizes, onChange]);

  // Load sizes from database if productId is provided
  useEffect(() => {
    if (productId) {
      fetchProductSizes(productId).then(fetchedSizes => {
        if (fetchedSizes.length > 0) {
          setSizes(fetchedSizes);
          onChange(fetchedSizes);
        }
      });
    }
  }, [productId]);

  const updateQuantity = (targetSize: 'S' | 'M' | 'L' | 'XL' | 'XXL', quantity: number) => {
    const updatedSizes = sizes.map(size => 
      size.size === targetSize ? { ...size, quantity: Math.max(0, quantity) } : size
    );
    setSizes(updatedSizes);
    onChange(updatedSizes);
  };

  const incrementQuantity = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => {
    const currentSize = sizes.find(s => s.size === size);
    updateQuantity(size, (currentSize?.quantity || 0) + 1);
  };

  const decrementQuantity = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => {
    const currentSize = sizes.find(s => s.size === size);
    updateQuantity(size, Math.max(0, (currentSize?.quantity || 0) - 1));
  };

  const handleSave = async () => {
    if (!productId) return;
    
    const result = await saveProductSizes(productId, sizes);
    if (result.success) {
      console.log('Sizes saved successfully');
    } else {
      console.error('Failed to save sizes:', result.error);
    }
  };

  const totalQuantity = sizes.reduce((total, size) => total + size.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          Size Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Total Stock: {totalQuantity} pieces
          </span>
          {productId && (
            <Button 
              onClick={handleSave} 
              disabled={loading}
              size="sm"
            >
              {loading ? 'Saving...' : 'Save Sizes'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AVAILABLE_SIZES.map((size) => {
            const sizeData = sizes.find(s => s.size === size);
            const quantity = sizeData?.quantity || 0;
            
            return (
              <div key={size} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Size {size}</Label>
                  <Badge variant={quantity > 0 ? "default" : "secondary"}>
                    {quantity}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => decrementQuantity(size)}
                    disabled={quantity <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => updateQuantity(size, parseInt(e.target.value) || 0)}
                    className="text-center h-8"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => incrementQuantity(size)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {totalQuantity === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No stock available for any size</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSizesManager;
