
import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
        <div className="flex-1 flex flex-col min-w-0">
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
          <div className="flex-1 p-6 min-h-0">
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
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-xl">Product Inventory</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 min-h-0">
                  <div className="h-full overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead className="w-[25%]">Product Name</TableHead>
                          <TableHead className="w-[15%]">Category</TableHead>
                          <TableHead className="w-[12%]">Quantity</TableHead>
                          <TableHead className="w-[12%]">Price/Unit</TableHead>
                          <TableHead className="w-[20%]">Barcode</TableHead>
                          <TableHead className="text-right w-[16%]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium truncate" title={product.name}>
                              {product.name}
                            </TableCell>
                            <TableCell className="truncate" title={product.category}>
                              {product.category}
                            </TableCell>
                            <TableCell>
                              {product.quantity} {product.unit}
                            </TableCell>
                            <TableCell>₹{product.price_per_unit}</TableCell>
                            <TableCell>
                              {product.barcode && (
                                <div className="flex items-center gap-2">
                                  <div className="text-xs truncate max-w-[100px]" title={product.barcode}>
                                    {product.barcode}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => printBarcode(product)}
                                    className="h-6 px-2"
                                  >
                                    <Printer className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                title="Edit Product"
                              >
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
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
      </div>
    </SidebarProvider>
  );
};

export default Products;
