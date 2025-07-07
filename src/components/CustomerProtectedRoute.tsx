
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give some time for auth to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading...</div>
      </div>
    );
  }

  // If no user, redirect to customer login
  if (!currentUser) {
    return <Navigate to="/customer-login" replace />;
  }

  return <>{children}</>;
};

export default CustomerProtectedRoute;
