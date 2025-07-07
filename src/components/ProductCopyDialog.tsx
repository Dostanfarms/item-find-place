
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ProductCopyDialogProps {
  open: boolean;
  onClose: () => void;
  selectedProducts: any[];
  onSuccess?: () => void;
}

const ProductCopyDialog: React.FC<ProductCopyDialogProps> = ({
  open,
  onClose,
  selectedProducts,
  onSuccess
}) => {
  const [targetBranchId, setTargetBranchId] = useState<string>('');
  const [productsToProcess, setProductsToProcess] = useState(selectedProducts);
  const [isLoading, setIsLoading] = useState(false);
  const { branches } = useBranches();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const removeProduct = (productId: string) => {
    setProductsToProcess(prev => prev.filter(p => p.id !== productId));
  };

  const handleCopy = async () => {
    if (!targetBranchId) {
      toast({
        title: "Error",
        description: "Please select a target branch",
        variant: "destructive"
      });
      return;
    }

    if (productsToProcess.length === 0) {
      toast({
        title: "Error",
        description: "No products selected for copying",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const targetBranch = branches.find(b => b.id === targetBranchId);
      if (!targetBranch) {
        throw new Error('Target branch not found');
      }

      // Copy each product
      for (const product of productsToProcess) {
        // Generate new barcode for target branch
        const { data: barcodeData, error: barcodeError } = await supabase
          .rpc('generate_branch_barcode', { branch_name: targetBranch.branch_name });

        if (barcodeError) {
          throw barcodeError;
        }

        const newBarcode = barcodeData;

        if (product.type === 'fashion') {
          // Copy fashion product
          const { data: newFashionProduct, error: fashionError } = await supabase
            .from('fashion_products')
            .insert([{
              name: product.name,
              description: product.description,
              price_per_unit: product.price_per_unit,
              category: product.category,
              barcode: newBarcode,
              image_url: product.image_url,
              is_active: product.is_active,
              branch_id: targetBranchId
            }])
            .select()
            .single();

          if (fashionError) {
            throw fashionError;
          }

          // Copy sizes
          if (product.sizes && product.sizes.length > 0) {
            const sizesToInsert = product.sizes.map((size: any) => ({
              fashion_product_id: newFashionProduct.id,
              size: size.size,
              pieces: size.pieces
            }));

            const { error: sizesError } = await supabase
              .from('fashion_product_sizes')
              .insert(sizesToInsert);

            if (sizesError) {
              throw sizesError;
            }
          }
        } else {
          // Copy general product
          const { error: productError } = await supabase
            .from('products')
            .insert([{
              name: product.name,
              description: product.description,
              quantity: product.quantity,
              unit: product.unit,
              price_per_unit: product.price_per_unit,
              category: product.category,
              barcode: newBarcode,
              image_url: product.image_url,
              is_active: product.is_active,
              branch_id: targetBranchId
            }]);

          if (productError) {
            throw productError;
          }
        }
      }

      // Log the copy operation
      await supabase
        .from('product_copy_operations')
        .insert([{
          source_branch_id: currentUser?.branch_id,
          target_branch_id: targetBranchId,
          product_ids: productsToProcess.map(p => p.id),
          created_by: currentUser?.email || 'unknown',
          status: 'completed'
        }]);

      toast({
        title: "Success",
        description: `${productsToProcess.length} products copied successfully with new barcodes`
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error copying products:', error);
      toast({
        title: "Error",
        description: "Failed to copy products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Copy Products to Branch</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Target Branch</label>
            <Select value={targetBranchId} onValueChange={setTargetBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch to copy products to" />
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

          <div>
            <h3 className="text-lg font-medium mb-3">
              Products to Copy ({productsToProcess.length})
            </h3>
            {productsToProcess.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products selected for copying</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {productsToProcess.map((product) => (
                  <Card key={product.id} className="relative">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ₹{product.price_per_unit}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {product.type === 'fashion' ? (
                              `${product.totalPieces} pieces`
                            ) : (
                              `${product.quantity} ${product.unit}`
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeProduct(product.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> New barcodes will be automatically generated for copied products 
              based on the target branch name. Prices and quantities can be modified after copying.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCopy} 
            disabled={isLoading || !targetBranchId || productsToProcess.length === 0}
          >
            {isLoading ? 'Copying...' : `Copy ${productsToProcess.length} Products`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductCopyDialog;
