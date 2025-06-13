
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/hooks/useProducts';

interface ProductFormProps {
  farmerId?: string;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
  editProduct?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ farmerId, onSubmit, onCancel, editProduct }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    quantity: editProduct?.quantity || 0,
    unit: editProduct?.unit || 'kg',
    price_per_unit: editProduct?.price_per_unit || 0,
    category: editProduct?.category || '',
    barcode: editProduct?.barcode || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price_per_unit <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      });
      return;
    }

    const productData: Product = {
      id: editProduct?.id || '',
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      price_per_unit: formData.price_per_unit,
      category: formData.category,
      farmer_id: farmerId || editProduct?.farmer_id || null,
      barcode: formData.barcode || null,
      created_at: editProduct?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Just call onSubmit once - the parent component handles the database operation
    onSubmit(productData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                placeholder="Enter quantity"
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="dozen">Dozen</SelectItem>
                  <SelectItem value="gram">Gram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="price">Price per Unit (₹) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price_per_unit}
              onChange={(e) => handleInputChange('price_per_unit', parseFloat(e.target.value) || 0)}
              placeholder="Enter price per unit"
              min="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Grains">Grains</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => handleInputChange('barcode', e.target.value)}
              placeholder="Enter barcode"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              {editProduct ? 'Update Product' : 'Add Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
