
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Package, Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import BranchFilter from '@/components/BranchFilter';
import { useAuth } from '@/context/AuthContext';
import ProductForm from '@/components/ProductForm';
import ProductCopyDialog from '@/components/ProductCopyDialog';
import FixedHeader from '@/components/layout/FixedHeader';

const Products = () => {
  const { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { currentUser, selectedBranch } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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
    setShowCopyDialog(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedProduct(null);
    fetchProducts(); // Refresh products after form operations
  };

  const handleCopySuccess = () => {
    setShowCopyDialog(false);
    setSelectedProduct(null);
    fetchProducts(); // Refresh products after copy operation
  };

  const handleCopyCancel = () => {
    setShowCopyDialog(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        fetchProducts();
      }
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
            <ProductForm
              editProduct={selectedProduct}
              onCancel={handleFormCancel}
              farmerId={selectedBranch || ''}
            />
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
            <Button onClick={handleCreateProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
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
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price/Unit</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
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
          selectedProducts={selectedProduct ? [selectedProduct] : []}
          onSuccess={handleCopySuccess}
        />
      )}
    </div>
  );
};

export default Products;
