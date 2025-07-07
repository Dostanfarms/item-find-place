
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BranchAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'order' | 'ticket';
  currentBranchId?: string | null;
  onSuccess?: () => void;
}

const BranchAssignmentDialog: React.FC<BranchAssignmentDialogProps> = ({
  open,
  onClose,
  itemId,
  itemType,
  currentBranchId,
  onSuccess
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(currentBranchId || '');
  const [isLoading, setIsLoading] = useState(false);
  const { branches } = useBranches();
  const { toast } = useToast();

  const handleAssign = async () => {
    if (!selectedBranchId) {
      toast({
        title: "Error",
        description: "Please select a branch",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const tableName = itemType === 'order' ? 'orders' : 'tickets';
      const { error } = await supabase
        .from(tableName)
        .update({ branch_id: selectedBranchId })
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `${itemType === 'order' ? 'Order' : 'Ticket'} assigned to branch successfully`
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error assigning to branch:', error);
      toast({
        title: "Error",
        description: "Failed to assign to branch",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign {itemType === 'order' ? 'Order' : 'Ticket'} to Branch
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Branch</label>
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.filter(branch => branch.is_active).map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.branch_name} - {branch.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign to Branch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BranchAssignmentDialog;
