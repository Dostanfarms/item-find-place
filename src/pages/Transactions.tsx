
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTransactions } from '@/hooks/useTransactions';
import { Search, Receipt, Calendar, IndianRupee, User, Filter } from 'lucide-react';
import { format } from 'date-fns';

const Transactions = () => {
  const { transactions, loading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_mobile.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getTotalAmount = () => {
    return filteredTransactions.reduce((sum, transaction) => sum + Number(transaction.total), 0);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-500',
      pending: 'bg-yellow-500',
      cancelled: 'bg-red-500',
      refunded: 'bg-blue-500'
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex-none flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all transactions</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-green-600">
              {transactions.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalAmount().toFixed(2)}</div>
            <p className="text-xs text-green-600">
              From {filteredTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{filteredTransactions.length > 0 ? (getTotalAmount() / filteredTransactions.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-green-600">
              Average value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-auto">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No transactions found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterStatus !== 'all' 
                ? 'No transactions match your search criteria.' 
                : 'No transactions have been recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            #{transaction.id.slice(0, 8)}
                          </span>
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Customer: {transaction.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Payment: {transaction.payment_method}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{Number(transaction.total).toFixed(2)}
                      </div>
                      {transaction.items && (
                        <div className="text-xs text-muted-foreground">
                          {Array.isArray(transaction.items) ? transaction.items.length : 0} items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction Items */}
                  {transaction.items && Array.isArray(transaction.items) && transaction.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Items:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {transaction.items.slice(0, 3).map((item: any, index: number) => (
                          <div key={index} className="text-xs bg-muted p-2 rounded">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-muted-foreground">
                              {item.quantity} × ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}
                            </div>
                          </div>
                        ))}
                        {transaction.items.length > 3 && (
                          <div className="text-xs text-muted-foreground flex items-center justify-center p-2 rounded border-2 border-dashed">
                            +{transaction.items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
