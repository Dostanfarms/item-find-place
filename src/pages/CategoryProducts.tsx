
import React, { useState } from 'react';
import CategoryHeader from '@/components/CategoryHeader';
import CategoryProductTable from '@/components/CategoryProductTable';
import DynamicProductForm from '@/components/DynamicProductForm';
import { DynamicProduct, useDynamicCategoryProducts } from '@/hooks/useDynamicCategoryProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const CategoryProducts = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<DynamicProduct | undefined>(undefined);
  
  const {
    productsByCategory,
    loading,
    getAllProducts,
    getProductsByCategory,
    getProductCounts,
    refetch
  } = useDynamicCategoryProducts();

  const productCounts = getProductCounts();

  const getFilteredProducts = () => {
    if (selectedCategory === 'all') {
      return getAllProducts();
    } else {
      return getProductsByCategory(selectedCategory);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleEditProduct = (product: DynamicProduct) => {
    if (!hasPermission('products', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit products",
        variant: "destructive"
      });
      return;
    }
    setEditProduct(product);
    setShowForm(true);
  };

  const handleAddProduct = () => {
    if (!hasPermission('products', 'create')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create products",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedCategory === 'all') {
      toast({
        title: "Select Category",
        description: "Please select a specific category to add products",
        variant: "destructive"
      });
      return;
    }
    
    setEditProduct(undefined);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditProduct(undefined);
  };

  const handleFormSuccess = () => {
    refetch();
    handleCloseForm();
  };

  const handlePrintBarcode = (product: DynamicProduct) => {
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
              </div>
              <svg id="barcode" class="barcode-image"></svg>
            </div>
            <script>
              JsBarcode("#barcode", "${product.barcode || product.id}", {
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
  if (showForm && selectedCategory !== 'all') {
    return (
      <DynamicProductForm 
        category={selectedCategory}
        onCancel={handleCloseForm}
        onSuccess={handleFormSuccess}
        editProduct={editProduct}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Category Products Management</h1>
          </div>
          
          <CategoryHeader
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            productCounts={productCounts}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] bg-white rounded-lg border">
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {selectedCategory === 'all' 
                ? "No products available in any category."
                : `No products found in ${selectedCategory} category.`
              }
            </p>
            {selectedCategory !== 'all' && categories.some(c => c.name === selectedCategory) && (
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add First {selectedCategory} Product
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedCategory === 'all' ? 'All Products' : `${selectedCategory} Products`}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({filteredProducts.length} items)
                  </span>
                </h2>
                {selectedCategory !== 'all' && categories.some(c => c.name === selectedCategory) && (
                  <button
                    onClick={handleAddProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Add {selectedCategory} Product
                  </button>
                )}
              </div>
            </div>
            
            <CategoryProductTable
              products={filteredProducts}
              category={selectedCategory}
              onEdit={handleEditProduct}
              onPrintBarcode={handlePrintBarcode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
