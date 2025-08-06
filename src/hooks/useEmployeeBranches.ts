
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmployeeBranch {
  id: string;
  employee_id: string;
  branch_id: string;
  created_at: string;
}

export const useEmployeeBranches = () => {
  const [employeeBranches, setEmployeeBranches] = useState<EmployeeBranch[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEmployeeBranches = async (employeeId?: string) => {
    try {
      setLoading(true);
      let query = supabase.from('employee_branches').select('*');
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employee branches:', error);
        toast({
          title: "Error",
          description: "Failed to load employee branches",
          variant: "destructive"
        });
        return;
      }

      setEmployeeBranches(data || []);
    } catch (error) {
      console.error('Error in fetchEmployeeBranches:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignEmployeeToBranches = async (employeeId: string, branchIds: string[]) => {
    try {
      // First, remove existing assignments
      await supabase
        .from('employee_branches')
        .delete()
        .eq('employee_id', employeeId);

      // Then add new assignments
      if (branchIds.length > 0) {
        const assignments = branchIds.map(branchId => ({
          employee_id: employeeId,
          branch_id: branchId
        }));

        const { error } = await supabase
          .from('employee_branches')
          .insert(assignments);

        if (error) {
          console.error('Error assigning employee to branches:', error);
          return { success: false, error };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in assignEmployeeToBranches:', error);
      return { success: false, error };
    }
  };

  const getEmployeeBranches = async (employeeId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('employee_branches')
        .select('branch_id')
        .eq('employee_id', employeeId);

      if (error) {
        console.error('Error fetching employee branches:', error);
        return [];
      }

      return data?.map(item => item.branch_id) || [];
    } catch (error) {
      console.error('Error in getEmployeeBranches:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchEmployeeBranches();
  }, []);

  return {
    employeeBranches,
    loading,
    fetchEmployeeBranches,
    assignEmployeeToBranches,
    getEmployeeBranches
  };
};
