
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
  const { roles, loading: rolesLoading } = useRoles();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('=== PROTECTED ROUTE CHECK ===');
    console.log('Current user:', currentUser);
    console.log('Required resource:', resource);
    console.log('Required action:', action);
    console.log('Roles loading:', rolesLoading);
    
    if (!currentUser) {
      console.log('No current user - redirecting to login');
      setHasAccess(false);
      return;
    }

    if (!currentUser.role) {
      console.log('No role assigned to user');
      setHasAccess(false);
      return;
    }

    // Wait for roles to finish loading
    if (rolesLoading) {
      console.log('Still loading roles from database...');
      setHasAccess(null);
      return;
    }

    console.log('Available roles from database:', roles);

    // Find the role data from the database with case-insensitive matching
    const userRole = roles.find(role => 
      role.name.toLowerCase() === currentUser.role.toLowerCase()
    );

    console.log('Found user role in database:', userRole);

    if (!userRole) {
      console.log('Role not found in database:', currentUser.role);
      // For admin users, grant access even if role not found in database (case-insensitive)
      if (currentUser.role.toLowerCase() === 'admin') {
        console.log('Admin user detected, granting access');
        setHasAccess(true);
        return;
      }
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

    console.log('Processed role permissions:', rolePermissions);

    const resourcePermission = rolePermissions.find((p: any) => p.resource === resource);
    const hasPermission = resourcePermission?.actions?.includes(action) || false;

    console.log('Permission check result:', {
      user: currentUser.name,
      role: currentUser.role,
      resource,
      action,
      resourcePermission,
      hasPermission
    });

    setHasAccess(hasPermission);
  }, [currentUser, roles, rolesLoading, resource, action]);

  // If no user, redirect to login
  if (!currentUser) {
    console.log('No current user, redirecting to employee login');
    return <Navigate to="/employee-login" replace />;
  }

  // Still loading permissions or roles
  if (hasAccess === null || rolesLoading) {
    console.log('Still loading permissions or roles...');
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Checking permissions...</div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    console.log('Access denied, redirecting to access-denied page');
    return <Navigate to="/access-denied" replace />;
  }

  console.log('Access granted, rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute;
