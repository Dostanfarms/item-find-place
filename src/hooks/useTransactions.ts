
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Use the database types directly
type DatabaseTransaction = Database['public']['Tables']['transactions']['Row'];
type DatabaseTransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Updated Transaction interface to match database schema with branch_id
export interface Transaction {
  id: string;
  customer_name: string;
  customer_mobile: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_used: string | null;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  branch_id?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('Fetching transactions from Supabase...');
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      console.log('Transactions fetched successfully:', data);
      
      // Transform the data to match our interface
      const transformedTransactions: Transaction[] = (data || []).map((dbTransaction: DatabaseTransaction) => ({
        id: dbTransaction.id,
        customer_name: dbTransaction.customer_name,
        customer_mobile: dbTransaction.customer_mobile,
        items: Array.isArray(dbTransaction.items) ? (dbTransaction.items as unknown as TransactionItem[]) : [],
        subtotal: Number(dbTransaction.subtotal),
        discount: Number(dbTransaction.discount),
        total: Number(dbTransaction.total),
        coupon_used: dbTransaction.coupon_used,
        payment_method: dbTransaction.payment_method,
        status: dbTransaction.status,
        created_at: dbTransaction.created_at,
        updated_at: dbTransaction.updated_at,
        branch_id: dbTransaction.branch_id || undefined,
      }));
      
      setTransactions(transformedTransactions);
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding transaction:', transactionData);
      
      // Transform data for database insertion
      const dbTransactionData: DatabaseTransactionInsert = {
        customer_name: transactionData.customer_name,
        customer_mobile: transactionData.customer_mobile,
        items: transactionData.items as unknown as Database['public']['Tables']['transactions']['Insert']['items'],
        subtotal: transactionData.subtotal,
        discount: transactionData.discount,
        total: transactionData.total,
        coupon_used: transactionData.coupon_used,
        payment_method: transactionData.payment_method,
        status: transactionData.status,
        branch_id: transactionData.branch_id || null,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([dbTransactionData])
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        return { success: false, error: error.message };
      }

      console.log('Transaction added successfully:', data);
      // Refresh the transactions list
      await fetchTransactions();
      return { success: true, data };
    } catch (error) {
      console.error('Error in addTransaction:', error);
      return { success: false, error: 'Failed to add transaction' };
    }
  };

  const updateTransactionStatus = async (id: string, status: string) => {
    try {
      console.log('Updating transaction status:', id, status);
      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        return { success: false, error: error.message };
      }

      console.log('Transaction updated successfully:', data);
      // Refresh the transactions list
      await fetchTransactions();
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateTransactionStatus:', error);
      return { success: false, error: 'Failed to update transaction' };
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransactionStatus
  };
};
