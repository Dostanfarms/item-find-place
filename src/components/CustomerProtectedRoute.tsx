
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const CustomerProtectedRoute: React.FC = () => {
  // Check if customer is logged in via localStorage
  const currentCustomer = localStorage.getItem('currentCustomer');
  
  if (!currentCustomer) {
    console.log('No customer found in localStorage, redirecting to customer login');
    return <Navigate to="/customer-login" replace />;
  }

  try {
    const customer = JSON.parse(currentCustomer);
    if (!customer || !customer.id) {
      console.log('Invalid customer data, redirecting to customer login');
      return <Navigate to="/customer-login" replace />;
    }
  } catch (error) {
    console.log('Error parsing customer data, redirecting to customer login');
    return <Navigate to="/customer-login" replace />;
  }

  console.log('Customer authenticated, allowing access');
  return <Outlet />;
};

export default CustomerProtectedRoute;
