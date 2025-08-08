
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  state?: string;
  district?: string;
  village?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  profile_photo?: string;
  date_joined: string;
  branch_id?: string;
  products?: any[];
  transactions?: any[];
}

export const useFarmers = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      console.log('Fetching farmers...');
      
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching farmers:', error);
        toast({
          title: "Error",
          description: "Failed to load farmers",
          variant: "destructive"
        });
        return;
      }

      console.log('Raw farmers data:', data?.length);

      // Apply branch filtering for non-admin users
      let filteredFarmers = data || [];
      
      if (currentUser?.role?.toLowerCase() !== 'admin') {
        const userBranchIds = currentUser?.branchIds || (currentUser?.branch_id ? [currentUser.branch_id] : []);
        console.log('Filtering farmers for branches:', userBranchIds);
        
        if (userBranchIds.length > 0) {
          filteredFarmers = (data || []).filter(farmer => 
            !farmer.branch_id || userBranchIds.includes(farmer.branch_id)
          );
        } else {
          // If user has no branches assigned, show only farmers with no branch
          filteredFarmers = (data || []).filter(farmer => !farmer.branch_id);
        }
      }

      console.log('Filtered farmers after branch restriction:', filteredFarmers.length);
      setFarmers(filteredFarmers);
    } catch (error) {
      console.error('Error in fetchFarmers:', error);
      toast({
        title: "Error",
        description: "Failed to load farmers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFarmer = async (farmerData: Omit<Farmer, 'id' | 'date_joined'>) => {
    try {
      console.log('Adding farmer:', farmerData);

      // Auto-assign branch for non-admin users
      let branchId = farmerData.branch_id;
      if (currentUser?.role?.toLowerCase() !== 'admin') {
        const userBranchIds = currentUser?.branchIds || (currentUser?.branch_id ? [currentUser.branch_id] : []);
        if (userBranchIds.length > 0) {
          branchId = userBranchIds[0]; // Use first assigned branch
          console.log('Auto-assigning branch to farmer:', branchId);
        }
      }

      const insertData = {
        name: farmerData.name,
        email: farmerData.email,
        phone: farmerData.phone,
        password: farmerData.password,
        address: farmerData.address || null,
        state: farmerData.state || null,
        district: farmerData.district || null,
        village: farmerData.village || null,
        bank_name: farmerData.bank_name || null,
        account_number: farmerData.account_number || null,
        ifsc_code: farmerData.ifsc_code || null,
        profile_photo: farmerData.profile_photo || null,
        branch_id: branchId || null
      };

      const { data, error } = await supabase
        .from('farmers')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error adding farmer:', error);
        toast({
          title: "Error",
          description: `Failed to add farmer: ${error.message}`,
          variant: "destructive"
        });
        return { success: false, error };
      }

      console.log('Farmer added successfully:', data);
      await fetchFarmers();
      toast({
        title: "Success",
        description: "Farmer has been added successfully"
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in addFarmer:', error);
      toast({
        title: "Error",
        description: "Failed to add farmer",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateFarmer = async (id: string, farmerData: Partial<Farmer>) => {
    try {
      console.log('Updating farmer:', id, farmerData);

      const updateData: any = {};
      if (farmerData.name !== undefined) updateData.name = farmerData.name;
      if (farmerData.email !== undefined) updateData.email = farmerData.email;
      if (farmerData.phone !== undefined) updateData.phone = farmerData.phone;
      if (farmerData.password !== undefined) updateData.password = farmerData.password;
      if (farmerData.address !== undefined) updateData.address = farmerData.address;
      if (farmerData.state !== undefined) updateData.state = farmerData.state;
      if (farmerData.district !== undefined) updateData.district = farmerData.district;
      if (farmerData.village !== undefined) updateData.village = farmerData.village;
      if (farmerData.bank_name !== undefined) updateData.bank_name = farmerData.bank_name;
      if (farmerData.account_number !== undefined) updateData.account_number = farmerData.account_number;
      if (farmerData.ifsc_code !== undefined) updateData.ifsc_code = farmerData.ifsc_code;
      if (farmerData.profile_photo !== undefined) updateData.profile_photo = farmerData.profile_photo;
      if (farmerData.branch_id !== undefined) updateData.branch_id = farmerData.branch_id;

      const { data, error } = await supabase
        .from('farmers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating farmer:', error);
        toast({
          title: "Error",
          description: `Failed to update farmer: ${error.message}`,
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchFarmers();
      toast({
        title: "Success",
        description: "Farmer has been updated successfully"
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateFarmer:', error);
      toast({
        title: "Error",
        description: "Failed to update farmer",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const deleteFarmer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting farmer:', error);
        toast({
          title: "Error",
          description: `Failed to delete farmer: ${error.message}`,
          variant: "destructive"
        });
        return { success: false, error };
      }

      await fetchFarmers();
      toast({
        title: "Success",
        description: "Farmer has been deleted successfully"
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteFarmer:', error);
      toast({
        title: "Error",
        description: "Failed to delete farmer",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [currentUser?.branchIds, currentUser?.branch_id]);

  return {
    farmers,
    loading,
    fetchFarmers,
    addFarmer,
    updateFarmer,
    deleteFarmer
  };
};
