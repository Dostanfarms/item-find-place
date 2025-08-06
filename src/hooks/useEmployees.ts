import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeBranches } from '@/hooks/useEmployeeBranches';
import { getBranchRestrictedData } from '@/utils/employeeData';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  profilePhoto?: string;
  dateJoined: string;
  state?: string;
  district?: string;
  village?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branchId?: string;
  branch_id?: string;
  branchIds?: string[]; // For multi-branch support
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { assignEmployeeToBranches, getEmployeeBranches } = useEmployeeBranches();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch employees with their branch assignments
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive"
        });
        return;
      }

      // Get branch assignments for each employee
      const employeesWithBranches = await Promise.all(
        (employeesData || []).map(async (emp) => {
          const branchIds = await getEmployeeBranches(emp.id);
          
          return {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            phone: emp.phone || '',
            password: emp.password,
            role: emp.role,
            profilePhoto: emp.profile_photo,
            dateJoined: emp.date_joined,
            state: emp.state,
            district: emp.district,
            village: emp.village,
            accountHolderName: emp.account_holder_name,
            accountNumber: emp.account_number,
            bankName: emp.bank_name,
            ifscCode: emp.ifsc_code,
            isActive: emp.is_active,
            createdAt: emp.created_at,
            updatedAt: emp.updated_at,
            branchId: emp.branch_id,
            branch_id: emp.branch_id,
            branchIds: branchIds
          };
        })
      );

      // Apply branch filtering (for now, keep existing logic for single branch)
      const filteredEmployees = getBranchRestrictedData(
        employeesWithBranches, 
        currentUser?.role || '', 
        currentUser?.branch_id || null
      );

      setEmployees(filteredEmployees);
    } catch (error) {
      console.error('Error in fetchEmployees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'dateJoined' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Auto-assign current user's branch if not admin
      let branchId = employeeData.branchId;
      if (currentUser?.role?.toLowerCase() !== 'admin' && currentUser?.branch_id) {
        branchId = currentUser.branch_id;
      }

      const { data, error } = await supabase
        .from('employees')
        .insert([{
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          password: employeeData.password,
          role: employeeData.role,
          profile_photo: employeeData.profilePhoto,
          state: employeeData.state,
          district: employeeData.district,
          village: employeeData.village,
          account_holder_name: employeeData.accountHolderName,
          account_number: employeeData.accountNumber,
          bank_name: employeeData.bankName,
          ifsc_code: employeeData.ifscCode,
          is_active: employeeData.isActive,
          branch_id: branchId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding employee:', error);
        toast({
          title: "Error",
          description: "Failed to add employee",
          variant: "destructive"
        });
        return { success: false, error };
      }

      // Assign employee to multiple branches if provided
      if (employeeData.branchIds && employeeData.branchIds.length > 0) {
        await assignEmployeeToBranches(data.id, employeeData.branchIds);
      }

      await fetchEmployees();
      toast({
        title: "Success",
        description: `${employeeData.name} was successfully added as ${employeeData.role}`
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in addEmployee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    try {
      const updateData: any = {};
      
      if (employeeData.name !== undefined) updateData.name = employeeData.name;
      if (employeeData.email !== undefined) updateData.email = employeeData.email;
      if (employeeData.phone !== undefined) updateData.phone = employeeData.phone;
      if (employeeData.password !== undefined && employeeData.password !== '') updateData.password = employeeData.password;
      if (employeeData.role !== undefined) updateData.role = employeeData.role;
      if (employeeData.profilePhoto !== undefined) updateData.profile_photo = employeeData.profilePhoto;
      if (employeeData.state !== undefined) updateData.state = employeeData.state;
      if (employeeData.district !== undefined) updateData.district = employeeData.district;
      if (employeeData.village !== undefined) updateData.village = employeeData.village;
      if (employeeData.accountHolderName !== undefined) updateData.account_holder_name = employeeData.accountHolderName;
      if (employeeData.accountNumber !== undefined) updateData.account_number = employeeData.accountNumber;
      if (employeeData.bankName !== undefined) updateData.bank_name = employeeData.bankName;
      if (employeeData.ifscCode !== undefined) updateData.ifsc_code = employeeData.ifscCode;
      if (employeeData.isActive !== undefined) updateData.is_active = employeeData.isActive;
      if (employeeData.branchId !== undefined) updateData.branch_id = employeeData.branchId;

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating employee:', error);
        toast({
          title: "Error",
          description: "Failed to update employee",
          variant: "destructive"
        });
        return { success: false, error };
      }

      // Update branch assignments if provided
      if (employeeData.branchIds !== undefined) {
        await assignEmployeeToBranches(id, employeeData.branchIds);
      }

      await fetchEmployees();
      toast({
        title: "Success",
        description: `Employee information was successfully updated`
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      // Delete employee branch assignments first (cascade should handle this)
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee:', error);
        toast({
          title: "Error",
          description: "Failed to delete employee",
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchEmployees();
      toast({
        title: "Success",
        description: "Employee has been deleted successfully"
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
};
