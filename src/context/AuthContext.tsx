
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/utils/types';
import { hasPermission as checkPermission } from '@/utils/employeeData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  loading: boolean;
  selectedBranch: string | null;
  setSelectedBranch: (branchId: string | null) => void;
  hasPermission: (resource: string, action: string) => boolean;
  checkPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const hasPermissionCheck = (resource: string, action: string): boolean => {
    if (!currentUser) return false;
    return checkPermission(currentUser.role, resource, action);
  };

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      
      // Query employees table with branch assignments
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select(`
          *,
          employee_branches (
            branch_id
          )
        `)
        .eq('email', email.toLowerCase().trim())
        .eq('password', password)
        .eq('is_active', true)
        .single();

      if (employeeError) {
        console.error('Employee login error:', employeeError);
        if (employeeError.code === 'PGRST116') {
          return { success: false, error: 'Invalid email or password' };
        }
        return { success: false, error: 'Login failed. Please try again.' };
      }

      if (!employeeData) {
        console.log('No employee found with provided credentials');
        return { success: false, error: 'Invalid email or password' };
      }

      console.log('Employee login successful:', employeeData);

      // Extract branch IDs from the junction table
      const branchIds = employeeData.employee_branches?.map((eb: any) => eb.branch_id) || [];

      const user: User = {
        id: employeeData.id,
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        branchIds: branchIds
      };

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedBranch(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      loading, 
      selectedBranch, 
      setSelectedBranch,
      hasPermission: hasPermissionCheck,
      checkPermission: hasPermissionCheck
    }}>
      {children}
    </AuthContext.Provider>
  );
};
