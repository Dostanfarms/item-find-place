import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/dashboard/Users";
import Sellers from "./pages/dashboard/Sellers";
import DeliveryPartners from "./pages/dashboard/DeliveryPartners";
import Orders from "./pages/dashboard/Orders";
import SellerLogin from "./pages/SellerLogin";
import SellerDashboard from "./pages/SellerDashboard";
import DeliveryPartnerLogin from "./pages/DeliveryPartnerLogin";
import DeliveryPartnerDashboard from "./pages/DeliveryPartnerDashboard";
import RestaurantMenu from "./pages/RestaurantMenu";
import { Checkout } from "./pages/Checkout";
import { MyOrders } from "./pages/MyOrders";
import CartPage from "./pages/CartPage";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { SellerAuthProvider } from "./contexts/SellerAuthContext";
import { UserAuthProvider } from "./contexts/UserAuthContext";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserAuthProvider>
      <SellerAuthProvider>
        <CartProvider>
          <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurant/:restaurantId" element={<RestaurantMenu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/seller-login" element={<SellerLogin />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/delivery-login" element={<DeliveryPartnerLogin />} />
            <Route path="/delivery-dashboard" element={<DeliveryPartnerDashboard />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="users" element={<Users />} />
              <Route path="sellers" element={<Sellers />} />
              <Route path="orders" element={<Orders />} />
              <Route path="delivery-partners" element={<DeliveryPartners />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </SellerAuthProvider>
    </UserAuthProvider>
  </QueryClientProvider>
);

export default App;
