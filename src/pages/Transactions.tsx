
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Search, Calendar, Eye, Download } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useEmployees } from '@/hooks/useEmployees';
import { useBranchName } from '@/hooks/useBranchName';
import { format } from 'date-fns';
import TransactionDetailsDialog from '@/components/TransactionDetailsDialog';
import BranchFilter from '@/components/BranchFilter';
import { useAuth } from '@/context/AuthContext';

const Transactions = () => {
  const { transactions, loading, fetchTransactions } = useTransactions();
  const { employees } = useEmployees();
  const { currentUser, selectedBranch } = useAuth();
  const { getBranchName } = useBranchName();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'bg-blue-100 text-blue-800';
      case 'card':
        return 'bg-purple-100 text-purple-800';
      case 'upi':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get employee's branch ID based on transaction created_by field
  const getTransactionBranchId = (transaction: any) => {
    // If transaction has direct branch_id, use it
    if (transaction.branch_id) return transaction.branch_id;
    
    // If transaction has created_by, find the employee and get their branch
    if (transaction.created_by) {
      const employee = employees.find(emp => emp.email === transaction.created_by);
      return employee?.branch_id || employee?.branchId || null;
    }
    
    return null;
  };

  // Apply branch filtering based on user role and selected branch
  const filteredTransactions = transactions.filter(transaction => {
    // Branch filter logic
    if (currentUser?.role?.toLowerCase() === 'admin') {
      // Admin can filter by selected branch or see all if no branch selected
      if (selectedBranch) {
        const transactionBranchId = getTransactionBranchId(transaction);
        if (transactionBranchId !== selectedBranch) return false;
      }
    } else {
      // Non-admin users can only see transactions from their assigned branch
      const transactionBranchId = getTransactionBranchId(transaction);
      const userBranchId = currentUser?.branch_id;
      
      // If user has a branch assigned, only show transactions from that branch
      if (userBranchId && transactionBranchId !== userBranchId) {
        return false;
      }
      
      // If user has no branch, only show transactions with no branch assignment
      if (!userBranchId && transactionBranchId !== null) {
        return false;
      }
    }
    
    // Search filter
    if (searchTerm && !transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.customer_mobile.includes(searchTerm)) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false;
    }
    
    // Payment method filter
    if (paymentFilter !== 'all' && transaction.payment_method !== paymentFilter) {
      return false;
    }
    
    return true;
  });

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailsDialog(true);
  };

  const handleExportTransactions = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const csvData = filteredTransactions.map(transaction => {
      const itemNames = Array.isArray(transaction.items) 
        ? transaction.items.map(item => `${item.name} (${item.quantity})`).join('; ')
        : '';
      
      return {
        'Transaction ID': transaction.id,
        'Date': format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm'),
        'Customer Name': transaction.customer_name,
        'Customer Mobile': transaction.customer_mobile,
        'Branch': getBranchName(getTransactionBranchId(transaction)),
        'Payment Method': transaction.payment_method,
        'Status': transaction.status,
        'Total Amount': `₹${transaction.total.toFixed(2)}`,
        'Created By': transaction.created_by || 'System',
        'Items Count': Array.isArray(transaction.items) ? transaction.items.length : 0,
        'Items Details': itemNames
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Transaction History</h1>
        </div>
        <Button onClick={handleExportTransactions} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <BranchFilter />
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono">
                      #{transaction.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{transaction.customer_mobile}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getBranchName(getTransactionBranchId(transaction))}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {Array.isArray(transaction.items) ? transaction.items.length : 0} items
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{transaction.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTransaction(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </div>
  );
};

export default Transactions;
