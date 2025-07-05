
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanBarcode, ShoppingCart, Trash2, Plus, Minus, Search, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useFashionProducts } from '@/hooks/useFashionProducts';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from '@/hooks/use-toast';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  category: string;
  unit: string;
  imageUrl?: string;
}

const Sales = () => {
  const navigate = useNavigate();
  const [saleItems, setSaleItems] = useState<SaleItem[]>(() => {
    // Load cart items from localStorage on component mount
    const storedItems = localStorage.getItem('checkoutItems');
    return storedItems ? JSON.parse(storedItems) : [];
  });
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { products } = useProducts();
  const { fashionProducts } = useFashionProducts();

  const allProducts = [...products, ...fashionProducts];

  // Filter products based on search term
  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBarcodeScanned = (barcode: string) => {
    const product = allProducts.find(p => p.barcode === barcode);
    
    if (product) {
      addToCart(product);
    } else {
      toast({
        title: "Product Not Found",
        description: "No product found with this barcode",
        variant: "destructive",
      });
    }
  };

  const addToCart = (product: any) => {
    const existingItem = saleItems.find(item => item.barcode === product.barcode);
    
    if (existingItem) {
      const updatedItems = saleItems.map(item => 
        item.barcode === product.barcode 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setSaleItems(updatedItems);
      localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
    } else {
      const newItem: SaleItem = {
        id: Date.now().toString(),
        name: product.name,
        price: product.price_per_unit,
        quantity: 1,
        barcode: product.barcode || '',
        category: product.category,
        unit: (product as any).unit || 'piece',
        imageUrl: product.image_url
      };
      const updatedItems = [...saleItems, newItem];
      setSaleItems(updatedItems);
      localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
    }
    
    toast({
      title: "Product Added",
      description: `${product.name} added to cart`,
    });
  };

  const updateQuantity = (id: string, change: number) => {
    const updatedItems = saleItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setSaleItems(updatedItems);
    localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
  };

  const removeItem = (id: string) => {
    const updatedItems = saleItems.filter(item => item.id !== id);
    setSaleItems(updatedItems);
    localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
  };

  const subtotal = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleProceedToCheckout = () => {
    if (saleItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    // Store cart items in localStorage for checkout page
    localStorage.setItem('checkoutItems', JSON.stringify(saleItems));
    navigate('/checkout');
  };

  // Helper function to get product images
  const getProductImages = (imageUrl?: string): string[] => {
    if (!imageUrl) return [];
    
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [imageUrl];
    } catch {
      return [imageUrl];
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">New Sale</h1>
          <p className="text-muted-foreground">Process customer transactions</p>
        </div>
        <Button
          onClick={() => setShowScanner(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ScanBarcode className="h-4 w-4 mr-2" />
          Scan Barcode
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products by name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>All Products</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => {
                  const images = getProductImages(product.image_url);
                  
                  return (
                    <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      {/* Product Image */}
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden flex-shrink-0">
                        {images.length > 0 ? (
                          <img 
                            src={images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">
                            {product.category === 'Vegetables' && '🥬'}
                            {product.category === 'Fruits' && '🍎'}
                            {product.category === 'Grains' && '🌾'}
                            {product.category === 'Dairy' && '🥛'}
                            {product.category === 'Fashion' && '👕'}
                            {!['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Fashion'].includes(product.category) && <Package className="h-4 w-4 text-green-600" />}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.category}</p>
                        <p className="text-sm font-semibold text-green-600">
                          ₹{product.price_per_unit.toFixed(2)} / {(product as any).unit || 'piece'}
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Cart Items ({saleItems.length})</span>
              {saleItems.length > 0 && (
                <Button 
                  onClick={handleProceedToCheckout}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Proceed to Checkout
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {saleItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items in cart</p>
                <p className="text-sm">Add products to get started</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-3">
                    {saleItems.map((item) => {
                      const images = getProductImages(item.imageUrl);
                      
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          {/* Product Image */}
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden flex-shrink-0">
                            {images.length > 0 ? (
                              <img 
                                src={images[0]} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">
                                {item.category === 'Vegetables' && '🥬'}
                                {item.category === 'Fruits' && '🍎'}
                                {item.category === 'Grains' && '🌾'}
                                {item.category === 'Dairy' && '🥛'}
                                {item.category === 'Fashion' && '👕'}
                                {!['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Fashion'].includes(item.category) && <Package className="h-3 w-3 text-green-600" />}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs truncate">{item.name}</h4>
                            <p className="text-xs text-green-600">₹{item.price.toFixed(2)} / {item.unit}</p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                            
                            <span className="text-xs w-6 text-center">{item.quantity}</span>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700 ml-1"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  );
};

export default Sales;
