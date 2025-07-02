
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Sidebar';

// Import pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import CategoryProducts from '@/pages/CategoryProducts';
import Coupons from '@/pages/Coupons';
import Categories from '@/pages/Categories';
import Banners from '@/pages/Banners';
import Employees from '@/pages/Employees';
import Roles from '@/pages/Roles';
import Customers from '@/pages/Customers';
import EmployeeLogin from '@/pages/EmployeeLogin';

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Employee/Admin Routes with Layout */}
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/products" element={<Layout><CategoryProducts /></Layout>} />
                <Route path="/category-products" element={<Layout><CategoryProducts /></Layout>} />
                <Route path="/coupons" element={<Layout><Coupons /></Layout>} />
                <Route path="/categories" element={<Layout><Categories /></Layout>} />
                <Route path="/banners" element={<Layout><Banners /></Layout>} />
                <Route path="/employees" element={<Layout><Employees /></Layout>} />
                <Route path="/roles" element={<Layout><Roles /></Layout>} />
                <Route path="/customers" element={<Layout><Customers /></Layout>} />

                {/* Authentication Routes */}
                <Route path="/employee-login" element={<EmployeeLogin />} />
              </Routes>
            </div>
          </Router>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
