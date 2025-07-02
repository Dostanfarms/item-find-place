
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DynamicProduct } from '@/hooks/useDynamicCategoryProducts';
import { ArrowLeft } from 'lucide-react';

interface DynamicProductFormProps {
  category: string;
  editProduct?: DynamicProduct;
  onCancel: () => void;
  onSuccess: () => void;
}

const DynamicProductForm: React.FC<DynamicProductFormProps> = ({
  category,
  editProduct,
  onCancel,
  onSuccess
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    unit: 'kg',
    price_per_unit: 0,
    barcode: '',
    is_active: true
  });
  const [sizes, setSizes] = useState<Array<{ size: string; pieces: number }>>([]);
  const [loading, setLoading] = useState(false);

  // Set default unit based on category
  useEffect(() => {
    const defaultUnit = getDefaultUnit(category);
    setFormData(prev => ({ ...prev, unit: defaultUnit }));
  }, [category]);

  // Populate form if editing
  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        description: editProduct.description || '',
        quantity: editProduct.quantity || 0,
        unit: editProduct.unit || getDefaultUnit(category),
        price_per_unit: editProduct.price_per_unit,
        barcode: editProduct.barcode || '',
        is_active: editProduct.is_active
      });

      // For fashion products, set sizes
      if (category.toLowerCase() === 'fashion' && editProduct.sizes) {
        setSizes(editProduct.sizes.map(s => ({ size: s.size, pieces: s.pieces })));
      }
    }
  }, [editProduct, category]);

  const getDefaultUnit = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('vegetable') || name.includes('fruit') || name.includes('grain')) return 'kg';
    if (name.includes('dairy')) return 'liter';
    return 'piece';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category.toLowerCase() === 'fashion') {
        // Handle fashion products
        const productData = {
          name: formData.name,
          description: formData.description || null,
          price_per_unit: formData.price_per_unit,
          category: category,
          barcode: formData.barcode || null,
          is_active: formData.is_active
        };

        let productId = editProduct?.id;

        if (editProduct) {
          // Update existing fashion product
          const { error } = await supabase
            .from('fashion_products')
            .update(productData)
            .eq('id', editProduct.id);

          if (error) throw error;
        } else {
          // Create new fashion product
          const { data, error } = await supabase
            .from('fashion_products')
            .insert([productData])
            .select()
            .single();

          if (error) throw error;
          productId = data.id;
        }

        // Handle sizes for fashion products
        if (productId && sizes.length > 0) {
          // Delete existing sizes if editing
          if (editProduct) {
            await supabase
              .from('fashion_product_sizes')
              .delete()
              .eq('fashion_product_id', productId);
          }

          // Insert new sizes
          const sizesData = sizes.map(size => ({
            fashion_product_id: productId,
            size: size.size,
            pieces: size.pieces
          }));

          const { error: sizesError } = await supabase
            .from('fashion_product_sizes')
            .insert(sizesData);

          if (sizesError) throw sizesError;
        }
      } else {
        // Handle other category products with specific table queries
        const productData = {
          name: formData.name,
          description: formData.description || null,
          quantity: formData.quantity,
          unit: formData.unit,
          price_per_unit: formData.price_per_unit,
          category: category,
          barcode: formData.barcode || null,
          is_active: formData.is_active
        };

        if (category.toLowerCase() === 'vegetables') {
          if (editProduct) {
            const { error } = await supabase
              .from('vegetable_products')
              .update(productData)
              .eq('id', editProduct.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('vegetable_products')
              .insert([productData]);
            if (error) throw error;
          }
        } else if (category.toLowerCase() === 'fruits') {
          if (editProduct) {
            const { error } = await supabase
              .from('fruit_products')
              .update(productData)
              .eq('id', editProduct.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('fruit_products')
              .insert([productData]);
            if (error) throw error;
          }
        } else if (category.toLowerCase() === 'grains') {
          if (editProduct) {
            const { error } = await supabase
              .from('grain_products')
              .update(productData)
              .eq('id', editProduct.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('grain_products')
              .insert([productData]);
            if (error) throw error;
          }
        } else if (category.toLowerCase() === 'dairy') {
          if (editProduct) {
            const { error } = await supabase
              .from('dairy_products')
              .update(productData)
              .eq('id', editProduct.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('dairy_products')
              .insert([productData]);
            if (error) throw error;
          }
        } else {
          throw new Error(`Category ${category} is not supported yet`);
        }
      }

      toast({
        title: "Success",
        description: `Product ${editProduct ? 'updated' : 'added'} successfully`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSizeChange = (index: number, field: 'size' | 'pieces', value: string | number) => {
    setSizes(prev => prev.map((size, i) => 
      i === index ? { ...size, [field]: value } : size
    ));
  };

  const addSize = () => {
    setSizes(prev => [...prev, { size: 'S', pieces: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {editProduct ? 'Edit' : 'Add'} {category} Product
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editProduct ? 'Edit' : 'Add New'} {category} Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit*</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Fashion products don't need quantity/unit, they use sizes */}
            {category.toLowerCase() !== 'fashion' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity*</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Sizes for fashion products */}
            {category.toLowerCase() === 'fashion' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Product Sizes</Label>
                  <Button type="button" onClick={addSize} variant="outline" size="sm">
                    Add Size
                  </Button>
                </div>
                {sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={size.size}
                      onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                      className="border rounded px-3 py-2"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                    </select>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Pieces"
                      value={size.pieces}
                      onChange={(e) => handleSizeChange(index, 'pieces', parseInt(e.target.value) || 0)}
                      className="w-32"
                    />
                    <Button type="button" onClick={() => removeSize(index)} variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active Product</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicProductForm;
