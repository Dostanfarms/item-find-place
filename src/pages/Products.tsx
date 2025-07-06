
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Search } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useFashionProducts } from '@/hooks/useFashionProducts';
import ProductForm from '@/components/ProductForm';
import FashionProductForm from '@/components/FashionProductForm';
import GeneralProductForm from '@/components/GeneralProductForm';
import { useCategories } from '@/hooks/useCategories';
import BranchFilter from '@/components/BranchFilter';
import { useBranches } from '@/hooks/useBranches';
import { Product, FashionProduct } from '@/utils/types';

const Products = () => {
  const { products, loading: productsLoading, deleteProduct } = useProducts();
  const { fashionProducts, loading: fashionLoading } = useFashionProducts();
  const { categories } = useCategories();
  const { branches } = useBranches();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(Product & { type: 'general' }) | (FashionProduct & { type: 'fashion' }) | null>(null);
  const [productType, setProductType] = useState<'general' | 'fashion'>('general');

  // Combine all products with branch information
  const allProducts = useMemo(() => {
    const generalProducts = products.map(p => ({ ...p, type: 'general' as const }));
    const fashionProductsWithType = fashionProducts.map(p => ({ ...p, type: 'fashion' as const }));
    return [...generalProducts, ...fashionProductsWithType];
  }, [products, fashionProducts]);

  // Filter products based on search, category, and branch
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      const matchesBranch = !selectedBranch || product.branch_id === selectedBranch;
      
      // Also search by branch name if search term is provided
      const matchesBranchName = !searchTerm || (product.branch_id && branches.some(branch => 
        branch.id === product.branch_id && 
        (branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         branch.branch_owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
      ));

      return matchesSearch && matchesCategory && matchesBranch && matchesBranchName;
    });
  }, [allProducts, searchTerm, selectedCategory, selectedBranch, branches]);

  const handleDelete = async (id: string, type: 'general' | 'fashion') => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      if (type === 'general') {
        await deleteProduct(id);
      }
      // Fashion product deletion would be handled by useFashionProducts
    }
  };

  const getTotalStock = () => {
    return filteredProducts.reduce((sum, product) => {
      if (product.type === 'fashion') {
        const fashionProduct = product as FashionProduct & { type: 'fashion' };
        return sum + (fashionProduct.sizes?.reduce((sizeSum, size) => sizeSum + size.pieces, 0) || 0);
      }
      const generalProduct = product as Product & { type: 'general' };
      return sum + (generalProduct.quantity || 0);
    }, 0);
  };

  const getActiveProducts = () => {
    return filteredProducts.filter(product => {
      if (product.type === 'fashion') {
        const fashionProduct = product as FashionProduct & { type: 'fashion' };
        return product.is_active !== false && fashionProduct.sizes?.some(size => size.pieces > 0);
      }
      const generalProduct = product as Product & { type: 'general' };
      return product.is_active !== false && generalProduct.quantity > 0;
    }).length;
  };

  if (productsLoading || fashionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex-none flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setProductType('general');
              setIsAddingProduct(true);
            }}
            className="bg-agri-primary hover:bg-agri-secondary"
          >
            <Plus className="mr-2 h-4 w-4" /> Add General Product
          </Button>
          <Button 
            onClick={() => {
              setProductType('fashion');
              setIsAddingProduct(true);
            }}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Fashion Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-none mb-6 space-y-4">
        <BranchFilter
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by product name, category, branch name or owner..."
        />
        
        <div className="flex gap-4">
          <select
            className="px-3 py-2 border rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedBranch ? 'In selected branch' : 'All products'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveProducts()}</div>
            <p className="text-xs text-green-600">In stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalStock()}</div>
            <p className="text-xs text-muted-foreground">Units/Pieces</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <div className="flex-1 overflow-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No products found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedBranch || selectedCategory !== 'all' 
                ? 'No products match your search criteria.' 
                : 'Get started by adding your first product.'}
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Product</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Stock</th>
                      <th className="text-left p-4 font-medium">Price</th>
                      <th className="text-left p-4 font-medium">Branch</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const branch = branches.find(b => b.id === product.branch_id);
                      
                      let stock = 0;
                      let unit = '';
                      
                      if (product.type === 'fashion') {
                        const fashionProduct = product as FashionProduct & { type: 'fashion' };
                        stock = fashionProduct.sizes?.reduce((sum, size) => sum + size.pieces, 0) || 0;
                        unit = 'pieces';
                      } else {
                        const generalProduct = product as Product & { type: 'general' };
                        stock = generalProduct.quantity || 0;
                        unit = generalProduct.unit || 'units';
                      }
                      
                      return (
                        <tr key={`${product.type}-${product.id}`} className="border-b hover:bg-muted/25">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {product.type === 'fashion' ? 'Fashion Item' : unit}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{stock}</div>
                            <div className="text-sm text-muted-foreground">{unit}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">₹{product.price_per_unit}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {branch ? `${branch.branch_name}` : 'No Branch'}
                              {branch && (
                                <div className="text-xs text-muted-foreground">
                                  {branch.branch_owner_name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant={product.is_active !== false && stock > 0 ? "default" : "secondary"}
                              className={product.is_active !== false && stock > 0 ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {product.is_active !== false && stock > 0 ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingProduct(product)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(product.id, product.type)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Product Dialogs */}
      {isAddingProduct && (
        productType === 'general' ? (
          <GeneralProductForm
            onCancel={() => setIsAddingProduct(false)}
          />
        ) : (
          <FashionProductForm
            onCancel={() => setIsAddingProduct(false)}
          />
        )
      )}

      {editingProduct && (
        editingProduct.type === 'general' ? (
          <GeneralProductForm
            onCancel={() => setEditingProduct(null)}
            editProduct={editingProduct as Product}
          />
        ) : (
          <FashionProductForm
            onCancel={() => setEditingProduct(null)}
            editProduct={editingProduct as FashionProduct}
          />
        )
      )}
    </div>
  );
};

export default Products;
