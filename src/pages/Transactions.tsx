
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTransactions } from '@/hooks/useTransactions';
import { useBranches } from '@/hooks/useBranches';
import TransactionDetailsDialog from '@/components/TransactionDetailsDialog';
import BranchFilter from '@/components/BranchFilter';
import { Search, Receipt, Calendar as CalendarIcon, Eye, FileDown } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import ProtectedAction from '@/components/ProtectedAction';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar';

const Transactions = () => {
  const { transactions, loading } = useTransactions();
  const { branches } = useBranches();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter by search, status, branch, and selected date
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_mobile.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesBranch = !selectedBranch || transaction.branch_id === selectedBranch;
    const matchesDate = !selectedDate ||
      isSameDay(new Date(transaction.created_at), selectedDate);
    
    // Also search by branch name if search term is provided
    const matchesBranchName = !searchTerm || (transaction.branch_id && branches.some(branch => 
      branch.id === transaction.branch_id && 
      (branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       branch.branch_owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
    ));

    return matchesSearch && matchesStatus && matchesBranch && matchesDate && matchesBranchName;
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

  const handleViewTransaction = (transaction: any) => {
    if (!hasPermission('transactions', 'view')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view transaction details",
        variant: "destructive"
      });
      return;
    }
    setSelectedTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  const formatItemNames = (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) return '';
    return items.map(item => item.name).join(', ');
  };

  const formatItemDetails = (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) return '';
    return items.map(item => `${item.name} (${item.quantity}x₹${item.price})`).join('; ');
  };

  const exportToCSV = () => {
    if (!hasPermission('transactions', 'view')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to export transactions",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Prepare CSV headers
      const headers = [
        'Transaction ID',
        'Customer Name',
        'Customer Mobile',
        'Date',
        'Payment Method',
        'Status',
        'Branch',
        'Item Names',
        'Item Details',
        'Subtotal',
        'Discount Amount',
        'Coupon Used',
        'Final Total'
      ];

      // Prepare CSV data
      const csvData = filteredTransactions.map(transaction => {
        const itemNames = formatItemNames(transaction.items);
        const itemDetails = formatItemDetails(transaction.items);
        const discountAmount = Number(transaction.discount) || 0;
        const couponUsed = transaction.coupon_used || '';
        const branch = branches.find(b => b.id === transaction.branch_id);
        
        return [
          transaction.id,
          transaction.customer_name,
          transaction.customer_mobile,
          format(new Date(transaction.created_at), 'yyyy-MM-dd HH:mm:ss'),
          transaction.payment_method,
          transaction.status,
          branch ? `${branch.branch_name} - ${branch.branch_owner_name}` : 'No Branch',
          `"${itemNames}"`, // Wrap in quotes to handle commas
          `"${itemDetails}"`, // Wrap in quotes to handle semicolons
          Number(transaction.subtotal).toFixed(2),
          discountAmount.toFixed(2),
          couponUsed,
          Number(transaction.total).toFixed(2)
        ];
      });

      // Create CSV content
      const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename with timestamp
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const filename = `transactions_export_${timestamp}.csv`;
      link.setAttribute('download', filename);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredTransactions.length} transactions to ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export transactions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Check if user has permission to view transactions
  if (!hasPermission('transactions', 'view')) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view transactions.</p>
        </div>
      </div>
    );
  }

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
          {/* Date Picker for filtering */}
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Date filter</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <DatePickerCalendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={(date) => setSelectedDate(date ?? null)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
                {selectedDate && (
                  <div className="flex justify-end px-4 pb-2">
                    <Button
                      variant="link"
                      className="text-xs text-muted-foreground p-0 h-auto min-h-0"
                      onClick={() => setSelectedDate(null)}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
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
          <ProtectedAction resource="transactions" action="view">
            <Button 
              onClick={exportToCSV}
              disabled={isExporting || filteredTransactions.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : `Export (${filteredTransactions.length})`}
            </Button>
          </ProtectedAction>
        </div>
      </div>

      {/* Branch Filter */}
      <div className="flex-none mb-6">
        <BranchFilter
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by ID, customer name, mobile, branch name or owner..."
        />
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-auto">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No transactions found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterStatus !== 'all' || selectedBranch
                ? 'No transactions match your search criteria.' 
                : 'No transactions have been recorded yet.'}
            </p>
          </div>
        ) : (
          <Card className="border shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[120px] font-semibold">Transaction ID</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Customer</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Mobile</TableHead>
                      <TableHead className="min-w-[80px] font-semibold">Items</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Amount</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Branch</TableHead>
                      <TableHead className="min-w-[80px] font-semibold">Status</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Date</TableHead>
                      <TableHead className="min-w-[100px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => {
                      const branch = branches.find(b => b.id === transaction.branch_id);
                      
                      return (
                        <TableRow key={transaction.id} className="hover:bg-gray-50 border-b">
                          <TableCell className="font-medium">
                            <div className="max-w-[120px] truncate font-mono text-sm" title={transaction.id}>
                              #{transaction.id.slice(0, 8)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[120px] truncate" title={transaction.customer_name}>
                              {transaction.customer_name}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {transaction.customer_mobile}
                          </TableCell>
                          <TableCell className="text-center">
                            {Array.isArray(transaction.items) ? transaction.items.length : 0}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium text-green-600">
                            ₹{Number(transaction.total).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {branch ? (
                                <>
                                  <div className="font-medium">{branch.branch_name}</div>
                                  <div className="text-muted-foreground text-xs">{branch.branch_owner_name}</div>
                                </>
                              ) : (
                                <span className="text-muted-foreground">No Branch</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <ProtectedAction resource="transactions" action="view">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTransaction(transaction)}
                                className="h-7 px-2"
                                title="View Details"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </ProtectedAction>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transaction Details Dialog */}
      {hasPermission('transactions', 'view') && (
        <TransactionDetailsDialog
          transaction={selectedTransaction}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}
    </div>
  );
};

export default Transactions;
