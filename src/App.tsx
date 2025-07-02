import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Sidebar';

// Import pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import CategoryProducts from '@/pages/CategoryProducts';
import Coupons from '@/pages/Coupons';
import Categories from '@/pages/Categories';
import Banners from '@/pages/Banners';
import Employees from '@/pages/Employees';
import Roles from '@/pages/Roles';
import SettingsPage from '@/pages/SettingsPage';
import Orders from '@/pages/Orders';
import Customers from '@/pages/Customers';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

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
                
                {/* Employee/Admin Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/products" element={
                  <ProtectedRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/category-products" element={
                  <ProtectedRoute>
                    <Layout>
                      <CategoryProducts />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/coupons" element={
                  <ProtectedRoute>
                    <Layout>
                      <Coupons />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/categories" element={
                  <ProtectedRoute>
                    <Layout>
                      <Categories />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/banners" element={
                  <ProtectedRoute>
                    <Layout>
                      <Banners />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/employees" element={
                  <ProtectedRoute>
                    <Layout>
                      <Employees />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/roles" element={
                  <ProtectedRoute>
                    <Layout>
                      <Roles />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <SettingsPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Layout>
                      <Orders />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/customers" element={
                  <ProtectedRoute>
                    <Layout>
                      <Customers />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Routes>
            </div>
          </Router>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
