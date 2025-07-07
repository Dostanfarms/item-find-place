import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import FarmerLogin from "./pages/farmer/FarmerLogin";
import EmployeeLogin from "./pages/employee/EmployeeLogin";
import EmployeeRegister from "./pages/employee/EmployeeRegister";
import AppLanding from "./pages/customer/AppLanding";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerProducts from "./pages/customer/CustomerProducts";
import ProductDetails from "./pages/customer/ProductDetails";
import CartPage from "./pages/customer/CartPage";
import Checkout from "./pages/customer/Checkout";
import CustomerPayment from "./pages/customer/CustomerPayment";
import PaymentPage from "./pages/customer/PaymentPage";
import OrderReceiptPage from "./pages/customer/OrderReceiptPage";
import CustomerOrderHistory from "./pages/customer/CustomerOrderHistory";
import OrderTracking from "./pages/customer/OrderTracking";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerTicketHistory from "./pages/customer/CustomerTicketHistory";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerTicketHistory from "./pages/farmer/FarmerTicketHistory";
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
              <Route path="/customer-login" element={<CustomerLogin />} />
              <Route path="/customer-register" element={<CustomerRegister />} />
              <Route path="/farmer-login" element={<FarmerLogin />} />
              <Route path="/employee-login" element={<EmployeeLogin />} />
              <Route path="/employee-register" element={<EmployeeRegister />} />

              {/* Customer routes */}
              <Route path="/customer" element={<CustomerProtectedRoute><AppLanding /></CustomerProtectedRoute>} />
              <Route path="/customer-home" element={<CustomerProtectedRoute><CustomerHome /></CustomerProtectedRoute>} />
              <Route path="/customer-products" element={<CustomerProtectedRoute><CustomerProducts /></CustomerProtectedRoute>} />
              <Route path="/product/:id" element={<CustomerProtectedRoute><ProductDetails /></CustomerProtectedRoute>} />
              <Route path="/cart" element={<CustomerProtectedRoute><CartPage /></CustomerProtectedRoute>} />
              <Route path="/checkout" element={<CustomerProtectedRoute><Checkout /></CustomerProtectedRoute>} />
              <Route path="/customer-payment" element={<CustomerProtectedRoute><CustomerPayment /></CustomerProtectedRoute>} />
              <Route path="/payment" element={<CustomerProtectedRoute><PaymentPage /></CustomerProtectedRoute>} />
              <Route path="/order-receipt/:orderId" element={<CustomerProtectedRoute><OrderReceiptPage /></CustomerProtectedRoute>} />
              <Route path="/customer-orders" element={<CustomerProtectedRoute><CustomerOrderHistory /></CustomerProtectedRoute>} />
              <Route path="/order-tracking/:orderId" element={<CustomerProtectedRoute><OrderTracking /></CustomerProtectedRoute>} />
              <Route path="/customer-profile" element={<CustomerProtectedRoute><CustomerProfile /></CustomerProtectedRoute>} />
              <Route path="/customer-tickets" element={<CustomerProtectedRoute><CustomerTicketHistory /></CustomerProtectedRoute>} />

              {/* Farmer routes */}
              <Route path="/farmer-dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
              <Route path="/farmer-tickets" element={<ProtectedRoute><FarmerTicketHistory /></ProtectedRoute>} />

              {/* Admin/Employee routes with Sidebar layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
