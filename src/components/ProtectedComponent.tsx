
import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedComponentProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  resource,
  action,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedComponent;
