import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { hasPermission as checkRolePermission } from '@/utils/employeeData';

interface AuthContextProps {
  user: User | null;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkPermission: (resource: string, action: string) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  selectedBranch: string | null;
  setSelectedBranch: (branchId: string | null) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id: string | null;
  branchIds?: string[]; // For multi-branch support
  permissions?: any[];
  profile_photo?: string; // Add this property
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
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // Fetch employee branch assignments using the database function
  const fetchEmployeeBranches = async (employeeId: string): Promise<string[]> => {
    try {
      console.log('Fetching branches for employee:', employeeId);
      
      const { data, error } = await supabase.rpc('get_employee_branches', {
        emp_id: employeeId
      });

      if (error) {
        console.error('Error fetching employee branches:', error);
        return [];
      }

      console.log('Employee branches from function:', data);
      return data || [];
    } catch (error) {
      console.error('Error in fetchEmployeeBranches:', error);
      return [];
    }
  };

  // Fetch role permissions from database with case-insensitive matching
  const fetchRolePermissions = async (roleName: string) => {
    try {
      console.log('Fetching permissions for role:', roleName);
      
      const { data, error } = await supabase
        .from('roles')
        .select('permissions')
        .ilike('name', roleName)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching role permissions:', error);
        return [];
      }

      console.log('Fetched role permissions from database:', data);
      
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
      console.log('User logged in, storing in localStorage:', user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Fetch role permissions
      fetchRolePermissions(user.role).then(permissions => {
        console.log('Setting role permissions:', permissions);
        setRolePermissions(permissions);
      });

      // Fetch employee branch assignments for all users (including admins for consistency)
      fetchEmployeeBranches(user.id).then(branchIds => {
        console.log('Fetched user branch IDs:', branchIds);
        if (branchIds.length > 0) {
          setUser(prev => prev ? { ...prev, branchIds } : null);
        } else if (user.branch_id) {
          // Fallback to single branch if no multi-branch assignments
          setUser(prev => prev ? { ...prev, branchIds: [user.branch_id!] } : null);
        }
      });
    } else {
      console.log('No user, removing from localStorage');
      localStorage.removeItem('user');
      setRolePermissions([]);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    
    try {
      // Check credentials against employees table
      console.log('Querying employees table...');
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      console.log('Employee query result:', { employee, error });

      if (error) {
        console.error('Employee not found or password incorrect:', error);
        
        // Check if employee exists with different password
        const { data: existingEmployee } = await supabase
          .from('employees')
          .select('email, is_active')
          .eq('email', email)
          .single();
        
        console.log('Existing employee check:', existingEmployee);
        
        if (existingEmployee) {
          return { success: false, message: 'Invalid password' };
        }
        
        return { success: false, message: 'Invalid email or password' };
      }

      console.log('Employee found:', employee);

      // Check if employee is active
      if (!employee.is_active) {
        console.log('Employee account is inactive');
        return { 
          success: false, 
          message: 'Your account has been deactivated. Please contact your administrator for assistance.' 
        };
      }

      console.log('Employee is active, creating user session');
      
      // Create user object with branch_id and fetch branch assignments
      const authenticatedUser: User = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        branch_id: employee.branch_id || null
      };

      // Fetch multi-branch assignments for all users
      const branchIds = await fetchEmployeeBranches(employee.id);
      if (branchIds.length > 0) {
        authenticatedUser.branchIds = branchIds;
      } else if (employee.branch_id) {
        // Fallback to single branch
        authenticatedUser.branchIds = [employee.branch_id];
      }
      
      console.log('Setting authenticated user:', authenticatedUser);
      setUser(authenticatedUser);
      
      console.log('=== LOGIN SUCCESS ===');
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login. Please try again.' };
    }
  };

  const logout = () => {
    console.log('=== LOGOUT ===');
    setUser(null);
    setSelectedBranch(null);
    // Redirect to /app instead of login page
    window.location.href = '/app';
  };

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) {
      console.log('No user logged in for permission check');
      return false;
    }
    
    console.log('=== PERMISSION CHECK ===');
    console.log('Resource:', resource, 'Action:', action);
    console.log('User:', user.name, 'Role:', user.role);
    
    // Admin has all permissions
    if (user.role.toLowerCase() === 'admin') {
      console.log('Admin user - granting all permissions');
      return true;
    }
    
    console.log('Available permissions:', rolePermissions);
    
    // First check database permissions - strict enforcement
    if (Array.isArray(rolePermissions) && rolePermissions.length > 0) {
      const resourcePermission = rolePermissions.find((p: any) => p.resource === resource);
      console.log('Found resource permission from DB:', resourcePermission);
      
      if (resourcePermission && Array.isArray(resourcePermission.actions)) {
        const hasPermission = resourcePermission.actions.includes(action);
        console.log('DB Permission result (STRICT):', hasPermission);
        return hasPermission;
      } else {
        // If no specific permission found in database, deny access
        console.log('No database permission found - denying access');
        return false;
      }
    }

    // If no database permissions available, fallback to hardcoded (should not happen in production)
    console.log('Falling back to hardcoded permissions');
    const hasHardcodedPermission = checkRolePermission(user.role, resource, action);
    console.log('Hardcoded permission result:', hasHardcodedPermission);
    
    return hasHardcodedPermission;
  };

  // Add hasPermission as an alias for checkPermission
  const hasPermission = checkPermission;

  const value: AuthContextProps = {
    user,
    currentUser: user,
    login,
    logout,
    checkPermission,
    hasPermission,
    selectedBranch,
    setSelectedBranch,
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
