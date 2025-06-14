
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Farmer } from '@/utils/types';
import { FarmerProduct, useFarmerProducts } from '@/hooks/useFarmerProducts';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TransactionImageUpload from '@/components/settlement/TransactionImageUpload';

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

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Farmer Basic Info */}
          <div className="space-y-3 p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">Name:</span>
              <span className="font-medium">{farmer.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">Mobile:</span>
              <span>{farmer.phone}</span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center p-3 bg-agri-muted rounded-md">
            <span className="font-medium">Unsettled Amount:</span>
            <span className="text-lg font-bold text-agri-primary">₹{unsettledAmount.toFixed(2)}</span>
          </div>
          
          {/* Upload Section */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-3">Upload Transaction Proof:</h4>
            <div className="flex items-center gap-3">
              <TransactionImageUpload 
                transactionImage={transactionImage}
                onImageChange={setTransactionImage}
              />
              <div className="flex-1">
                {!transactionImage ? (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Upload transaction receipt
                    </p>
                    <p className="text-xs text-red-500">
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
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4 flex flex-col sm:flex-row gap-2 sm:justify-between">
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
