
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Search, Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import ProductForm from '@/components/ProductForm';
import ProductCopyDialog from '@/components/ProductCopyDialog';
import BranchFilter from '@/components/BranchFilter';
import { useBranchName } from '@/hooks/useBranchName';
import FixedHeader from '@/components/layout/FixedHeader';
import ProfileChangeDialog from '@/components/profile/ProfileChangeDialog';

const Products = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { getBranchName } = useBranchName();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileMode, setProfileMode] = useState<'photo' | 'password'>('photo');

  const handleChangePhoto = () => {
    setProfileMode('photo');
    setShowProfileDialog(true);
  };

  const handleChangePassword = () => {
    setProfileMode('password');
    setShowProfileDialog(true);
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && product.category !== categoryFilter) {
      return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !product.is_active) return false;
      if (statusFilter === 'inactive' && product.is_active) return false;
    }
    if (typeFilter !== 'all' && product.type !== typeFilter) {
      return false;
    }
    return true;
  });

  // Get unique categories and types from products
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const types = [...new Set(products.map(p => p.type))].filter(Boolean);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleCopy = (product: any) => {
    setSelectedProduct(product);
    setShowCopyDialog(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddProduct = async (productData: any) => {
    const result = await addProduct(productData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      setShowAddDialog(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!selectedProduct) return;
    
    const result = await updateProduct(selectedProduct.id, productData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setShowEditDialog(false);
      setSelectedProduct(null);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleCopyProduct = async (productData: any) => {
    const result = await addProduct(productData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Product copied successfully",
      });
      setShowCopyDialog(false);
      setSelectedProduct(null);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to copy product",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="pt-20">
        <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Product Management</h1>
          </div>
          {hasPermission('products', 'create') && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <BranchFilter />
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-10 h-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.type}</Badge>
                      </TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock_quantity > 10 ? "default" : "destructive"}>
                          {product.stock_quantity} units
                        </Badge>
                      </TableCell>
                      <TableCell>{getBranchName(product.branch_id)}</TableCell>
                      <TableCell>{format(new Date(product.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/product-details/${product.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('products', 'edit') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('products', 'create') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(product)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('products', 'delete') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products found matching your search criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {showAddDialog && (
          <ProductForm
            open={showAddDialog}
            onClose={() => setShowAddDialog(false)}
            onSubmit={handleAddProduct}
          />
        )}

        {showEditDialog && selectedProduct && (
          <ProductForm
            open={showEditDialog}
            onClose={() => {
              setShowEditDialog(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onSubmit={handleUpdateProduct}
          />
        )}

        {showCopyDialog && selectedProduct && (
          <ProductCopyDialog
            open={showCopyDialog}
            onClose={() => {
              setShowCopyDialog(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onSubmit={handleCopyProduct}
          />
        )}

        <ProfileChangeDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          mode={profileMode}
        />
      </div>
    </div>
  );
};

export default Products;
