import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import SalesDashboard from '@/pages/SalesDashboard';
import Products from '@/pages/Products';
import Sales from '@/pages/Sales';
import Coupons from '@/pages/Coupons';
import Customers from '@/pages/Customers';
import OrderReceipt from '@/pages/OrderReceipt';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext';
import PaymentPage from '@/pages/PaymentPage';
import { CartProvider } from './contexts/CartContext';

const queryClient = new QueryClient()

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Router>
              <Routes>
                <Route path="/" element={<SalesDashboard />} />
                <Route path="/sales-dashboard" element={<SalesDashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/order-receipt" element={<OrderReceipt />} />
                <Route path="/payment" element={<PaymentPage />} />
              </Routes>
            </Router>
          </div>
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
