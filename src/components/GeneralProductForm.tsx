import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useProducts, Product } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductImageUpload from './ProductImageUpload';
import ProductSizesManager from './ProductSizesManager';
import { canAccessBranch } from '@/utils/employeeData';

interface GeneralProductFormProps {
  onCancel: () => void;
  editProduct?: Product;
}

const GeneralProductForm = ({ onCancel, editProduct }: GeneralProductFormProps) => {
  const { addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { branches } = useBranches();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(editProduct?.name || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [category, setCategory] = useState(editProduct?.category || '');
  const [unit, setUnit] = useState(editProduct?.unit || '');
  const [quantity, setQuantity] = useState(editProduct?.quantity?.toString() || '0');
  const [pricePerUnit, setPricePerUnit] = useState(editProduct?.price_per_unit.toString() || '');
  const [barcode, setBarcode] = useState(editProduct?.barcode || '');
  const [imageUrl, setImageUrl] = useState(editProduct?.image_url || '');
  const [isActive, setIsActive] = useState(editProduct?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchId, setBranchId] = useState(editProduct?.branch_id || '');

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name || '');
      setDescription(editProduct.description || '');
      setCategory(editProduct.category || '');
      setUnit(editProduct.unit || '');
      setQuantity(editProduct.quantity?.toString() || '0');
      setPricePerUnit(editProduct.price_per_unit.toString() || '');
      setBarcode(editProduct.barcode || '');
      setImageUrl(editProduct.image_url || '');
      setIsActive(editProduct.is_active ?? true);
      setBranchId(editProduct.branch_id || '');
    }
  }, [editProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !unit || !pricePerUnit) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const parsedPrice = parseFloat(pricePerUnit);
    
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const productData = {
      name: name.trim(),
      description: description.trim() || null,
      category,
      unit,
      quantity: parseInt(quantity) || 0,
      price_per_unit: parsedPrice,
      barcode: barcode.trim() || null,
      image_url: imageUrl || null,
      is_active: isActive,
      branch_id: branchId || null
    };
    
    try {
      if (editProduct) {
        const result = await updateProduct(editProduct.id, productData);
        if (result.success) {
          toast({
            title: "Success",
            description: "Product updated successfully",
          });
          onCancel();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update product",
            variant: "destructive"
          });
        }
      } else {
        const result = await addProduct(productData);
        if (result.success) {
          toast({
            title: "Success",
            description: "Product added successfully",
          });
          onCancel();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add product",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter branches based on user permissions
  const accessibleBranches = branches.filter(branch => 
    canAccessBranch(currentUser?.role || '', currentUser?.branch_id || null, branch.id)
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {editProduct ? 'Edit Product' : 'Add Product'}
          </h1>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name*</Label>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <ProductImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <select
                    id="category"
                    className="w-full p-2 border rounded-md"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <select
                    id="branch"
                    className="w-full p-2 border rounded-md"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">All Branches</option>
                    {accessibleBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit*</Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., kg, piece"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit (₹)*</Label>
                  <Input 
                    id="price"
                    type="number" 
                    min="0"
                    step="0.01"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Enter barcode"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active-status">Product Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-status"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="active-status" className="text-sm">
                    {isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-agri-primary hover:bg-agri-secondary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editProduct ? 'Update' : 'Add'} Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeneralProductForm;
