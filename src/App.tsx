
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
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
import Sales from '@/pages/Sales';
import Farmers from '@/pages/Farmers';
import EmployeeLogin from '@/pages/EmployeeLogin';
import AppLanding from '@/pages/AppLanding';

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
                {/* Public Routes */}
                <Route path="/" element={<AppLanding />} />
                <Route path="/employee-login" element={<EmployeeLogin />} />
                
                {/* Protected Routes with Sidebar */}
                <Route path="/dashboard" element={
                  <SidebarProvider>
                    <Layout><Dashboard /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/products" element={
                  <SidebarProvider>
                    <Layout><CategoryProducts /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/category-products" element={
                  <SidebarProvider>
                    <Layout><CategoryProducts /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/sales" element={
                  <SidebarProvider>
                    <Layout><Sales /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/farmers" element={
                  <SidebarProvider>
                    <Layout><Farmers /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/coupons" element={
                  <SidebarProvider>
                    <Layout><Coupons /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/categories" element={
                  <SidebarProvider>
                    <Layout><Categories /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/banners" element={
                  <SidebarProvider>
                    <Layout><Banners /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/employees" element={
                  <SidebarProvider>
                    <Layout><Employees /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/roles" element={
                  <SidebarProvider>
                    <Layout><Roles /></Layout>
                  </SidebarProvider>
                } />
                <Route path="/customers" element={
                  <SidebarProvider>
                    <Layout><Customers /></Layout>
                  </SidebarProvider>
                } />
              </Routes>
            </div>
          </Router>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
