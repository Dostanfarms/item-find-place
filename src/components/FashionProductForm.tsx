
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FashionProduct } from '@/hooks/useCategoryProducts';

interface FashionProductFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  editProduct?: FashionProduct;
}

interface SizeQuantity {
  size: string;
  pieces: number;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const FashionProductForm: React.FC<FashionProductFormProps> = ({
  onCancel,
  onSuccess,
  editProduct
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_unit: '',
    barcode: '',
    image_url: '',
    is_active: true
  });

  const [sizes, setSizes] = useState<SizeQuantity[]>(
    AVAILABLE_SIZES.map(size => ({ size, pieces: 0 }))
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        description: editProduct.description || '',
        price_per_unit: editProduct.price_per_unit.toString(),
        barcode: editProduct.barcode || '',
        image_url: editProduct.image_url || '',
        is_active: editProduct.is_active
      });

      // Set sizes from existing product
      const productSizes = AVAILABLE_SIZES.map(size => {
        const existingSize = editProduct.sizes?.find(s => s.size === size);
        return {
          size,
          pieces: existingSize?.pieces || 0
        };
      });
      setSizes(productSizes);
    }
  }, [editProduct]);

  const updateSizeQuantity = (size: string, pieces: number) => {
    setSizes(prev => prev.map(s => 
      s.size === size ? { ...s, pieces: Math.max(0, pieces) } : s
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price_per_unit: parseFloat(formData.price_per_unit),
        category: 'Fashion',
        barcode: formData.barcode || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active
      };

      let productId: string;

      if (editProduct) {
        // Update existing product
        const { error: productError } = await supabase
          .from('fashion_products')
          .update(productData)
          .eq('id', editProduct.id);

        if (productError) throw productError;
        productId = editProduct.id;

        // Delete existing sizes
        await supabase
          .from('fashion_product_sizes')
          .delete()
          .eq('fashion_product_id', productId);
      } else {
        // Create new product
        const { data: newProduct, error: productError } = await supabase
          .from('fashion_products')
          .insert(productData)
          .select()
          .single();

        if (productError) throw productError;
        productId = newProduct.id;
      }

      // Insert sizes with quantities > 0
      const sizesToInsert = sizes
        .filter(s => s.pieces > 0)
        .map(s => ({
          fashion_product_id: productId,
          size: s.size,
          pieces: s.pieces
        }));

      if (sizesToInsert.length > 0) {
        const { error: sizesError } = await supabase
          .from('fashion_product_sizes')
          .insert(sizesToInsert);

        if (sizesError) throw sizesError;
      }

      toast({
        title: "Success",
        description: `Fashion product ${editProduct ? 'updated' : 'created'} successfully.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving fashion product:', error);
      toast({
        title: "Error",
        description: "Failed to save fashion product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPieces = sizes.reduce((sum, s) => sum + s.pieces, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {editProduct ? 'Edit Fashion Product' : 'Add Fashion Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Unit *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price_per_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Size and Inventory Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Size & Inventory Management
              <Badge variant="outline" className="text-sm">
                Total: {totalPieces} pieces
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {AVAILABLE_SIZES.map((size) => {
                const sizeData = sizes.find(s => s.size === size);
                const pieces = sizeData?.pieces || 0;
                
                return (
                  <div key={size} className="space-y-2 p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Size {size}</Label>
                      <Badge 
                        variant={pieces > 0 ? "default" : "secondary"}
                        className={pieces > 0 ? "bg-green-500" : ""}
                      >
                        {pieces}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateSizeQuantity(size, pieces - 1)}
                        disabled={pieces <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <Input
                        type="number"
                        min="0"
                        value={pieces}
                        onChange={(e) => updateSizeQuantity(size, parseInt(e.target.value) || 0)}
                        className="text-center h-7 text-xs"
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateSizeQuantity(size, pieces + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {pieces > 0 && pieces < 20 && (
                      <p className="text-xs text-orange-500 text-center">Low Stock</p>
                    )}
                    {pieces === 0 && (
                      <p className="text-xs text-red-500 text-center">Out of Stock</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FashionProductForm;
