
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanBarcode, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useFashionProducts } from '@/hooks/useFashionProducts';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from '@/hooks/use-toast';
import BarcodeScanner from '@/components/BarcodeScanner';

interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  category: string;
  unit: string;
}

const Sales = () => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const { products } = useProducts();
  const { fashionProducts } = useFashionProducts();
  const { addTransaction } = useTransactions();

  const allProducts = [...products, ...fashionProducts];

  const handleBarcodeScanned = (barcode: string) => {
    const product = allProducts.find(p => p.barcode === barcode);
    
    if (product) {
      const existingItem = saleItems.find(item => item.barcode === barcode);
      
      if (existingItem) {
        setSaleItems(prev => prev.map(item => 
          item.barcode === barcode 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        const newItem: SaleItem = {
          id: Date.now().toString(),
          name: product.name,
          price: product.price_per_unit,
          quantity: 1,
          barcode: product.barcode || '',
          category: product.category,
          unit: (product as any).unit || 'piece'
        };
        setSaleItems(prev => [...prev, newItem]);
      }
      
      toast({
        title: "Product Added",
        description: `${product.name} added to cart`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: "No product found with this barcode",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setSaleItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setSaleItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - discount;

  const handleCompleteSale = async () => {
    if (!customerName.trim() || !customerMobile.trim() || saleItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer details and add items to cart",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      customer_name: customerName,
      customer_mobile: customerMobile,
      items: saleItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      discount,
      total,
      coupon_used: null,
      payment_method: 'cash',
      status: 'completed'
    };

    const result = await addTransaction(transactionData);
    
    if (result.success) {
      toast({
        title: "Sale Completed",
        description: `Transaction completed successfully. Total: ₹${total.toFixed(2)}`,
      });
      
      // Reset form
      setSaleItems([]);
      setCustomerName('');
      setCustomerMobile('');
      setDiscount(0);
    } else {
      toast({
        title: "Sale Failed",
        description: result.error || "Failed to complete transaction",
        variant: "destructive",
      });
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Customer Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="customerMobile">Mobile Number</Label>
                <Input
                  id="customerMobile"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="Enter mobile number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sale Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Sale Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="discount">Discount:</Label>
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-24 text-right"
                  min="0"
                  max={subtotal}
                />
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <Button 
                onClick={handleCompleteSale}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={saleItems.length === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Complete Sale
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Cart Items */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Cart Items ({saleItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {saleItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items in cart</p>
                <p className="text-sm">Scan barcode to add products</p>
              </div>
            ) : (
              <div className="space-y-2">
                {saleItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} per {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="ml-4 text-right">
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
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
