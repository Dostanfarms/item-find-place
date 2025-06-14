
import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ProductForm from '@/components/ProductForm';
import { useProducts, Product } from '@/hooks/useProducts';
import { Search, Plus, Package, Edit, Printer, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Barcode128 from 'react-barcode-generator';

const Products = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  
  const { products, loading } = useProducts();

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const printBarcode = (product: Product) => {
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
                <span>${product.quantity} ${product.unit}</span>
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

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground text-lg">Loading products...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b bg-white">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Products Management</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products or barcodes..."
                    className="pl-8 w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setSelectedProduct(undefined);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-agri-primary hover:bg-agri-secondary">
                      <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <ProductForm 
                      onCancel={() => {
                        setIsDialogOpen(false);
                        setSelectedProduct(undefined);
                      }}
                      editProduct={selectedProduct}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden h-fit">
                    <CardHeader className="bg-muted pb-3">
                      <CardTitle className="text-base truncate">
                        {product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {/* Barcode Display */}
                      {product.barcode && (
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="mb-2">
                            <Barcode128 
                              value={product.barcode}
                              format="CODE128"
                              width={0.8}
                              height={20}
                              displayValue={true}
                              fontSize={6}
                              margin={0}
                            />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => printBarcode(product)}
                            className="w-full text-xs h-7"
                          >
                            <Printer className="h-3 w-3 mr-1" /> Print
                          </Button>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Quantity:</span>
                          <span className="text-sm font-semibold">{product.quantity} {product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Price/Unit:</span>
                          <span className="text-sm font-semibold">₹{product.price_per_unit}</span>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm"
                        className="w-full bg-agri-primary hover:bg-agri-secondary text-sm" 
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Products;
