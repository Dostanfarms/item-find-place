import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  profile_photo?: string;
  date_joined: string;
  state?: string;
  district?: string;
  village?: string;
  account_holder_name?: string;
  account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
        updated_at: emp.updated_at
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
          is_active: employeeData.is_active
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

      await fetchEmployees(); // Refresh the list
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
      if (employeeData.profile_photo !== undefined) updateData.profile_photo = employeeData.profile_photo;
      if (employeeData.state !== undefined) updateData.state = employeeData.state;
      if (employeeData.district !== undefined) updateData.district = employeeData.district;
      if (employeeData.village !== undefined) updateData.village = employeeData.village;
      if (employeeData.account_holder_name !== undefined) updateData.account_holder_name = employeeData.account_holder_name;
      if (employeeData.account_number !== undefined) updateData.account_number = employeeData.account_number;
      if (employeeData.bank_name !== undefined) updateData.bank_name = employeeData.bank_name;
      if (employeeData.ifsc_code !== undefined) updateData.ifsc_code = employeeData.ifsc_code;
      if (employeeData.is_active !== undefined) updateData.is_active = employeeData.is_active;

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

      await fetchEmployees(); // Refresh the list
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

      await fetchEmployees(); // Refresh the list
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
