
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductSizes } from '@/hooks/useProductSizes';
import { Shirt, Plus, Minus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface ProductSize {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  quantity: number;
}

interface ProductSizesManagerProps {
  productId?: string;
  initialSizes?: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
}

const AVAILABLE_SIZES: Array<'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'> = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

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
      // Ensure all sizes are represented, filling missing ones with 0
      const completeSizes = AVAILABLE_SIZES.map(size => {
        const existingSize = initialSizes.find(s => s.size === size);
        return existingSize || { size, quantity: 0 };
      });
      setSizes(completeSizes);
      onChange(completeSizes);
    }
  }, [initialSizes, onChange]);

  // Load sizes from database if productId is provided
  useEffect(() => {
    if (productId) {
      fetchProductSizes(productId).then(fetchedSizes => {
        if (fetchedSizes.length > 0) {
          // Ensure all sizes are represented
          const completeSizes = AVAILABLE_SIZES.map(size => {
            const existingSize = fetchedSizes.find(s => s.size === size);
            return existingSize || { size, quantity: 0 };
          });
          setSizes(completeSizes);
          onChange(completeSizes);
        }
      });
    }
  }, [productId, fetchProductSizes, onChange]);

  const updateQuantity = (targetSize: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL', quantity: number) => {
    const updatedSizes = sizes.map(size => 
      size.size === targetSize ? { ...size, quantity: Math.max(0, quantity) } : size
    );
    setSizes(updatedSizes);
    onChange(updatedSizes);
  };

  const incrementQuantity = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL') => {
    const currentSize = sizes.find(s => s.size === size);
    updateQuantity(size, (currentSize?.quantity || 0) + 1);
  };

  const decrementQuantity = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL') => {
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
  const sizesWithStock = sizes.filter(size => size.quantity > 0);

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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Total Stock: <Badge variant="secondary">{totalQuantity}</Badge> pieces
            </span>
            <span className="text-sm text-muted-foreground">
              Available Sizes: <Badge variant="outline">{sizesWithStock.length}</Badge>
            </span>
          </div>
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

        {totalQuantity === 0 && (
          <Alert>
            <AlertDescription>
              Please add quantities for at least one size to make this fashion product available for customers.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {AVAILABLE_SIZES.map((size) => {
            const sizeData = sizes.find(s => s.size === size);
            const quantity = sizeData?.quantity || 0;
            
            return (
              <div key={size} className="space-y-2 p-3 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Size {size}</Label>
                  <Badge 
                    variant={quantity > 0 ? "default" : "secondary"}
                    className={quantity > 0 ? "bg-green-500" : ""}
                  >
                    {quantity}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
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
                    className="text-center h-7 text-xs"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => incrementQuantity(size)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {quantity === 0 && (
                  <p className="text-xs text-red-500 text-center">Out of Stock</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSizesManager;
