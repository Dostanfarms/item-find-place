
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus, Package, Eye, Edit2, Trash2, Copy, Menu } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import ProductForm from '@/components/ProductForm';
import ProductCopyDialog from '@/components/ProductCopyDialog';
import ProtectedAction from '@/components/ProtectedAction';
import BranchFilter from '@/components/BranchFilter';
import { format } from 'date-fns';
import FixedHeader from '@/components/layout/FixedHeader';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { products, loading, addProduct, updateProduct, deleteProduct, copyProduct } = useProducts();
  const { toast } = useToast();
  
  const itemsPerPage = 10;

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  // Filter products based on search query, category, and branch
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.farmer_id && product.farmer_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesBranch = selectedBranchFilter === 'all' || product.branch_id === selectedBranchFilter;
    
    return matchesSearch && matchesCategory && matchesBranch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateProduct = async (productData: any) => {
    const result = await addProduct(productData);
    if (result.success) {
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!selectedProduct) return;
    
    const result = await updateProduct(selectedProduct.id, productData);
    if (result.success) {
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleCopyProduct = async (productData: any) => {
    if (!selectedProduct) return;
    
    const result = await copyProduct(selectedProduct.id, productData);
    if (result.success) {
      setIsCopyDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Product copied successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to copy product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    const result = await deleteProduct(productId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleChangePhoto = () => {
    console.log('Change photo clicked');
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
  };

  return (
    <div className="flex-1 flex flex-col">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="flex-1 p-6 pt-20">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredProducts.length}</div>
              <p className="text-xs text-muted-foreground">
                Active products
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Badge variant="outline">{categories.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                Product categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <Badge variant="destructive">0</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Products running low
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <span className="text-lg">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{filteredProducts.reduce((total, product) => total + (product.price_per_unit * product.quantity), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Inventory value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products by name, category, or farmer ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <BranchFilter
            selectedBranch={selectedBranchFilter}
            onBranchChange={setSelectedBranchFilter}
          />
          
          <ProtectedAction resource="products" action="create">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </ProtectedAction>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products found matching your search criteria.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price per Unit</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{product.name}</div>
                              {product.farmer_id && (
                                <div className="text-sm text-muted-foreground">
                                  Farmer: {product.farmer_id}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{product.quantity}</span>
                              <Badge variant="secondary" className="text-xs">
                                {product.unit}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">₹{product.price_per_unit.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">₹{(product.price_per_unit * product.quantity).toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            {format(new Date(product.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <ProtectedAction resource="products" action="edit">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </ProtectedAction>
                              <ProtectedAction resource="products" action="create">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setIsCopyDialogOpen(true);
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </ProtectedAction>
                              <ProtectedAction resource="products" action="delete">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </ProtectedAction>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Product Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedProduct(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Copy Product Dialog */}
        <ProductCopyDialog
          open={isCopyDialogOpen}
          onOpenChange={setIsCopyDialogOpen}
          product={selectedProduct}
          onSubmit={handleCopyProduct}
        />
      </div>
    </div>
  );
};

export default Products;
