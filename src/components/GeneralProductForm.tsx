import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategories } from '@/hooks/useCategories';
import { useProducts, Product } from '@/hooks/useProducts';
import { Barcode, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import MultipleImageUpload from './MultipleImageUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface GeneralProductFormProps {
  onCancel: () => void;
  editProduct?: Product;
}

const GeneralProductForm = ({ onCancel, editProduct }: GeneralProductFormProps) => {
  const { addProduct, updateProduct } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { toast } = useToast();
  const [name, setName] = useState(editProduct?.name || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [quantity, setQuantity] = useState(editProduct?.quantity.toString() || '1');
  const [unit, setUnit] = useState(editProduct?.unit || 'kg');
  const [pricePerUnit, setPricePerUnit] = useState(editProduct?.price_per_unit.toString() || '');
  const [category, setCategory] = useState(editProduct?.category || '');
  const [isActive, setIsActive] = useState(editProduct?.is_active ?? true);
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

  // Rich text editor configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'align', 'list', 'bullet', 'color', 'background', 'link'
  ];

  // Calculate total price
  const totalPrice = React.useMemo(() => {
    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = parseFloat(pricePerUnit);
    
    if (!isNaN(parsedQuantity) && !isNaN(parsedPrice) && parsedQuantity > 0 && parsedPrice > 0) {
      return parsedQuantity * parsedPrice;
    }
    return 0;
  }, [quantity, pricePerUnit]);

  // Set default category when categories load
  useEffect(() => {
    if (!editProduct && categories.length > 0 && !category) {
      // Set default to 'General' if available, otherwise first category
      const defaultCategory = categories.find(c => c.name === 'General') || categories[0];
      if (defaultCategory) {
        setCategory(defaultCategory.name);
      }
    }
  }, [categories, editProduct, category]);

  // Generate barcode for new products or keep existing barcode for edits
  const generateBarcode = () => {
    return `BAR${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !quantity || !pricePerUnit || !category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate numeric fields
    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = parseFloat(pricePerUnit);
    
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare image data
    const imageData = images.length > 0 ? JSON.stringify(images) : null;
    
    const productData = {
      name: name.trim(),
      description: description.trim() || null,
      quantity: Math.floor(parsedQuantity), // General products use integer quantities
      unit,
      price_per_unit: parsedPrice,
      category,
      barcode: editProduct?.barcode || generateBarcode(),
      image_url: imageData,
      is_active: isActive
    };
    
    console.log('Submitting general product data:', productData);
    
    try {
      if (editProduct) {
        // Update existing product
        console.log('Updating product with ID:', editProduct.id);
        const result = await updateProduct(editProduct.id, productData);
        console.log('Update result:', result);
        if (result.success) {
          toast({
            title: "Success",
            description: "Product updated successfully",
          });
          onCancel(); // Close form
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update product",
            variant: "destructive"
          });
        }
      } else {
        // Add new product
        console.log('Adding new product');
        const result = await addProduct(productData);
        console.log('Add result:', result);
        if (result.success) {
          toast({
            title: "Success",
            description: "Product added successfully",
          });
          // Reset form
          setName('');
          setDescription('');
          setQuantity('1');
          setPricePerUnit('');
          setImages([]);
          setIsActive(true);
          const defaultCategory = categories.find(c => c.name === 'General') || categories[0];
          setCategory(defaultCategory?.name || '');
          onCancel(); // Close form
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add product",
            variant: "destructive"
          });
        }
      }
      
    } catch (error) {
      console.error('Error saving general product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show alert if no categories are available
  if (!categoriesLoading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No categories available. Please add categories first from the Manage → Categories section.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={onCancel}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {editProduct ? 'Edit Product' : 'Add New Product'}
          </h1>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-6xl mx-auto">
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
                <Label htmlFor="product-description">Product Description</Label>
                <div className="border rounded-lg">
                  <ReactQuill
                    value={description}
                    onChange={setDescription}
                    modules={modules}
                    formats={formats}
                    placeholder="Enter product description..."
                    style={{ minHeight: '200px' }}
                    readOnly={isSubmitting}
                  />
                </div>
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
                  <Label htmlFor="category">Category*</Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory} 
                    disabled={isSubmitting || categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity*</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 1, 2, 3"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit*</Label>
                  <Select value={unit} onValueChange={setUnit} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="g">Gram (g)</SelectItem>
                      <SelectItem value="l">Liter (l)</SelectItem>
                      <SelectItem value="ml">Milliliter (ml)</SelectItem>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
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
              </div>

              {/* Total Price Display */}
              {totalPrice > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Total Price:</span>
                    <span className="text-lg font-bold text-agri-primary">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {quantity} {unit} × ₹{pricePerUnit} per {unit}
                  </div>
                </div>
              )}

              {editProduct?.barcode && (
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Barcode className="h-4 w-4" />
                    <span className="font-mono text-sm">{editProduct.barcode}</span>
                  </div>
                </div>
              )}
              
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
                  disabled={isSubmitting || categoriesLoading || categories.length === 0}
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
