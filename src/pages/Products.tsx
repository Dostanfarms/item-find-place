
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Package, Eye, Edit, Copy, Trash2, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import BranchFilter from '@/components/BranchFilter';
import { useAuth } from '@/context/AuthContext';
import ProductCopyDialog from '@/components/ProductCopyDialog';
import FixedHeader from '@/components/layout/FixedHeader';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { currentUser, selectedBranch } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkCopyMode, setBulkCopyMode] = useState(false);

  // Form state for product creation/editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    unit: 'kg',
    price_per_unit: 0,
    category: '',
    barcode: '',
    image_url: '',
    is_active: true,
    branch_id: selectedBranch || ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Reset form data when selectedProduct changes
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        quantity: selectedProduct.quantity || 0,
        unit: selectedProduct.unit || 'kg',
        price_per_unit: selectedProduct.price_per_unit || 0,
        category: selectedProduct.category || '',
        barcode: selectedProduct.barcode || '',
        image_url: selectedProduct.image_url || '',
        is_active: selectedProduct.is_active !== false,
        branch_id: selectedProduct.branch_id || selectedBranch || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        quantity: 0,
        unit: 'kg',
        price_per_unit: 0,
        category: categories.length > 0 ? categories[0].name : '',
        barcode: '',
        image_url: '',
        is_active: true,
        branch_id: selectedBranch || ''
      });
    }
  }, [selectedProduct, categories, selectedBranch]);

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCopyProduct = (product: any) => {
    setSelectedProduct(product);
    setSelectedProducts([]);
    setShowCopyDialog(true);
  };

  const handleBulkCopy = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one product to copy.",
        variant: "destructive"
      });
      return;
    }
    
    const productsToyCopy = products.filter(p => selectedProducts.includes(p.id));
    setSelectedProduct(null);
    setShowCopyDialog(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price_per_unit <= 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      let result;
      if (selectedProduct) {
        result = await updateProduct(selectedProduct.id, formData);
      } else {
        result = await addProduct(formData);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: selectedProduct ? "Product updated successfully" : "Product created successfully"
        });
        setShowForm(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save product",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting product form:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleCopySuccess = () => {
    setShowCopyDialog(false);
    setSelectedProduct(null);
    setSelectedProducts([]);
    setBulkCopyMode(false);
    fetchProducts();
  };

  const handleCopyCancel = () => {
    setShowCopyDialog(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully"
        });
        fetchProducts();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product",
          variant: "destructive"
        });
      }
    }
  };

  const handleProductSelection = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Apply filters
  const filteredProducts = products.filter(product => {
    // Branch filter for admin users
    if (currentUser?.role?.toLowerCase() === 'admin' && selectedBranch) {
      if (product.branch_id !== selectedBranch) return false;
    }
    
    // Search filter
    if (searchTerm && 
        !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.category.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(product.barcode && product.barcode.includes(searchTerm))) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && product.category !== categoryFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      const isActive = product.is_active;
      if (statusFilter === 'active' && !isActive) return false;
      if (statusFilter === 'inactive' && isActive) return false;
    }
    
    return true;
  });

  const activeCategories = categories.filter(cat => cat.is_active);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FixedHeader 
          onChangePhoto={() => {}} 
          onChangePassword={() => {}} 
        />
        <div className="pt-16">
          <div className="container mx-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedProduct ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product Name*</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category*</label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity*</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unit*</label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="g">Gram (g)</SelectItem>
                          <SelectItem value="l">Liter (l)</SelectItem>
                          <SelectItem value="ml">Milliliter (ml)</SelectItem>
                          <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="quintal">Quintal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price per Unit (₹)*</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price_per_unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Barcode</label>
                      <Input
                        value={formData.barcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                        placeholder="Enter barcode (optional)"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter product description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="Enter image URL"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked as boolean }))}
                    />
                    <label htmlFor="is_active" className="text-sm font-medium">
                      Active Product
                    </label>
                  </div>
                  
                  <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={handleFormCancel}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedProduct ? 'Update' : 'Create'} Product
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FixedHeader 
          onChangePhoto={() => {}} 
          onChangePassword={() => {}} 
        />
        <div className="pt-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FixedHeader 
        onChangePhoto={() => {}} 
        onChangePassword={() => {}} 
      />
      <div className="pt-16">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Product Management</h1>
            </div>
            <div className="flex gap-2">
              {!bulkCopyMode && selectedProducts.length === 0 && (
                <>
                  <Button variant="outline" onClick={() => setBulkCopyMode(true)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Bulk Copy
                  </Button>
                  <Button onClick={handleCreateProduct}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </>
              )}
              {(bulkCopyMode || selectedProducts.length > 0) && (
                <>
                  <Button onClick={handleBulkCopy} disabled={selectedProducts.length === 0}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Selected ({selectedProducts.length})
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setBulkCopyMode(false);
                    setSelectedProducts([]);
                  }}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <BranchFilter />
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, category, or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {activeCategories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {(bulkCopyMode || selectedProducts.length > 0) && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                      )}
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price/Unit</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Status</TableHead>
                      {!bulkCopyMode && (
                        <TableHead>Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        {(bulkCopyMode || selectedProducts.length > 0) && (
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.description && product.description.length > 50
                                  ? `${product.description.substring(0, 50)}...`
                                  : product.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.price_per_unit}/{product.unit}</TableCell>
                        <TableCell>
                          <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                            {product.quantity} {product.unit}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.barcode || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {!bulkCopyMode && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCopyProduct(product)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Copy Dialog */}
      {showCopyDialog && (
        <ProductCopyDialog
          open={showCopyDialog}
          onClose={handleCopyCancel}
          selectedProducts={
            selectedProducts.length > 0 
              ? products.filter(p => selectedProducts.includes(p.id))
              : selectedProduct ? [selectedProduct] : []
          }
          onSuccess={handleCopySuccess}
        />
      )}
    </div>
  );
};

export default Products;
