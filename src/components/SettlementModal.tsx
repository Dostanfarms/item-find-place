
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
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import FarmerDetailsSection from '@/components/settlement/FarmerDetailsSection';
import BankDetailsSection from '@/components/settlement/BankDetailsSection';
import UnsettledProductsTable from '@/components/settlement/UnsettledProductsTable';
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
          {/* Total Amount - Fixed at top */}
          <div className="flex justify-between items-center p-3 bg-agri-muted rounded-md flex-shrink-0">
            <span className="font-medium">Total Amount to Settle:</span>
            <span className="text-lg font-bold text-agri-primary">₹{unsettledAmount.toFixed(2)}</span>
          </div>
          
          {/* Scrollable Content */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <FarmerDetailsSection farmer={farmer} />
              <BankDetailsSection farmer={farmer} />
              <UnsettledProductsTable unsettledProducts={unsettledProducts} />
            </div>
          </ScrollArea>

          {/* Upload Section - Fixed at bottom */}
          <TransactionImageUpload 
            transactionImage={transactionImage}
            onImageChange={setTransactionImage}
          />
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
