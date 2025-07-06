
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/utils/types';

export const useBranches = () => {
  const { data: branches = [], isLoading: loading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log('Fetching branches...');
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('branch_name');
      
      if (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }
      
      console.log('Fetched branches:', data);
      return data as Branch[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  return { branches, loading, error };
};
