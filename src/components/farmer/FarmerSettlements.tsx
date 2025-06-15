
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FarmerProduct } from '@/hooks/useFarmerProducts';
import { IndianRupee, Eye, Image, Package } from 'lucide-react';
import { format } from 'date-fns';

interface FarmerSettlementsProps {
  products: FarmerProduct[];
  loading: boolean;
}

const FarmerSettlements = ({ products, loading }: FarmerSettlementsProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter only settled products
  const settledProducts = products.filter(product => product.payment_status === 'settled');

  // Group settled products by date for settlement summary
  const settlementGroups = React.useMemo(() => {
    const groups = new Map();
    
    settledProducts.forEach(product => {
      const settlementDate = format(new Date(product.updated_at), 'yyyy-MM-dd');
      if (!groups.has(settlementDate)) {
        groups.set(settlementDate, []);
      }
      groups.get(settlementDate).push(product);
    });
    
    return Array.from(groups.entries()).map(([date, products]) => {
      const totalAmount = products.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
      // Get the first product's transaction image as the settlement receipt
      const settlementReceipt = products.find(p => p.transaction_image)?.transaction_image;
      return {
        date,
        products,
        totalAmount,
        productCount: products.length,
        settlementReceipt
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [settledProducts]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            My Settlements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>Loading settlements...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (settlementGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            My Settlements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No settlements found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            My Settlements ({settlementGroups.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {settlementGroups.map((settlement, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    Settlement - {format(new Date(settlement.date), 'MMM dd, yyyy')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {settlement.productCount} product(s) settled
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{settlement.totalAmount.toFixed(2)}
                    </p>
                    <Badge variant="default" className="bg-green-600">
                      Settled
                    </Badge>
                  </div>
                  {settlement.settlementReceipt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageClick(settlement.settlementReceipt!)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View Receipt
                    </Button>
                  )}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlement.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.quantity} {product.unit}
                      </TableCell>
                      <TableCell>₹{product.price_per_unit.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">
                        ₹{(product.quantity * product.price_per_unit).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Payment Receipt
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Transaction receipt"
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FarmerSettlements;
