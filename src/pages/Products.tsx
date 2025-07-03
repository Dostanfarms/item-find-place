
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProducts, Product } from '@/hooks/useProducts';
import { useFashionProducts } from '@/hooks/useFashionProducts';
import { useCategories } from '@/hooks/useCategories';
import { Search, Plus, Package, Edit, Printer, Shirt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GeneralProductForm from '@/components/GeneralProductForm';
import FashionProductForm from '@/components/FashionProductForm';
import ProtectedAction from '@/components/ProtectedAction';
import { useAuth } from '@/context/AuthContext';

const Products = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [selectedFashionProduct, setSelectedFashionProduct] = useState<any>(undefined);
  
  const { products, loading: productsLoading } = useProducts();
  const { fashionProducts, loading: fashionLoading } = useFashionProducts();
  const { categories } = useCategories();

  const loading = productsLoading || fashionLoading;

  // Combine all products based on selected category
  const getAllProducts = () => {
    if (selectedCategory === 'all') {
      return [
        ...products.map(p => ({ ...p, type: 'general' as const })),
        ...fashionProducts.map(p => ({ 
          ...p, 
          type: 'fashion' as const, 
          totalPieces: p.sizes?.reduce((sum, s) => sum + s.pieces, 0) || 0,
          quantity: undefined, // Fashion products don't have quantity
          unit: undefined // Fashion products don't have unit
        }))
      ];
    } else if (selectedCategory === 'Fashion') {
      return fashionProducts.map(p => ({ 
        ...p, 
        type: 'fashion' as const, 
        totalPieces: p.sizes?.reduce((sum, s) => sum + s.pieces, 0) || 0,
        quantity: undefined,
        unit: undefined
      }));
    } else {
      return products.filter(p => p.category === selectedCategory).map(p => ({ ...p, type: 'general' as const }));
    }
  };

  const allProducts = getAllProducts();

  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditProduct = (product: any) => {
    if (!hasPermission('products', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit products",
        variant: "destructive"
      });
      return;
    }
    if (product.type === 'fashion') {
      setSelectedFashionProduct(product);
    } else {
      setSelectedProduct(product);
    }
    setShowForm(true);
  };

  const handleCreateProduct = () => {
    if (!hasPermission('products', 'create')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create products",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedCategory === 'Fashion') {
      setSelectedFashionProduct(undefined);
    } else {
      setSelectedProduct(undefined);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProduct(undefined);
    setSelectedFashionProduct(undefined);
  };

  const printBarcode = (product: any) => {
    if (!hasPermission('products', 'view')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to print barcodes",
        variant: "destructive"
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode - ${product.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
                margin: 0;
              }
              .barcode-container { 
                border: 2px solid #000; 
                padding: 30px; 
                display: inline-block; 
                background: white;
                max-width: 500px;
              }
              .product-info { 
                font-size: 32px; 
                font-weight: bold; 
                margin-bottom: 20px; 
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
              }
              .barcode-image { 
                margin: 20px 0;
                max-width: 100%;
              }
              @media print {
                body { margin: 0; }
                .barcode-container { border: 2px solid #000; }
              }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          </head>
          <body>
            <div class="barcode-container">
              <div class="product-info">
                <span>${product.name}</span>
                <span>${product.type === 'fashion' ? `${product.totalPieces} pieces` : `${product.quantity} ${product.unit}`}</span>
              </div>
              <svg id="barcode" class="barcode-image"></svg>
            </div>
            <script>
              JsBarcode("#barcode", "${product.barcode}", {
                format: "CODE128",
                width: 3,
                height: 100,
                displayValue: true,
                fontSize: 16
              });
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      toast({
        title: "Barcode printed",
        description: `Barcode for ${product.name} has been sent to printer`,
      });
    } else {
      toast({
        title: "Unable to print",
        description: "Please check your browser settings and try again.",
        variant: "destructive"
      });
    }
  };

  // Check if user has permission to view products
  if (!hasPermission('products', 'view')) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view products.</p>
        </div>
      </div>
    );
  }

  // Show form if requested
  if (showForm) {
    if (selectedCategory === 'Fashion' || selectedFashionProduct) {
      return (
        <FashionProductForm 
          onCancel={handleCloseForm}
          editProduct={selectedFashionProduct}
        />
      );
    } else {
      return (
        <GeneralProductForm 
          onCancel={handleCloseForm}
          editProduct={selectedProduct}
        />
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-lg">Loading products...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products Management</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or barcodes..."
                  className="pl-8 w-full sm:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ProtectedAction resource="products" action="create">
                <Button className="bg-agri-primary hover:bg-agri-secondary" onClick={handleCreateProduct}>
                  <Plus className="mr-2 h-4 w-4" /> 
                  {selectedCategory === 'Fashion' ? 'Add Fashion Product' : 'Add Product'}
                </Button>
              </ProtectedAction>
            </div>
          </div>
          
          {/* Category Filter Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {categories.filter(cat => cat.is_active).map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="flex items-center gap-1"
              >
                {category.name === 'Fashion' && <Shirt className="h-3 w-3" />}
                {category.name}
              </Button>
            ))}
            {/* Add Fashion category button if there are fashion products */}
            {fashionProducts.length > 0 && (
              <Button
                variant={selectedCategory === 'Fashion' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Fashion')}
                className="flex items-center gap-1"
              >
                <Shirt className="h-3 w-3" />
                Fashion
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] bg-white rounded-lg border">
            <Package className="h-16 w-16 text-muted-foreground mb-6" />
            {searchTerm ? (
              <>
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground text-center">
                  No products match your search criteria. Try with a different name or barcode.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium mb-2">No products added yet</h3>
                <p className="text-muted-foreground text-center">
                  Get started by adding your first product using the "Add Product" button.
                </p>
              </>
            )}
          </div>
        ) : (
          <Card className="border shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">
                Product Inventory 
                {selectedCategory !== 'all' && (
                  <span className="text-base font-normal text-muted-foreground ml-2">
                    - {selectedCategory} ({filteredProducts.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[150px] font-semibold">Product Name</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Category</TableHead>
                      <TableHead className="min-w-[80px] font-semibold">Stock</TableHead>
                      <TableHead className="min-w-[80px] font-semibold">Price/Unit</TableHead>
                      <TableHead className="min-w-[80px] font-semibold">Status</TableHead>
                      <TableHead className="min-w-[140px] font-semibold">Barcode</TableHead>
                      <TableHead className="min-w-[100px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50 border-b">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {product.type === 'fashion' && <Shirt className="h-4 w-4 text-purple-600" />}
                            <div className="max-w-[150px] truncate" title={product.name}>
                              {product.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[100px] truncate" title={product.category}>
                            {product.category}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {product.type === 'fashion' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span>{(product as any).totalPieces} pieces</span>
                                {(product as any).totalPieces < 10 && (
                                  <Badge variant="destructive" className="text-xs">
                                    Low Stock
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {(product as any).sizes?.map((s: any) => `${s.size}: ${s.pieces}`).join(', ')}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{(product as any).quantity} {(product as any).unit}</span>
                              {(product as any).quantity < 10 && (
                                <Badge variant="destructive" className="text-xs">
                                  Low Stock
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          ₹{product.price_per_unit}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.is_active !== false ? "default" : "secondary"}
                            className={product.is_active !== false ? "bg-green-500" : "bg-gray-500"}
                          >
                            {product.is_active !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.barcode ? (
                            <div className="flex items-center gap-2 max-w-[140px]">
                              <div className="text-xs font-mono truncate flex-1" title={product.barcode}>
                                {product.barcode}
                              </div>
                              <ProtectedAction resource="products" action="view">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => printBarcode(product)}
                                  className="h-7 w-7 p-0 flex-shrink-0"
                                  title="Print Barcode"
                                >
                                  <Printer className="h-3 w-3" />
                                </Button>
                              </ProtectedAction>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No barcode</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <ProtectedAction resource="products" action="edit">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="h-7 px-2"
                              title="Edit Product"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </ProtectedAction>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Products;
