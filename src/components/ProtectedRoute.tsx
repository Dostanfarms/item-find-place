
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';

interface ProtectedRouteProps {
  resource: string;
  action: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ resource, action }) => {
  const { currentUser } = useAuth();
  const { roles } = useRoles();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setHasAccess(false);
      return;
    }

    if (!currentUser.role) {
      console.log('No role assigned to user');
      setHasAccess(false);
      return;
    }

    // Find the role data from the database
    const userRole = roles.find(role => 
      role.name.toLowerCase() === currentUser.role.toLowerCase()
    );

    if (!userRole) {
      console.log('Role not found in database:', currentUser.role);
      setHasAccess(false);
      return;
    }

    // Check permissions
    let rolePermissions = userRole.permissions;
    
    // Handle different permission formats
    if (!rolePermissions) {
      rolePermissions = [];
    } else if (typeof rolePermissions === 'string') {
      try {
        rolePermissions = JSON.parse(rolePermissions);
      } catch (e) {
        console.error('Error parsing permissions:', e);
        rolePermissions = [];
      }
    } else if (!Array.isArray(rolePermissions)) {
      rolePermissions = [];
    }

    const resourcePermission = rolePermissions.find((p: any) => p.resource === resource);
    const hasPermission = resourcePermission?.actions?.includes(action) || false;

    console.log('Permission check:', {
      user: currentUser.name,
      role: currentUser.role,
      resource,
      action,
      permissions: rolePermissions,
      hasPermission
    });

    setHasAccess(hasPermission);
  }, [currentUser, roles, resource, action]);

  if (!currentUser) {
    console.log('No current user, redirecting to employee login');
    return <Navigate to="/employee-login" replace />;
  }

  if (hasAccess === null) {
    // Still loading permissions
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Checking permissions...</div>
      </div>
    );
  }

  if (!hasAccess) {
    console.log('Access denied, redirecting to access-denied page');
    return <Navigate to="/access-denied" replace />;
  }

  console.log('Access granted, rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute;
