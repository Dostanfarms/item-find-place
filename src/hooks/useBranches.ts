
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/utils/types';

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
