import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Dashboard from '@/pages/Dashboard';
import ProductsPage from '@/pages/Products';
import OrdersPage from '@/pages/Orders';
import CustomersPage from '@/pages/Customers';
import TicketsPage from '@/pages/Tickets';
import SettingsPage from '@/pages/Settings';
import LoginPage from '@/pages/Login';
import { useAuth } from '@/context/AuthContext';
import CustomerHome from '@/pages/CustomerHome';
import CustomerProducts from '@/pages/CustomerProducts';
import CustomerOrders from '@/pages/CustomerOrders';
import CustomerProfile from '@/pages/CustomerProfile';
import CustomerLoginPage from '@/pages/CustomerLoginPage';
import CustomerRegistrationPage from '@/pages/CustomerRegistrationPage';
import CustomerPayment from '@/pages/CustomerPayment';
import FarmerDashboard from '@/pages/FarmerDashboard';
import FarmerLoginPage from '@/pages/FarmerLoginPage';
import FarmerRegistrationPage from '@/pages/FarmerRegistrationPage';
import FarmerProducts from '@/pages/FarmerProducts';
import ProductDetails from '@/pages/ProductDetails';
import CustomerTicketHistory from '@/pages/CustomerTicketHistory';
import FarmerTicketHistory from '@/pages/FarmerTicketHistory';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/customer-login" element={<CustomerLoginPage />} />
                <Route path="/customer-register" element={<CustomerRegistrationPage />} />
                <Route path="/farmer-login" element={<FarmerLoginPage />} />
                <Route path="/farmer-register" element={<FarmerRegistrationPage />} />
                
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Customer Routes */}
                <Route path="/customer-home" element={<CustomerHome />} />
                <Route path="/customer-products" element={<CustomerProducts />} />
                <Route path="/customer-orders" element={<CustomerOrders />} />
                <Route path="/customer-profile" element={<CustomerProfile />} />
                <Route path="/customer-payment" element={<CustomerPayment />} />
                <Route path="/customer-tickets" element={<CustomerTicketHistory />} />
                <Route path="/product/:productId" element={<ProductDetails />} />

                {/* Farmer Routes */}
                <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                <Route path="/farmer-products/:id" element={<FarmerProducts />} />
                <Route path="/farmer-tickets/:id" element={<FarmerTicketHistory />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
