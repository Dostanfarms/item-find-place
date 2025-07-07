
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, X, Check } from 'lucide-react';
import PhotoUploadField from '@/components/PhotoUploadField';

interface SettlementModalProps {
  open: boolean;
  onClose: () => void;
  farmerSummary: {
    farmer: any;
    totalAmount: number;
    unsettledAmount: number;
    products: any[];
  } | null;
  onConfirmSettlement: (transactionImage: string) => Promise<void>;
}

const SettlementModal: React.FC<SettlementModalProps> = ({
  open,
  onClose,
  farmerSummary,
  onConfirmSettlement
}) => {
  const { toast } = useToast();
  const [transactionImage, setTransactionImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmSettlement = async () => {
    if (!transactionImage.trim()) {
      toast({
        title: "Error",
        description: "Please upload transaction proof before settling",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onConfirmSettlement(transactionImage);
      setTransactionImage('');
      onClose();
    } catch (error) {
      console.error('Settlement error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTransactionImage('');
    onClose();
  };

  if (!farmerSummary) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Settle Payment</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            You are about to settle the payment for {farmerSummary.farmer.name}.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Farmer Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="font-medium">{farmerSummary.farmer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mobile:</span>
              <span className="font-medium">{farmerSummary.farmer.phone}</span>
            </div>
          </div>

          {/* Amount Display */}
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Unsettled Amount:</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{farmerSummary.unsettledAmount.toFixed(2)}
            </p>
          </div>

          {/* Transaction Proof Upload */}
          <div className="space-y-2">
            <Label>Upload Transaction Proof:</Label>
            <PhotoUploadField
              value={transactionImage}
              onChange={setTransactionImage}
            />
            <div className="flex items-center gap-2 text-sm">
              {transactionImage ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Transaction receipt uploaded</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Required before settling</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSettlement} 
              disabled={loading || !transactionImage}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Settlement
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettlementModal;
