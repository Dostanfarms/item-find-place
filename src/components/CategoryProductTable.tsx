
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Printer, AlertTriangle } from 'lucide-react';
import { FashionProduct, CategoryProduct } from '@/hooks/useCategoryProducts';

interface CategoryProductTableProps {
  products: (FashionProduct | CategoryProduct)[];
  category: string;
  onEdit: (product: FashionProduct | CategoryProduct) => void;
  onPrintBarcode: (product: FashionProduct | CategoryProduct) => void;
}

const CategoryProductTable: React.FC<CategoryProductTableProps> = ({
  products,
  category,
  onEdit,
  onPrintBarcode
}) => {
  const getProductQuantity = (product: FashionProduct | CategoryProduct) => {
    if (category === 'Fashion') {
      const fashionProduct = product as FashionProduct;
      return fashionProduct.total_pieces || 0;
    } else {
      const categoryProduct = product as CategoryProduct;
      return categoryProduct.quantity || 0;
    }
  };

  const getProductUnit = (product: FashionProduct | CategoryProduct) => {
    if (category === 'Fashion') {
      return 'pieces';
    } else {
      const categoryProduct = product as CategoryProduct;
      return categoryProduct.unit || 'unit';
    }
  };

  const isLowStock = (product: FashionProduct | CategoryProduct) => {
    const quantity = getProductQuantity(product);
    if (category === 'Fashion') {
      return quantity > 0 && quantity < 20;
    } else {
      return quantity > 0 && quantity < 10;
    }
  };

  const isOutOfStock = (product: FashionProduct | CategoryProduct) => {
    return getProductQuantity(product) === 0;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="min-w-[150px] font-semibold">Product Name</TableHead>
            <TableHead className="min-w-[80px] font-semibold">Stock</TableHead>
            <TableHead className="min-w-[80px] font-semibold">Price/Unit</TableHead>
            <TableHead className="min-w-[80px] font-semibold">Status</TableHead>
            {category === 'Fashion' && (
              <TableHead className="min-w-[100px] font-semibold">Sizes</TableHead>
            )}
            <TableHead className="min-w-[140px] font-semibold">Barcode</TableHead>
            <TableHead className="min-w-[100px] text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const quantity = getProductQuantity(product);
            const unit = getProductUnit(product);
            const lowStock = isLowStock(product);
            const outOfStock = isOutOfStock(product);
            
            return (
              <TableRow 
                key={product.id} 
                className={`hover:bg-gray-50 border-b ${lowStock ? 'bg-orange-50' : ''} ${outOfStock ? 'bg-red-50' : ''}`}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="max-w-[150px] truncate" title={product.name}>
                      {product.name}
                    </div>
                    {lowStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    {outOfStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${outOfStock ? "text-red-600" : lowStock ? "text-orange-600" : ""}`}>
                      {quantity} {unit}
                    </span>
                    {outOfStock && (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                    {lowStock && !outOfStock && (
                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  ₹{Number(product.price_per_unit).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={product.is_active ? "default" : "secondary"}
                    className={product.is_active ? "bg-green-500" : "bg-gray-500"}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                {category === 'Fashion' && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(product as FashionProduct).sizes?.map((size) => (
                        <Badge 
                          key={size.size} 
                          variant="outline" 
                          className={`text-xs ${size.pieces === 0 ? 'bg-red-100 text-red-700' : size.pieces < 20 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {size.size}: {size.pieces}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  {product.barcode ? (
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="text-xs font-mono truncate flex-1" title={product.barcode}>
                        {product.barcode}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onPrintBarcode(product)}
                        className="h-7 w-7 p-0 flex-shrink-0"
                        title="Print Barcode"
                      >
                        <Printer className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No barcode</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="h-7 px-2"
                    title="Edit Product"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryProductTable;
