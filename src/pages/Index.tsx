
import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';

const Index = () => {
  const { products, loading } = useProducts();

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to DostanFarms
            </h1>
            <p className="text-xl text-gray-600">
              Fresh, organic produce delivered to your doorstep
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </main>
        <Cart />
      </div>
    </CartProvider>
  );
};

export default Index;
