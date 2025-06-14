
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Farmer } from '@/utils/types';
import { FarmerProduct, useFarmerProducts } from '@/hooks/useFarmerProducts';
import { format } from 'date-fns';
import { Check, Upload } from 'lucide-react';
import PhotoUploadField from '@/components/PhotoUploadField';
import { supabase } from '@/integrations/supabase/client';

interface SettlementModalProps {
  farmer: Farmer;
  unsettledAmount: number;
  unsettledProducts: FarmerProduct[];
  open: boolean;
  onClose: () => void;
  onSettle: () => void;
  farmerId?: string;
}

const SettlementModal: React.FC<SettlementModalProps> = ({ 
  farmer, 
  unsettledAmount, 
  unsettledProducts,
  open, 
  onClose, 
  onSettle,
  farmerId 
}) => {
  const { toast } = useToast();
  const { fetchFarmerProducts } = useFarmerProducts();
  const [transactionImage, setTransactionImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSettle = async () => {
    if (!transactionImage) {
      toast({
        title: "Image Required",
        description: "Please upload a transaction image before settling payment",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update all unsettled products to settled with transaction image
      for (const product of unsettledProducts) {
        const { error } = await supabase
          .from('farmer_products')
          .update({
            payment_status: 'settled',
            transaction_image: transactionImage,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (error) {
          console.error('Error updating product payment status:', error);
          toast({
            title: "Error",
            description: `Failed to update payment status for ${product.name}`,
            variant: "destructive"
          });
          return;
        }
      }

      // Refresh farmer products data
      if (farmerId) {
        await fetchFarmerProducts(farmerId);
      }

      onSettle();
      toast({
        title: "Payment Settled",
        description: `Successfully settled payment of ₹${unsettledAmount.toFixed(2)} to ${farmer.name}`,
      });
      
      // Reset form
      setTransactionImage('');
      onClose();
    } catch (error) {
      console.error('Error settling payment:', error);
      toast({
        title: "Error",
        description: "Failed to settle payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Settle Payment</DialogTitle>
          <DialogDescription>
            You are about to settle the payment for {farmer.name}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] pr-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-agri-muted rounded-md">
              <span className="font-medium">Total Amount to Settle:</span>
              <span className="text-lg font-bold text-agri-primary">₹{unsettledAmount.toFixed(2)}</span>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Payment will be sent to:</h4>
              <div className="space-y-2 p-3 border rounded-md">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Holder:</span>
                  <span>{farmer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bank:</span>
                  <span>{farmer.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Number:</span>
                  <span>{farmer.account_number}</span>
                </div>
                {farmer.ifsc_code && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">IFSC Code:</span>
                    <span>{farmer.ifsc_code}</span>
                  </div>
                )}
              </div>
            </div>
            
            {unsettledProducts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Unsettled Products:</h4>
                <div className="border rounded-md max-h-32 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="text-left p-2 text-xs">Product</th>
                        <th className="text-left p-2 text-xs">Date</th>
                        <th className="text-right p-2 text-xs">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {unsettledProducts.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-2">{product.name}</td>
                          <td className="p-2">{format(new Date(product.created_at), 'MMM dd, yyyy')}</td>
                          <td className="text-right p-2">₹{(product.quantity * product.price_per_unit).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Upload Section - Outside ScrollArea */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <h4 className="text-sm font-medium mb-3">Upload Transaction Proof:</h4>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
            <PhotoUploadField
              value={transactionImage}
              onChange={setTransactionImage}
              name="transaction-image"
              className="w-20 h-20 mb-2"
            />
            {!transactionImage ? (
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                <p className="text-xs text-muted-foreground">
                  Upload transaction receipt
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Required before settling
                </p>
              </div>
            ) : (
              <p className="text-xs text-green-600">
                ✓ Transaction image uploaded
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-0 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleSettle} 
            className="bg-agri-primary hover:bg-agri-secondary w-full sm:w-auto"
            disabled={unsettledAmount <= 0 || !transactionImage || isSubmitting}
          >
            <Check className="mr-2 h-4 w-4" /> 
            {isSubmitting ? 'Settling...' : 'Confirm Settlement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettlementModal;
