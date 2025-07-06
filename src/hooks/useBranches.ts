
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Branch {
  id: string;
  branch_name: string;
  branch_owner_name: string;
  mobile_number: string;
  state: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBranches = () => {
  const { data: branches = [], isLoading: loading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('branch_name');
      
      if (error) throw error;
      return data as Branch[];
    }
  });

  return { branches, loading };
};
