
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import FarmerLogin from "./pages/FarmerLogin";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeRegister from "./pages/EmployeeRegister";
import AppLanding from "./pages/AppLanding";
import CustomerHome from "./pages/CustomerHome";
import CustomerProducts from "./pages/CustomerProducts";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import CustomerPayment from "./pages/CustomerPayment";
import PaymentPage from "./pages/PaymentPage";
import OrderReceiptPage from "./pages/OrderReceiptPage";
import CustomerOrderHistory from "./pages/CustomerOrderHistory";
import OrderTracking from "./pages/OrderTracking";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerTicketHistory from "./pages/CustomerTicketHistory";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerTicketHistory from "./pages/FarmerTicketHistory";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import OrdersManagement from "./pages/OrdersManagement";
import Customers from "./pages/Customers";
import Farmers from "./pages/Farmers";
import FarmerDetails from "./pages/FarmerDetails";
import Transactions from "./pages/Transactions";
import Settlements from "./pages/Settlements";
import Tickets from "./pages/Tickets";
import Categories from "./pages/Categories";
import Coupons from "./pages/Coupons";
import Banners from "./pages/Banners";
import Branches from "./pages/Branches";
import Employees from "./pages/Employees";
import Roles from "./pages/Roles";
import Sales from "./pages/Sales";
import SalesDashboard from "./pages/SalesDashboard";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/app" element={<AppLanding />} />
              <Route path="/customer-login" element={<CustomerLogin />} />
              <Route path="/customer-register" element={<CustomerRegister />} />
              <Route path="/farmer-login" element={<FarmerLogin />} />
              <Route path="/employee-login" element={<EmployeeLogin />} />
              <Route path="/employee-register" element={<EmployeeRegister />} />

              {/* Customer routes - no authentication required for these pages */}
              <Route path="/customer-home" element={<CustomerHome />} />
              <Route path="/customer-products" element={<CustomerProducts />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/customer-payment" element={<CustomerPayment />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/order-receipt/:orderId" element={<OrderReceiptPage />} />
              <Route path="/customer-orders" element={<CustomerOrderHistory />} />
              <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
              <Route path="/customer-profile" element={<CustomerProfile />} />
              <Route path="/customer-tickets" element={<CustomerTicketHistory />} />

              {/* Farmer routes */}
              <Route path="/farmer-dashboard" element={<ProtectedRoute resource="dashboard" action="view"><FarmerDashboard /></ProtectedRoute>} />
              <Route path="/farmer-tickets" element={<ProtectedRoute resource="tickets" action="view"><FarmerTicketHistory /></ProtectedRoute>} />

              {/* Admin/Employee routes with Sidebar layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute resource="dashboard" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Dashboard />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/products" element={
                <ProtectedRoute resource="products" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Products />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute resource="orders" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <OrdersManagement />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/customers" element={
                <ProtectedRoute resource="customers" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Customers />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/farmers" element={
                <ProtectedRoute resource="farmers" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Farmers />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/farmer-details/:id" element={
                <ProtectedRoute resource="farmers" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <FarmerDetails />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/transactions" element={
                <ProtectedRoute resource="transactions" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Transactions />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/settlements" element={
                <ProtectedRoute resource="settlements" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Settlements />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/tickets" element={
                <ProtectedRoute resource="tickets" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Tickets />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/categories" element={
                <ProtectedRoute resource="categories" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Categories />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/coupons" element={
                <ProtectedRoute resource="coupons" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Coupons />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/banners" element={
                <ProtectedRoute resource="banners" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Banners />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/branches" element={
                <ProtectedRoute resource="branches" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Branches />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/employees" element={
                <ProtectedRoute resource="employees" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Employees />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/roles" element={
                <ProtectedRoute resource="roles" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Roles />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/sales" element={
                <ProtectedRoute resource="sales" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <Sales />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/sales-dashboard" element={
                <ProtectedRoute resource="dashboard" action="view">
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-hidden">
                        <SalesDashboard />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
