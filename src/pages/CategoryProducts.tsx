
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';
import CategoryHeader from '@/components/CategoryHeader';
import CategoryProductTable from '@/components/CategoryProductTable';
import FashionProductForm from '@/components/FashionProductForm';
import ProtectedAction from '@/components/ProtectedAction';
import { useAuth } from '@/context/AuthContext';

const CategoryProducts = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFashionForm, setShowFashionForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const {
    fashionProducts,
    vegetableProducts,
    fruitProducts,
    grainProducts,
    dairyProducts,
    loading,
    refetch
  } = useCategoryProducts();

  const productCounts = {
    fashion: fashionProducts.length,
    vegetables: vegetableProducts.length,
    fruits: fruitProducts.length,
    grains: grainProducts.length,
    dairy: dairyProducts.length
  };

  const getFilteredProducts = () => {
    let products: any[] = [];
    
    switch (selectedCategory) {
      case 'Fashion':
        products = fashionProducts;
        break;
      case 'Vegetables':
        products = vegetableProducts;
        break;
      case 'Fruits':
        products = fruitProducts;
        break;
      case 'Grains':
        products = grainProducts;
        break;
      case 'Dairy':
        products = dairyProducts;
        break;
      default:
        products = [
          ...fashionProducts,
          ...vegetableProducts,
          ...fruitProducts,
          ...grainProducts,
          ...dairyProducts
        ];
    }

    if (searchTerm) {
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return products;
  };

  const handleEditProduct = (product: any) => {
    if (!hasPermission('products', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit products",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedCategory === 'Fashion' || product.category === 'Fashion') {
      setEditingProduct(product);
      setShowFashionForm(true);
    } else {
      // Handle other category products
      toast({
        title: "Feature Coming Soon",
        description: "Editing for this category will be available soon.",
      });
    }
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
      setEditingProduct(null);
      setShowFashionForm(true);
    } else {
      toast({
        title: "Select Fashion Category",
        description: "Please select Fashion category to add fashion products with sizes.",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowFashionForm(false);
    setEditingProduct(null);
    refetch();
  };

  const handleFormCancel = () => {
    setShowFashionForm(false);
    setEditingProduct(null);
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
                <span>${selectedCategory === 'Fashion' ? (product.total_pieces || 0) : (product.quantity || 0)} ${selectedCategory === 'Fashion' ? 'pieces' : (product.unit || 'unit')}</span>
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
  if (showFashionForm) {
    return (
      <FashionProductForm 
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
        editProduct={editingProduct}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-lg">Loading products...</div>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Category Products Management</h1>
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
                <Button 
                  className="bg-agri-primary hover:bg-agri-secondary" 
                  onClick={handleCreateProduct}
                  disabled={selectedCategory !== 'Fashion' && selectedCategory !== 'all'}
                >
                  <Plus className="mr-2 h-4 w-4" /> 
                  Add {selectedCategory === 'Fashion' ? 'Fashion Product' : 'Product'}
                </Button>
              </ProtectedAction>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        <CategoryHeader
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          productCounts={productCounts}
        />

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] bg-white rounded-lg border">
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
                <h3 className="text-xl font-medium mb-2">No products in {selectedCategory === 'all' ? 'any category' : selectedCategory}</h3>
                <p className="text-muted-foreground text-center">
                  Get started by adding your first {selectedCategory === 'all' ? '' : selectedCategory.toLowerCase()} product.
                </p>
              </>
            )}
          </div>
        ) : (
          <Card className="border shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">
                {selectedCategory === 'all' ? 'All Products' : `${selectedCategory} Products`} ({filteredProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CategoryProductTable
                products={filteredProducts}
                category={selectedCategory}
                onEdit={handleEditProduct}
                onPrintBarcode={printBarcode}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
