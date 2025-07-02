
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

// Simple wrapper component for protected routes
const ProtectedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

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
                
                {/* Employee/Admin Routes */}
                <Route path="/dashboard" element={
                  <ProtectedWrapper>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedWrapper>
                } />
                
                <Route path="/products" element={
                  <ProtectedWrapper>
                    <Layout>
                      <CategoryProducts />
                    </Layout>
                  </ProtectedWrapper>
                } />
                
                <Route path="/category-products" element={
                  <ProtectedWrapper>
                    <Layout>
                      <CategoryProducts />
                    </Layout>
                  </ProtectedWrapper>
                } />
                
                <Route path="/coupons" element={
                  <ProtectedWrapper>
                    <Layout>
                      <Coupons />
                    </Layout>
                  </ProtectedWrapper>
                } />
                
                <Route path="/categories" element={
                  <ProtectedWrapper>
                    <Layout>
                      <Categories />
                    </Layout>
                  </ProtectedWrapper>
                } />
                
                <Route path="/banners" element={
                  <ProtectedWrapper>
                    <Layout>
                      <Banners />
                    </Layout>
                  </ProtectedWrapper>
                } />
                
                <Route path="/employees" element={
                  <ProtectedWrapper>
                    <Layout>
                      <Employees />
                    </Layout>
                  </ProtectedWrapper>
                } />
                
                <Route path="/roles" element={
                  <ProtectedWrapper>
                    <Layout>
                      <Roles />
                    </Layout>
                  </ProtectedWrapper>
                } />

                <Route path="/customers" element={
                  <ProtectedWrapper>
                    <Layout>
                      <Customers />
                    </Layout>
                  </ProtectedWrapper>
                } />

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
