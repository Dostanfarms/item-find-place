
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerProtectedRoute from '@/components/CustomerProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Transactions from '@/pages/Transactions';
import Farmers from '@/pages/Farmers';
import FarmerDetails from '@/pages/FarmerDetails';
import Customers from '@/pages/Customers';
import Employees from '@/pages/Employees';
import Categories from '@/pages/Categories';
import Coupons from '@/pages/Coupons';
import Banners from '@/pages/Banners';
import Branches from '@/pages/Branches';
import Roles from '@/pages/Roles';
import Tickets from '@/pages/Tickets';
import Settlements from '@/pages/Settlements';
import OrdersManagement from '@/pages/OrdersManagement';
import Sales from '@/pages/Sales';
import SalesDashboard from '@/pages/SalesDashboard';
import OrderHistory from '@/pages/OrderHistory';
import NotFound from '@/pages/NotFound';
import AccessDenied from '@/pages/AccessDenied';

// Authentication Pages
import EmployeeLogin from '@/pages/EmployeeLogin';
import EmployeeRegister from '@/pages/EmployeeRegister';
import CustomerLogin from '@/pages/CustomerLogin';
import CustomerRegister from '@/pages/CustomerRegister';
import FarmerLogin from '@/pages/FarmerLogin';
import FarmerDashboard from '@/pages/FarmerDashboard';
import FarmerTicketHistory from '@/pages/FarmerTicketHistory';

// Customer Pages
import AppLanding from '@/pages/AppLanding';
import CustomerHome from '@/pages/CustomerHome';
import CustomerProducts from '@/pages/CustomerProducts';
import ProductDetails from '@/pages/ProductDetails';
import CartPage from '@/pages/CartPage';
import Checkout from '@/pages/Checkout';
import CustomerPayment from '@/pages/CustomerPayment';
import PaymentPage from '@/pages/PaymentPage';
import OrderReceiptPage from '@/pages/OrderReceiptPage';
import OrderTracking from '@/pages/OrderTracking';
import CustomerOrderHistory from '@/pages/CustomerOrderHistory';
import CustomerProfile from '@/pages/CustomerProfile';
import CustomerTicketHistory from '@/pages/CustomerTicketHistory';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/employee-login" element={<EmployeeLogin />} />
                <Route path="/employee-register" element={<EmployeeRegister />} />
                <Route path="/customer-login" element={<CustomerLogin />} />
                <Route path="/customer-register" element={<CustomerRegister />} />
                <Route path="/farmer-login" element={<FarmerLogin />} />
                <Route path="/app" element={<AppLanding />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                
                {/* Admin/Employee Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/farmers" element={<ProtectedRoute><Farmers /></ProtectedRoute>} />
                <Route path="/farmers/:id" element={<ProtectedRoute><FarmerDetails /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
                <Route path="/banners" element={<ProtectedRoute><Banners /></ProtectedRoute>} />
                <Route path="/branches" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
                <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
                <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                <Route path="/settlements" element={<ProtectedRoute><Settlements /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersManagement /></ProtectedRoute>} />
                <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                <Route path="/sales-dashboard" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
                <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

                {/* Farmer Protected Routes */}
                <Route path="/farmer-dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
                <Route path="/farmer-tickets" element={<ProtectedRoute><FarmerTicketHistory /></ProtectedRoute>} />

                {/* Customer Protected Routes */}
                <Route path="/home" element={<CustomerProtectedRoute><CustomerHome /></CustomerProtectedRoute>} />
                <Route path="/shop" element={<CustomerProtectedRoute><CustomerProducts /></CustomerProtectedRoute>} />
                <Route path="/product/:id" element={<CustomerProtectedRoute><ProductDetails /></CustomerProtectedRoute>} />
                <Route path="/cart" element={<CustomerProtectedRoute><CartPage /></CustomerProtectedRoute>} />
                <Route path="/checkout" element={<CustomerProtectedRoute><Checkout /></CustomerProtectedRoute>} />
                <Route path="/customer-payment" element={<CustomerProtectedRoute><CustomerPayment /></CustomerProtectedRoute>} />
                <Route path="/payment" element={<CustomerProtectedRoute><PaymentPage /></CustomerProtectedRoute>} />
                <Route path="/order-receipt/:orderId" element={<CustomerProtectedRoute><OrderReceiptPage /></CustomerProtectedRoute>} />
                <Route path="/order-tracking" element={<CustomerProtectedRoute><OrderTracking /></CustomerProtectedRoute>} />
                <Route path="/my-orders" element={<CustomerProtectedRoute><CustomerOrderHistory /></CustomerProtectedRoute>} />
                <Route path="/profile" element={<CustomerProtectedRoute><CustomerProfile /></CustomerProtectedRoute>} />
                <Route path="/my-tickets" element={<CustomerProtectedRoute><CustomerTicketHistory /></CustomerProtectedRoute>} />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
