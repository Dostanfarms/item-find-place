
import React from 'react';
import ProductCard from './ProductCard';
import { useFashionProducts } from '@/hooks/useFashionProducts';

interface ProductGridProps {
  products: any[];
  category?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, category }) => {
  const { fashionProducts } = useFashionProducts();

  // Combine all products - general products and fashion products
  const getAllProducts = () => {
    if (category === 'Fashion') {
      // Only show fashion products
      return fashionProducts.filter(p => p.is_active && p.sizes?.some(s => s.pieces > 0));
    } else if (category && category !== 'all') {
      // Show only products from specific category (non-fashion)
      return products.filter(p => p.category === category && p.is_active !== false && p.quantity > 0);
    } else {
      // Show all products - combine general and fashion
      const activeGeneralProducts = products.filter(p => p.is_active !== false && p.quantity > 0);
      const activeFashionProducts = fashionProducts.filter(p => p.is_active && p.sizes?.some(s => s.pieces > 0));
      return [...activeGeneralProducts, ...activeFashionProducts];
    }
  };

  const displayProducts = getAllProducts();

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
