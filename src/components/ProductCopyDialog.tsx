
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, X, Shirt } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ProductCopyDialogProps {
  open: boolean;
  onClose: () => void;
  selectedProducts: any[];
  onSuccess: () => void;
}

const ProductCopyDialog: React.FC<ProductCopyDialogProps> = ({
  open,
  onClose,
  selectedProducts,
  onSuccess
}) => {
  const [targetBranchId, setTargetBranchId] = useState('');
  const [loading, setLoading] = useState(false);
  const { branches } = useBranches();
  const { toast } = useToast();
  const { selectedBranch, currentUser } = useAuth();

  // Function to generate unique barcode for copied products
  const generateUniqueBarcode = async (branchName?: string): Promise<string> => {
    if (branchName) {
      // Use the database function for branch-specific barcode generation
      const { data, error } = await supabase.rpc('generate_branch_barcode', {
        branch_name: branchName
      });
      
      if (error) {
        console.error('Error generating branch barcode:', error);
        // Fallback to generic barcode generation
      } else if (data) {
        return data;
      }
    }
    
    // Fallback to generic barcode generation
    let barcode: string;
    let isUnique = false;
    
    while (!isUnique) {
      barcode = `CPY${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Check if barcode exists in any product table
      const [generalCheck, fashionCheck] = await Promise.all([
        supabase.from('products').select('id').eq('barcode', barcode).single(),
        supabase.from('fashion_products').select('id').eq('barcode', barcode).single()
      ]);
      
      if (!generalCheck.data && !fashionCheck.data) {
        isUnique = true;
        return barcode;
      }
    }
    
    return barcode!;
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

    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "No products selected to copy",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get target branch name for barcode generation
      const targetBranch = branches.find(b => b.id === targetBranchId);
      const targetBranchName = targetBranch?.branch_name;

      // Create product copy operation record
      const { data: copyOperation, error: copyError } = await supabase
        .from('product_copy_operations')
        .insert({
          source_branch_id: selectedBranch,
          target_branch_id: targetBranchId,
          product_ids: selectedProducts.map(p => p.id),
          created_by: currentUser?.email || 'Unknown',
          status: 'in_progress'
        })
        .select()
        .single();

      if (copyError) throw copyError;

      // Copy each product
      for (const product of selectedProducts) {
        // Generate new barcode for copied product
        const newBarcode = await generateUniqueBarcode(targetBranchName);
        
        const productData = {
          name: product.name,
          category: product.category,
          price_per_unit: product.price_per_unit,
          description: product.description,
          image_url: product.image_url,
          is_active: product.is_active,
          branch_id: targetBranchId,
          barcode: newBarcode
        };

        if (product.type === 'fashion') {
          // Copy fashion product
          const { data: newFashionProduct, error: fashionError } = await supabase
            .from('fashion_products')
            .insert(productData)
            .select()
            .single();

          if (fashionError) throw fashionError;

          // Copy fashion product sizes
          if (product.sizes && product.sizes.length > 0) {
            const sizesData = product.sizes.map((size: any) => ({
              fashion_product_id: newFashionProduct.id,
              size: size.size,
              pieces: size.pieces
            }));

            const { error: sizesError } = await supabase
              .from('fashion_product_sizes')
              .insert(sizesData);

            if (sizesError) throw sizesError;
          }
        } else {
          // Copy general product
          const generalProductData = {
            ...productData,
            quantity: product.quantity,
            unit: product.unit
          };

          const { error: productError } = await supabase
            .from('products')
            .insert(generalProductData);

          if (productError) throw productError;
        }
      }

      // Update copy operation status
      await supabase
        .from('product_copy_operations')
        .update({ status: 'completed' })
        .eq('id', copyOperation.id);

      toast({
        title: "Success",
        description: `Successfully copied ${selectedProducts.length} products to the target branch with new barcodes`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error copying products:', error);
      toast({
        title: "Error",
        description: "Failed to copy products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter out current branch from target options
  const availableBranches = branches.filter(branch => 
    branch.id !== selectedBranch && branch.is_active
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Copy Products to Another Branch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Target Branch <span className="text-red-500">*</span>
            </label>
            <Select value={targetBranchId} onValueChange={setTargetBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target branch" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.branch_name} - {branch.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">
              Products to Copy ({selectedProducts.length})
            </h3>
            
            {selectedProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products selected for copying
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.type === 'fashion' && (
                              <Shirt className="h-4 w-4 text-purple-600" />
                            )}
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.type === 'fashion' ? (
                            <div>
                              <span>{product.totalPieces || 0} pieces</span>
                              {product.sizes && (
                                <div className="text-xs text-muted-foreground">
                                  {product.sizes.map((s: any) => `${s.size}: ${s.pieces}`).join(', ')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span>{product.quantity} {product.unit}</span>
                          )}
                        </TableCell>
                        <TableCell>₹{product.price_per_unit}</TableCell>
                        <TableCell>
                          <Badge variant={product.is_active !== false ? "default" : "secondary"}>
                            {product.is_active !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleCopy} 
              disabled={loading || !targetBranchId || selectedProducts.length === 0}
            >
              <Copy className="h-4 w-4 mr-2" />
              {loading ? 'Copying...' : `Copy ${selectedProducts.length} Products`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductCopyDialog;
