
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Sidebar from '@/components/Sidebar';
import ProductForm from '@/components/ProductForm';
import { useFarmers, Farmer } from '@/hooks/useFarmers';
import { useProducts, Product } from '@/hooks/useProducts';
import { ArrowLeft, Plus, DollarSign, Edit } from 'lucide-react';
import { format } from 'date-fns';

const FarmerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { farmers, loading: farmersLoading } = useFarmers();
  const { products, addProduct, updateProduct } = useProducts();
  
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    if (id && farmers.length > 0) {
      const foundFarmer = farmers.find(farmer => farmer.id === id);
      if (foundFarmer) {
        setFarmer(foundFarmer);
        
        // Filter products for this farmer
        const filteredProducts = products.filter(product => product.farmer_id === id);
        setFarmerProducts(filteredProducts);
      } else {
        toast({
          title: "Farmer not found",
          description: "The requested farmer could not be found.",
          variant: "destructive"
        });
        navigate('/farmers');
      }
    }
  }, [id, farmers, products, navigate, toast]);

  // Update farmer products when products change
  useEffect(() => {
    if (id) {
      const filteredProducts = products.filter(product => product.farmer_id === id);
      setFarmerProducts(filteredProducts);
    }
  }, [products, id]);
  
  const handleProductSubmit = async (product: Product) => {
    if (!farmer) return;
    
    if (selectedProduct) {
      // Update existing product
      const result = await updateProduct(product.id, product);
      if (result.success) {
        setSelectedProduct(undefined);
        setIsProductDialogOpen(false);
        toast({
          title: "Product Updated",
          description: `Updated ${product.name} successfully`,
        });
      }
    } else {
      // Add new product
      const productData = {
        ...product,
        farmer_id: farmer.id
      };
      
      const result = await addProduct(productData);
      if (result.success) {
        setIsProductDialogOpen(false);
        toast({
          title: "Product Added",
          description: `Added ${product.quantity} ${product.unit} of ${product.name}`,
        });
      }
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };
  
  if (farmersLoading || !farmer) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p>Loading farmer details...</p>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const totalProductValue = farmerProducts.reduce((total, product) => {
    return total + (product.quantity * product.price_per_unit);
  }, 0);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/farmers')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Farmer Details</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{farmer.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        setSelectedProduct(undefined);
                        setIsProductDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <span>{farmer.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="text-right">{farmer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Address:</span>
                        <span className="text-right">{farmer.address || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Joined:</span>
                        <span>{format(new Date(farmer.date_joined), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Payment Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bank:</span>
                        <span>{farmer.bank_name || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Account:</span>
                        <span>{farmer.account_number || 'Not provided'}</span>
                      </div>
                      {farmer.ifsc_code && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">IFSC:</span>
                          <span>{farmer.ifsc_code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Total Product Value</p>
                  <p className="text-3xl font-bold text-green-600">₹{totalProductValue.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-xl font-semibold">{farmerProducts.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-sm font-semibold">{farmer.village || farmer.district || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Tabs defaultValue="products">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {farmerProducts.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No products added yet.</p>
                        <Button 
                          className="mt-2 bg-green-600 hover:bg-green-700"
                          onClick={() => setIsProductDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Product</th>
                              <th className="text-left p-2">Category</th>
                              <th className="text-left p-2">Date</th>
                              <th className="text-right p-2">Quantity</th>
                              <th className="text-right p-2">Unit Price (₹)</th>
                              <th className="text-right p-2">Total (₹)</th>
                              <th className="text-center p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {farmerProducts.map((product) => (
                              <tr key={product.id} className="border-b">
                                <td className="p-2">{product.name}</td>
                                <td className="p-2">{product.category || 'N/A'}</td>
                                <td className="p-2">{format(new Date(product.created_at), 'MMM dd, yyyy')}</td>
                                <td className="text-right p-2">{product.quantity} {product.unit}</td>
                                <td className="text-right p-2">₹{product.price_per_unit.toFixed(2)}</td>
                                <td className="text-right p-2 font-medium">
                                  ₹{(product.quantity * product.price_per_unit).toFixed(2)}
                                </td>
                                <td className="text-center p-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
            setIsProductDialogOpen(open);
            if (!open) setSelectedProduct(undefined);
          }}>
            <DialogContent>
              <ProductForm 
                farmerId={farmer.id} 
                onSubmit={handleProductSubmit} 
                onCancel={() => {
                  setIsProductDialogOpen(false);
                  setSelectedProduct(undefined);
                }}
                editProduct={selectedProduct}
              />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default FarmerDetails;
