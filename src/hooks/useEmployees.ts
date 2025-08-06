
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
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
  branchIds?: string[];
  branches?: Array<{id: string; branch_name: string}>;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch employees with their branch assignments
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          employee_branches (
            branch_id,
            branches (
              id,
              branch_name
            )
          )
        `)
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

      // Format employees data
      const formattedEmployees = employeesData?.map(emp => ({
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
        branchIds: emp.employee_branches?.map((eb: any) => eb.branch_id) || [],
        branches: emp.employee_branches?.map((eb: any) => ({
          id: eb.branches.id,
          branch_name: eb.branches.branch_name
        })) || []
      })) || [];

      // Apply branch filtering based on current user's permissions
      const filteredEmployees = currentUser?.role?.toLowerCase() === 'admin' 
        ? formattedEmployees 
        : formattedEmployees.filter(emp => {
            // Show employees that share at least one branch with current user
            const userBranchId = currentUser?.branch_id;
            if (!userBranchId) return emp.branchIds?.length === 0;
            return emp.branchIds?.includes(userBranchId) || emp.branchIds?.length === 0;
          });

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
      const { data: newEmployee, error: employeeError } = await supabase
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
          is_active: employeeData.isActive
        }])
        .select()
        .single();

      if (employeeError) {
        console.error('Error adding employee:', employeeError);
        toast({
          title: "Error",
          description: "Failed to add employee",
          variant: "destructive"
        });
        return { success: false, error: employeeError };
      }

      // Handle branch assignments
      if (employeeData.branchIds && employeeData.branchIds.length > 0) {
        const branchAssignments = employeeData.branchIds.map(branchId => ({
          employee_id: newEmployee.id,
          branch_id: branchId
        }));

        const { error: branchError } = await supabase
          .from('employee_branches')
          .insert(branchAssignments);

        if (branchError) {
          console.error('Error assigning branches:', branchError);
          // Don't fail the whole operation, just log the error
        }
      }

      await fetchEmployees();
      toast({
        title: "Success",
        description: `${employeeData.name} was successfully added as ${employeeData.role}`
      });
      
      return { success: true, data: newEmployee };
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

      // Handle branch assignments update
      if (employeeData.branchIds !== undefined) {
        // Delete existing assignments
        await supabase
          .from('employee_branches')
          .delete()
          .eq('employee_id', id);

        // Add new assignments
        if (employeeData.branchIds.length > 0) {
          const branchAssignments = employeeData.branchIds.map(branchId => ({
            employee_id: id,
            branch_id: branchId
          }));

          const { error: branchError } = await supabase
            .from('employee_branches')
            .insert(branchAssignments);

          if (branchError) {
            console.error('Error updating branch assignments:', branchError);
          }
        }
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
      // Delete branch assignments first
      await supabase
        .from('employee_branches')
        .delete()
        .eq('employee_id', id);

      // Delete employee
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
  }, [currentUser]);

  return {
    employees,
    loading,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
};
