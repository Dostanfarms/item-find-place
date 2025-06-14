
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextProps {
  user: User | null;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkPermission: (resource: string, action: string) => boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: any[];
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);

  // Fetch role permissions from database
  const fetchRolePermissions = async (roleName: string) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );

      const fetchPromise = supabase
        .from('roles')
        .select('permissions')
        .eq('name', roleName)
        .eq('is_active', true)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching role permissions:', error);
        return [];
      }

      console.log('Fetched role permissions:', data);
      
      let permissions = data?.permissions || [];
      
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          console.error('Error parsing permissions:', e);
          permissions = [];
        }
      } else if (!Array.isArray(permissions)) {
        permissions = [];
      }
      
      return Array.isArray(permissions) ? permissions : [];
    } catch (error) {
      console.error('Error in fetchRolePermissions:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      
      const timeoutId = setTimeout(() => {
        setRolePermissions([]);
      }, 2000);

      fetchRolePermissions(user.role).then(permissions => {
        clearTimeout(timeoutId);
        setRolePermissions(permissions);
      });
    } else {
      localStorage.removeItem('user');
      setRolePermissions([]);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    console.log('Login attempt:', { email, password });
    
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout')), 3000)
      );

      const loginPromise = (async () => {
        // Check credentials against Supabase employees table
        const { data: employees, error } = await supabase
          .from('employees')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (error) {
          console.error('Login error:', error);
          return { success: false, message: 'Invalid email or password' };
        }

        if (employees) {
          // Check if employee account is active
          if (!employees.is_active) {
            console.log('Employee account is inactive:', employees.email);
            return { 
              success: false, 
              message: 'Your account has been deactivated. Please contact your administrator for assistance.' 
            };
          }

          console.log('Login successful for active employee:', employees);
          const authenticatedUser: User = {
            id: employees.id,
            name: employees.name,
            email: employees.email,
            role: employees.role
          };
          setUser(authenticatedUser);
          return { success: true };
        }
        
        return { success: false, message: 'Invalid email or password' };
      })();

      return await Promise.race([loginPromise, timeoutPromise]) as { success: boolean; message?: string };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'An error occurred during login. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    console.log('Checking permission:', { resource, action, rolePermissions });
    
    // Check database permissions first
    if (Array.isArray(rolePermissions) && rolePermissions.length > 0) {
      const resourcePermission = rolePermissions.find((p: any) => p.resource === resource);
      if (resourcePermission && Array.isArray(resourcePermission.actions)) {
        return resourcePermission.actions.includes(action);
      }
    }

    // Fallback to default admin permissions for admin role
    if (user.role === 'admin') {
      return true;
    }

    return false;
  };

  const value: AuthContextProps = {
    user,
    currentUser: user,
    login,
    logout,
    checkPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
