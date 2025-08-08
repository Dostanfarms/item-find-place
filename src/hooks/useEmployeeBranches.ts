
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
      console.log('Assigning employee to branches:', { employeeId, branchIds });
      
      // First, remove existing assignments
      const { error: deleteError } = await supabase
        .from('employee_branches')
        .delete()
        .eq('employee_id', employeeId);

      if (deleteError) {
        console.error('Error removing existing assignments:', deleteError);
        return { success: false, error: deleteError };
      }

      // Then add new assignments
      if (branchIds.length > 0) {
        const assignments = branchIds.map(branchId => ({
          employee_id: employeeId,
          branch_id: branchId
        }));

        console.log('Creating assignments:', assignments);

        const { error: insertError } = await supabase
          .from('employee_branches')
          .insert(assignments);

        if (insertError) {
          console.error('Error assigning employee to branches:', insertError);
          return { success: false, error: insertError };
        }

        // Also update the primary branch in employees table
        const { error: updateError } = await supabase
          .from('employees')
          .update({ branch_id: branchIds[0] })
          .eq('id', employeeId);

        if (updateError) {
          console.error('Error updating primary branch:', updateError);
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
      console.log('Getting branches for employee:', employeeId);
      
      const { data, error } = await supabase
        .from('employee_branches')
        .select('branch_id')
        .eq('employee_id', employeeId);

      if (error) {
        console.error('Error fetching employee branches:', error);
        return [];
      }

      const branchIds = data?.map(item => item.branch_id) || [];
      console.log('Found branch IDs:', branchIds);
      return branchIds;
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
