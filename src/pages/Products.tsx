
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useProducts } from '@/hooks/useProducts';
import { Search, Plus, Package, TrendingUp, AlertTriangle, Menu } from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import ProtectedAction from '@/components/ProtectedAction';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import FixedHeader from '@/components/layout/FixedHeader';

const Products = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { products, loading, addProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  const handleAddProduct = async (productData: any) => {
    const result = await addProduct(productData);
    if (result.success) {
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Product added successfully"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const getLowStockProducts = () => products.filter(p => p.quantity < 10).length;
  const getTotalValue = () => products.reduce((sum, p) => sum + (p.quantity * p.price_per_unit), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <FixedHeader />
      <div className="flex-1 p-6 pt-20"> {/* Added pt-20 for header space */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-muted-foreground">Manage your product inventory</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ProtectedAction resource="products" action="create">
              <Button 
                className="bg-agri-primary hover:bg-agri-secondary"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </ProtectedAction>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{getLowStockProducts()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{getTotalValue().toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(products.map(p => p.category)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No products found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? 'No products match your search criteria.' : 'Get started by adding your first product.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Category:</span> {product.category}</p>
                      <p><span className="font-medium">Price:</span> ₹{product.price_per_unit}/{product.unit}</p>
                      <p className={`${product.quantity < 10 ? 'text-red-600' : ''}`}>
                        <span className="font-medium">Stock:</span> {product.quantity} {product.unit}
                      </p>
                      {product.barcode && (
                        <p className="text-xs text-muted-foreground">Barcode: {product.barcode}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {hasPermission('products', 'create') && (
          <ProductForm 
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSubmit={handleAddProduct}
          />
        )}
      </div>
    </div>
  );
};

export default Products;
