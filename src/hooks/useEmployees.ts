
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/utils/types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive"
        });
        return;
      }

      const formattedEmployees = data?.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone || '',
        password: emp.password,
        role: emp.role,
        profile_photo: emp.profile_photo,
        date_joined: emp.date_joined,
        state: emp.state,
        district: emp.district,
        village: emp.village,
        account_holder_name: emp.account_holder_name,
        account_number: emp.account_number,
        bank_name: emp.bank_name,
        ifsc_code: emp.ifsc_code,
        is_active: emp.is_active,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
        branch_id: emp.branch_id
      })) || [];

      setEmployees(formattedEmployees);
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

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'date_joined' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([{
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          password: employeeData.password,
          role: employeeData.role,
          profile_photo: employeeData.profile_photo,
          state: employeeData.state,
          district: employeeData.district,
          village: employeeData.village,
          account_holder_name: employeeData.account_holder_name,
          account_number: employeeData.account_number,
          bank_name: employeeData.bank_name,
          ifsc_code: employeeData.ifsc_code,
          is_active: employeeData.is_active,
          branch_id: employeeData.branch_id
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

      await fetchEmployees();
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
      
      // Only include defined fields in the update
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key as keyof Employee] !== undefined) {
          updateData[key] = employeeData[key as keyof Employee];
        }
      });

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

      await fetchEmployees();
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
