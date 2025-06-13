
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import Sidebar from '@/components/Sidebar';
import { format, isValid } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Check, X, ArrowLeft, RefreshCw } from 'lucide-react';

const Transactions = () => {
  const navigate = useNavigate();
  const { transactions, loading, fetchTransactions, updateTransactionStatus } = useTransactions();
  const { checkPermission } = useAuth();
  
  const canEdit = checkPermission('transactions', 'edit');

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy HH:mm');
      }
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Invalid Date';
    }
  };

  const handleMarkAsSettled = async (id: string) => {
    const result = await updateTransactionStatus(id, 'settled');
    if (result.success) {
      console.log('Transaction marked as settled');
    } else {
      console.error('Failed to update transaction status:', result.error);
    }
  };
  
  const handleBack = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    fetchTransactions();
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="mr-4" 
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-2xl font-bold">Transactions</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Customer</th>
                        <th className="text-left p-2">Items</th>
                        <th className="text-center p-2">Type</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="text-center p-2">Status</th>
                        <th className="text-center p-2">Payment Method</th>
                        {canEdit && <th className="text-right p-2">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="p-2">{transaction.id.slice(-8)}</td>
                          <td className="p-2">{formatTimestamp(transaction.created_at)}</td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{transaction.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{transaction.customer_mobile}</p>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="text-sm">
                              {transaction.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="text-xs">
                                  {item.name} x{item.quantity}
                                </div>
                              ))}
                              {transaction.items.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{transaction.items.length - 2} more items
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                              <ArrowDownLeft className="h-3 w-3" />
                              Sale
                            </span>
                          </td>
                          <td className="text-right p-2 font-medium text-green-600">
                            ₹{Number(transaction.total).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'settled' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {transaction.status === 'settled' 
                                ? <Check className="h-3 w-3" /> 
                                : <X className="h-3 w-3" />}
                              {transaction.status === 'settled' ? 'Settled' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              (transaction.payment_method === 'upi' || transaction.payment_method === 'card')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {transaction.payment_method.toUpperCase()}
                            </span>
                          </td>
                          {canEdit && (
                            <td className="p-2 text-right">
                              {transaction.status !== 'settled' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleMarkAsSettled(transaction.id)}
                                >
                                  Mark as Settled
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={canEdit ? 9 : 8} className="text-center py-8 text-muted-foreground">
                            No transactions found. Complete a sale to see transactions here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Transactions;
