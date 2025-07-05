
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Dashboard from '@/pages/Dashboard';
import ProductsPage from '@/pages/Products';
import OrdersManagement from '@/pages/OrdersManagement';
import CustomersPage from '@/pages/Customers';
import TicketsPage from '@/pages/Tickets';
import Roles from '@/pages/Roles';
import EmployeeLogin from '@/pages/EmployeeLogin';
import { useAuth } from '@/context/AuthContext';
import CustomerHome from '@/pages/CustomerHome';
import CustomerProducts from '@/pages/CustomerProducts';
import CustomerOrderHistory from '@/pages/CustomerOrderHistory';
import CustomerProfile from '@/pages/CustomerProfile';
import CustomerLogin from '@/pages/CustomerLogin';
import CustomerRegister from '@/pages/CustomerRegister';
import CustomerPayment from '@/pages/CustomerPayment';
import FarmerDashboard from '@/pages/FarmerDashboard';
import FarmerLogin from '@/pages/FarmerLogin';
import FarmerDetails from '@/pages/FarmerDetails';
import ProductDetails from '@/pages/ProductDetails';
import CustomerTicketHistory from '@/pages/CustomerTicketHistory';
import FarmerTicketHistory from '@/pages/FarmerTicketHistory';
import AppLanding from '@/pages/AppLanding';
import Sidebar from '@/components/Sidebar';

const queryClient = new QueryClient();

// Admin Layout Component with Sidebar
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Landing page */}
                <Route path="/" element={<AppLanding />} />
                
                {/* Employee/Admin routes with sidebar */}
                <Route path="/login" element={<EmployeeLogin />} />
                <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
                <Route path="/products" element={<AdminLayout><ProductsPage /></AdminLayout>} />
                <Route path="/orders" element={<AdminLayout><OrdersManagement /></AdminLayout>} />
                <Route path="/customers" element={<AdminLayout><CustomersPage /></AdminLayout>} />
                <Route path="/tickets" element={<AdminLayout><TicketsPage /></AdminLayout>} />
                <Route path="/settings" element={<AdminLayout><Roles /></AdminLayout>} />

                {/* Customer routes */}
                <Route path="/customer-login" element={<CustomerLogin />} />
                <Route path="/customer-register" element={<CustomerRegister />} />
                <Route path="/customer-home" element={<CustomerHome />} />
                <Route path="/customer-products" element={<CustomerProducts />} />
                <Route path="/customer-orders" element={<CustomerOrderHistory />} />
                <Route path="/customer-profile" element={<CustomerProfile />} />
                <Route path="/customer-payment" element={<CustomerPayment />} />
                <Route path="/customer-tickets" element={<CustomerTicketHistory />} />
                <Route path="/product/:productId" element={<ProductDetails />} />

                {/* Farmer routes */}
                <Route path="/farmer-login" element={<FarmerLogin />} />
                <Route path="/farmer-register" element={<FarmerDetails />} />
                <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                <Route path="/farmer-products/:id" element={<FarmerDetails />} />
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
