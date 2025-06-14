
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

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
      setTransactions(data || []);
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding transaction:', transactionData);
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
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
