
import React from 'react';
import { FarmerProduct } from '@/hooks/useFarmerProducts';
import { format } from 'date-fns';

interface UnsettledProductsTableProps {
  unsettledProducts: FarmerProduct[];
}

const UnsettledProductsTable: React.FC<UnsettledProductsTableProps> = ({ unsettledProducts }) => {
  if (unsettledProducts.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Unsettled Products ({unsettledProducts.length}):</h4>
      <div className="border rounded-md max-h-40 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b">
              <th className="text-left p-2 text-xs font-medium">Product</th>
              <th className="text-left p-2 text-xs font-medium">Date</th>
              <th className="text-right p-2 text-xs font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {unsettledProducts.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{product.name}</td>
                <td className="p-2 text-gray-600">{format(new Date(product.created_at), 'MMM dd, yyyy')}</td>
                <td className="text-right p-2 font-medium">₹{(product.quantity * product.price_per_unit).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnsettledProductsTable;
