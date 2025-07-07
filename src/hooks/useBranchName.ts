
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Branch {
  id: string;
  branch_name: string;
}

export const useBranchName = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, branch_name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBranchName = (branchId: string | null | undefined): string => {
    if (!branchId) return '-';
    const branch = branches.find(b => b.id === branchId);
    return branch?.branch_name || '-';
  };

  return { branches, getBranchName, loading };
};
