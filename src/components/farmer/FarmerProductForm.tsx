
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFarmerProducts } from '@/hooks/useFarmerProducts';

interface FarmerProductFormProps {
  open: boolean;
  onClose: () => void;
  farmerId: string;
}

const FarmerProductForm: React.FC<FarmerProductFormProps> = ({
  open,
  onClose,
  farmerId
}) => {
  const { toast } = useToast();
  const { addFarmerProduct } = useFarmerProducts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: ''
  });

  const categories = [
    'Vegetables',
    'Fruits',
    'Grains',
    'Dairy',
    'Spices',
    'Others'
  ];

  const units = [
    'kg',
    'gram',
    'liter',
    'piece',
    'dozen',
    'quintal'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: 'kg',
      price_per_unit: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.quantity || !formData.price_per_unit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        farmer_id: farmerId,
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price_per_unit: parseFloat(formData.price_per_unit),
        payment_status: 'unsettled' as const,
        is_active: true
      };

      const result = await addFarmerProduct(productData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Product added successfully"
        });
        resetForm();
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add product",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Farmer Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_per_unit">Price per Unit (₹) *</Label>
            <Input
              id="price_per_unit"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_per_unit}
              onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FarmerProductForm;
