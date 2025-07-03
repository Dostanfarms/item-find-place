import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  ChevronLeft, 
  Search,
  Filter
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useFashionProducts } from '@/hooks/useFashionProducts';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import CustomerHeader from '@/components/CustomerHeader';

const CustomerProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, loading: productsLoading } = useProducts();
  const { fashionProducts, loading: fashionLoading } = useFashionProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customer, setCustomer] = useState<any>(null);
  
  const loading = productsLoading || fashionLoading;
  
  console.log('Fashion products in CustomerProducts:', fashionProducts);
  console.log('General products in CustomerProducts:', products);
  
  // Filter out inactive products
  const activeProducts = products.filter(product => product.is_active !== false && product.quantity > 0);
  const activeFashionProducts = fashionProducts.filter(product => 
    product.is_active && product.sizes && product.sizes.some(size => size.pieces > 0)
  );
  
  // Get all categories including Fashion
  const generalCategories = Array.from(new Set(activeProducts.map(p => p.category)));
  const categories = ['all', ...generalCategories];
  
  // Always add Fashion category if there are active fashion products
  if (activeFashionProducts.length > 0 && !categories.includes('Fashion')) {
    categories.push('Fashion');
  }
  
  console.log('Available categories:', categories);
  console.log('Active fashion products:', activeFashionProducts);
  
  // Combine and filter products based on search and category
  const getAllFilteredProducts = () => {
    let allProducts: any[] = [];
    
    if (selectedCategory === 'all') {
      allProducts = [
        ...activeProducts.map(p => ({ ...p, type: 'general' })), 
        ...activeFashionProducts.map(p => ({ ...p, type: 'fashion' }))
      ];
    } else if (selectedCategory === 'Fashion') {
      allProducts = activeFashionProducts.map(p => ({ ...p, type: 'fashion' }));
    } else {
      allProducts = activeProducts.filter(product => product.category === selectedCategory).map(p => ({ ...p, type: 'general' }));
    }
    
    // Apply search filter
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredProducts = getAllFilteredProducts();
  console.log('Filtered products:', filteredProducts);

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (currentCustomer) {
      setCustomer(JSON.parse(currentCustomer));
    }
  }, []);

  // Handle category selection from navigation state
  useEffect(() => {
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
      // Clear the navigation state to prevent it from persisting
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleLogout = () => {
    setCustomer(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <CustomerHeader customer={customer} onLogout={handleLogout} />

      {/* Content with top padding to account for fixed header */}
      <div className="pt-20 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/customer-home')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-agri-primary" />
              <span className="text-lg font-bold">
                {selectedCategory === 'all' ? 'Browse Products' : `${selectedCategory} Products`}
              </span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid products={filteredProducts} category={selectedCategory} />
        </div>
      </div>

      {/* Cart Component */}
      <Cart />
    </div>
  );
};

export default CustomerProducts;
