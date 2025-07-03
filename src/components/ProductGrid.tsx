
import React from 'react';
import ProductCard from './ProductCard';
import { useFashionProducts } from '@/hooks/useFashionProducts';

interface ProductGridProps {
  products: any[];
  category?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, category }) => {
  const { fashionProducts } = useFashionProducts();

  // If category is Fashion, show fashion products, otherwise show general products
  const displayProducts = category === 'Fashion' 
    ? fashionProducts.filter(p => p.is_active)
    : products.filter(p => p.is_active !== false);

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">No products available</div>
        <p className="text-sm text-muted-foreground">
          {category === 'Fashion' 
            ? 'No fashion products are currently available.' 
            : 'No products are currently available in this category.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
