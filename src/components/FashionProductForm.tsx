
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useFashionProducts, FashionProduct } from '@/hooks/useFashionProducts';
import { Shirt, Plus, Minus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MultipleImageUpload from './MultipleImageUpload';

interface FashionProductFormProps {
  onCancel: () => void;
  editProduct?: FashionProduct;
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const FashionProductForm = ({ onCancel, editProduct }: FashionProductFormProps) => {
  const { addFashionProduct, updateFashionProduct } = useFashionProducts();
  const { toast } = useToast();
  const [name, setName] = useState(editProduct?.name || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [pricePerUnit, setPricePerUnit] = useState(editProduct?.price_per_unit.toString() || '');
  const [isActive, setIsActive] = useState(editProduct?.is_active ?? true);
  const [sizes, setSizes] = useState<{ size: string; pieces: number }[]>(() => {
    if (editProduct?.sizes) {
      return editProduct.sizes.map(s => ({ size: s.size, pieces: s.pieces }));
    }
    return AVAILABLE_SIZES.map(size => ({ size, pieces: 0 }));
  });
  const [images, setImages] = useState<string[]>(() => {
    if (!editProduct?.image_url) return [];
    try {
      const parsed = JSON.parse(editProduct.image_url);
      return Array.isArray(parsed) ? parsed : [editProduct.image_url];
    } catch {
      return editProduct.image_url ? [editProduct.image_url] : [];
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSizeQuantity = (targetSize: string, pieces: number) => {
    setSizes(prev => prev.map(size => 
      size.size === targetSize ? { ...size, pieces: Math.max(0, pieces) } : size
    ));
  };

  const incrementSize = (targetSize: string) => {
    setSizes(prev => prev.map(size => 
      size.size === targetSize ? { ...size, pieces: size.pieces + 1 } : size
    ));
  };

  const decrementSize = (targetSize: string) => {
    setSizes(prev => prev.map(size => 
      size.size === targetSize ? { ...size, pieces: Math.max(0, size.pieces - 1) } : size
    ));
  };

  const totalPieces = sizes.reduce((total, size) => total + size.pieces, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !pricePerUnit) {
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

    if (totalPieces === 0) {
      toast({
        title: "No stock",
        description: "Please add at least one piece for any size",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const imageData = images.length > 0 ? JSON.stringify(images) : null;
    
    const productData = {
      name: name.trim(),
      description: description.trim() || null,
      price_per_unit: parsedPrice,
      category: 'Fashion',
      image_url: imageData,
      is_active: isActive
    };
    
    try {
      if (editProduct) {
        const result = await updateFashionProduct(editProduct.id, productData, sizes);
        if (result.success) {
          toast({
            title: "Success",
            description: "Fashion product updated successfully",
          });
          onCancel();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update fashion product",
            variant: "destructive"
          });
        }
      } else {
        const result = await addFashionProduct(productData, sizes);
        if (result.success) {
          toast({
            title: "Success",
            description: "Fashion product added successfully",
          });
          onCancel();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add fashion product",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error saving fashion product:', error);
      toast({
        title: "Error",
        description: "Failed to save fashion product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {editProduct ? 'Edit Fashion Product' : 'Add Fashion Product'}
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
                  placeholder="Enter fashion product name"
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
                <MultipleImageUpload
                  value={images}
                  onChange={setImages}
                  disabled={isSubmitting}
                  maxImages={4}
                />
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
              </div>

              {/* Size Management */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shirt className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Size & Stock Management</h3>
                    <Badge variant="outline">Total: {totalPieces} pieces</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {AVAILABLE_SIZES.map((size) => {
                      const sizeData = sizes.find(s => s.size === size);
                      const pieces = sizeData?.pieces || 0;
                      
                      return (
                        <div key={size} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Size {size}</Label>
                            <Badge 
                              variant={pieces > 10 ? "default" : pieces > 0 ? "secondary" : "destructive"}
                              className={pieces < 10 && pieces > 0 ? "bg-yellow-500" : ""}
                            >
                              {pieces}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => decrementSize(size)}
                              disabled={pieces <= 0 || isSubmitting}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <Input
                              type="number"
                              min="0"
                              value={pieces}
                              onChange={(e) => updateSizeQuantity(size, parseInt(e.target.value) || 0)}
                              className="text-center h-8"
                              disabled={isSubmitting}
                            />
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => incrementSize(size)}
                              disabled={isSubmitting}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPieces === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No stock available for any size</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
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
                  {isSubmitting ? 'Saving...' : editProduct ? 'Update' : 'Add'} Fashion Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FashionProductForm;
